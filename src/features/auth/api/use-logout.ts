import { useMutation } from '@tanstack/react-query';

import { signOutFromGoogle } from '@/features/auth/oauth/google-sign-in';
import { useSession } from '@/features/auth/session/session-context';
import { unregisterDevicePushToken } from '@/lib/push-notifications';
import { cancelAllScheduledReminders } from '@/lib/scheduled-reminders';

export function useLogout() {
  const { endSession } = useSession();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([unregisterDevicePushToken(), cancelAllScheduledReminders()]);
      await endSession();
      await signOutFromGoogle();
    },
  });
}
