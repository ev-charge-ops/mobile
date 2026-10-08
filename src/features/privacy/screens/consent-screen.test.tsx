import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking, Share } from 'react-native';

import * as privacyApi from '@/features/privacy/api/privacy-api';
import { ConsentScreen } from '@/features/privacy/screens/consent-screen';
import { buildConsents } from '@/features/privacy/testing/consent-fixtures';
import { renderWithProviders } from '@/features/privacy/testing/render-with-providers';

jest.mock('@/features/privacy/api/privacy-api', () => {
  const actual = jest.requireActual('@/features/privacy/api/privacy-api');
  return {
    ...actual,
    getMyConsents: jest.fn(),
    updateMyConsents: jest.fn(),
    exportMyData: jest.fn(),
    deleteMyAccount: jest.fn(),
  };
});

const api = jest.mocked(privacyApi);
const { PrivacyApiError } = jest.requireActual('@/features/privacy/api/privacy-api');

beforeEach(() => {
  jest.clearAllMocks();
  api.getMyConsents.mockResolvedValue(buildConsents());
  api.updateMyConsents.mockResolvedValue(buildConsents({ mustAccept: false, acceptedTermsVersion: '2026-10-07' }));
});

describe('<ConsentScreen />', () => {
  it('locks the required purposes and shows the terms version', async () => {
    await renderWithProviders(<ConsentScreen mode="gate" onSignOut={jest.fn()} />);

    expect(await screen.findByText('Serviço de recarga')).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Serviço de recarga' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Serviço de recarga' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Rateio com o condomínio' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Análise de uso' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Novidades do produto' })).not.toBeChecked();
    expect(screen.getByText('Versão de 07/10/2026')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeOnTheScreen();
  });

  it('records the choices with the current terms version', async () => {
    const onDone = jest.fn();
    await renderWithProviders(<ConsentScreen mode="gate" onDone={onDone} />);

    await fireEvent.press(await screen.findByRole('switch', { name: 'Novidades do produto' }));
    await fireEvent.press(screen.getByRole('switch', { name: 'Análise de uso' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aceitar e continuar' }));

    await waitFor(() =>
      expect(api.updateMyConsents).toHaveBeenCalledWith({
        termsVersion: '2026-10-07',
        consents: [
          { purpose: 'ESSENTIAL_SERVICE', granted: true },
          { purpose: 'BILLING_SHARING', granted: true },
          { purpose: 'USAGE_ANALYTICS', granted: false },
          { purpose: 'MARKETING_COMMUNICATIONS', granted: true },
        ],
      }),
    );
    expect(onDone).toHaveBeenCalled();
  });

  it('saves each change right away in the settings', async () => {
    await renderWithProviders(<ConsentScreen mode="settings" onBack={jest.fn()} />);

    expect(await screen.findByText('Privacidade e dados')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Aceitar e continuar' })).toBeNull();
    await fireEvent.press(await screen.findByRole('switch', { name: 'Novidades do produto' }));

    await waitFor(() =>
      expect(api.updateMyConsents).toHaveBeenCalledWith({
        termsVersion: '2026-10-07',
        consents: [
          { purpose: 'ESSENTIAL_SERVICE', granted: true },
          { purpose: 'BILLING_SHARING', granted: true },
          { purpose: 'USAGE_ANALYTICS', granted: true },
          { purpose: 'MARKETING_COMMUNICATIONS', granted: true },
        ],
      }),
    );
    expect(screen.getByRole('switch', { name: 'Novidades do produto' })).toBeChecked();
  });

  it('reverts the change and reloads the terms when the version is outdated', async () => {
    api.updateMyConsents.mockRejectedValue(new PrivacyApiError(409, 'TERMS_VERSION_OUTDATED'));
    await renderWithProviders(<ConsentScreen mode="settings" onBack={jest.fn()} />);

    const toggle = await screen.findByRole('switch', { name: 'Novidades do produto' });
    const callsBefore = api.getMyConsents.mock.calls.length;
    await fireEvent.press(toggle);

    expect(await screen.findByText('Os termos foram atualizados. Revise e aceite a nova versão.')).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Novidades do produto' })).not.toBeChecked();
    await waitFor(() => expect(api.getMyConsents.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it('shares the exported data as JSON text', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    const exported = { exportedAt: '2026-10-07T20:00:00.000Z', sessions: [] } as unknown as privacyApi.MyDataExport;
    api.exportMyData.mockResolvedValue(exported);
    await renderWithProviders(<ConsentScreen mode="settings" />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Exportar meus dados' }));

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: 'Meus dados · EV ChargeOps',
        message: JSON.stringify(exported, null, 2),
      }),
    );
  });

  it('deletes a password account after the password and the typed confirmation', async () => {
    api.deleteMyAccount.mockResolvedValue({
      id: 'd1',
      status: 'COMPLETED',
      reason: null,
      requestedAt: '2026-10-08T20:00:00.000Z',
      processedAt: '2026-10-08T20:00:00.000Z',
    });
    const onAccountDeleted = jest.fn();
    await renderWithProviders(<ConsentScreen mode="settings" onAccountDeleted={onAccountDeleted} />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Excluir conta' }));
    expect(screen.getByText('A exclusão é imediata. Veja o que acontece:')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Digite EXCLUIR para confirmar'), 'excluir');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(api.deleteMyAccount).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'secret-123');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));

    await waitFor(() => expect(onAccountDeleted).toHaveBeenCalled());
    expect(api.deleteMyAccount).toHaveBeenCalledWith('secret-123');
  });

  it('asks only for the typed confirmation on Google and Apple accounts', async () => {
    api.deleteMyAccount.mockResolvedValue({} as privacyApi.DeletionRequest);
    const onAccountDeleted = jest.fn();
    await renderWithProviders(
      <ConsentScreen mode="settings" hasPassword={false} onAccountDeleted={onAccountDeleted} />,
    );

    await fireEvent.press(await screen.findByRole('button', { name: 'Excluir conta' }));
    expect(screen.queryByLabelText('Senha atual')).not.toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Digite EXCLUIR para confirmar'), 'EXCLUIR');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));

    await waitFor(() => expect(onAccountDeleted).toHaveBeenCalled());
    expect(api.deleteMyAccount).toHaveBeenCalledWith(undefined);
  });

  it('explains a wrong password and the last manager block', async () => {
    api.deleteMyAccount
      .mockRejectedValueOnce(new PrivacyApiError(400, 'INVALID_PASSWORD'))
      .mockRejectedValueOnce(new PrivacyApiError(409, 'LAST_MANAGER'));
    const onAccountDeleted = jest.fn();
    await renderWithProviders(<ConsentScreen mode="settings" onAccountDeleted={onAccountDeleted} />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Excluir conta' }));
    await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'wrong');
    await fireEvent.changeText(screen.getByLabelText('Digite EXCLUIR para confirmar'), 'EXCLUIR');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(await screen.findByText('Senha incorreta. Confira e tente de novo.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(await screen.findByText(/Você é o único gestor de um condomínio/)).toBeOnTheScreen();
    expect(onAccountDeleted).not.toHaveBeenCalled();
  });

  it('opens the terms and the privacy policy on the web', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await renderWithProviders(<ConsentScreen mode="settings" />);

    await fireEvent.press(await screen.findByRole('link', { name: 'Termos de uso' }));
    await fireEvent.press(screen.getByRole('link', { name: 'Política de privacidade' }));

    expect(openURL).toHaveBeenNthCalledWith(1, 'https://app.evchargeops.com.br/termos');
    expect(openURL).toHaveBeenNthCalledWith(2, 'https://app.evchargeops.com.br/privacidade');
  });
});
