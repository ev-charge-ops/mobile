import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';

export function useNightStatusBar(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;
      setStatusBarStyle('light', true);
      return () => setStatusBarStyle('dark', true);
    }, [enabled]),
  );
}
