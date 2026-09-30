import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as notificationsApi from '@/features/notifications/api/notifications-api';
import { formatBellLabel, NotificationsBell } from '@/features/notifications/components/notifications-bell';
import { buildNotification, buildNotificationPage } from '@/features/notifications/testing/notification-fixtures';
import { renderWithProviders } from '@/features/notifications/testing/render-with-providers';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

jest.mock('@/features/notifications/api/notifications-api', () => ({
  listMyNotifications: jest.fn(),
}));

const api = jest.mocked(notificationsApi);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<NotificationsBell />', () => {
  it('formats the accessible label with the unread count', () => {
    expect(formatBellLabel(0)).toBe('Avisos');
    expect(formatBellLabel(1)).toBe('Avisos, 1 aviso não lido');
    expect(formatBellLabel(4)).toBe('Avisos, 4 avisos não lidos');
  });

  it('shows the unread badge and opens the notices', async () => {
    api.listMyNotifications.mockResolvedValue(buildNotificationPage([buildNotification({ id: 'n1' })], { unreadCount: 2 }));

    await renderWithProviders(<NotificationsBell />);

    const bell = await screen.findByRole('button', { name: 'Avisos, 2 avisos não lidos' });
    expect(screen.getByTestId('notifications-bell-badge')).toBeOnTheScreen();

    await fireEvent.press(bell);
    expect(router.push).toHaveBeenCalledWith('/notifications');
  });

  it('hides the badge when everything is read', async () => {
    api.listMyNotifications.mockResolvedValue(buildNotificationPage([], { unreadCount: 0 }));

    await renderWithProviders(<NotificationsBell />);

    expect(await screen.findByRole('button', { name: 'Avisos' })).toBeOnTheScreen();
    expect(screen.queryByTestId('notifications-bell-badge')).toBeNull();
  });
});
