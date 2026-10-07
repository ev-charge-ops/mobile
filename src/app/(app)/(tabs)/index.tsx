import { AccountButton } from '@/features/account/components/account-button';
import { useMe } from '@/features/auth/api/use-me';
import { ChargePointsScreen } from '@/features/charging/screens/charge-points-screen';

export default function SearchRoute() {
  const { data: user } = useMe();

  return (
    <ChargePointsScreen
      accountAction={user ? <AccountButton name={user.name} hasPendingAction={!user.emailVerified} /> : null}
    />
  );
}
