import { router } from 'expo-router';

import { ConsentScreen } from '@/features/privacy/screens/consent-screen';

export default function PrivacyRoute() {
  return <ConsentScreen mode="settings" onBack={() => router.back()} onDone={() => router.back()} />;
}
