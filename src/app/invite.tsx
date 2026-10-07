import { useQueryClient } from '@tanstack/react-query';

import { InviteScreen } from '@/features/auth/screens/invite-screen';
import { myOrganizationsQueryKey } from '@/features/home/api/use-my-organizations';

export default function InviteRoute() {
  const queryClient = useQueryClient();

  return <InviteScreen onAccepted={() => queryClient.invalidateQueries({ queryKey: myOrganizationsQueryKey })} />;
}
