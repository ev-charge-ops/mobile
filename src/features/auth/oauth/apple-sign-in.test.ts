import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { isAppleSignInAvailable, signInWithApple } from '@/features/auth/oauth/apple-sign-in';

const apple = jest.mocked(AppleAuthentication);

function credential(overrides: Partial<AppleAuthentication.AppleAuthenticationCredential>) {
  return {
    user: 'apple-user',
    state: null,
    fullName: null,
    email: null,
    realUserStatus: 1,
    identityToken: 'apple-identity-token',
    authorizationCode: 'code',
    ...overrides,
  } as AppleAuthentication.AppleAuthenticationCredential;
}

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('apple sign-in', () => {
  it('is only available on iOS when the device supports it', async () => {
    apple.isAvailableAsync.mockResolvedValue(true);
    expect(await isAppleSignInAvailable()).toBe(true);

    jest.replaceProperty(Platform, 'OS', 'android');
    expect(await isAppleSignInAvailable()).toBe(false);
  });

  it('requests the name and email scopes and returns the token with the shared name', async () => {
    apple.signInAsync.mockResolvedValue(
      credential({
        fullName: {
          givenName: 'Ana',
          familyName: 'Souza',
          middleName: null,
          namePrefix: null,
          nameSuffix: null,
          nickname: null,
        },
      }),
    );

    await expect(signInWithApple()).resolves.toEqual({
      type: 'success',
      identityToken: 'apple-identity-token',
      fullName: { givenName: 'Ana', familyName: 'Souza' },
    });
    expect(apple.signInAsync).toHaveBeenCalledWith({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  });

  it('omits the name when apple does not share it', async () => {
    apple.signInAsync.mockResolvedValue(credential({}));

    await expect(signInWithApple()).resolves.toEqual({
      type: 'success',
      identityToken: 'apple-identity-token',
      fullName: undefined,
    });
  });

  it('treats ERR_REQUEST_CANCELED as cancellation', async () => {
    apple.signInAsync.mockRejectedValue(Object.assign(new Error('canceled'), { code: 'ERR_REQUEST_CANCELED' }));

    await expect(signInWithApple()).resolves.toEqual({ type: 'cancelled' });
  });
});
