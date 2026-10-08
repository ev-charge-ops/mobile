import { summarizeChargePoint, summarizeMapItem, summarizeMapItems } from '@/features/charging/charge-point-summary';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';
import { buildMapItem } from '@/features/charging/testing/map-fixtures';

describe('summarizeMapItem', () => {
  it('derives the demand factor and the peak from the cached prices', () => {
    const summary = summarizeMapItem(buildMapItem({ basePricePerKwhCents: 100, pricePerKwhCents: 150 }));

    expect(summary.demandFactor).toBe(1.5);
    expect(summary.isPeak).toBe(true);
    expect(summary.queueLength).toBe(0);
  });

  it('is not peak at the base price or without a tariff', () => {
    expect(summarizeMapItem(buildMapItem({ basePricePerKwhCents: 189, pricePerKwhCents: 189 })).isPeak).toBe(false);
    const withoutTariff = summarizeMapItem(buildMapItem({ basePricePerKwhCents: null, pricePerKwhCents: null }));
    expect(withoutTariff.isPeak).toBe(false);
    expect(withoutTariff.demandFactor).toBeNull();
  });

  it('marks Open Charge Map prices as demo prices', () => {
    expect(summarizeMapItem(buildMapItem({ source: 'OCM' })).isDemoPrice).toBe(true);
    expect(summarizeMapItem(buildMapItem({ source: 'SEED' })).isDemoPrice).toBe(false);
  });

  it('keeps the queue and the demand level of a known point with the live status', () => {
    const detail = buildCommercialChargePoint({ queueLength: 2 });
    const summary = summarizeMapItem(buildMapItem({ id: detail.id, status: 'OFFLINE', source: 'SEED' }), detail);

    expect(summary.queueLength).toBe(2);
    expect(summary.isPeak).toBe(true);
    expect(summary.status).toBe('OFFLINE');
    expect(summary.operatorName).toBe(detail.organizationName);
  });
});

describe('summarizeChargePoint', () => {
  it('reads the connector, the operator and the base price of a private point', () => {
    const summary = summarizeChargePoint(buildChargePoint());

    expect(summary.connector).toBe('TYPE_2');
    expect(summary.operatorName).toBe('Residencial Aclimação');
    expect(summary.basePricePerKwhCents).toBe(89);
    expect(summary.isDemoPrice).toBe(false);
  });
});

describe('summarizeMapItems', () => {
  it('enriches only the items the driver already knows', () => {
    const known = buildChargePoint({ id: 'known', queueLength: 1 });
    const summaries = summarizeMapItems([buildMapItem({ id: 'known' }), buildMapItem({ id: 'other' })], [known]);

    expect(summaries.map((summary) => summary.queueLength)).toEqual([1, 0]);
  });
});
