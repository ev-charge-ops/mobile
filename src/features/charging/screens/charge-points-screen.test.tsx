import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import * as StatusBar from 'expo-status-bar';
import { Component } from 'react';
import * as Maps from 'react-native-maps';

import * as chargingApi from '@/features/charging/api/charging-api';
import { ChargePointsScreen } from '@/features/charging/screens/charge-points-screen';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';
import { buildSession } from '@/features/charging/testing/session-fixtures';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    router: { push: jest.fn(), back: jest.fn() },
    useFocusEffect: (effect: () => void | (() => void)) => useEffect(effect, [effect]),
  };
});

jest.mock('expo-status-bar', () => ({ setStatusBarStyle: jest.fn() }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, listChargePoints: jest.fn(), getActiveSession: jest.fn() };
});

const api = jest.mocked(chargingApi);
const location = jest.mocked(Location);
const { mockAnimateToRegion, mockAnimateCamera } = jest.requireMock<{
  mockAnimateToRegion: jest.Mock;
  mockAnimateCamera: jest.Mock;
}>('react-native-maps');

const NBSP = ' ';

const commercialPoint = buildCommercialChargePoint({
  status: 'CHARGING',
  latitude: -23.5612,
  longitude: -46.6559,
  organizationName: 'Shopping Paulista',
});

beforeEach(() => {
  jest.clearAllMocks();
  api.getActiveSession.mockResolvedValue(null);
  location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
});

const nearbyPoint = buildCommercialChargePoint({
  id: 'cp-4',
  code: 'RM-01',
  name: 'Rua Muniz · Vaga 1',
  organizationName: 'Rede Muniz',
  status: 'CHARGING',
  latitude: -23.572,
  longitude: -46.633,
});

function listedCardNames() {
  return screen
    .getAllByRole('button', { name: /, a \d/ })
    .map((card) => card.props.accessibilityLabel as string);
}

function findMapCard() {
  return screen.findByTestId('charge-point-map-card');
}

async function showList() {
  await fireEvent.press(screen.getByRole('button', { name: 'Ver lista' }));
}

