import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { mapCenterSource } from '@/config/map-center';
import { useMapCenter, type UseMapCenterOptions } from '@/features/charging/map/use-map-center';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';

const location = jest.mocked(Location);

beforeEach(() => {
  jest.clearAllMocks();
});

function render(options: Partial<UseMapCenterOptions> = {}) {
  return renderHook(() =>
    useMapCenter({ enabled: true, chargePoints: [buildChargePoint()], isLoading: false, ...options }),
  );
}

describe('useMapCenter', () => {
  it('uses the fixed demo location by default', () => {
    expect(mapCenterSource).toBe('demo');
  });

  it('centers on the condominium without touching the device location', async () => {
    const { result } = await render();

    expect(result.current.source).toBe('demo');
    expect(result.current.status).toBe('granted');
    expect(result.current.coordinates).toEqual({ latitude: -23.56905, longitude: -46.63145 });
    expect(result.current.regionFor(result.current.coordinates!).latitudeDelta).toBe(0.034);
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('waits for the charge points before centering', async () => {
    const { result } = await render({ chargePoints: undefined, isLoading: true });

    expect(result.current.status).toBe('pending');
    expect(result.current.coordinates).toBeNull();

    let requested: unknown;
    await act(async () => {
      requested = await result.current.request();
    });
    expect(requested).toEqual({ latitude: -23.5692, longitude: -46.6312 });
  });

  it('falls back to Aclimação without a condominium or after a failed load', async () => {
    const commercial = await render({ chargePoints: [buildCommercialChargePoint()] });
    expect(commercial.result.current.coordinates).toEqual({ latitude: -23.5692, longitude: -46.6312 });

    const failed = await render({ chargePoints: undefined });
    expect(failed.result.current.coordinates).toEqual({ latitude: -23.5692, longitude: -46.6312 });
  });

  it('still follows the device when switched back to it', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -23.6, longitude: -46.7 },
      timestamp: 0,
    } as never);

    const { result } = await render({ source: 'device' });

    await waitFor(() => expect(result.current.coordinates).toEqual({ latitude: -23.6, longitude: -46.7 }));
    expect(result.current.source).toBe('device');
    expect(result.current.regionFor(result.current.coordinates!).latitudeDelta).toBe(0.008);
    expect(location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });
});
