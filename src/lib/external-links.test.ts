import { Linking } from 'react-native';

import { externalLinks, openExternalLink } from '@/lib/external-links';

describe('openExternalLink', () => {
  it('opens the public pages of the web app', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

    await expect(openExternalLink('terms')).resolves.toBe(true);
    expect(openURL).toHaveBeenCalledWith('https://app.evchargeops.com.br/termos');
    expect(externalLinks.privacy).toBe('https://app.evchargeops.com.br/privacidade');
    expect(externalLinks.support).toBe('https://app.evchargeops.com.br/suporte');
  });

  it('reports a page that could not be opened', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no browser'));

    await expect(openExternalLink('privacy')).resolves.toBe(false);
  });
});
