import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AccountScreen, type AccountScreenProps } from '@/features/account/screens/account-screen';

import * as organizationsApi from '@/features/account/api/organizations-api';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), navigate: jest.fn() } }));
jest.mock('@/features/account/api/organizations-api', () => ({ listMyOrganizations: jest.fn() }));

const organizationsMock = jest.mocked(organizationsApi);

const user: AccountScreenProps['user'] = {
  id: 'u1',
  name: 'Ana Souza',
  email: 'ana@example.com',
  role: 'DRIVER',
  emailVerified: true,
  hasPassword: true,
  paymentMode: 'TEST',
  locationMode: 'DEMO',
  autoRefund: false,
};

async function renderScreen(
  overrides: Partial<AccountScreenProps['user']> = {},
  props: Partial<AccountScreenProps> = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

  function Providers({ children }: PropsWithChildren) {
    return (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  await render(<AccountScreen user={{ ...user, ...overrides }} onSignOut={jest.fn()} {...props} />, {
    wrapper: Providers,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  organizationsMock.listMyOrganizations.mockResolvedValue([]);
});

describe('<AccountScreen />', () => {
  it('shows the profile without the design system shortcut', async () => {
    await renderScreen();

    expect(screen.getByText('Conta')).toBeOnTheScreen();
    expect(screen.getByText('AS')).toBeOnTheScreen();
    expect(screen.getByText('Ana Souza')).toBeOnTheScreen();
    expect(await screen.findByText(/Você ainda não faz parte de um condomínio/)).toBeOnTheScreen();
    expect(screen.queryByText('Ver design system')).not.toBeOnTheScreen();
  });

  it('opens the personal data and change password screens', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Editar perfil' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(router.push).toHaveBeenNthCalledWith(1, '/profile');
    expect(router.push).toHaveBeenNthCalledWith(2, '/change-password');
  });

  it('shows the condo, the unit and the month summary', async () => {
    organizationsMock.listMyOrganizations.mockResolvedValue([
      { id: 'o1', name: 'Residencial Aclimação', type: 'CONDOMINIUM', role: 'DRIVER', unitLabel: 'B · 42' },
    ] as never);
    await renderScreen({}, { monthSummary: { energyKwh: 54.3, totalCents: 8333 } });

    expect(await screen.findByText('Residencial Aclimação · B · 42')).toBeOnTheScreen();
    expect(screen.getByText('54,30')).toBeOnTheScreen();
    expect(screen.getByText('83,33')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('account-month'));
    expect(router.navigate).toHaveBeenCalledWith('/history');
  });

  it('opens privacy and signs out', async () => {
    const onSignOut = jest.fn();
    await renderScreen({}, { onSignOut });

    await fireEvent.press(screen.getByRole('button', { name: 'Privacidade e dados' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sair' }));

    expect(router.push).toHaveBeenCalledWith('/privacy');
    expect(onSignOut).toHaveBeenCalled();
  });

  it('offers to create a password when the account has none', async () => {
    await renderScreen({ hasPassword: false });

    expect(screen.getByRole('button', { name: 'Criar senha' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Alterar senha' })).not.toBeOnTheScreen();
  });
});
