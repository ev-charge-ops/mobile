import { acceptInvite, acceptInviteAsCurrentUser, AuthApiError, getInvitePreview } from '@/features/auth/api/auth-api';

const mockFetch = jest.fn<Promise<Response>, [Request]>();

jest.mock('@/lib/api-client', () => {
  const createClient = jest.requireActual('openapi-fetch').default;
  const options = { baseUrl: 'https://api.test', fetch: (request: Request) => mockFetch(request) };
  return { apiClient: createClient(options), publicApiClient: createClient(options) };
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

describe('invite api', () => {
  it('loads the invite preview', async () => {
    const preview = {
      organizationName: 'Residencial Aclimação',
      email: 'ana@example.com',
      unitLabel: 'B · 42',
      expiresAt: '2026-10-20T00:00:00.000Z',
      status: 'PENDING',
    };
    respond(200, preview);

    await expect(getInvitePreview('abc')).resolves.toEqual(preview);
    expect(mockFetch.mock.calls[0][0].url).toBe('https://api.test/invites/abc');
  });

  it('exposes the error code returned by the api', async () => {
    respond(404, { statusCode: 404, message: 'Invite not found', code: 'INVITE_NOT_FOUND' });

    const error = await getInvitePreview('missing').catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(AuthApiError);
    expect(error).toMatchObject({ status: 404, code: 'INVITE_NOT_FOUND' });
  });

  it('creates the account when accepting the invite', async () => {
    const session = { accessToken: 'a', refreshToken: 'r', user: { id: 'u1' } };
    respond(201, session);

    await expect(acceptInvite('abc', { name: 'Ana', password: 'secret-123' })).resolves.toEqual(session);
    const request = mockFetch.mock.calls[0][0];
    expect(request.method).toBe('POST');
    expect(request.url).toBe('https://api.test/invites/abc/accept');
    expect(await request.json()).toEqual({ name: 'Ana', password: 'secret-123' });
  });

  it('accepts the invite as the current user', async () => {
    respond(204);

    await expect(acceptInviteAsCurrentUser('abc')).resolves.toBeUndefined();
    expect(mockFetch.mock.calls[0][0].url).toBe('https://api.test/invites/abc/accept-authenticated');
  });

  it('keeps a null code when the error body has none', async () => {
    respond(401, { message: 'Unauthorized', statusCode: 401 });

    await expect(acceptInviteAsCurrentUser('abc')).rejects.toMatchObject({ status: 401, code: null });
  });
});
