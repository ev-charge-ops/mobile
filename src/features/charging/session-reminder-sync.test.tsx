import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import type { PropsWithChildren } from 'react';

import * as chargingApi from '@/features/charging/api/charging-api';
import { useStartSession, useStopSession } from '@/features/charging/api/use-charging-sessions';
import { resetSessionRemindersCache, syncSessionReminders } from '@/features/charging/session-reminder-sync';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';

jest.mock('@/features/charging/api/charging-api', () => ({
  ...jest.requireActual('@/features/charging/api/charging-api'),
  startSession: jest.fn(),
  stopSession: jest.fn(),
}));

const notifications = jest.mocked(Notifications);
const api = jest.mocked(chargingApi);

function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function projectedSession(overrides: Parameters<typeof buildSession>[0] = {}) {
  return buildSession({
    id: 's1',
    status: 'ACTIVE',
    projectedChargingEndsAt: minutesFromNow(30),
    projectedGraceEndsAt: minutesFromNow(40),
    projectedIdleStartsAt: minutesFromNow(40),
    ...overrides,
  });
}

function scheduled(identifier: string) {
  return { identifier, content: { data: { fireAt: minutesFromNow(30) } }, trigger: null } as never;
}

function scheduledIdentifiers() {
  return notifications.scheduleNotificationAsync.mock.calls.map(([request]) => request.identifier);
}

function wrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  resetSessionRemindersCache();
  notifications.getAllScheduledNotificationsAsync.mockResolvedValue([]);
});

describe('syncSessionReminders', () => {
  it('schedules the completion, grace and idle reminders of an active session', async () => {
    await syncSessionReminders(projectedSession());

    expect(scheduledIdentifiers()).toEqual([
      'session-reminder:s1:complete',
      'session-reminder:s1:grace',
      'session-reminder:s1:idle',
    ]);
    expect(notifications.scheduleNotificationAsync.mock.calls[0][0].content.data).toMatchObject({
      type: 'SESSION_REMINDER',
      sessionId: 's1',
      reminder: 'complete',
    });
  });

  it('does not touch the schedule again for the same projection', async () => {
    await syncSessionReminders(projectedSession());
    await syncSessionReminders(projectedSession({ energyKwh: 3 }));

    expect(notifications.getAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });

  it('cancels only the reminders of a session that ended', async () => {
    notifications.getAllScheduledNotificationsAsync.mockResolvedValue([
      scheduled('session-reminder:s1:complete'),
      scheduled('session-reminder:s2:complete'),
    ]);

    await syncSessionReminders(buildClosedSession({ id: 's1' }));

    expect(notifications.cancelScheduledNotificationAsync.mock.calls).toEqual([['session-reminder:s1:complete']]);
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels every session reminder when there is no open session', async () => {
    notifications.getAllScheduledNotificationsAsync.mockResolvedValue([
      scheduled('session-reminder:s1:idle'),
      scheduled('session-reminder:s2:grace'),
    ]);

    await syncSessionReminders(null);

    expect(notifications.cancelScheduledNotificationAsync.mock.calls).toEqual([
      ['session-reminder:s1:idle'],
      ['session-reminder:s2:grace'],
    ]);
  });
});

describe('session mutations', () => {
  it('schedules the reminders as soon as the session starts', async () => {
    api.startSession.mockResolvedValue({ ...projectedSession(), paymentSheet: null });
    const { result } = await renderHook(() => useStartSession(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ chargePointId: 'cp-1' });
    });

    await waitFor(() =>
      expect(scheduledIdentifiers()).toEqual([
        'session-reminder:s1:complete',
        'session-reminder:s1:grace',
        'session-reminder:s1:idle',
      ]),
    );
  });

  it('cancels the reminders when the driver stops the session', async () => {
    notifications.getAllScheduledNotificationsAsync.mockResolvedValue([scheduled('session-reminder:s1:complete')]);
    api.stopSession.mockResolvedValue(buildClosedSession({ id: 's1' }));
    const { result } = await renderHook(() => useStopSession('s1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() =>
      expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('session-reminder:s1:complete'),
    );
  });
});
