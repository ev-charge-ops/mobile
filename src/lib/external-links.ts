import { Linking } from 'react-native';

const WEB_APP_URL = 'https://app.evchargeops.com.br';

export const externalLinks = {
  terms: `${WEB_APP_URL}/termos`,
  privacy: `${WEB_APP_URL}/privacidade`,
  support: `${WEB_APP_URL}/suporte`,
} as const;

export type ExternalLink = keyof typeof externalLinks;

export async function openExternalLink(link: ExternalLink) {
  try {
    await Linking.openURL(externalLinks[link]);
    return true;
  } catch {
    return false;
  }
}
