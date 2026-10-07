import { getMapCenterSource } from '@/config/map-center';
import { useMe } from '@/features/auth/api/use-me';
import { ChargePointsScreen } from '@/features/charging/screens/charge-points-screen';

export default function PointsRoute() {
  const { data: user } = useMe();

  return <ChargePointsScreen locationSource={getMapCenterSource(user?.locationMode)} />;
}
