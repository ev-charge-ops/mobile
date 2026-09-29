import { List, LocateFixed, Map as MapIcon, RotateCw } from 'lucide-react-native';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { InfoBanner } from '@/components/ui/info-banner';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useTabBarHeight } from '@/components/ui/tab-bar';
import { useToast } from '@/components/ui/toast';
import { colors, motion, radii, spacing, typography } from '@/constants/theme';
import type { ChargePoint } from '@/features/charging/api/charging-api';
import { useChargePoints } from '@/features/charging/api/use-charge-points';
import { filterChargePoints, type ChargePointFilter } from '@/features/charging/charge-point-filters';
import { ChargePointCard } from '@/features/charging/components/charge-point-card';
import { ChargePointFilterChips } from '@/features/charging/components/charge-point-filter-chips';
import { ChargePointPreview, openChargePoint } from '@/features/charging/components/charge-point-preview';
import { ChargePointSearchField } from '@/features/charging/components/charge-point-search-field';
import { ChargePointsMap, isMapSupported } from '@/features/charging/map/charge-points-map';
import { MapErrorBoundary } from '@/features/charging/map/map-error-boundary';
import { getFocusRegion, getRegionForCoordinates, MAP_ANIMATION_DURATION } from '@/features/charging/map/map-region';
import type { ChargePointsMapHandle } from '@/features/charging/map/map-types';
import { useMapCenter } from '@/features/charging/map/use-map-center';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { haptics } from '@/lib/haptics';

type ViewMode = 'map' | 'list';

const noChargePoints: ChargePoint[] = [];

const enter = (index: number) =>
  FadeInDown.duration(motion.duration.slow)
    .delay(40 * index)
    .easing(motion.easing.sheet);

export type ChargePointsScreenProps = {
  subtitle?: string;
  accountAction?: ReactNode;
};

