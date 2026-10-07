import { setUpTests } from 'react-native-reanimated';

setUpTests();

jest.mock('@stripe/stripe-react-native', () => jest.requireActual('@stripe/stripe-react-native/jest/mock.js'));

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

jest.mock('react-native-maps', () => {
  const { Component, createElement } = jest.requireActual<typeof import('react')>('react');
  const { Pressable, View } = jest.requireActual<typeof import('react-native')>('react-native');

  const animateToRegion = jest.fn();
  const fitToCoordinates = jest.fn();
  const animateCamera = jest.fn();

  class MockMapView extends Component<Record<string, unknown> & { children?: unknown }> {
    animateToRegion(...args: unknown[]) {
      animateToRegion(...args);
    }

    fitToCoordinates(...args: unknown[]) {
      fitToCoordinates(...args);
    }

    getCamera() {
      return Promise.resolve({ zoom: 15 });
    }

    animateCamera(...args: unknown[]) {
      animateCamera(...args);
    }

    render() {
      return createElement(View, { testID: 'map-view' }, this.props.children as never);
    }
  }

  const Marker = ({ children, onPress, testID }: { children?: unknown; onPress?: () => void; testID?: string }) =>
    createElement(Pressable, { testID, onPress, accessibilityRole: 'button' }, children as never);

  return {
    __esModule: true,
    default: MockMapView,
    Marker,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: undefined,
    mockAnimateToRegion: animateToRegion,
    mockFitToCoordinates: fitToCoordinates,
    mockAnimateCamera: animateCamera,
  };
});

jest.mock('expo-location', () => ({
  Accuracy: { Lowest: 1, Low: 2, Balanced: 3, High: 4, Highest: 5, BestForNavigation: 6 },
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied', granted: false }),
  getForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied', granted: false }),
  getLastKnownPositionAsync: jest.fn().mockResolvedValue(null),
  getCurrentPositionAsync: jest.fn().mockResolvedValue(null),
}));

jest.mock('expo-notifications', () => ({
  DEFAULT_ACTION_IDENTIFIER: 'expo.modules.notifications.actions.DEFAULT',
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ type: 'expo', data: 'ExponentPushToken[test]' }),
  getLastNotificationResponse: jest.fn().mockReturnValue(null),
  clearLastNotificationResponseAsync: jest.fn().mockResolvedValue(undefined),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('scheduled'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-video', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    useVideoPlayer: jest.fn((_source: unknown, setup?: (player: Record<string, unknown>) => void) => {
      const player = { play: jest.fn(), pause: jest.fn(), loop: false, muted: false };
      setup?.(player);
      return player;
    }),
    VideoView: ({ testID }: { testID?: string }) => createElement(View, { testID }),
  };
});

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn().mockResolvedValue('/tmp/receipt.png'),
  releaseCapture: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));
