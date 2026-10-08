import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { TermsCheckbox } from '@/features/auth/components/terms-checkbox';

describe('<TermsCheckbox />', () => {
  it('toggles the acceptance', async () => {
    const onChange = jest.fn();
    await render(<TermsCheckbox checked={false} onChange={onChange} />);

    await fireEvent.press(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('opens the terms and the privacy policy without toggling', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const onChange = jest.fn();
    await render(<TermsCheckbox checked={false} onChange={onChange} />);

    await fireEvent.press(screen.getByText('Termos de uso'));
    await fireEvent.press(screen.getByText('Política de privacidade'));

    expect(openURL).toHaveBeenNthCalledWith(1, 'https://app.evchargeops.com.br/termos');
    expect(openURL).toHaveBeenNthCalledWith(2, 'https://app.evchargeops.com.br/privacidade');
    expect(onChange).not.toHaveBeenCalled();
  });
});
