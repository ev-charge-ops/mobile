export type MapCenterSource = 'demo' | 'device';

export type LocationMode = 'DEMO' | 'DEVICE';

export const mapCenterSource: MapCenterSource = 'demo';

export const demoMapCenterFallback = { latitude: -23.5692, longitude: -46.6312 } as const;

export function getMapCenterSource(locationMode: LocationMode | null | undefined): MapCenterSource {
  return locationMode === 'DEVICE' ? 'device' : mapCenterSource;
}
