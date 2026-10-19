import { Map as MapIcon, MapPinned, Navigation, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import {
  directionsAppLabels,
  getDirectionsApps,
  openDirections,
  type DirectionsApp,
} from '@/features/charging/directions';
import type { Coordinates } from '@/features/charging/map/map-region';

const directionsAppIcons: Record<DirectionsApp, LucideIcon> = {
  apple: MapIcon,
  google: MapPinned,
  waze: Navigation,
};

export type DirectionsSheetProps = {
  destination: Coordinates;
  visible: boolean;
  onClose: () => void;
};

export function DirectionsSheet({ destination, visible, onClose }: DirectionsSheetProps) {
  const toast = useToast();
  const apps = getDirectionsApps();

  const open = (app: DirectionsApp) => {
    onClose();
    openDirections(app, destination).catch(() =>
      toast.show(`Não foi possível abrir o ${directionsAppLabels[app]}.`, { tone: 'error' }),
    );
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <View>
          <Text accessibilityRole="header" style={typography.heading}>
            Como chegar
          </Text>
          <Text style={styles.subtitle}>Escolha o app para abrir a rota até o ponto.</Text>
        </View>
        <Card padding={0} style={styles.inset}>
          {apps.map((app, index) => (
            <ListRow
              key={app}
              label={directionsAppLabels[app]}
              icon={directionsAppIcons[app]}
              divider={index < apps.length - 1}
              onPress={() => open(app)}
            />
          ))}
        </Card>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
  inset: {
    backgroundColor: colors.surfaceCard,
  },
});
