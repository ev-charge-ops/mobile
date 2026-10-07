import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Send } from 'lucide-react-native';

import { EmailForm } from '@/features/auth/components/email-form';

describe('<EmailForm />', () => {
  it('requires a valid email', async () => {
    const onSubmit = jest.fn();
    await render(<EmailForm submitLabel="Enviar link" submitIcon={Send} onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar link' }));

    expect(await screen.findByText('Informe um e-mail válido')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the trimmed email and shows server errors', async () => {
    const onSubmit = jest.fn();
    await render(<EmailForm
        submitLabel="Enviar link"
        submitIcon={Send}
        onSubmit={onSubmit}
        errorMessage="Muitas tentativas. Tente novamente em 30 s."
      />);

    await fireEvent.changeText(screen.getByLabelText('E-mail'), ' ana@example.com ');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar link' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'ana@example.com' });
    expect(screen.getByText('Muitas tentativas. Tente novamente em 30 s.')).toBeOnTheScreen();
  });
});
