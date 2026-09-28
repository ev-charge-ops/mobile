import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as authApi from '@/features/auth/api/auth-api';
import { meQueryKey } from '@/features/auth/api/use-me';
import { EditProfileScreen } from '@/features/auth/screens/edit-profile-screen';
import {
  createSessionValue,
  createTestQueryClient,
  renderWithProviders,
  testUser,
} from '@/features/auth/testing/render-with-providers';

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, updateMyProfile: jest.fn() };
});

const api = jest.mocked(authApi);

async function renderScreen(onDone = jest.fn()) {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(meQueryKey, testUser);
  await renderWithProviders(
    <EditProfileScreen user={testUser} onBack={jest.fn()} onDone={onDone} />,
    createSessionValue({ status: 'authenticated', user: testUser }),
    queryClient,
  );
  return { queryClient, onDone };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<EditProfileScreen />', () => {
  it('shows the name and the read-only email', async () => {
    await renderScreen();

    expect(await screen.findByDisplayValue('Ana')).toBeOnTheScreen();
    expect(screen.getByLabelText('E-mail')).toHaveProp('editable', false);
    expect(screen.getByDisplayValue('ana@example.com')).toBeOnTheScreen();
    expect(screen.getByText(/ainda não pode ser alterado/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  it('validates the name before saving', async () => {
    await renderScreen();

    await fireEvent.changeText(screen.getByLabelText('Nome'), ' A ');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('O nome deve ter pelo menos 2 caracteres')).toBeOnTheScreen();
    expect(api.updateMyProfile).not.toHaveBeenCalled();
  });

  it('saves the trimmed name, updates the cached profile and goes back', async () => {
    api.updateMyProfile.mockResolvedValue({ ...testUser, name: 'Ana Souza' });
    const { queryClient, onDone } = await renderScreen();

    await fireEvent.changeText(screen.getByLabelText('Nome'), '  Ana Souza ');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(api.updateMyProfile.mock.calls[0][0]).toEqual({ name: 'Ana Souza' });
    expect(queryClient.getQueryData(meQueryKey)).toEqual({ ...testUser, name: 'Ana Souza' });
    expect(screen.getByText('Dados atualizados')).toBeOnTheScreen();
  });

  it('shows the error when saving fails', async () => {
    api.updateMyProfile.mockRejectedValue(new authApi.AuthApiError(null));
    const { onDone } = await renderScreen();

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Ana Souza');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('Não foi possível conectar ao servidor. Tente novamente.')).toBeOnTheScreen();
    expect(onDone).not.toHaveBeenCalled();
  });
});
