export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasMixedCase: boolean;
};

export const PASSWORD_MIN_LENGTH = 8;

const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'] as const;

export function getPasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH;
  const hasNumber = /\d/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isLong = password.length >= 12;

  let score = 0;
  if (password.length > 0) score = 1;
  if (hasMinLength && hasNumber) score = 2;
  if (score === 2 && (hasMixedCase || hasSymbol)) score = 3;
  if (score === 3 && isLong) score = 4;

  return { score: score as PasswordStrength['score'], label: labels[score], hasMinLength, hasNumber, hasMixedCase };
}
