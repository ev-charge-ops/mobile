import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AccountScreen, type AccountScreenProps } from '@/features/account/screens/account-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('@/features/account/api/organizations-api', () => ({ listMyOrganizations: jest.fn().mockResolvedValue([]) }));

const user: AccountScreenProps['user'] = {
  id: 'u1',
  name: 'Ana Souza',
  email: 'ana@example.com',
  role: 'DRIVER',
  emailVerified: true,
  hasPassword: true,
};

async function renderScreen(overrides: Partial<AccountScreenProps['user']> = {}) {
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

  await render(<AccountScreen user={{ ...user, ...overrides }} onSignOut={jest.fn()} />, { wrapper: Providers });
  await screen.findByText('Você ainda não faz parte de um condomínio');
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<AccountScreen />', () => {
  it('shows the profile without the design system shortcut', async () => {
    await renderScreen();

    expect(screen.getByText('AS')).toBeOnTheScreen();
    expect(screen.getByText('Ana Souza')).toBeOnTheScreen();
    expect(screen.queryByText('Ver design system')).not.toBeOnTheScreen();
  });

  it('opens the personal data and change password screens', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Dados pessoais' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(router.push).toHaveBeenNthCalledWith(1, '/profile');
    expect(router.push).toHaveBeenNthCalledWith(2, '/change-password');
  });

  it('offers to create a password when the account has none', async () => {
    await renderScreen({ hasPassword: false });

    expect(screen.getByRole('button', { name: 'Criar senha' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Alterar senha' })).not.toBeOnTheScreen();
  });
});
