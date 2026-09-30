import { useMyOrganizations } from '@/features/account/api/use-my-organizations';
import { formatUnitSubtitle } from '@/features/account/unit-subtitle';
import { ChargePointsScreen } from '@/features/charging/screens/charge-points-screen';

export default function PointsRoute() {
  const { data: organizations } = useMyOrganizations();

  return <ChargePointsScreen subtitle={formatUnitSubtitle(organizations)} />;
}
