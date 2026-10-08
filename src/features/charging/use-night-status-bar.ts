import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';

let focusedNightScreens = 0;

export function useNightStatusBar(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;
      focusedNightScreens += 1;
      setStatusBarStyle('light', true);
      return () => {
        focusedNightScreens = Math.max(0, focusedNightScreens - 1);
        if (focusedNightScreens === 0) setStatusBarStyle('dark', true);
      };
    }, [enabled]),
  );
}
