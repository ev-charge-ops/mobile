import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowRight, Check, LogIn, LogOut, RotateCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { colors, spacing } from '@/constants/theme';
import type { AuthUser, InvitePreview } from '@/features/auth/api/auth-api';
import { useAcceptInvite, useAcceptInviteAsCurrentUser, useInvitePreview } from '@/features/auth/api/use-invite';
import { useLogout } from '@/features/auth/api/use-logout';
import {
  getAcceptInviteErrorMessage,
  getInviteUnavailableReason,
  isInviteEmailMismatch,
  type InviteUnavailableReason,
} from '@/features/auth/auth-errors';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { FormError } from '@/features/auth/components/form-error';
import { InviteAccountForm } from '@/features/auth/components/invite-account-form';
import { InviteDetails } from '@/features/auth/components/invite-details';
import { OAuthButtons } from '@/features/auth/components/oauth-buttons';
import { clearReturnTarget, setReturnTarget } from '@/features/auth/session/return-target';
import { useSession } from '@/features/auth/session/session-context';

export type InviteScreenProps = {
  onAccepted?: () => void;
};

const unavailableCopy: Record<InviteUnavailableReason, { title: string; subtitle: string }> = {
  NOT_FOUND: {
    title: 'Convite não encontrado',
    subtitle: 'Este link de convite é inválido. Peça ao gestor do condomínio para enviar um novo convite.',
  },
  EXPIRED: {
    title: 'Convite expirado',
    subtitle: 'Este convite não é mais válido. Peça ao gestor do condomínio para enviar um novo convite.',
  },
  REVOKED: {
    title: 'Convite cancelado',
    subtitle: 'Este convite foi cancelado pelo gestor do condomínio.',
  },
  ACCEPTED: {
    title: 'Convite já aceito',
    subtitle: 'Este convite já foi utilizado. Entre com a conta vinculada a ele para acessar o condomínio.',
  },
};

const unavailableByStatus: Partial<Record<InvitePreview['status'], InviteUnavailableReason>> = {
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
  ACCEPTED: 'ACCEPTED',
};

function isSameEmail(first: string, second: string) {
  return first.trim().toLowerCase() === second.trim().toLowerCase();
}

