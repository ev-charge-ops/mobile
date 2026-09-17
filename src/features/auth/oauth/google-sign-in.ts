import { Platform, TurboModuleRegistry } from 'react-native';

import { env } from '@/config/env';

type GoogleSigninLibrary = typeof import('@react-native-google-signin/google-signin');

export type GoogleSignInResult = { type: 'success'; idToken: string } | { type: 'cancelled' };

let library: GoogleSigninLibrary | null = null;

export function isGoogleSignInAvailable() {
  return Platform.OS !== 'web' && Boolean(env.googleWebClientId) && TurboModuleRegistry.get('RNGoogleSignin') != null;
}

function loadGoogleSignin() {
  if (!library) {
    library = require('@react-native-google-signin/google-signin') as GoogleSigninLibrary;
    library.GoogleSignin.configure({ webClientId: env.googleWebClientId, iosClientId: env.googleIosClientId });
  }
  return library;
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const { GoogleSignin, isCancelledResponse, isErrorWithCode, statusCodes } = loadGoogleSignin();
  try {
    if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (isCancelledResponse(response)) return { type: 'cancelled' };
    if (!response.data.idToken) throw new Error('Google Sign-In did not return an ID token');
    return { type: 'success', idToken: response.data.idToken };
  } catch (error) {
    const cancelledCodes = [statusCodes.SIGN_IN_CANCELLED, statusCodes.IN_PROGRESS];
    if (isErrorWithCode(error) && cancelledCodes.includes(error.code)) return { type: 'cancelled' };
    throw error;
  }
}

export async function signOutFromGoogle() {
  if (!isGoogleSignInAvailable()) return;
  try {
    const { GoogleSignin } = loadGoogleSignin();
    await GoogleSignin.signOut();
  } catch {
    return;
  }
}
