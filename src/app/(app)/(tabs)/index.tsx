import { useMemo } from 'react';

import { useMyOrganizations } from '@/features/account/api/use-my-organizations';
import { getInitials } from '@/features/account/account-initials';
import { useMe } from '@/features/auth/api/use-me';
import { hasOpenSession, useActiveSession } from '@/features/charging/api/use-charging-sessions';
import { formatDistance } from '@/features/charging/charge-point-distance';
import { useNearbyChargePoints } from '@/features/charging/use-nearby-charge-points';
import { formatGreeting, formatHomeSubtitle, toHomeCharge, toHomePoint } from '@/features/home/home-summary';
import { HomeScreen } from '@/features/home/screens/home-screen';
import { NotificationsBell } from '@/features/notifications/components/notifications-bell';
import { useNow } from '@/hooks/use-now';

const ETA_REFRESH_MS = 30_000;

export default function HomeRoute() {
  const { data: user } = useMe();
  const organizationsQuery = useMyOrganizations();
  const sessionQuery = useActiveSession();
  const pointsQuery = useNearbyChargePoints();
  const session = hasOpenSession(sessionQuery.data) ? sessionQuery.data : null;
  const now = useNow(ETA_REFRESH_MS);

  const points = useMemo(
    () =>
      pointsQuery.nearby.map(({ chargePoint, distanceMeters }) =>
        toHomePoint(chargePoint, distanceMeters === null ? null : formatDistance(distanceMeters)),
      ),
    [pointsQuery.nearby],
  );

  const refetchSession = sessionQuery.refetch;
  const refetchPoints = pointsQuery.refetch;
  const refetchOrganizations = organizationsQuery.refetch;
  const onRefresh = useMemo(
    () => () => Promise.all([refetchSession(), refetchPoints(), refetchOrganizations()]),
    [refetchSession, refetchPoints, refetchOrganizations],
  );

  return (
    <HomeScreen
      greeting={formatGreeting(user?.name)}
      initials={user ? getInitials(user.name) : ''}
      subtitle={formatHomeSubtitle(organizationsQuery.data)}
      actions={<NotificationsBell />}
      charge={toHomeCharge(session, now)}
      isChargeLoading={sessionQuery.isPending}
      points={points}
      isPointsLoading={pointsQuery.isPending}
      onRefresh={onRefresh}
    />
  );
}