export function InviteScreen({ onAccepted }: InviteScreenProps) {
  const { token = '' } = useLocalSearchParams<{ token?: string }>();
  const { status, user } = useSession();
  const preview = useInvitePreview(token);
  const createAccount = useAcceptInvite(token);
  const acceptAsCurrentUser = useAcceptInviteAsCurrentUser(token);
  const [unavailableReason, setUnavailableReason] = useState<InviteUnavailableReason | null>(null);
  const [hasEmailMismatch, setHasEmailMismatch] = useState(false);
  const toast = useToast();
  const isCreatingAccount = createAccount.isPending || createAccount.isSuccess;
  const isAuthenticated = status === 'authenticated' && user !== null && !isCreatingAccount;

  useEffect(() => {
    if (isAuthenticated) clearReturnTarget();
  }, [isAuthenticated]);

  if (!token) return <InviteUnavailable reason="NOT_FOUND" />;

  if (preview.isPending) {
    return (
      <AuthLayout title="Carregando convite" subtitle="Aguarde só um instante.">
        <ActivityIndicator accessibilityLabel="Carregando convite" color={colors.accent} size="large" />
      </AuthLayout>
    );
  }

  if (preview.isError) {
    const reason = getInviteUnavailableReason(preview.error);
    if (reason) return <InviteUnavailable reason={reason} />;
    return (
      <AuthLayout title="Não foi possível carregar o convite" subtitle="Verifique sua conexão e tente novamente.">
        <View style={styles.stack}>
          <FormError message={getAcceptInviteErrorMessage(preview.error)} />
          <Button label="Tentar novamente" icon={RotateCw} size="lg" block onPress={() => preview.refetch()} />
        </View>
      </AuthLayout>
    );
  }

  const invite = preview.data;
  const reason = unavailableReason ?? unavailableByStatus[invite.status];
  if (reason) return <InviteUnavailable reason={reason} />;

  const complete = () => {
    onAccepted?.();
    toast.show(`Convite aceito! Agora você faz parte de ${invite.organizationName}.`);
    router.replace('/');
  };

  const handleAcceptError = (error: unknown) => {
    const errorReason = getInviteUnavailableReason(error);
    if (errorReason) setUnavailableReason(errorReason);
    else if (isInviteEmailMismatch(error)) setHasEmailMismatch(true);
  };

  const acceptAsSignedInUser = () => {
    acceptAsCurrentUser.mutate(undefined, { onSuccess: complete, onError: handleAcceptError });
  };

  if (isAuthenticated) {
    return (
      <SignedInInvite
        token={token}
        invite={invite}
        user={user}
        hasEmailMismatch={hasEmailMismatch || !isSameEmail(user.email, invite.email)}
        onAccept={acceptAsSignedInUser}
        isAccepting={acceptAsCurrentUser.isPending}
        errorMessage={
          acceptAsCurrentUser.isError && !isInviteEmailMismatch(acceptAsCurrentUser.error)
            ? getAcceptInviteErrorMessage(acceptAsCurrentUser.error)
            : null
        }
      />
    );
  }

  return (
    <AuthLayout title="Você foi convidado" subtitle="Crie sua conta para participar do condomínio no EV ChargeOps.">
      <InviteDetails invite={invite} />
      <InviteAccountForm
        onSubmit={({ name, password }) => {
          clearReturnTarget();
          createAccount.mutate({ name, password }, { onSuccess: complete, onError: handleAcceptError });
        }}
        isSubmitting={isCreatingAccount}
        errorMessage={createAccount.isError ? getAcceptInviteErrorMessage(createAccount.error) : null}
      />
      <Button
        label="Já tenho conta"
        icon={LogIn}
        variant="outline"
        size="lg"
        block
        onPress={() => {
          setReturnTarget(inviteHref(token));
          router.push('/login');
        }}
      />
      <OAuthButtons
        onSignedIn={(session) => {
          if (isSameEmail(session.user.email, invite.email)) acceptAsSignedInUser();
        }}
      />
    </AuthLayout>
  );
}

function inviteHref(token: string): Href {
  return { pathname: '/invite', params: { token } };
}

type SignedInInviteProps = {
  token: string;
  invite: InvitePreview;
  user: AuthUser;
  hasEmailMismatch: boolean;
  onAccept: () => void;
  isAccepting: boolean;
  errorMessage: string | null;
};

function SignedInInvite({
  token,
  invite,
  user,
  hasEmailMismatch,
  onAccept,
  isAccepting,
  errorMessage,
}: SignedInInviteProps) {
  const logoutMutation = useLogout();

  if (hasEmailMismatch) {
    return (
      <AuthLayout
        title="Convite para outro e-mail"
        subtitle={`Este convite foi enviado para ${invite.email}, mas você entrou como ${user.email}. Entre com a conta do e-mail convidado para aceitar.`}
      >
        <InviteDetails invite={invite} />
        <Button
          label="Sair e entrar com outra conta"
          icon={LogOut}
          size="lg"
          block
          loading={logoutMutation.isPending}
          onPress={async () => {
            setReturnTarget(inviteHref(token));
            await logoutMutation.mutateAsync();
            router.push('/login');
          }}
        />
        <Button label="Ir para o início" icon={ArrowRight} variant="ghost" block onPress={() => router.replace('/')} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Você foi convidado" subtitle={`Aceite o convite para participar de ${invite.organizationName}.`}>
      <InviteDetails invite={invite} />
      <View style={styles.stack}>
        {errorMessage ? <FormError message={errorMessage} /> : null}
        <Button label="Aceitar convite" icon={Check} size="lg" block loading={isAccepting} onPress={onAccept} />
        <Button label="Agora não" variant="ghost" block onPress={() => router.replace('/')} />
      </View>
    </AuthLayout>
  );
}

function InviteUnavailable({ reason }: { reason: InviteUnavailableReason }) {
  const { title, subtitle } = unavailableCopy[reason];

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <Button label="Ir para o início" icon={ArrowRight} size="lg" block onPress={() => router.replace('/')} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
});
