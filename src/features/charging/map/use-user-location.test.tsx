import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { useUserLocation } from '@/features/charging/map/use-user-location';

const location = jest.mocked(Location);

function position(latitude: number, longitude: number) {
  return { coords: { latitude, longitude }, timestamp: 0 } as Location.LocationObject;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useUserLocation', () => {
  it('does nothing while disabled', async () => {
    const { result } = await renderHook(() => useUserLocation(false));

    expect(result.current.status).toBe('idle');
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('resolves the current position once permission is granted', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    location.getLastKnownPositionAsync.mockResolvedValue(position(-23.5, -46.6));
    location.getCurrentPositionAsync.mockResolvedValue(position(-23.57, -46.63));

    const { result } = await renderHook(() => useUserLocation(true));

    await waitFor(() => expect(result.current.coordinates).toEqual({ latitude: -23.57, longitude: -46.63 }));
    expect(result.current.status).toBe('granted');
    expect(location.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: Location.Accuracy.Balanced });
  });

  it('reports a denied permission without a position', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);

    const { result } = await renderHook(() => useUserLocation(true));

    await waitFor(() => expect(result.current.status).toBe('denied'));
    expect(result.current.coordinates).toBeNull();
    expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('keeps the last known position when the fresh one fails', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    location.getLastKnownPositionAsync.mockResolvedValue(position(-23.5, -46.6));
    location.getCurrentPositionAsync.mockRejectedValue(new Error('timeout'));

    const { result } = await renderHook(() => useUserLocation(true));

    await waitFor(() => expect(result.current.status).toBe('granted'));
    expect(result.current.coordinates).toEqual({ latitude: -23.5, longitude: -46.6 });
  });

  it('can ask again after a denial', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ granted: false } as never);
    const { result } = await renderHook(() => useUserLocation(true));
    await waitFor(() => expect(result.current.status).toBe('denied'));

    location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ granted: true } as never);
    location.getCurrentPositionAsync.mockResolvedValueOnce(position(-23.6, -46.7));

    let resolved: unknown;
    await act(async () => {
      resolved = await result.current.request();
    });

    expect(resolved).toEqual({ latitude: -23.6, longitude: -46.7 });
    expect(result.current.status).toBe('granted');
  });
});
