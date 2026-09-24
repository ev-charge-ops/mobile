import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Component } from 'react';
import * as Maps from 'react-native-maps';

import * as chargingApi from '@/features/charging/api/charging-api';
import { ChargePointsScreen } from '@/features/charging/screens/charge-points-screen';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, listChargePoints: jest.fn() };
});

const api = jest.mocked(chargingApi);
const location = jest.mocked(Location);
const { mockAnimateToRegion } = jest.requireMock<{ mockAnimateToRegion: jest.Mock }>('react-native-maps');

const NBSP = ' ';

const commercialPoint = buildCommercialChargePoint({
  status: 'CHARGING',
  latitude: -23.5612,
  longitude: -46.6559,
  organizationName: 'Shopping Paulista',
});

beforeEach(() => {
  jest.clearAllMocks();
  location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
});

async function showList() {
  await fireEvent.press(screen.getByRole('button', { name: 'Ver lista' }));
}

describe('<ChargePointsScreen /> map mode', () => {
  it('shows a price marker per point and previews the first one', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), commercialPoint]);

    await renderWithProviders(<ChargePointsScreen subtitle="Unidade B · 42 · Residencial Aclimação" />);

    expect(await screen.findByText('Ver ponto e continuar')).toBeOnTheScreen();
    expect(screen.getByText('Unidade B · 42 · Residencial Aclimação')).toBeOnTheScreen();
    expect(within(screen.getByTestId('marker-cp-1')).getByText(`R$${NBSP}0,89`)).toBeOnTheScreen();
    expect(within(screen.getByTestId('marker-cp-3')).getByText(`R$${NBSP}2,84`)).toBeOnTheScreen();
    expect(screen.getByText('Condomínio · energia repassada a custo, sem margem')).toBeOnTheScreen();
    expect(screen.getByText('Previsão da IA · modelo v1')).toBeOnTheScreen();
  });

  it('selects a marker, flies to it and opens the point from the preview', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), commercialPoint]);

    await renderWithProviders(<ChargePointsScreen />);
    await screen.findByText('Ver ponto e continuar');

    await fireEvent.press(screen.getByTestId('marker-cp-3'));

    expect(await screen.findByText('Comercial · tarifa dinâmica conforme a demanda')).toBeOnTheScreen();
    expect(mockAnimateToRegion).toHaveBeenLastCalledWith(
      expect.objectContaining({ longitude: commercialPoint.longitude, latitudeDelta: 0.011 }),
      420,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Ver ponto' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/charge-points/[chargePointId]',
      params: { chargePointId: 'cp-3' },
    });
  });

  it('filters the markers by search and chips', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), commercialPoint]);

    await renderWithProviders(<ChargePointsScreen />);
    await screen.findByTestId('marker-cp-1');

    await fireEvent.changeText(screen.getByLabelText('Buscar ponto de recarga'), 'paulista');
    expect(screen.queryByTestId('marker-cp-1')).not.toBeOnTheScreen();
    expect(screen.getByTestId('marker-cp-3')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Limpar busca' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Só livres' }));
    expect(screen.getByTestId('marker-cp-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('marker-cp-3')).not.toBeOnTheScreen();
  });

  it('centers on the points when location is denied', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);

    await waitFor(() => expect(mockAnimateToRegion).toHaveBeenCalledWith(expect.objectContaining({ longitude: -46.63145 }), 420));
    expect(screen.queryByTestId('user-location-marker')).not.toBeOnTheScreen();
  });

  it('shows the user and centers on them when location is granted', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    location.getLastKnownPositionAsync.mockResolvedValue(null);
    location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -23.6, longitude: -46.7 },
      timestamp: 0,
    } as never);
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);

    expect(await screen.findByTestId('user-location-marker')).toBeOnTheScreen();
    await waitFor(() =>
      expect(mockAnimateToRegion).toHaveBeenCalledWith(expect.objectContaining({ longitude: -46.7, latitudeDelta: 0.008 }), 420),
    );
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
    expect(await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Livre' })).toBeOnTheScreen();
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

    const privateCard = await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Livre' });
    expect(within(privateCard).getByText(`R$${NBSP}0,89`)).toBeOnTheScreen();
    expect(within(privateCard).getByText('7 kW · Condomínio')).toBeOnTheScreen();
    expect(within(privateCard).getByText('Fora de pico · ×0,80')).toBeOnTheScreen();
    expect(within(privateCard).getByText('Previsão da IA · modelo v1')).toBeOnTheScreen();

    const commercialCard = screen.getByRole('button', { name: 'Garagem L2 · Visitantes, Em uso' });
    expect(within(commercialCard).getByText(`R$${NBSP}2,84`)).toBeOnTheScreen();
    expect(within(commercialCard).getByText('Pico · ×1,50')).toBeOnTheScreen();
    expect(within(commercialCard).getByText('Regra por horário')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ver mapa' })).toBeOnTheScreen();
  });

  it('filters by regime, availability and search', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), buildCommercialChargePoint({ status: 'CHARGING' })]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await screen.findByText('Garagem L1 · Vaga 12');

    await fireEvent.press(screen.getByRole('button', { name: 'Comercial' }));
    expect(screen.queryByText('Garagem L1 · Vaga 12')).not.toBeOnTheScreen();
    expect(screen.getByText('Garagem L2 · Visitantes')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Só livres' }));
    expect(screen.getByText('Garagem L1 · Vaga 12')).toBeOnTheScreen();
    expect(screen.queryByText('Garagem L2 · Visitantes')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Todos' }));
    await fireEvent.changeText(screen.getByLabelText('Buscar ponto de recarga'), 'visitantes');
    expect(screen.queryByText('Garagem L1 · Vaga 12')).not.toBeOnTheScreen();
    expect(screen.getByText('Garagem L2 · Visitantes')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Buscar ponto de recarga'), 'nada por aqui');
    expect(screen.getByText('Nenhum ponto corresponde a esta busca agora.')).toBeOnTheScreen();
  });

  it('opens the point detail', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);
    await showList();
    await fireEvent.press(await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Livre' }));

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
