import * as chargingApi from '@/features/charging/api/charging-api';
import { findNearestChargePoint, NEARBY_RADIUS_METERS } from '@/features/charging/api/nearest-charge-point';
import { buildMapItem } from '@/features/charging/testing/map-fixtures';

jest.mock('@/features/charging/api/charging-api', () => ({
  ...jest.requireActual('@/features/charging/api/charging-api'),
  listChargePointsInBounds: jest.fn(),
}));

const api = jest.mocked(chargingApi);
const recife = { latitude: -8.0476, longitude: -34.877 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('findNearestChargePoint', () => {
  it('asks for the single nearest point in a box around the user', async () => {
    const point = buildMapItem({ latitude: -8.06, longitude: -34.9 });
    api.listChargePointsInBounds.mockResolvedValue([point]);

    await expect(findNearestChargePoint(recife, NEARBY_RADIUS_METERS)).resolves.toBe(point);
    const [bbox, limit] = api.listChargePointsInBounds.mock.calls[0];
    const [minLongitude, minLatitude, maxLongitude, maxLatitude] = bbox.split(',').map(Number);
    expect(limit).toBe(1);
    expect((minLatitude + maxLatitude) / 2).toBeCloseTo(recife.latitude, 4);
    expect((minLongitude + maxLongitude) / 2).toBeCloseTo(recife.longitude, 4);
  });

  it('ignores a point in the corner of the box beyond the radius', async () => {
    api.listChargePointsInBounds.mockResolvedValue([buildMapItem({ latitude: -8.47, longitude: -34.45 })]);

    await expect(findNearestChargePoint(recife, NEARBY_RADIUS_METERS)).resolves.toBeNull();
  });

  it('returns null without points', async () => {
    api.listChargePointsInBounds.mockResolvedValue([]);

    await expect(findNearestChargePoint(recife, NEARBY_RADIUS_METERS)).resolves.toBeNull();
  });
});
