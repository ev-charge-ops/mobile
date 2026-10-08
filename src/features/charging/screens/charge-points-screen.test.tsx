import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import * as StatusBar from 'expo-status-bar';
import { Component } from 'react';
import * as Maps from 'react-native-maps';

import * as chargingApi from '@/features/charging/api/charging-api';
import { ChargePointsScreen } from '@/features/charging/screens/charge-points-screen';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';
import { buildMapItem, toMapItem } from '@/features/charging/testing/map-fixtures';
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
  return {
    ...actual,
    listChargePoints: jest.fn(),
    listChargePointsInBounds: jest.fn(),
    listChargePointClusters: jest.fn(),
    getActiveSession: jest.fn(),
  };
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

const mockNearest = jest.fn<Promise<chargingApi.ChargePointMapItem[]>, []>();

beforeEach(() => {
  jest.clearAllMocks();
  mockNearest.mockReset().mockResolvedValue([buildMapItem()]);
  api.listChargePointsInBounds.mockImplementation(async (_bbox, limit) => {
    if (limit === 1) return mockNearest();
    const points = (await api.listChargePoints.getMockImplementation()?.()) ?? [];
    return points.map(toMapItem);
  });
  api.listChargePointClusters.mockResolvedValue([]);
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

    await renderWithProviders(<ChargePointsScreen />);
    await showList();

    const privateCard = await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Livre, a 10 m' });
    expect(within(privateCard).getByText('L1-01 · Vaga 12')).toBeOnTheScreen();
    expect(within(privateCard).getByText('Livre')).toBeOnTheScreen();
    expect(within(privateCard).getByText(`R$${NBSP}0,89/kWh`)).toBeOnTheScreen();
    expect(within(privateCard).getByText('7 kW')).toBeOnTheScreen();
    expect(within(privateCard).getByText('Grupo A · rateio no condomínio')).toBeOnTheScreen();
    expect(within(privateCard).getByTestId('ring-mark')).toBeOnTheScreen();

    const commercialCard = screen.getByRole('button', { name: 'Garagem L2 · Visitantes, Em uso, a 10 m' });
    expect(within(commercialCard).getByText('R$ 1,89 × 1,50/kWh')).toBeOnTheScreen();
    expect(within(commercialCard).getByText('cartão')).toBeOnTheScreen();
    expect(within(commercialCard).getByText('Grupo B · ponto comercial')).toBeOnTheScreen();
    expect(screen.getByText('2 pontos')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Ver mapa' })).toBeOnTheScreen();
  });

  it('highlights the point charging the car of the driver', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);
    api.getActiveSession.mockResolvedValue(
      buildSession({
        socPercent: 68,
        limit: { type: 'PERCENT', energyKwh: null, amountCents: null, socPercent: 80 },
        projectedChargingEndsAt: '2026-10-07T21:32:00.000-03:00',
      }),
    );

    await renderWithProviders(<ChargePointsScreen />);
    await showList();

    const card = await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Em uso por você, a 10 m' });
    expect(within(card).getByText('68')).toBeOnTheScreen();
    expect(within(card).getByText(/^7 kW · limite 80% · pronta às \d\d:\d\d$/)).toBeOnTheScreen();
  });

  it('sorts the points by distance from the condominium, nearest first', async () => {
    api.listChargePoints.mockResolvedValue([commercialPoint, buildChargePoint(), nearbyPoint]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await screen.findByText('L1-01 · Vaga 12');

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
    await screen.findByText('L1-01 · Vaga 12');

    await fireEvent.press(screen.getByRole('button', { name: 'Comercial' }));
    expect(listedCardNames()).toEqual([
      'Rua Muniz · Vaga 1, Em uso, a 360 m',
      'Garagem L2 · Visitantes, Em uso, a 2,6 km',
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Buscar ponto' }));
    await fireEvent.changeText(screen.getByLabelText('Buscar ponto'), 'vaga');
    expect(listedCardNames()).toEqual(['Rua Muniz · Vaga 1, Em uso, a 360 m']);
  });

  it('filters by regime, availability and search', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), buildCommercialChargePoint({ status: 'CHARGING' })]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await screen.findByText('L1-01 · Vaga 12');

    await fireEvent.press(screen.getByRole('button', { name: 'Comercial' }));
    expect(screen.queryByText('L1-01 · Vaga 12')).not.toBeOnTheScreen();
    expect(screen.getByText('L2-01 · Visitantes')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Comercial' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Livres agora' }));
    expect(screen.getByText('L1-01 · Vaga 12')).toBeOnTheScreen();
    expect(screen.queryByText('L2-01 · Visitantes')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Livres agora' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Buscar ponto' }));
    await fireEvent.changeText(screen.getByLabelText('Buscar ponto'), 'visitantes');
    expect(screen.queryByText('L1-01 · Vaga 12')).not.toBeOnTheScreen();
    expect(screen.getByText('L2-01 · Visitantes')).toBeOnTheScreen();

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
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);
    api.listChargePointsInBounds.mockRejectedValueOnce(new Error('offline'));

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('L1-01 · Vaga 12')).toBeOnTheScreen();
  });
});

