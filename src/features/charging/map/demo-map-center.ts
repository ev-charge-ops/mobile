import type { ChargePoint } from '@/features/charging/api/charging-api';
import type { Coordinates } from '@/features/charging/map/map-region';

export function getDemoMapCenter(chargePoints: ChargePoint[], fallback: Coordinates): Coordinates {
  const homePoints = chargePoints.filter((chargePoint) => chargePoint.type === 'PRIVATE' && chargePoint.isMember);
  const homeOrganizationId = homePoints[0]?.organizationId;
  const condominium = homePoints.filter((chargePoint) => chargePoint.organizationId === homeOrganizationId);
  if (condominium.length === 0) return { latitude: fallback.latitude, longitude: fallback.longitude };

  const sum = condominium.reduce(
    (total, chargePoint) => ({
      latitude: total.latitude + chargePoint.latitude,
      longitude: total.longitude + chargePoint.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );
  return { latitude: sum.latitude / condominium.length, longitude: sum.longitude / condominium.length };
}
