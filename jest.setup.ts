import { setUpTests } from 'react-native-reanimated';

setUpTests();

jest.mock('expo-apple-authentication', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const { Pressable } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    isAvailableAsync: jest.fn().mockResolvedValue(false),
    signInAsync: jest.fn(),
    AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
    AppleAuthenticationButtonType: { SIGN_IN: 0, CONTINUE: 1, SIGN_UP: 2 },
    AppleAuthenticationButtonStyle: { WHITE: 0, WHITE_OUTLINE: 1, BLACK: 2 },
    AppleAuthenticationButton: (props: Record<string, unknown>) =>
      createElement(Pressable, { accessibilityRole: 'button', ...props }),
  };
});
