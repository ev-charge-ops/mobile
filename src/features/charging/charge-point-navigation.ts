import { router } from 'expo-router';

export function openChargePoint(chargePointId: string) {
  router.push({ pathname: '/charge-points/[chargePointId]', params: { chargePointId } });
}
