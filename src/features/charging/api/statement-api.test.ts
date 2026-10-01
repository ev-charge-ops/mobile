import { ChargingApiError } from '@/features/charging/api/charging-api';
import { getMyMonthlyStatement } from '@/features/charging/api/statement-api';

const mockFetch = jest.fn<Promise<Response>, [Request]>();

jest.mock('@/lib/api-client', () => {
  const createClient = jest.requireActual('openapi-fetch').default;
  return { apiClient: createClient({ baseUrl: 'https://api.test', fetch: (request: Request) => mockFetch(request) }) };
});

function respond(status: number, body?: unknown) {
  mockFetch.mockResolvedValueOnce(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('getMyMonthlyStatement', () => {
  it('loads the statement of the month', async () => {
    respond(200, { month: '2026-09', totalCents: 8333 });

    await expect(getMyMonthlyStatement('2026-09')).resolves.toEqual({ month: '2026-09', totalCents: 8333 });
    expect(mockFetch.mock.calls[0][0].url).toBe('https://api.test/me/statements/2026-09');
  });

  it('returns null when the driver has no condo unit', async () => {
    respond(404, { statusCode: 404 });

    await expect(getMyMonthlyStatement('2026-09')).resolves.toBeNull();
  });

  it('fails on other errors', async () => {
    respond(500, {});
    await expect(getMyMonthlyStatement('2026-09')).rejects.toEqual(new ChargingApiError(500));

    mockFetch.mockRejectedValueOnce(new TypeError('offline'));
    await expect(getMyMonthlyStatement('2026-09')).rejects.toBeInstanceOf(ChargingApiError);
  });
});
