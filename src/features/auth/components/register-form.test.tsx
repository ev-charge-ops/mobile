import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { RegisterForm } from '@/features/auth/components/register-form';

async function fill(values: Record<string, string>) {
  for (const [label, value] of Object.entries(values)) {
    await fireEvent.changeText(screen.getByLabelText(label), value);
  }
}

describe('<RegisterForm />', () => {
  it('requires every field', async () => {
    const onSubmit = jest.fn();
    await render(<RegisterForm onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Informe seu nome')).toBeOnTheScreen();
    expect(screen.getByText('Informe seu e-mail')).toBeOnTheScreen();
    expect(screen.getByText('A senha deve ter pelo menos 8 caracteres')).toBeOnTheScreen();
    expect(screen.getByText('Confirme sua senha')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a short password and a mismatched confirmation', async () => {
    const onSubmit = jest.fn();
    await render(<RegisterForm onSubmit={onSubmit} />);

    await fill({ Nome: 'Ana', 'E-mail': 'ana@example.com', Senha: 'short', 'Confirmar senha': 'different' });
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('A senha deve ter pelo menos 8 caracteres')).toBeOnTheScreen();
    expect(screen.getByText('As senhas não coincidem')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid values', async () => {
    const onSubmit = jest.fn();
    await render(<RegisterForm onSubmit={onSubmit} />);

    await fill({
      Nome: ' Ana Souza ',
      'E-mail': 'ana@example.com',
      Senha: 's3cure-passw0rd',
      'Confirmar senha': 's3cure-passw0rd',
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      name: 'Ana Souza',
      email: 'ana@example.com',
      password: 's3cure-passw0rd',
      confirmPassword: 's3cure-passw0rd',
    });
  });

  it('renders the server error', async () => {
    await render(<RegisterForm onSubmit={jest.fn()} errorMessage="Este e-mail já está cadastrado" />);

    expect(screen.getByText('Este e-mail já está cadastrado')).toBeOnTheScreen();
  });
});
