import { getPasswordStrength } from '@/features/auth/password-strength';

describe('getPasswordStrength', () => {
  it('is empty without a password', () => {
    expect(getPasswordStrength('')).toEqual({ score: 0, label: '', hasMinLength: false, hasNumber: false });
  });

  it('is weak until it has eight characters and a number', () => {
    expect(getPasswordStrength('abc').score).toBe(1);
    expect(getPasswordStrength('abcdefgh').score).toBe(1);
    expect(getPasswordStrength('abc1').score).toBe(1);
    expect(getPasswordStrength('abc1').label).toBe('Fraca');
  });

  it('grows with case, symbols and length', () => {
    expect(getPasswordStrength('abcdefg1')).toMatchObject({ score: 2, label: 'Razoável', hasMinLength: true, hasNumber: true });
    expect(getPasswordStrength('abcdefG1')).toMatchObject({ score: 3, label: 'Boa' });
    expect(getPasswordStrength('abcdef-1')).toMatchObject({ score: 3, label: 'Boa' });
    expect(getPasswordStrength('s3cure-passw0rd')).toMatchObject({ score: 4, label: 'Forte' });
  });
});
