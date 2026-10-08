import { summarizeMapItem } from '@/features/charging/charge-point-summary';
import {
  CLIENT_CLUSTER_THRESHOLD,
  clusterChargePoints,
  formatClusterCount,
  fromServerClusters,
  MAX_RENDERED_MARKERS,
} from '@/features/charging/map/marker-clusters';
import { buildMapItem } from '@/features/charging/testing/map-fixtures';

const bounds = { minLongitude: -47, minLatitude: -24, maxLongitude: -46, maxLatitude: -23 };

function grid(count: number, step: number) {
  return Array.from({ length: count }, (_, index) =>
    summarizeMapItem(
      buildMapItem({
        id: `p-${index}`,
        status: index % 2 === 0 ? 'AVAILABLE' : 'CHARGING',
        latitude: -23.5 + (index % 20) * step,
        longitude: -46.5 + Math.floor(index / 20) * step,
      }),
    ),
  );
}

describe('clusterChargePoints', () => {
  it('keeps every pin while the viewport is light', () => {
    const points = grid(CLIENT_CLUSTER_THRESHOLD, 0.001);

    const markers = clusterChargePoints(points, bounds, 14);

    expect(markers.points).toHaveLength(CLIENT_CLUSTER_THRESHOLD);
    expect(markers.clusters).toEqual([]);
  });

  it('groups crowded viewports and counts the free points of each group', () => {
    const points = grid(400, 0.0005);

    const markers = clusterChargePoints(points, bounds, 12);
    const grouped = markers.clusters.reduce((total, cluster) => total + cluster.count, 0);
    const available = markers.clusters.reduce((total, cluster) => total + cluster.availableCount, 0);

    expect(markers.clusters.length).toBeGreaterThan(0);
    expect(grouped + markers.points.length).toBe(400);
    expect(available).toBe(200 - markers.points.filter((point) => point.status === 'AVAILABLE').length);
  });

  it('caps the pins and keeps the selected one', () => {
    const points = grid(600, 0.05);

    const markers = clusterChargePoints(points, { minLongitude: -50, minLatitude: -30, maxLongitude: -40, maxLatitude: -20 }, 18, 'p-599');

    expect(markers.points).toHaveLength(MAX_RENDERED_MARKERS);
    expect(markers.points.some((point) => point.id === 'p-599')).toBe(true);
  });
});

describe('fromServerClusters', () => {
  it('gives each server cell a stable id', () => {
    expect(fromServerClusters([{ latitude: -22.9, longitude: -43.2, count: 12, availableCount: 3 }])).toEqual([
      { id: 'server--22.90000,-43.20000', latitude: -22.9, longitude: -43.2, count: 12, availableCount: 3 },
    ]);
  });
});

describe('formatClusterCount', () => {
  it('shortens thousands', () => {
    expect(formatClusterCount(42)).toBe('42');
    expect(formatClusterCount(999)).toBe('999');
    expect(formatClusterCount(1000)).toBe('1 mil');
    expect(formatClusterCount(1234)).toBe('1,2 mil');
    expect(formatClusterCount(12_500)).toBe('12,5 mil');
  });
});
