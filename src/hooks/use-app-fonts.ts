import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';
import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    JetBrainsMono_500Medium,
  });
}
