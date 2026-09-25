import { getNotificationHref, getPushNotificationId } from '@/features/notifications/notification-routing';

describe('getNotificationHref', () => {
  it.each([
    'SESSION_ACTIVE',
    'CHARGING_COMPLETE',
    'IDLE_FEE_STARTED',
    'PAYMENT_CAPTURED',
    'PAYMENT_FAILED',
    'SESSION_INTERRUPTED',
    'SESSION_REMINDER',
  ])('opens the session for %s', (type) => {
    expect(getNotificationHref(type, { sessionId: 's1', chargePointId: 'cp-1' })).toEqual({
      pathname: '/sessions/[sessionId]',
      params: { sessionId: 's1' },
    });
  });

  it('opens the charge point for a queue turn', () => {
    expect(getNotificationHref('QUEUE_TURN', { queueEntryId: 'q1', chargePointId: 'cp-1' })).toEqual({
      pathname: '/charge-points/[chargePointId]',
      params: { chargePointId: 'cp-1' },
    });
  });

  it('opens the account for an organization invite', () => {
    expect(getNotificationHref('ORGANIZATION_INVITE', { inviteId: 'i1' })).toBe('/account');
  });

  it('ignores unknown types and missing ids', () => {
    expect(getNotificationHref('SOMETHING_NEW', { sessionId: 's1' })).toBeNull();
    expect(getNotificationHref('CHARGING_COMPLETE', {})).toBeNull();
    expect(getNotificationHref('QUEUE_TURN', { chargePointId: 42 })).toBeNull();
    expect(getNotificationHref(undefined, null)).toBeNull();
  });
});

describe('getPushNotificationId', () => {
  it('reads the notification id from the push data', () => {
    expect(getPushNotificationId({ notificationId: 'n1', type: 'CHARGING_COMPLETE' })).toBe('n1');
    expect(getPushNotificationId({ sessionId: 's1' })).toBeNull();
    expect(getPushNotificationId(undefined)).toBeNull();
  });
});
