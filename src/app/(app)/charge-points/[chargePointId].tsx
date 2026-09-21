import { useLocalSearchParams } from 'expo-router';

import { ChargePointScreen } from '@/features/charging/screens/charge-point-screen';

export default function ChargePointRoute() {
  const { chargePointId = '' } = useLocalSearchParams<{ chargePointId?: string }>();

  return <ChargePointScreen chargePointId={chargePointId} />;
}