export function ChargePointsScreen({ subtitle, accountAction }: ChargePointsScreenProps) {
  const tabBarHeight = useTabBarHeight();
  const toast = useToast();
  const { data, isPending, isError, refetch, isRefetching } = useChargePoints();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);
  const showError = isError && !data;
  const [filter, setFilter] = useState<ChargePointFilter>('ALL');
  const [query, setQuery] = useState('');
  const [preferredMode, setPreferredMode] = useState<ViewMode>('map');
  const [hasMapFailed, setMapFailed] = useState(!isMapSupported);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewHeight, setPreviewHeight] = useState(0);
  const mapRef = useRef<ChargePointsMapHandle>(null);
  const centeredOn = useRef<'none' | 'points' | 'user'>('none');

  const mode: ViewMode = hasMapFailed ? 'list' : preferredMode;
  const chargePoints = data ?? noChargePoints;
  const visible = filterChargePoints(chargePoints, filter, query);
  const selected = visible.find((chargePoint) => chargePoint.id === selectedId) ?? visible[0] ?? null;
  const location = useMapCenter({ enabled: mode === 'map', chargePoints: data, isLoading: isPending });
  const isDemoCenter = location.source === 'demo';

  const hasLocationSettled = location.status === 'denied' || location.status === 'unavailable';

  useEffect(() => {
    const map = mapRef.current;
    if (mode !== 'map' || !map) return;
    if (location.coordinates) {
      if (centeredOn.current === 'user') return;
      centeredOn.current = 'user';
      map.animateToRegion(location.regionFor(location.coordinates), MAP_ANIMATION_DURATION);
      return;
    }
    if (centeredOn.current !== 'none' || chargePoints.length === 0 || !hasLocationSettled) return;
    centeredOn.current = 'points';
    map.animateToRegion(getRegionForCoordinates(chargePoints), MAP_ANIMATION_DURATION);
  }, [mode, location, hasLocationSettled, chargePoints]);

  const initialRegion = location.coordinates
    ? location.regionFor(location.coordinates)
    : getRegionForCoordinates(chargePoints);

  const selectChargePoint = (chargePoint: ChargePoint) => {
    haptics.selection();
    setSelectedId(chargePoint.id);
    mapRef.current?.animateToRegion(getFocusRegion(chargePoint), MAP_ANIMATION_DURATION);
  };

  const locateUser = async () => {
    const coordinates = location.coordinates ?? (await location.request());
    if (coordinates) {
      mapRef.current?.animateToRegion(location.regionFor(coordinates), MAP_ANIMATION_DURATION);
      return;
    }
    toast.show('Permita o acesso à localização nos ajustes para centralizar o mapa.', { tone: 'info' });
  };

  const toggleMode = () => {
    haptics.selection();
    if (mode === 'list') centeredOn.current = location.coordinates ? 'user' : chargePoints.length > 0 ? 'points' : 'none';
    setPreferredMode(mode === 'map' ? 'list' : 'map');
  };

  const actions = (
    <View style={styles.actions}>
      {hasMapFailed ? null : (
        <IconButton
          icon={mode === 'map' ? List : MapIcon}
          tone="inset"
          accessibilityLabel={mode === 'map' ? 'Ver lista' : 'Ver mapa'}
          onPress={toggleMode}
        />
      )}
      {accountAction}
    </View>
  );

  const errorCard = (
    <Card style={styles.stack}>
      <Text style={typography.body}>Não foi possível carregar os pontos de recarga.</Text>
      <Button
        label="Tentar novamente"
        icon={RotateCw}
        variant="secondary"
        size="sm"
        loading={isRefetching}
        onPress={() => refetch()}
      />
    </Card>
  );

  const emptyCard = (
    <Card style={styles.stack}>
      <Text style={typography.subtitle}>Nenhum ponto encontrado</Text>
      <Text style={styles.hint}>
        {filter === 'ALL' && query.trim().length === 0
          ? 'Ainda não há pontos disponíveis para você. Entre em um condomínio pelo convite do gestor.'
          : 'Nenhum ponto corresponde a esta busca agora.'}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar variant="large" title="Buscar pontos" subtitle={subtitle} actions={actions} />
      {mode === 'map' ? (
        <View style={styles.mapArea}>
          <MapErrorBoundary onError={() => setMapFailed(true)}>
            <ChargePointsMap
              ref={mapRef}
              chargePoints={visible}
              selectedId={selected?.id ?? null}
              userCoordinates={location.coordinates}
              userLabel={isDemoCenter ? 'Você' : null}
              initialRegion={initialRegion}
              padding={{ top: 120, right: 0, bottom: previewHeight, left: 0 }}
              onSelect={selectChargePoint}
            />
          </MapErrorBoundary>
          <View style={styles.overlayTop} pointerEvents="box-none">
            <Animated.View
              entering={FadeInDown.duration(motion.duration.slow).easing(motion.easing.sheet)}
              style={styles.searchRow}
            >
              <ChargePointSearchField value={query} onChangeText={setQuery} />
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={isDemoCenter ? 'Centralizar no condomínio' : 'Centralizar na minha localização'}
                onPress={locateUser}
                haptic
                scaleTo={0.92}
                style={styles.locate}
              >
                <Icon icon={LocateFixed} size={20} color={colors.textTitle} />
              </PressableScale>
            </Animated.View>
            <ChargePointFilterChips value={filter} onChange={setFilter} delay={60} />
          </View>
          <View
            style={[styles.sheet, { paddingBottom: tabBarHeight + spacing.md }]}
            onLayout={(event) => setPreviewHeight(Math.round(event.nativeEvent.layout.height))}
          >
            <View style={styles.grabber} />
            {isPending ? (
              <ActivityIndicator accessibilityLabel="Carregando pontos de recarga" color={colors.accent} />
            ) : showError ? (
              errorCard
            ) : selected ? (
              <Animated.View
                key={selected.id}
                entering={FadeInUp.duration(motion.duration.sheet).easing(motion.easing.sheet)}
              >
                <ChargePointPreview chargePoint={selected} />
              </Animated.View>
            ) : (
              emptyCard
            )}
          </View>
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + spacing.xxl }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          {hasMapFailed && isMapSupported ? (
            <InfoBanner tone="info">O mapa não pôde ser carregado. Mostrando os pontos em lista.</InfoBanner>
          ) : null}
          <Animated.View entering={enter(0)} style={styles.searchRow}>
            <ChargePointSearchField value={query} onChangeText={setQuery} />
          </Animated.View>
          <ChargePointFilterChips value={filter} onChange={setFilter} delay={40} />
          {isPending ? (
            <ActivityIndicator accessibilityLabel="Carregando pontos de recarga" color={colors.accent} />
          ) : showError ? (
            errorCard
          ) : visible.length === 0 ? (
            emptyCard
          ) : (
            visible.map((chargePoint, index) => (
              <Animated.View key={chargePoint.id} entering={enter(index + 1)}>
                <ChargePointCard chargePoint={chargePoint} onPress={() => openChargePoint(chargePoint.id)} />
              </Animated.View>
            ))
          )}
          <Text style={styles.legal}>
            Preço por kWh se a recarga começar agora. Em condomínio a energia é repassada a custo e o fator de demanda
            é apenas informativo.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mapArea: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
  },
  overlayTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.gutter,
    right: spacing.gutter,
    gap: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  locate: {
    width: 52,
    height: 52,
    borderRadius: radii.input,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.gutter,
    paddingTop: 10,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    backgroundColor: colors.surfaceSheet,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -12 },
    elevation: 20,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
    backgroundColor: colors.borderSubtle,
  },
  listContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  stack: {
    gap: spacing.md,
  },
  hint: {
    ...typography.body,
    color: colors.textMuted,
  },
  legal: {
    ...typography.caption,
    color: colors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
});