describe('<ChargePointsScreen /> map mode', () => {
  it('shows a pin per point and the nearest point in the bottom card', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), commercialPoint]);

    await renderWithProviders(<ChargePointsScreen />);

    const card = await findMapCard();
    expect(within(card).getByText('L1-01 livre a 10 m')).toBeOnTheScreen();
    expect(within(card).getByText(`Garagem L1 · Vaga 12 · R$${NBSP}0,89/kWh`)).toBeOnTheScreen();
    expect(within(screen.getByTestId('marker-cp-1')).getByTestId('pin-free')).toBeOnTheScreen();
    expect(within(screen.getByTestId('marker-cp-1')).getByTestId('pin-pulse')).toBeOnTheScreen();
    expect(within(screen.getByTestId('marker-cp-3')).getByTestId('pin-busy')).toBeOnTheScreen();
  });

  it('switches the status bar to light while the night map is focused', async () => {
    const setStyle = jest.mocked(StatusBar.setStatusBarStyle);
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);

    const { unmount } = await renderWithProviders(<ChargePointsScreen />);
    await findMapCard();
    expect(setStyle).toHaveBeenCalledWith('light', true);

    await unmount();
    expect(setStyle).toHaveBeenLastCalledWith('dark', true);
  });

  it('paints peak, offline and the own charging car with their own pins', async () => {
    api.listChargePoints.mockResolvedValue([
      buildChargePoint(),
      buildChargePoint({ id: 'cp-2', code: 'L1-02', status: 'OFFLINE' }),
      buildCommercialChargePoint({ status: 'AVAILABLE' }),
    ]);
    api.getActiveSession.mockResolvedValue(buildSession({ socPercent: 68.4 }));

    await renderWithProviders(<ChargePointsScreen />);

    expect(await within(await screen.findByTestId('marker-cp-1')).findByText('68%')).toBeOnTheScreen();
    expect(within(screen.getByTestId('marker-cp-1')).getByTestId('pin-mine')).toBeOnTheScreen();
    expect(within(screen.getByTestId('marker-cp-2')).getByTestId('pin-offline')).toBeOnTheScreen();
    expect(within(screen.getByTestId('marker-cp-3')).getByTestId('pin-peak')).toBeOnTheScreen();
  });

  it('shows the distance and the queue of the selected point', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), { ...commercialPoint, queueLength: 2 }]);

    await renderWithProviders(<ChargePointsScreen />);
    await findMapCard();

    await fireEvent.press(screen.getByTestId('marker-cp-3'));

    const card = await findMapCard();
    expect(await within(card).findByText('L2-01 em uso a 2,6 km')).toBeOnTheScreen();
    expect(within(card).getByText('2 na fila')).toBeOnTheScreen();
  });

  it('selects a marker, flies to it and opens the point from the card', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), commercialPoint]);

    await renderWithProviders(<ChargePointsScreen />);
    await findMapCard();

    await fireEvent.press(screen.getByTestId('marker-cp-3'));

    expect(mockAnimateToRegion).toHaveBeenLastCalledWith(
      expect.objectContaining({ longitude: commercialPoint.longitude, latitudeDelta: 0.011 }),
      420,
    );

    await fireEvent.press(await screen.findByRole('button', { name: /^L2-01 em uso/ }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/charge-points/[chargePointId]',
      params: { chargePointId: 'cp-3' },
    });
  });

  it('filters the markers by search and chips', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), commercialPoint]);

    await renderWithProviders(<ChargePointsScreen />);
    await screen.findByTestId('marker-cp-1');

    await fireEvent.changeText(screen.getByLabelText('Buscar ponto'), 'paulista');
    expect(screen.queryByTestId('marker-cp-1')).not.toBeOnTheScreen();
    expect(screen.getByTestId('marker-cp-3')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Limpar busca' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Livres agora' }));
    expect(screen.getByTestId('marker-cp-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('marker-cp-3')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Livres agora' }));
    await fireEvent.press(screen.getByRole('button', { name: '22 kW' }));
    expect(screen.queryByTestId('marker-cp-1')).not.toBeOnTheScreen();
    expect(screen.getByTestId('marker-cp-3')).toBeOnTheScreen();
  });

  it('combines the filters from the filter sheet', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), commercialPoint]);

    await renderWithProviders(<ChargePointsScreen />);
    await screen.findByTestId('marker-cp-1');

    await fireEvent.press(screen.getByRole('button', { name: 'Filtros' }));
    expect(await screen.findByRole('button', { name: 'Qualquer' })).toBeOnTheScreen();
    const commercialOptions = screen.getAllByRole('button', { name: 'Comercial' });
    await fireEvent.press(commercialOptions[commercialOptions.length - 1]);

    expect(screen.queryByTestId('marker-cp-1')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ver 1 ponto' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Filtros, 1 ativos' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByTestId('marker-cp-1')).toBeOnTheScreen();
  });

  it('zooms the map from the glass controls', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);
    await findMapCard();

    await fireEvent.press(screen.getByRole('button', { name: 'Aproximar' }));
    await waitFor(() => expect(mockAnimateCamera).toHaveBeenLastCalledWith({ zoom: 16 }, { duration: 240 }));

    await fireEvent.press(screen.getByRole('button', { name: 'Afastar' }));
    await waitFor(() => expect(mockAnimateCamera).toHaveBeenLastCalledWith({ zoom: 14 }, { duration: 240 }));
  });

  it('centers on the condominium of the user without asking for the device location', async () => {
    api.listChargePoints.mockResolvedValue([
      buildChargePoint(),
      buildChargePoint({ id: 'cp-2', code: 'L1-02', latitude: -23.56928, longitude: -46.63102 }),
      commercialPoint,
    ]);

    await renderWithProviders(<ChargePointsScreen />);

    const marker = await screen.findByTestId('user-location-marker');
    expect(within(marker).getByText('Você')).toBeOnTheScreen();
    await waitFor(() =>
      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({ longitude: expect.closeTo(-46.631235, 6), latitudeDelta: 0.034 }),
        420,
      ),
    );
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('falls back to Aclimação when the user has no condominium', async () => {
    api.listChargePoints.mockResolvedValue([commercialPoint]);

    await renderWithProviders(<ChargePointsScreen />);

    expect(await screen.findByTestId('user-location-marker')).toBeOnTheScreen();
    await waitFor(() =>
      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({ longitude: -46.6312, latitudeDelta: 0.034 }),
        420,
      ),
    );
  });

  it('recenters on the condominium from the locate button', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), commercialPoint]);

    await renderWithProviders(<ChargePointsScreen />);
    await findMapCard();

    await fireEvent.press(screen.getByTestId('marker-cp-3'));
    await fireEvent.press(screen.getByRole('button', { name: 'Centralizar no condomínio' }));

    expect(mockAnimateToRegion).toHaveBeenLastCalledWith(
      expect.objectContaining({ longitude: -46.63145, latitudeDelta: 0.034 }),
      420,
    );
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('falls back to the list when the map fails to load', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const renderSpy = jest
      .spyOn((Maps.default as unknown as typeof Component).prototype, 'render')
      .mockImplementation(() => {
        throw new Error('Google Maps API key not found');
      });
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);

    expect(await screen.findByText('O mapa não pôde ser carregado. Mostrando os pontos em lista.')).toBeOnTheScreen();
    expect(await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Livre, a 10 m' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ver mapa' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ver lista' })).not.toBeOnTheScreen();

    renderSpy.mockRestore();
  });
});

