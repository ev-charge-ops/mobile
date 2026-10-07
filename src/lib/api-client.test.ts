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

function setup(handlers: AuthTokenHandlers | null, responses: number[]) {
  const fetchMock = jest.fn(async (request: Request) => {
    const status = responses.shift() ?? 200;
    return new Response(JSON.stringify({ id: '1', auth: request.headers.get('Authorization') }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
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
});
