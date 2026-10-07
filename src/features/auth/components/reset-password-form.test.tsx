import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

describe('<ResetPasswordForm />', () => {
  it('validates the new password and its confirmation', async () => {
    const onSubmit = jest.fn();
    await render(<ResetPasswordForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'short');
    await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), 'other');
    await fireEvent.press(screen.getByRole('button', { name: 'Redefinir senha' }));

    expect(await screen.findByText('A senha deve ter pelo menos 8 caracteres')).toBeOnTheScreen();
    expect(screen.getByText('As senhas não coincidem')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits matching passwords', async () => {
    const onSubmit = jest.fn();
    await render(<ResetPasswordForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'n3w-s3cure-pass');
    await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), 'n3w-s3cure-pass');
    await fireEvent.press(screen.getByRole('button', { name: 'Redefinir senha' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ password: 'n3w-s3cure-pass', confirmPassword: 'n3w-s3cure-pass' });
  });
});
