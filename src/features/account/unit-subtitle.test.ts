import type { MyOrganization } from '@/features/account/api/organizations-api';
import { formatMembershipLine, formatUnitSubtitle } from '@/features/account/unit-subtitle';

function organization(overrides: Partial<MyOrganization> = {}): MyOrganization {
  return {
    id: 'o1',
    name: 'Residencial Aclimação',
    type: 'CONDOMINIUM',
    role: 'DRIVER',
    unitLabel: 'B · 42',
    ...overrides,
  } as MyOrganization;
}

describe('formatUnitSubtitle', () => {
  it('shows the unit and its organization', () => {
    expect(formatUnitSubtitle([organization()])).toBe('Unidade B · 42 · Residencial Aclimação');
  });

  it('prefers the first membership with a unit', () => {
    expect(
      formatUnitSubtitle([organization({ id: 'o2', name: 'Shopping Paulista', unitLabel: null }), organization()]),
    ).toBe('Unidade B · 42 · Residencial Aclimação');
  });

  it('falls back to the organization name or nothing', () => {
    expect(formatUnitSubtitle([organization({ unitLabel: null })])).toBe('Residencial Aclimação');
    expect(formatUnitSubtitle([])).toBeUndefined();
    expect(formatUnitSubtitle(undefined)).toBeUndefined();
  });
});

describe('formatMembershipLine', () => {
  it('shows the condo followed by the unit', () => {
    expect(
      formatMembershipLine([organization({ id: 'o2', name: 'Shopping Paulista', unitLabel: null }), organization()]),
    ).toBe('Residencial Aclimação · B · 42');
  });

  it('falls back to the organization name or nothing', () => {
    expect(formatMembershipLine([organization({ unitLabel: null })])).toBe('Residencial Aclimação');
    expect(formatMembershipLine([])).toBeNull();
    expect(formatMembershipLine(undefined)).toBeNull();
  });
});
