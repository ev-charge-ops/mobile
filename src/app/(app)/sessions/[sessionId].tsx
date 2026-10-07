import { useLocalSearchParams } from 'expo-router';

import { SessionScreen } from '@/features/charging/screens/session-screen';

export default function SessionRoute() {
  const { sessionId = '' } = useLocalSearchParams<{ sessionId?: string }>();

  return <SessionScreen sessionId={sessionId} />;
}
