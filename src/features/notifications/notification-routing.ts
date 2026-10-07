import type { Href } from 'expo-router';

const sessionTypes = new Set([
  'SESSION_ACTIVE',
  'CHARGING_COMPLETE',
  'IDLE_FEE_STARTED',
  'PAYMENT_CAPTURED',
  'PAYMENT_FAILED',
  'SESSION_INTERRUPTED',
  'SESSION_REMINDER',
]);

function readString(data: Record<string, unknown> | null | undefined, key: string) {
  const value = data?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function getNotificationHref(type: unknown, data: Record<string, unknown> | null | undefined): Href | null {
  if (typeof type !== 'string') return null;

  if (sessionTypes.has(type)) {
    const sessionId = readString(data, 'sessionId');
    return sessionId ? { pathname: '/sessions/[sessionId]', params: { sessionId } } : null;
  }

  if (type === 'QUEUE_TURN') {
    const chargePointId = readString(data, 'chargePointId');
    return chargePointId ? { pathname: '/charge-points/[chargePointId]', params: { chargePointId } } : null;
  }

  if (type === 'ORGANIZATION_INVITE') return '/account';

  return null;
}

export function getPushNotificationId(data: Record<string, unknown> | null | undefined) {
  return readString(data, 'notificationId');
}