describe('<ChargePointsScreen /> device location', () => {
  function locateAt(latitude: number, longitude: number) {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    location.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude, longitude }, timestamp: 0 } as never);
  }

  it('centers on the device position without the far notice when a point is nearby', async () => {
    locateAt(-23.6, -46.7);
    api.listChargePoints.mockResolvedValue([commercialPoint]);
    mockNearest.mockResolvedValue([buildMapItem({ latitude: -23.61, longitude: -46.71 })]);

    await renderWithProviders(<ChargePointsScreen locationSource="device" />);

    await waitFor(() =>
      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({ longitude: -46.7, latitudeDelta: 0.008 }),
        420,
      ),
    );
    await waitFor(() => expect(mockNearest).toHaveBeenCalled());
    expect(screen.queryByText('Nenhum ponto perto de você')).not.toBeOnTheScreen();
    expect(screen.queryByText('Você')).not.toBeOnTheScreen();
  });

  it('offers the nearest point in Brazil when nothing is within 50 km', async () => {
    locateAt(-8.0476, -34.877);
    api.listChargePoints.mockResolvedValue([commercialPoint]);
    mockNearest.mockResolvedValueOnce([]).mockResolvedValueOnce([buildMapItem({ latitude: -9.66, longitude: -35.73 })]);

    await renderWithProviders(<ChargePointsScreen locationSource="device" />);

    expect(await screen.findByText('Nenhum ponto perto de você')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Ver pontos no Brasil' }));

    await waitFor(() =>
      expect(mockAnimateToRegion).toHaveBeenLastCalledWith(
        expect.objectContaining({ longitude: -35.73, latitudeDelta: 0.034 }),
        420,
      ),
    );
    expect(mockNearest).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Nenhum ponto perto de você')).not.toBeOnTheScreen();
  });

  it('shows the whole country when no point is found at all', async () => {
    locateAt(-8.0476, -34.877);
    api.listChargePoints.mockResolvedValue([]);
    mockNearest.mockResolvedValue([]);

    await renderWithProviders(<ChargePointsScreen locationSource="device" />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Ver pontos no Brasil' }));

    await waitFor(() =>
      expect(mockAnimateToRegion).toHaveBeenLastCalledWith(
        expect.objectContaining({ latitudeDelta: 38, longitudeDelta: 38 }),
        420,
      ),
    );
  });

  it('lets the driver dismiss the far notice', async () => {
    locateAt(-8.0476, -34.877);
    api.listChargePoints.mockResolvedValue([commercialPoint]);
    mockNearest.mockResolvedValue([]);

    await renderWithProviders(<ChargePointsScreen locationSource="device" />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Fechar aviso' }));
    expect(screen.queryByText('Nenhum ponto perto de você')).not.toBeOnTheScreen();
  });
});

describe('<ChargePointsScreen /> at scale', () => {
  function scatterPoints(count: number) {
    return Array.from({ length: count }, (_, index) =>
      buildMapItem({
        id: `ocm-${index}`,
        code: `OCM-${index}`,
        latitude: -23.5692 + ((index % 15) - 7) * 0.001,
        longitude: -46.6312 + (Math.floor(index / 15) - 7) * 0.001,
      }),
    );
  }

  it('asks for the points inside the viewport', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);
    await findMapCard();

    const [bbox, limit] = api.listChargePointsInBounds.mock.calls[0];
    const [minLongitude, minLatitude, maxLongitude, maxLatitude] = bbox.split(',').map(Number);
    expect(limit).toBe(300);
    expect(maxLongitude - minLongitude).toBeCloseTo(0.034, 3);
    expect(minLatitude).toBeLessThan(-23.56905);
    expect(maxLatitude).toBeGreaterThan(-23.56905);
  });

  it('shows server clusters when zoomed out and zooms in on tap', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);
    api.listChargePointClusters.mockResolvedValue([
      { latitude: -22.9, longitude: -43.2, count: 1234, availableCount: 900 },
    ]);

    await renderWithProviders(<ChargePointsScreen />);
    await findMapCard();
    await fireEvent(screen.getByTestId('map-view'), 'regionChangeComplete', {
      latitude: -15,
      longitude: -50,
      latitudeDelta: 30,
      longitudeDelta: 30,
    });

    const cluster = await screen.findByTestId('cluster-server--22.90000,-43.20000');
    expect(within(cluster).getByText('1,2 mil')).toBeOnTheScreen();
    expect(screen.getByTestId('clusters-card')).toHaveTextContent(/1\.234 pontos nesta área/);
    expect(screen.getByTestId('ocm-attribution')).toHaveTextContent('© Open Charge Map');
    expect(api.listChargePointClusters).toHaveBeenCalledWith(expect.any(String), 4);
    expect(screen.queryByTestId('marker-cp-1')).not.toBeOnTheScreen();

    await fireEvent.press(cluster);
    expect(mockAnimateToRegion).toHaveBeenLastCalledWith(
      expect.objectContaining({ latitude: -22.9, longitude: -43.2, longitudeDelta: 360 / 2 ** 5 }),
      420,
    );
  });

  it('groups crowded viewports on the device', async () => {
    api.listChargePoints.mockResolvedValue([]);
    api.listChargePointsInBounds.mockResolvedValue(scatterPoints(200));

    await renderWithProviders(<ChargePointsScreen />);

    const clusters = await screen.findAllByTestId(/^cluster-client-/);
    expect(clusters.length).toBeGreaterThan(0);
    expect(screen.queryAllByTestId(/^marker-/).length).toBeLessThan(200);
  });

  it('flags demo prices and credits Open Charge Map', async () => {
    api.listChargePoints.mockResolvedValue([]);
    api.listChargePointsInBounds.mockResolvedValue([
      buildMapItem({ latitude: -23.5692, longitude: -46.6312, connector: 'CHADEMO' }),
    ]);

    await renderWithProviders(<ChargePointsScreen />);

    const card = await findMapCard();
    expect(within(card).getByTestId('demo-price-tag')).toHaveTextContent('Preço de demonstração');
    expect(screen.getByTestId('ocm-attribution')).toHaveTextContent('© Open Charge Map');

    await showList();
    expect(screen.getByText('CHAdeMO')).toBeOnTheScreen();
    expect(screen.getByTestId('ocm-attribution')).toHaveTextContent(/Open Charge Map/);
  });

  it('pages the list of a crowded viewport', async () => {
    api.listChargePoints.mockResolvedValue([]);
    api.listChargePointsInBounds.mockResolvedValue(scatterPoints(45));

    await renderWithProviders(<ChargePointsScreen />);
    await findMapCard();
    await showList();

    expect(screen.getByText('45 pontos')).toBeOnTheScreen();
    expect(screen.getAllByTestId('distance-tag')).toHaveLength(30);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar mais pontos' }));
    expect(screen.getAllByTestId('distance-tag')).toHaveLength(45);
    expect(screen.queryByRole('button', { name: 'Mostrar mais pontos' })).not.toBeOnTheScreen();
  });
});
