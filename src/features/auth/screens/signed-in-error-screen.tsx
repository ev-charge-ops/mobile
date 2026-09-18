import { ErrorScreen } from '@/components/ui/error-screen';
import { useLogout } from '@/features/auth/api/use-logout';

export type SignedInErrorScreenProps = {
  message?: string;
  details?: string | null;
  onRetry: () => void;
  isRetrying?: boolean;
};

export function SignedInErrorScreen(props: SignedInErrorScreenProps) {
  const logoutMutation = useLogout();

  return (
    <ErrorScreen {...props} onSignOut={() => logoutMutation.mutate()} isSigningOut={logoutMutation.isPending} />
  );
}
