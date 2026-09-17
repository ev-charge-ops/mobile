import { fireEvent, screen } from '@testing-library/react-native';

import * as authApi from '@/features/auth/api/auth-api';
import { EmailVerificationBanner } from '@/features/auth/components/email-verification-banner';
import { renderWithProviders } from '@/features/auth/testing/render-with-providers';

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, resendEmailVerification: jest.fn() };
});

const api = jest.mocked(authApi);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<EmailVerificationBanner />', () => {
  it('resends the verification email', async () => {
    api.resendEmailVerification.mockResolvedValue();

    await renderWithProviders(<EmailVerificationBanner email="ana@example.com" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Reenviar e-mail' }));

    expect(await screen.findByText('Enviamos um novo link para ana@example.com.')).toBeOnTheScreen();
    expect(api.resendEmailVerification).toHaveBeenCalledTimes(1);
  });

  it('shows the rate limit error', async () => {
    api.resendEmailVerification.mockRejectedValue(new authApi.AuthApiError(429, 20));

    await renderWithProviders(<EmailVerificationBanner email="ana@example.com" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Reenviar e-mail' }));

    expect(await screen.findByText('Muitas tentativas. Tente novamente em 20 s.')).toBeOnTheScreen();
  });
});
