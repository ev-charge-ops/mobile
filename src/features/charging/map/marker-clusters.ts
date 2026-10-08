import Supercluster from 'supercluster';

import type { ChargePointCluster } from '@/features/charging/api/charging-api';
import type { ChargePointSummary } from '@/features/charging/charge-point-summary';
import type { Bounds } from '@/features/charging/map/map-bounds';

export const CLIENT_CLUSTER_THRESHOLD = 150;
export const MAX_RENDERED_MARKERS = 200;

const CLUSTER_RADIUS = 60;
const CLUSTER_MAX_ZOOM = 16;

export type MapCluster = {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  availableCount: number;
};

export type MapMarkers = {
  points: ChargePointSummary[];
  clusters: MapCluster[];
};

type PointProperties = { id: string; available: number };
type ClusterProperties = { available: number };

export function fromServerClusters(clusters: ChargePointCluster[]): MapCluster[] {
  return clusters.map((cluster) => ({
    id: `server-${cluster.latitude.toFixed(5)},${cluster.longitude.toFixed(5)}`,
    latitude: cluster.latitude,
    longitude: cluster.longitude,
    count: cluster.count,
    availableCount: cluster.availableCount,
  }));
}

function capPoints(points: ChargePointSummary[], keepId: string | null) {
  if (points.length <= MAX_RENDERED_MARKERS) return points;
  const capped = points.slice(0, MAX_RENDERED_MARKERS);
  const kept = keepId ? points.find((point) => point.id === keepId) : undefined;
  if (!kept || capped.includes(kept)) return capped;
  return [...capped.slice(0, MAX_RENDERED_MARKERS - 1), kept];
}

export function clusterChargePoints(
  points: ChargePointSummary[],
  bounds: Bounds,
  zoom: number,
  keepId: string | null = null,
): MapMarkers {
  if (points.length <= CLIENT_CLUSTER_THRESHOLD) return { points: capPoints(points, keepId), clusters: [] };

  const index = new Supercluster<PointProperties, ClusterProperties>({
    radius: CLUSTER_RADIUS,
    maxZoom: CLUSTER_MAX_ZOOM,
    map: (properties) => ({ available: properties.available }),
    reduce: (accumulated, properties) => {
      accumulated.available += properties.available;
    },
  });
  index.load(
    points.map((point) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
      properties: { id: point.id, available: point.status === 'AVAILABLE' ? 1 : 0 },
    })),
  );

  const byId = new Map(points.map((point) => [point.id, point]));
  const result: MapMarkers = { points: [], clusters: [] };
  const features = index.getClusters(
    [bounds.minLongitude, bounds.minLatitude, bounds.maxLongitude, bounds.maxLatitude],
    Math.floor(zoom),
  );
  for (const feature of features) {
    const [longitude, latitude] = feature.geometry.coordinates;
    if ('cluster' in feature.properties && feature.properties.cluster) {
      result.clusters.push({
        id: `client-${feature.properties.cluster_id}`,
        latitude,
        longitude,
        count: feature.properties.point_count,
        availableCount: feature.properties.available,
      });
      continue;
    }
    const point = byId.get((feature.properties as PointProperties).id);
    if (point) result.points.push(point);
  }
  return { points: capPoints(result.points, keepId), clusters: result.clusters };
}

export function formatClusterCount(count: number) {
  if (count < 1000) return String(count);
  return `${(Math.floor(count / 100) / 10).toFixed(1).replace('.', ',').replace(',0', '')} mil`;
}
