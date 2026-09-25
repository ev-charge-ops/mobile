import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as notificationsApi from '@/features/notifications/api/notifications-api';
import { NotificationsScreen } from '@/features/notifications/screens/notifications-screen';
import { buildNotification, buildNotificationPage } from '@/features/notifications/testing/notification-fixtures';
import { renderWithProviders } from '@/features/notifications/testing/render-with-providers';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

jest.mock('@/features/notifications/api/notifications-api', () => ({
  listMyNotifications: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
}));

const api = jest.mocked(notificationsApi);

beforeEach(() => {
  jest.clearAllMocks();
  api.markNotificationRead.mockResolvedValue({} as never);
  api.markAllNotificationsRead.mockResolvedValue({ markedCount: 1, unreadCount: 0 });
});

describe('<NotificationsScreen />', () => {
  it('lists the notices with unread styling and the unread count', async () => {
    api.listMyNotifications.mockResolvedValue(
      buildNotificationPage([
        buildNotification({ id: 'n1' }),
        buildNotification({
          id: 'n2',
          type: 'PAYMENT_CAPTURED',
          title: 'Pagamento confirmado',
          body: 'R$ 12,78 cobrados no cartão.',
          readAt: '2026-10-07T20:00:00.000Z',
        }),
      ]),
    );

    await renderWithProviders(<NotificationsScreen />);

    expect(await screen.findByText('Recarga concluída')).toBeOnTheScreen();
    expect(api.listMyNotifications).toHaveBeenCalledWith(1, 20);
    expect(screen.getByText('Pagamento confirmado')).toBeOnTheScreen();
    expect(screen.getByText('1 aviso não lido')).toBeOnTheScreen();
    expect(screen.getAllByText('há 5 min')).toHaveLength(2);
    expect(screen.getByTestId('notification-unread-n1')).toBeOnTheScreen();
    expect(screen.queryByTestId('notification-unread-n2')).toBeNull();
  });

  it('marks a notice as read and opens its session', async () => {
    api.listMyNotifications.mockResolvedValue(buildNotificationPage([buildNotification({ id: 'n1' })]));

    await renderWithProviders(<NotificationsScreen />);
    const card = await screen.findByTestId('notification-n1');
    api.listMyNotifications.mockResolvedValue(
      buildNotificationPage([buildNotification({ id: 'n1', readAt: '2026-10-07T20:00:00.000Z' })]),
    );
    await fireEvent.press(card);

    await waitFor(() => expect(api.markNotificationRead).toHaveBeenCalledWith('n1'));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/sessions/[sessionId]', params: { sessionId: 's1' } });
    await waitFor(() => expect(screen.queryByTestId('notification-unread-n1')).toBeNull());
  });

  it('opens a queue turn without marking an already read notice', async () => {
    api.listMyNotifications.mockResolvedValue(
      buildNotificationPage([
        buildNotification({
          id: 'n3',
          type: 'QUEUE_TURN',
          title: 'Sua vez na fila',
          data: { queueEntryId: 'q1', chargePointId: 'cp-9', chargePointName: 'Vaga 9' },
          readAt: '2026-10-07T20:00:00.000Z',
        }),
      ]),
    );

    await renderWithProviders(<NotificationsScreen />);
    await fireEvent.press(await screen.findByTestId('notification-n3'));

    expect(api.markNotificationRead).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/charge-points/[chargePointId]',
      params: { chargePointId: 'cp-9' },
    });
  });

  it('marks every notice as read', async () => {
    api.listMyNotifications.mockResolvedValue(
      buildNotificationPage([buildNotification({ id: 'n1' }), buildNotification({ id: 'n2' })]),
    );

    await renderWithProviders(<NotificationsScreen />);
    expect(await screen.findByText('2 avisos não lidos')).toBeOnTheScreen();

    api.listMyNotifications.mockResolvedValue(
      buildNotificationPage([
        buildNotification({ id: 'n1', readAt: '2026-10-07T20:00:00.000Z' }),
        buildNotification({ id: 'n2', readAt: '2026-10-07T20:00:00.000Z' }),
      ]),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Marcar todas como lidas' }));

    await waitFor(() => expect(api.markAllNotificationsRead).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Cada evento financeiro é avisado')).toBeOnTheScreen();
    expect(screen.queryByTestId('notification-unread-n1')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Marcar todas como lidas' })).toBeNull();
  });

  it('shows the empty state', async () => {
    api.listMyNotifications.mockResolvedValue(buildNotificationPage([]));

    await renderWithProviders(<NotificationsScreen />);

    expect(await screen.findByText('Nenhum aviso por enquanto')).toBeOnTheScreen();
  });

  it('retries after an error', async () => {
    api.listMyNotifications.mockRejectedValueOnce(new Error('offline'));
    api.listMyNotifications.mockResolvedValue(buildNotificationPage([buildNotification()]));

    await renderWithProviders(<NotificationsScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Recarga concluída')).toBeOnTheScreen();
  });
});
