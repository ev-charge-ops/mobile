import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';

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
    requestAccountDeletion: jest.fn(),
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

  it('reloads the terms when the version is outdated', async () => {
    api.updateMyConsents.mockRejectedValue(new PrivacyApiError(409, 'TERMS_VERSION_OUTDATED'));
    await renderWithProviders(<ConsentScreen mode="settings" onBack={jest.fn()} />);

    const save = await screen.findByRole('button', { name: 'Salvar preferências' });
    const callsBefore = api.getMyConsents.mock.calls.length;
    await fireEvent.press(save);

    expect(await screen.findByText('Os termos foram atualizados. Revise e aceite a nova versão.')).toBeOnTheScreen();
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

  it('requests the account deletion with an optional reason', async () => {
    api.requestAccountDeletion.mockResolvedValue({
      id: 'd1',
      status: 'PENDING',
      reason: 'Mudei de condomínio',
      requestedAt: '2026-10-07T20:00:00.000Z',
      processedAt: null,
    });
    await renderWithProviders(<ConsentScreen mode="settings" />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Solicitar exclusão da conta' }));
    await fireEvent.changeText(screen.getByLabelText('Motivo (opcional)'), '  Mudei de condomínio ');
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    await waitFor(() => expect(api.requestAccountDeletion).toHaveBeenCalledWith('Mudei de condomínio'));
    expect(
      await screen.findByText('Pedido de exclusão registrado. Avisaremos por e-mail quando concluir.'),
    ).toBeOnTheScreen();
  });
});
