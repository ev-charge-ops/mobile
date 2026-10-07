import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import * as organizationsApi from '@/features/home/api/organizations-api';
import { OrganizationsCard } from '@/features/home/components/organizations-card';

jest.mock('@/features/home/api/organizations-api', () => ({ listMyOrganizations: jest.fn() }));

const api = jest.mocked(organizationsApi);

function renderCard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

  function Providers({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(<OrganizationsCard />, { wrapper: Providers });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<OrganizationsCard />', () => {
  it('lists the organizations with unit and role', async () => {
    api.listMyOrganizations.mockResolvedValue([
      { id: 'o1', name: 'Residencial Aclimação', type: 'PRIVATE', role: 'DRIVER', unitLabel: 'B · 42' },
      { id: 'o2', name: 'Condomínio Jardins', type: 'PRIVATE', role: 'MANAGER', unitLabel: null },
    ]);

    await renderCard();

    expect(await screen.findByText('Residencial Aclimação')).toBeOnTheScreen();
    expect(screen.getByText('Unidade B · 42')).toBeOnTheScreen();
    expect(screen.getByText('Motorista')).toBeOnTheScreen();
    expect(screen.getByText('Condomínio Jardins')).toBeOnTheScreen();
    expect(screen.getByText('Gestor')).toBeOnTheScreen();
    expect(screen.getByText('Meus condomínios')).toBeOnTheScreen();
  });

  it('shows the empty state with a hint to ask for an invite', async () => {
    api.listMyOrganizations.mockResolvedValue([]);

    await renderCard();

    expect(await screen.findByText('Você ainda não faz parte de um condomínio')).toBeOnTheScreen();
    expect(screen.getByText(/Peça ao gestor do seu condomínio um convite/)).toBeOnTheScreen();
  });

  it('retries after a failure', async () => {
    api.listMyOrganizations
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([
        { id: 'o1', name: 'Residencial Aclimação', type: 'PRIVATE', role: 'DRIVER', unitLabel: null },
      ]);

    await renderCard();
    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Residencial Aclimação')).toBeOnTheScreen();
    expect(screen.getByText('Meu condomínio')).toBeOnTheScreen();
  });
});
