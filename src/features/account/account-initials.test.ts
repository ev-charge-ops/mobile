import { getInitials } from '@/features/account/account-initials';

describe('getInitials', () => {
  it('uses the first and last names', () => {
    expect(getInitials('Ana Maria Souza')).toBe('AS');
  });

  it('uses a single initial for one name', () => {
    expect(getInitials('  ana ')).toBe('A');
  });

  it('falls back for an empty name', () => {
    expect(getInitials('')).toBe('?');
  });
});
