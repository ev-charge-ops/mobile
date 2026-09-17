import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import type { AppleLoginInput } from '@/features/auth/api/auth-api';

export type AppleSignInResult = ({ type: 'success' } & AppleLoginInput) | { type: 'cancelled' };

export async function isAppleSignInAvailable() {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

function toFullName(fullName: AppleAuthentication.AppleAuthenticationFullName | null) {
  const givenName = fullName?.givenName?.trim() || undefined;
  const familyName = fullName?.familyName?.trim() || undefined;
  if (!givenName && !familyName) return undefined;
  return { givenName, familyName };
}

function isCancellation(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ERR_REQUEST_CANCELED';
}

export async function signInWithApple(): Promise<AppleSignInResult> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) throw new Error('Sign in with Apple did not return an identity token');
    return { type: 'success', identityToken: credential.identityToken, fullName: toFullName(credential.fullName) };
  } catch (error) {
    if (isCancellation(error)) return { type: 'cancelled' };
    throw error;
  }
}
