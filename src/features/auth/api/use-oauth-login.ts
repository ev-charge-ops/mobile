import { useMutation } from '@tanstack/react-query';

import { loginWithApple, loginWithGoogle, type AuthSession } from '@/features/auth/api/auth-api';
import { signInWithApple } from '@/features/auth/oauth/apple-sign-in';
import { signInWithGoogle } from '@/features/auth/oauth/google-sign-in';
import { useSession } from '@/features/auth/session/session-context';

export type OAuthLoginOptions = {
  onSignedIn?: (session: AuthSession) => void;
};

export function useGoogleLogin({ onSignedIn }: OAuthLoginOptions = {}) {
  const { startSession } = useSession();

  return useMutation({
    mutationFn: async () => {
      const result = await signInWithGoogle();
      if (result.type === 'cancelled') return null;
      return loginWithGoogle(result.idToken);
    },
    onSuccess: async (session) => {
      if (!session) return;
      await startSession(session);
      onSignedIn?.(session);
    },
  });
}

export function useAppleLogin({ onSignedIn }: OAuthLoginOptions = {}) {
  const { startSession } = useSession();

  return useMutation({
    mutationFn: async () => {
      const result = await signInWithApple();
      if (result.type === 'cancelled') return null;
      return loginWithApple({ identityToken: result.identityToken, fullName: result.fullName });
    },
    onSuccess: async (session) => {
      if (!session) return;
      await startSession(session);
      onSignedIn?.(session);
    },
  });
}
