import { fireEvent, render, screen } from '@testing-library/react-native';

import { PasswordField } from '@/components/ui/password-field';

describe('<PasswordField />', () => {
  it('hides the password until the toggle is pressed', async () => {
    await render(<PasswordField label="Senha atual" value="s3cret-pass" />);

    expect(screen.getByLabelText('Senha atual')).toHaveProp('secureTextEntry', true);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha atual' }));

    expect(screen.getByLabelText('Senha atual')).toHaveProp('secureTextEntry', false);

    await fireEvent.press(screen.getByRole('button', { name: 'Ocultar senha atual' }));

    expect(screen.getByLabelText('Senha atual')).toHaveProp('secureTextEntry', true);
  });

  it('forwards text changes and errors', async () => {
    const onChangeText = jest.fn();
    await render(<PasswordField label="Nova senha" onChangeText={onChangeText} error="Senha muito curta" />);

    await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'abc');

    expect(onChangeText).toHaveBeenCalledWith('abc');
    expect(screen.getByText('Senha muito curta')).toBeOnTheScreen();
  });
});