describe('<ChargePointsScreen /> list mode', () => {
  it('lists the points with status, power, price and the demand badge', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), buildCommercialChargePoint({ status: 'CHARGING' })]);

    await renderWithProviders(<ChargePointsScreen subtitle="Unidade B · 42 · Residencial Aclimação" />);
    await showList();

    expect(await screen.findByText('Unidade B · 42 · Residencial Aclimação')).toBeOnTheScreen();
    const privateCard = await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Livre, a 10 m' });
    expect(within(privateCard).getByText(`R$${NBSP}0,89`)).toBeOnTheScreen();
    expect(within(privateCard).getByText('7 kW · Condomínio')).toBeOnTheScreen();
    expect(within(privateCard).getByText('Fora de pico · ×0,80')).toBeOnTheScreen();
    expect(within(privateCard).getByText('Previsão da IA · modelo v1')).toBeOnTheScreen();

    const commercialCard = screen.getByRole('button', { name: 'Garagem L2 · Visitantes, Em uso, a 10 m' });
    expect(within(commercialCard).getByText(`R$${NBSP}2,84`)).toBeOnTheScreen();
    expect(within(commercialCard).getByText('Pico · ×1,50')).toBeOnTheScreen();
    expect(within(commercialCard).getByText('Regra por horário')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ver mapa' })).toBeOnTheScreen();
  });

  it('sorts the points by distance from the condominium, nearest first', async () => {
    api.listChargePoints.mockResolvedValue([commercialPoint, buildChargePoint(), nearbyPoint]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await screen.findByText('Garagem L1 · Vaga 12');

    expect(listedCardNames()).toEqual([
      'Garagem L1 · Vaga 12, Livre, a 10 m',
      'Rua Muniz · Vaga 1, Em uso, a 360 m',
      'Garagem L2 · Visitantes, Em uso, a 2,6 km',
    ]);
    expect(screen.getAllByTestId('distance-tag')).toHaveLength(3);
  });

  it('keeps the distance order after the search and the filter chips', async () => {
    api.listChargePoints.mockResolvedValue([commercialPoint, buildChargePoint(), nearbyPoint]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await screen.findByText('Garagem L1 · Vaga 12');

    await fireEvent.press(screen.getByRole('button', { name: 'Comercial' }));
    expect(listedCardNames()).toEqual([
      'Rua Muniz · Vaga 1, Em uso, a 360 m',
      'Garagem L2 · Visitantes, Em uso, a 2,6 km',
    ]);

    await fireEvent.changeText(screen.getByLabelText('Buscar ponto'), 'vaga');
    expect(listedCardNames()).toEqual(['Rua Muniz · Vaga 1, Em uso, a 360 m']);
  });

  it('filters by regime, availability and search', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), buildCommercialChargePoint({ status: 'CHARGING' })]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await screen.findByText('Garagem L1 · Vaga 12');

    await fireEvent.press(screen.getByRole('button', { name: 'Comercial' }));
    expect(screen.queryByText('Garagem L1 · Vaga 12')).not.toBeOnTheScreen();
    expect(screen.getByText('Garagem L2 · Visitantes')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Comercial' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Livres agora' }));
    expect(screen.getByText('Garagem L1 · Vaga 12')).toBeOnTheScreen();
    expect(screen.queryByText('Garagem L2 · Visitantes')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Livres agora' }));
    await fireEvent.changeText(screen.getByLabelText('Buscar ponto'), 'visitantes');
    expect(screen.queryByText('Garagem L1 · Vaga 12')).not.toBeOnTheScreen();
    expect(screen.getByText('Garagem L2 · Visitantes')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Buscar ponto'), 'nada por aqui');
    expect(screen.getByText('Nenhum ponto corresponde a esta busca agora.')).toBeOnTheScreen();
  });

  it('opens the point detail', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await fireEvent.press(await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Livre, a 10 m' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/charge-points/[chargePointId]',
      params: { chargePointId: 'cp-1' },
    });
  });

  it('shows the empty state', async () => {
    api.listChargePoints.mockResolvedValue([]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();

    expect(await screen.findByText('Nenhum ponto encontrado')).toBeOnTheScreen();
  });

  it('retries after a failure', async () => {
    api.listChargePoints.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Garagem L1 · Vaga 12')).toBeOnTheScreen();
  });
});
