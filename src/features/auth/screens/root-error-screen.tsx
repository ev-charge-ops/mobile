import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorScreen } from '@/components/ui/error-screen';
import { signOutFromGoogle } from '@/features/auth/oauth/google-sign-in';
import { discardStoredSession } from '@/features/auth/session/session-store';

export type RootErrorScreenProps = {
  details?: string | null;
  onRetry: () => Promise<void>;
};

export function RootErrorScreen({ details, onRetry }: RootErrorScreenProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setIsSigningOut(true);
    await discardStoredSession().catch(() => undefined);
    await signOutFromGoogle();
    setIsSigningOut(false);
    await onRetry();
  };

  return (
    <SafeAreaProvider>
      <ErrorScreen details={details} onRetry={onRetry} onSignOut={signOut} isSigningOut={isSigningOut} />
    </SafeAreaProvider>
  );
}
