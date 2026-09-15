import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextField } from '@/components/ui/text-field';

describe('<TextField />', () => {
  it('renders the label, hint and placeholder', async () => {
    await render(<TextField label="E-mail" placeholder="voce@exemplo.com" hint="Usaremos para os recibos." />);

    expect(screen.getByText('E-mail')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('voce@exemplo.com')).toBeOnTheScreen();
    expect(screen.getByText('Usaremos para os recibos.')).toBeOnTheScreen();
  });

  it('forwards text changes', async () => {
    const onChangeText = jest.fn();
    await render(<TextField label="E-mail" onChangeText={onChangeText} />);

    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'motorista@ev.com');

    expect(onChangeText).toHaveBeenCalledWith('motorista@ev.com');
  });

  it('shows the error instead of the hint', async () => {
    await render(<TextField label="Senha" hint="Mínimo de 8 caracteres" error="Senha incorreta" />);

    expect(screen.getByText('Senha incorreta')).toBeOnTheScreen();
    expect(screen.queryByText('Mínimo de 8 caracteres')).not.toBeOnTheScreen();
  });

  it('calls focus and blur handlers', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await render(<TextField label="Nome" onFocus={onFocus} onBlur={onBlur} />);

    const input = screen.getByLabelText('Nome');
    await fireEvent(input, 'focus');
    await fireEvent(input, 'blur');

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
