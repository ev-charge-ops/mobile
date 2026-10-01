import {
  formatChargingEta,
  formatGreeting,
  formatHomeSubtitle,
  formatMinutes,
  formatPointTitle,
  formatSessionLimit,
  toHomeCharge,
  toHomePoint,
} from '@/features/home/home-summary';
import { buildHomeChargePoint, buildHomeSession } from '@/features/home/testing/home-fixtures';

const now = Date.parse('2026-10-07T14:00:00.000Z');

function plain(text: string | null) {
  return text?.replace(/ /g, ' ') ?? null;
}

describe('greeting', () => {
  it('uses the first name', () => {
    expect(formatGreeting('Ana Souza')).toBe('Olá, Ana');
    expect(formatGreeting(undefined)).toBe('Olá');
    expect(formatGreeting('  ')).toBe('Olá');
  });

  it('shows the condo and the unit', () => {
    expect(
      formatHomeSubtitle([
        { name: 'Shopping', unitLabel: null },
        { name: 'Residencial Aclimação', unitLabel: 'B · 42' },
      ]),
    ).toBe('Residencial Aclimação · B · 42');
    expect(formatHomeSubtitle([{ name: 'Shopping', unitLabel: null }])).toBe('Shopping');
    expect(formatHomeSubtitle([])).toBeNull();
  });
});

describe('formatPointTitle', () => {
  it('joins the code with the last part of the name', () => {
    expect(formatPointTitle('L1-01', 'Garagem L1 · Vaga 12')).toBe('L1-01 · Vaga 12');
    expect(formatPointTitle('L2-01', 'Visitantes')).toBe('L2-01 · Visitantes');
    expect(formatPointTitle('L2-01', 'L2-01')).toBe('L2-01');
  });
});

describe('formatMinutes', () => {
  it('formats minutes and hours', () => {
    expect(formatMinutes(42)).toBe('42 min');
    expect(formatMinutes(161)).toBe('2h 41min');
    expect(formatMinutes(-3)).toBe('0 min');
  });
});

describe('formatSessionLimit', () => {
  it('describes each limit type', () => {
    expect(formatSessionLimit({ type: 'PERCENT', socPercent: 80, energyKwh: null, amountCents: null })).toBe(
      'Limite 80%',
    );
    expect(formatSessionLimit({ type: 'ENERGY', socPercent: null, energyKwh: 10, amountCents: null })).toBe(
      'Limite 10,0 kWh',
    );
    expect(plain(formatSessionLimit({ type: 'AMOUNT', socPercent: null, energyKwh: null, amountCents: 2000 }))).toBe(
      'Limite R$ 20,00',
    );
    expect(formatSessionLimit({ type: 'FULL', socPercent: null, energyKwh: null, amountCents: null })).toBe(
      'Até completar',
    );
  });
});

describe('formatChargingEta', () => {
  it('projects the end of an active charge', () => {
    const session = buildHomeSession({ projectedChargingEndsAt: '2026-10-07T14:42:00.000Z' });
    expect(formatChargingEta(session, now)).toBe('cerca de 42 min');
  });

  it('says it is finishing once the projection passed', () => {
    const session = buildHomeSession({ projectedChargingEndsAt: '2026-10-07T13:59:00.000Z' });
    expect(formatChargingEta(session, now)).toBe('terminando');
  });

  it('is empty without a projection or outside the charging phase', () => {
    expect(formatChargingEta(buildHomeSession(), now)).toBeNull();
    expect(
      formatChargingEta(buildHomeSession({ status: 'GRACE', projectedChargingEndsAt: '2026-10-07T14:42:00.000Z' }), now),
    ).toBeNull();
  });
});

describe('toHomeCharge', () => {
  it('summarizes an active charge', () => {
    const charge = toHomeCharge(
      buildHomeSession({
        limit: { type: 'PERCENT', socPercent: 80, energyKwh: null, amountCents: null },
        projectedChargingEndsAt: '2026-10-07T14:42:00.000Z',
        socPercent: 67.6,
        energyKwh: 12.456,
        powerKw: 6.8,
        totalCents: 1109,
      }),
      now,
    );

    expect(charge).toEqual({
      sessionId: 'session-1',
      title: 'Recarga em andamento',
      subtitle: 'Limite 80% · cerca de 42 min',
      isCharging: true,
      statusLabel: 'Carregando',
      status: 'charging',
      pointLabel: 'L1-01 · Vaga 12',
      percent: 68,
      limitPercent: 80,
      energy: '12,46',
      power: '6,8',
      amount: '11,09',
    });
  });

  it('falls back to the energy target without a state of charge', () => {
    const charge = toHomeCharge(buildHomeSession({ socPercent: null, targetEnergyKwh: 20, energyKwh: 5 }), now);
    expect(charge?.percent).toBe(25);
    expect(toHomeCharge(buildHomeSession({ socPercent: null, targetEnergyKwh: null }), now)?.percent).toBeNull();
  });

  it('asks to move the car during the grace period', () => {
    const charge = toHomeCharge(buildHomeSession({ status: 'GRACE' }), now);
    expect(charge).toMatchObject({
      title: 'Carga concluída',
      subtitle: 'Até completar · Retire o veículo',
      isCharging: false,
      status: 'idle',
    });
  });

  it('ignores missing or finished sessions', () => {
    expect(toHomeCharge(null, now)).toBeNull();
    expect(toHomeCharge(buildHomeSession({ status: 'CLOSED' }), now)).toBeNull();
  });
});

describe('toHomePoint', () => {
  it('shows power, price and distance for a free point', () => {
    const point = toHomePoint(buildHomeChargePoint(), '40 m');

    expect({ ...point, details: point.details.map(plain) }).toEqual({
      id: 'cp-1',
      title: 'L1-02 · Vaga 13',
      photoUrl: null,
      details: ['7 kW', 'R$ 0,89/kWh', '40 m'],
      statusLabel: 'Livre',
      status: 'available',
    });
  });

  it('marks commercial points paid by card when the distance is unknown', () => {
    const point = toHomePoint(buildHomeChargePoint({ type: 'COMMERCIAL', maxPowerKw: 22 }), null);
    expect(point.details.map(plain)).toEqual(['22 kW', 'R$ 0,89/kWh', 'cartão']);
  });

  it('derives the status from availability and demand', () => {
    const peak = buildHomeChargePoint();
    peak.pricing = { ...peak.pricing!, demandLevel: 'PEAK' };

    expect(toHomePoint(peak, null).statusLabel).toBe('Pico');
    expect(toHomePoint(buildHomeChargePoint({ status: 'CHARGING' }), null).statusLabel).toBe('Ocupado');
    expect(toHomePoint(buildHomeChargePoint({ reservedUntil: '2026-10-07T14:10:00.000Z' }), null).statusLabel).toBe(
      'Ocupado',
    );
    expect(toHomePoint(buildHomeChargePoint({ status: 'OFFLINE' }), null).statusLabel).toBe('Offline');
  });

  it('keeps the photo and skips a missing price', () => {
    const point = toHomePoint(
      buildHomeChargePoint({ photoUrl: 'https://cdn.evchargeops.com.br/l1-02.webp', pricing: null }),
      null,
    );
    expect(point.photoUrl).toBe('https://cdn.evchargeops.com.br/l1-02.webp');
    expect(point.details).toEqual(['7 kW']);
  });
});
