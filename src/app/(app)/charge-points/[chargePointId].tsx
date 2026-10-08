import { useLocalSearchParams } from 'expo-router';

import { getMapCenterSource } from '@/config/map-center';
import { useMe } from '@/features/auth/api/use-me';
import { ChargePointScreen } from '@/features/charging/screens/charge-point-screen';

export default function ChargePointRoute() {
  const { chargePointId = '' } = useLocalSearchParams<{ chargePointId?: string }>();
  const { data: user } = useMe();

  return <ChargePointScreen chargePointId={chargePointId} locationSource={getMapCenterSource(user?.locationMode)} />;
}
