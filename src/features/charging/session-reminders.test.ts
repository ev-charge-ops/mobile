import { formatCents } from '@/features/charging/charging-format';
import { planSessionReminders } from '@/features/charging/session-reminders';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';

const data = (reminder: string) => ({ type: 'SESSION_REMINDER', sessionId: 's1', reminder });

describe('planSessionReminders', () => {
  it('plans nothing without a session or before the charging end is known', () => {
    expect(planSessionReminders(null)).toEqual([]);
    expect(planSessionReminders(buildSession({ status: 'ACTIVE' }))).toEqual([]);
    expect(planSessionReminders(buildSession({ status: 'PENDING' }))).toEqual([]);
  });

  it('plans nothing once the session is closed or interrupted', () => {
    expect(planSessionReminders(buildClosedSession())).toEqual([]);
    expect(
      planSessionReminders(
        buildSession({
          status: 'INTERRUPTED',
          projectedChargingEndsAt: '2026-10-07T20:00:00.000Z',
          projectedGraceEndsAt: '2026-10-07T20:10:00.000Z',
        }),
      ),
    ).toEqual([]);
  });

  it('plans every reminder from the projected times while charging', () => {
    const session = buildSession({
      id: 's1',
      status: 'ACTIVE',
      projectedChargingEndsAt: '2026-10-07T20:00:00.000Z',
      projectedGraceEndsAt: '2026-10-07T20:10:00.000Z',
      projectedIdleStartsAt: '2026-10-07T20:10:00.000Z',
    });

    expect(planSessionReminders(session)).toEqual([
      {
        identifier: 'session-reminder:s1:complete',
        title: 'Recarga concluída',
        body: 'Seu veículo na vaga Garagem L1 · Vaga 12 terminou de carregar. Você tem 10 min de tolerância para liberar a vaga.',
        fireAt: '2026-10-07T20:00:00.000Z',
        data: data('complete'),
      },
      {
        identifier: 'session-reminder:s1:grace',
        title: 'Tolerância acabando',
        body: 'Libere a vaga Garagem L1 · Vaga 12 para evitar a taxa de ocupação.',
        fireAt: '2026-10-07T20:08:00.000Z',
        data: data('grace'),
      },
      {
        identifier: 'session-reminder:s1:idle',
        title: 'Taxa de ocupação iniciada',
        body: `A vaga Garagem L1 · Vaga 12 segue ocupada: ${formatCents(25)} por minuto até liberar.`,
        fireAt: '2026-10-07T20:10:00.000Z',
        data: data('idle'),
      },
    ]);
  });

  it('prefers the actual times once charging has ended', () => {
    const session = buildSession({
      id: 's1',
      status: 'GRACE',
      chargingEndedAt: '2026-10-07T20:00:30.000Z',
      graceEndsAt: '2026-10-07T20:10:30.000Z',
      idleStartsAt: '2026-10-07T20:10:30.000Z',
      projectedChargingEndsAt: '2026-10-07T20:00:00.000Z',
      projectedGraceEndsAt: '2026-10-07T20:10:00.000Z',
      projectedIdleStartsAt: '2026-10-07T20:10:00.000Z',
    });

    expect(planSessionReminders(session).map((reminder) => reminder.fireAt)).toEqual([
      '2026-10-07T20:00:30.000Z',
      '2026-10-07T20:08:30.000Z',
      '2026-10-07T20:10:30.000Z',
    ]);
  });

  it('falls back to the grace end when the idle start is missing', () => {
    const session = buildSession({
      id: 's1',
      status: 'GRACE',
      chargingEndedAt: '2026-10-07T20:00:00.000Z',
      graceEndsAt: '2026-10-07T20:10:00.000Z',
    });

    expect(planSessionReminders(session).at(-1)).toMatchObject({
      identifier: 'session-reminder:s1:idle',
      fireAt: '2026-10-07T20:10:00.000Z',
    });
  });

  it('shortens the lead for a short simulated grace and skips the idle reminder without a fee', () => {
    const session = buildSession({
      id: 's1',
      status: 'ACTIVE',
      projectedChargingEndsAt: '2026-10-07T20:00:00.000Z',
      projectedGraceEndsAt: '2026-10-07T20:00:10.000Z',
      projectedIdleStartsAt: '2026-10-07T20:00:10.000Z',
      idleFeeCentsPerMinute: 0,
    });

    const reminders = planSessionReminders(session);

    expect(reminders.map((reminder) => reminder.identifier)).toEqual([
      'session-reminder:s1:complete',
      'session-reminder:s1:grace',
    ]);
    expect(reminders[1].fireAt).toBe('2026-10-07T20:00:05.000Z');
  });
});
