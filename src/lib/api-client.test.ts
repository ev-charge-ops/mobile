import createClient from 'openapi-fetch';

import { createAuthMiddleware, type AuthTokenHandlers } from '@/lib/api-client';

type TestPaths = {
  '/me': {
    get: {
      parameters: { query?: never; header?: never; path?: never; cookie?: never };
      requestBody?: never;
      responses: { 200: { headers: Record<string, unknown>; content: { 'application/json': { id: string } } } };
    };
  };
};

class NativeFetchResponse {
  readonly headers = new Headers({ 'Content-Type': 'application/json' });
  readonly statusText = '';

  constructor(
    private readonly body: string,
    readonly status: number,
  ) {}

  get ok() {
    return this.status >= 200 && this.status < 300;
  }

  get [Symbol.toStringTag]() {
    return 'Response';
  }

  async text() {
    return this.body;
  }

  async json() {
    return JSON.parse(this.body);
  }
}

function setup(handlers: AuthTokenHandlers | null, responses: number[], { native = false } = {}) {
  const fetchMock = jest.fn(async (request: Request) => {
    const status = responses.shift() ?? 200;
    const body = JSON.stringify({ id: '1', auth: request.headers.get('Authorization') });
    if (native) return new NativeFetchResponse(body, status) as unknown as Response;
    return new Response(body, { status, headers: { 'Content-Type': 'application/json' } });
  });
  const client = createClient<TestPaths>({ baseUrl: 'https://api.test', fetch: fetchMock });
  client.use(createAuthMiddleware(() => handlers));
  return { client, fetchMock };
}

describe('createAuthMiddleware', () => {
  it('sends the access token as a bearer token', async () => {
    const { client, fetchMock } = setup(
      { getAccessToken: () => 'token-1', refreshAccessToken: jest.fn() },
      [200],
    );

    await client.GET('/me');

    expect(fetchMock.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer token-1');
  });

  it('does not set the header without handlers', async () => {
    const { client, fetchMock } = setup(null, [200]);

    await client.GET('/me');

    expect(fetchMock.mock.calls[0][0].headers.get('Authorization')).toBeNull();
  });

  it('refreshes the token and retries once on 401', async () => {
    const refreshAccessToken = jest.fn().mockResolvedValue('token-2');
    const { client, fetchMock } = setup({ getAccessToken: () => 'token-1', refreshAccessToken }, [401, 200]);

    const { response } = await client.GET('/me');

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0].headers.get('Authorization')).toBe('Bearer token-2');
    expect(response.status).toBe(200);
  });

  it('calls onUnauthorized when the refresh fails', async () => {
    const onUnauthorized = jest.fn();
    const { client, fetchMock } = setup(
      { getAccessToken: () => 'token-1', refreshAccessToken: jest.fn().mockResolvedValue(null), onUnauthorized },
      [401],
    );

    const { response } = await client.GET('/me');

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });

  describe('with a native fetch whose responses are not global Response instances', () => {
    it('returns the response data', async () => {
      const { client } = setup({ getAccessToken: () => 'token-1', refreshAccessToken: jest.fn() }, [200], {
        native: true,
      });

      const { data, response } = await client.GET('/me');

      expect(response.status).toBe(200);
      expect(data).toEqual({ id: '1', auth: 'Bearer token-1' });
    });

    it('returns the error response when the refresh fails', async () => {
      const onUnauthorized = jest.fn();
      const { client } = setup(
        { getAccessToken: () => 'token-1', refreshAccessToken: jest.fn().mockResolvedValue(null), onUnauthorized },
        [401],
        { native: true },
      );

      const { response } = await client.GET('/me');

      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(401);
    });

    it('returns the retried response after refreshing the token', async () => {
      const refreshAccessToken = jest.fn().mockResolvedValue('token-2');
      const { client } = setup({ getAccessToken: () => 'token-1', refreshAccessToken }, [401, 200], {
        native: true,
      });

      const { data, response } = await client.GET('/me');

      expect(response.status).toBe(200);
      expect(data).toEqual({ id: '1', auth: 'Bearer token-2' });
    });
  });
});
