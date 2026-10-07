import type { ConfigContext, ExpoConfig } from 'expo/config';

const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY || undefined;
const iosGoogleMapsApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY || undefined;
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || undefined;

export default ({ config }: ConfigContext): ExpoConfig => {
  const baseConfig = config as ExpoConfig;

  return {
    ...baseConfig,
    android: {
      ...baseConfig.android,
      googleServicesFile,
    },
    plugins: [
      ...(baseConfig.plugins ?? []),
      ['react-native-maps', { androidGoogleMapsApiKey, iosGoogleMapsApiKey }],
    ],
  };
};
