import { useMyOrganizations } from '@/features/account/api/use-my-organizations';
import { AccountButton } from '@/features/account/components/account-button';
import { formatUnitSubtitle } from '@/features/account/unit-subtitle';
import { useMe } from '@/features/auth/api/use-me';
import { ChargePointsScreen } from '@/features/charging/screens/charge-points-screen';

export default function SearchRoute() {
  const { data: user } = useMe();
  const { data: organizations } = useMyOrganizations();

  return (
    <ChargePointsScreen
      subtitle={formatUnitSubtitle(organizations)}
      accountAction={user ? <AccountButton name={user.name} hasPendingAction={!user.emailVerified} /> : null}
    />
  );
}
