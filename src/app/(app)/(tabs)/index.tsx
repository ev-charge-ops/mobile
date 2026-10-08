import { useMyOrganizations } from '@/features/account/api/use-my-organizations';
import { formatUnitSubtitle } from '@/features/account/unit-subtitle';
import { useMe } from '@/features/auth/api/use-me';
import { CurrentChargeScreen } from '@/features/charging/screens/current-charge-screen';
import { NotificationsBell } from '@/features/notifications/components/notifications-bell';

function firstName(name: string | undefined) {
  return name?.trim().split(/\s+/)[0] ?? '';
}

export default function HomeRoute() {
  const { data: user } = useMe();
  const { data: organizations } = useMyOrganizations();
  const name = firstName(user?.name);

  return (
    <CurrentChargeScreen
      title={name ? `Olá, ${name}` : 'Olá'}
      subtitle={formatUnitSubtitle(organizations)}
      actions={<NotificationsBell />}
    />
  );
}
