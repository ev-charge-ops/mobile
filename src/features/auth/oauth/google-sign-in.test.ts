import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform, TurboModuleRegistry } from 'react-native';

import { isGoogleSignInAvailable, signInWithGoogle, signOutFromGoogle } from '@/features/auth/oauth/google-sign-in';

jest.mock('@/config/env', () => ({
  env: { apiUrl: 'https://api.test', googleWebClientId: 'web-client-id', googleIosClientId: 'ios-client-id' },
}));

beforeEach(() => {
  jest.spyOn(TurboModuleRegistry, 'get').mockReturnValue({} as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('google sign-in', () => {
  it('is unavailable without the native module or on web', () => {
    expect(isGoogleSignInAvailable()).toBe(true);

    jest.spyOn(TurboModuleRegistry, 'get').mockReturnValue(null);
    expect(isGoogleSignInAvailable()).toBe(false);

    jest.spyOn(TurboModuleRegistry, 'get').mockReturnValue({} as never);
    jest.replaceProperty(Platform, 'OS', 'web');
    expect(isGoogleSignInAvailable()).toBe(false);
  });

  it('returns the id token after configuring the client ids', async () => {
    await expect(signInWithGoogle()).resolves.toEqual({ type: 'success', idToken: 'mockIdToken' });
  });

  it('treats a cancelled response as cancellation', async () => {
    jest.spyOn(GoogleSignin, 'signIn').mockResolvedValue({ type: 'cancelled', data: null });

    await expect(signInWithGoogle()).resolves.toEqual({ type: 'cancelled' });
  });

  it('treats the cancelled status code as cancellation', async () => {
    jest
      .spyOn(GoogleSignin, 'signIn')
      .mockRejectedValue(Object.assign(new Error('cancelled'), { code: statusCodes.SIGN_IN_CANCELLED }));

    await expect(signInWithGoogle()).resolves.toEqual({ type: 'cancelled' });
  });

  it('rethrows other errors', async () => {
    jest.spyOn(GoogleSignin, 'signIn').mockRejectedValue(new Error('network'));

    await expect(signInWithGoogle()).rejects.toThrow('network');
  });

  it('signs out of google', async () => {
    const signOut = jest.spyOn(GoogleSignin, 'signOut');

    await signOutFromGoogle();

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
