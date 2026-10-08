import { useToast } from '@/components/ui/toast';
import { useLogout } from '@/features/auth/api/use-logout';

export function useDeletedAccountSignOut() {
  const logout = useLogout();
  const toast = useToast();

  return () => {
    logout.mutate(undefined, { onSettled: () => toast.show('Conta excluída') });
  };
}
