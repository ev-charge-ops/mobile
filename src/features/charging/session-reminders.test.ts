import { formatCents } from '@/features/charging/charging-format';
import { planSessionReminders } from '@/features/charging/session-reminders';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';

describe('planSessionReminders', () => {
  it('plans nothing before the charging ends or without a session', () => {
    expect(planSessionReminders(null)).toEqual([]);
    expect(planSessionReminders(buildSession({ status: 'ACTIVE' }))).toEqual([]);
  });

  it('plans nothing once the session is closed', () => {
    expect(planSessionReminders(buildClosedSession())).toEqual([]);
  });

  it('warns two minutes before the grace ends and when the idle fee starts', () => {
    const session = buildSession({
      id: 's1',
      status: 'GRACE',
      chargingEndedAt: '2026-10-07T20:00:00.000Z',
      graceEndsAt: '2026-10-07T20:10:00.000Z',
      idleStartsAt: '2026-10-07T20:10:00.000Z',
    });

    expect(planSessionReminders(session)).toEqual([
      {
        identifier: 'session-reminder:s1:grace',
        title: 'Tolerância acabando',
        body: 'Libere a vaga Garagem L1 · Vaga 12 para evitar a taxa de ocupação.',
        fireAt: '2026-10-07T20:08:00.000Z',
        data: { type: 'SESSION_REMINDER', sessionId: 's1' },
      },
      {
        identifier: 'session-reminder:s1:idle',
        title: 'Taxa de ocupação iniciada',
        body: `A vaga Garagem L1 · Vaga 12 segue ocupada: ${formatCents(25)} por minuto até liberar.`,
        fireAt: '2026-10-07T20:10:00.000Z',
        data: { type: 'SESSION_REMINDER', sessionId: 's1' },
      },
    ]);
  });

  it('shortens the lead for a short simulated grace and skips the idle reminder without a fee', () => {
    const session = buildSession({
      id: 's1',
      status: 'GRACE',
      chargingEndedAt: '2026-10-07T20:00:00.000Z',
      graceEndsAt: '2026-10-07T20:00:10.000Z',
      idleStartsAt: '2026-10-07T20:00:10.000Z',
      idleFeeCentsPerMinute: 0,
    });

    const reminders = planSessionReminders(session);

    expect(reminders).toHaveLength(1);
    expect(reminders[0].fireAt).toBe('2026-10-07T20:00:05.000Z');
  });
});
