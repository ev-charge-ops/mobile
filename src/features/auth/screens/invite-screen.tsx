import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowRight, LogOut, MailCheck, MailX, RotateCw, WifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { InfoBanner } from '@/components/ui/info-banner';
import { Rise } from '@/components/ui/rise';
import { useToast } from '@/components/ui/toast';
import { colors, fonts } from '@/constants/theme';
import type { AuthUser, InvitePreview } from '@/features/auth/api/auth-api';
import { useAcceptInvite, useAcceptInviteAsCurrentUser, useInvitePreview } from '@/features/auth/api/use-invite';
import { useLogout } from '@/features/auth/api/use-logout';
import {
  getAcceptInviteErrorMessage,
  getInviteUnavailableReason,
  isInviteEmailMismatch,
  type InviteUnavailableReason,
} from '@/features/auth/auth-errors';
import {
  AuthBackButton,
  AuthBarTitle,
  AuthFooterLink,
  AuthHeading,
  AuthIconTile,
  AuthScreen,
  authTextStyles,
} from '@/features/auth/components/auth-screen';
import { AuthTextButton } from '@/features/auth/components/auth-text-button';
import { BrandTile } from '@/features/auth/components/brand-tile';
import { FormError } from '@/features/auth/components/form-error';
import { InviteAccountForm } from '@/features/auth/components/invite-account-form';
import { InviteCard, InviteIncluded } from '@/features/auth/components/invite-card';
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
  const [isChoosingAccount, setIsChoosingAccount] = useState(false);
  const toast = useToast();
  const isCreatingAccount = createAccount.isPending || createAccount.isSuccess;
  const isAuthenticated = status === 'authenticated' && user !== null && !isCreatingAccount;

  useEffect(() => {
    if (isAuthenticated) clearReturnTarget();
  }, [isAuthenticated]);

  if (!token) return <InviteUnavailable reason="NOT_FOUND" />;

  if (preview.isPending) {
    return (
      <AuthScreen header={<InviteHeader />}>
        <AuthHeading title="Carregando convite" subtitle="Aguarde só um instante." />
        <ActivityIndicator
          accessibilityLabel="Carregando convite"
          color={colors.accent}
          size="large"
          style={styles.spinner}
        />
      </AuthScreen>
    );
  }

  if (preview.isError) {
    const reason = getInviteUnavailableReason(preview.error);
    if (reason) return <InviteUnavailable reason={reason} />;
    return (
      <AuthScreen
        header={<InviteHeader />}
        footer={
          <Rise index={3}>
            <Button label="Tentar novamente" icon={RotateCw} size="lg" block haptic onPress={() => preview.refetch()} />
          </Rise>
        }
      >
        <AuthIconTile icon={WifiOff} tone="critical" />
        <AuthHeading title="Não foi possível carregar o convite" subtitle="Verifique sua conexão e tente novamente." />
        <Rise index={2}>
          <FormError message={getAcceptInviteErrorMessage(preview.error)} />
        </Rise>
      </AuthScreen>
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

  const goToLogin = () => {
    setReturnTarget(inviteHref(token));
    router.push('/login');
  };

  if (!isChoosingAccount) {
    return (
      <InviteOverview
        invite={invite}
        onAccept={() => setIsChoosingAccount(true)}
        onDecline={() => router.replace('/')}
      />
    );
  }

  return (
    <AuthScreen
      header={
        <>
          <AuthBackButton onPress={() => setIsChoosingAccount(false)} />
          <AuthBarTitle>{invite.organizationName}</AuthBarTitle>
        </>
      }
      footer={<AuthFooterLink index={8} text="Já tem uma conta?" linkLabel="Já tenho conta" onPress={goToLogin} />}
    >
      <AuthHeading
        title="Crie sua conta"
        subtitle={
          <>
            Para aceitar o convite com <Text style={authTextStyles.strong}>{invite.email}</Text>.
          </>
        }
      />
      <InviteAccountForm
        riseIndex={2}
        onSubmit={({ name, password }) => {
          clearReturnTarget();
          createAccount.mutate({ name, password }, { onSuccess: complete, onError: handleAcceptError });
        }}
        isSubmitting={isCreatingAccount}
        errorMessage={createAccount.isError ? getAcceptInviteErrorMessage(createAccount.error) : null}
      />
      <Rise index={6}>
        <OAuthButtons
          onSignedIn={(session) => {
            if (isSameEmail(session.user.email, invite.email)) acceptAsSignedInUser();
          }}
        />
      </Rise>
    </AuthScreen>
  );
}

function InviteHeader() {
  return (
    <View style={styles.inviteHeader}>
      <Text accessibilityRole="header" style={styles.inviteHeaderTitle}>
        Convite do condomínio
      </Text>
      <BrandTile size={36} />
    </View>
  );
}

type InviteOverviewProps = {
  invite: InvitePreview;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting?: boolean;
  errorMessage?: string | null;
};

function InviteOverview({ invite, onAccept, onDecline, isAccepting = false, errorMessage }: InviteOverviewProps) {
  return (
    <AuthScreen
      header={<InviteHeader />}
      footer={
        <View style={styles.actions}>
          {errorMessage ? <FormError message={errorMessage} /> : null}
          <Rise index={7}>
            <Button label="Aceitar convite" size="lg" block haptic loading={isAccepting} onPress={onAccept} />
          </Rise>
          <Rise index={8}>
            <AuthTextButton label="Agora não" onPress={onDecline} />
          </Rise>
        </View>
      }
    >
      <InviteCard invite={invite} />
      <InviteIncluded invite={invite} />
      <Rise index={5}>
        <InfoBanner>Grupo A · uso condominial. Energia repassada a custo, conforme ANEEL RN 1.000/2021.</InfoBanner>
      </Rise>
    </AuthScreen>
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
      <AuthScreen
        header={<InviteHeader />}
        footer={
          <View style={styles.actions}>
            <Rise index={6}>
              <Button
                label="Sair e entrar com outra conta"
                icon={LogOut}
                size="lg"
                block
                haptic
                loading={logoutMutation.isPending}
                onPress={async () => {
                  setReturnTarget(inviteHref(token));
                  await logoutMutation.mutateAsync();
                  router.push('/login');
                }}
              />
            </Rise>
            <Rise index={7}>
              <AuthTextButton label="Ir para o início" onPress={() => router.replace('/')} />
            </Rise>
          </View>
        }
      >
        <InviteCard invite={invite} />
        <Rise index={3}>
          <InfoBanner tone="warning" title="Convite para outro e-mail">
            {`Este convite foi enviado para ${invite.email}, mas você entrou como ${user.email}. Entre com a conta do e-mail convidado para aceitar.`}
          </InfoBanner>
        </Rise>
      </AuthScreen>
    );
  }

  return (
    <InviteOverview
      invite={invite}
      onAccept={onAccept}
      onDecline={() => router.replace('/')}
      isAccepting={isAccepting}
      errorMessage={errorMessage}
    />
  );
}

function InviteUnavailable({ reason }: { reason: InviteUnavailableReason }) {
  const { title, subtitle } = unavailableCopy[reason];
  const accepted = reason === 'ACCEPTED';

  return (
    <AuthScreen
      header={<InviteHeader />}
      footer={
        <Rise index={3}>
          <Button label="Ir para o início" icon={ArrowRight} size="lg" block haptic onPress={() => router.replace('/')} />
        </Rise>
      }
    >
      <AuthIconTile icon={accepted ? MailCheck : MailX} tone={accepted ? 'energy' : 'critical'} />
      <AuthHeading title={title} subtitle={subtitle} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 24,
  },
  inviteHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingLeft: 4,
  },
  inviteHeaderTitle: {
    flex: 1,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fonts.bold,
    letterSpacing: -0.6,
    color: colors.textTitle,
  },
  actions: {
    gap: 4,
  },
});
