import { listChargePoints, listChargePointsInBounds } from '@/features/charging/api/charging-api';
import { buildChargePoint } from '@/features/charging/testing/fixtures';
import { buildMapItem } from '@/features/charging/testing/map-fixtures';

const mockFetch = jest.fn<Promise<Response>, [Request]>();

jest.mock('@/lib/api-client', () => {
  const createClient = jest.requireActual('openapi-fetch').default;
  return { apiClient: createClient({ baseUrl: 'https://api.test', fetch: (request: Request) => mockFetch(request) }) };
});

function respond(body: unknown) {
  mockFetch.mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } }),
  );
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('listChargePoints', () => {
  it('keeps only the full charge points of the capped list', async () => {
    respond([buildChargePoint(), buildMapItem({ id: 'map-1' })]);

    await expect(listChargePoints()).resolves.toEqual([buildChargePoint()]);
    expect(mockFetch.mock.calls[0][0].url).toBe('https://api.test/charge-points');
  });
});

describe('listChargePointsInBounds', () => {
  it('asks for the map items inside the viewport', async () => {
    respond([buildMapItem({ id: 'map-1' })]);

    const items = await listChargePointsInBounds('-46.75,-23.65,-46.55,-23.45', 1);

    expect(items.map((item) => item.id)).toEqual(['map-1']);
    expect(decodeURIComponent(mockFetch.mock.calls[0][0].url)).toBe(
      'https://api.test/charge-points?bbox=-46.75,-23.65,-46.55,-23.45&limit=1',
    );
  });
});
