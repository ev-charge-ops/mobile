import { getDemoMapCenter } from '@/features/charging/map/demo-map-center';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';

const fallback = { latitude: -23.5692, longitude: -46.6312 };

describe('getDemoMapCenter', () => {
  it('uses the centroid of the private points of the user condominium', () => {
    const center = getDemoMapCenter(
      [
        buildChargePoint({ latitude: -23.569, longitude: -46.631 }),
        buildChargePoint({ id: 'cp-2', latitude: -23.571, longitude: -46.633 }),
        buildCommercialChargePoint({ latitude: -23.55, longitude: -46.6 }),
      ],
      fallback,
    );

    expect(center.latitude).toBeCloseTo(-23.57);
    expect(center.longitude).toBeCloseTo(-46.632);
  });

  it('only looks at the first condominium of the user', () => {
    const center = getDemoMapCenter(
      [
        buildChargePoint({ latitude: -23.569, longitude: -46.631 }),
        buildChargePoint({ id: 'cp-9', organizationId: 'org-9', latitude: -23.4, longitude: -46.5 }),
      ],
      fallback,
    );

    expect(center).toEqual({ latitude: -23.569, longitude: -46.631 });
  });

  it('ignores private points the user is not a member of', () => {
    expect(getDemoMapCenter([buildChargePoint({ isMember: false })], fallback)).toEqual(fallback);
  });

  it('falls back without a condominium', () => {
    expect(getDemoMapCenter([buildCommercialChargePoint()], fallback)).toEqual(fallback);
    expect(getDemoMapCenter([], fallback)).toEqual(fallback);
  });
});
