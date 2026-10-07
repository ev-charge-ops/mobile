import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { LoginForm } from '@/features/auth/components/login-form';

describe('<LoginForm />', () => {
  it('shows validation errors and does not submit invalid values', async () => {
    const onSubmit = jest.fn();
    await render(<LoginForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'not-an-email');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido')).toBeOnTheScreen();
    expect(screen.getByText('Informe sua senha')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed credentials', async () => {
    const onSubmit = jest.fn();
    await render(<LoginForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('E-mail'), ' ana@example.com ');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'secret-password');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'ana@example.com', password: 'secret-password' });
  });

  it('renders the server error and the loading state', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting errorMessage="E-mail ou senha inválidos" />);

    expect(screen.getByText('E-mail ou senha inválidos')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeBusy();
  });
});
