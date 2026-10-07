import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { EmailCodeForm, sanitizeEmailCode } from '@/features/auth/components/email-code-form';

describe('sanitizeEmailCode', () => {
  it('keeps only the first six digits', () => {
    expect(sanitizeEmailCode(' 042 817 ')).toBe('042817');
    expect(sanitizeEmailCode('12-34-56-78')).toBe('123456');
  });
});

describe('<EmailCodeForm />', () => {
  it('submits automatically when a full code is pasted', async () => {
    const onSubmit = jest.fn();
    await render(<EmailCodeForm onSubmit={onSubmit} onResend={jest.fn()} />);

    await fireEvent.changeText(screen.getByLabelText('Código'), '042 817');

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ code: '042817' });
  });

  it('rejects an incomplete code', async () => {
    const onSubmit = jest.fn();
    await render(<EmailCodeForm onSubmit={onSubmit} onResend={jest.fn()} />);

    await fireEvent.changeText(screen.getByLabelText('Código'), '123');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe o código de 6 dígitos')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables resend during the cooldown', async () => {
    const onResend = jest.fn();
    await render(<EmailCodeForm onSubmit={jest.fn()} onResend={onResend} resendCooldown={12} />);

    const button = screen.getByRole('button', { name: 'Reenviar código em 12 s' });
    await fireEvent.press(button);

    expect(button).toBeDisabled();
    expect(onResend).not.toHaveBeenCalled();
  });
});
