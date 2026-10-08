import { Funnel, List, Map as MapIcon, RotateCw, Search, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { InfoBanner } from '@/components/ui/info-banner';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useTabBarHeight, useTabSchemeOverride } from '@/components/ui/tab-bar';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, motion, nightColors, radii, spacing } from '@/constants/theme';
import type { ChargePoint } from '@/features/charging/api/charging-api';
import { useChargePoints } from '@/features/charging/api/use-charge-points';
import { hasOpenSession, useActiveSession } from '@/features/charging/api/use-charging-sessions';
import { rankChargePointsByDistance } from '@/features/charging/charge-point-distance';
import {
  countActiveFilters,
  DEFAULT_CHARGE_POINT_FILTERS,
  filterChargePoints,
  type ChargePointFilters,
} from '@/features/charging/charge-point-filters';
import { openChargePoint } from '@/features/charging/charge-point-navigation';
import { ChargePointCard, type MyChargeSummary } from '@/features/charging/components/charge-point-card';
import { formatTime } from '@/features/charging/charging-format';
import { ChargePointFilterChips } from '@/features/charging/components/charge-point-filter-chips';
import { ChargePointFilterSheet } from '@/features/charging/components/charge-point-filter-sheet';
import { ChargePointMapCard } from '@/features/charging/components/charge-point-map-card';
import { ChargePointSearchField } from '@/features/charging/components/charge-point-search-field';
import { ChargePointsMap, isMapSupported } from '@/features/charging/map/charge-points-map';
import { GlassSurface, MapControls } from '@/features/charging/map/map-controls';
import { MapErrorBoundary } from '@/features/charging/map/map-error-boundary';
import { getFocusRegion, getRegionForCoordinates, MAP_ANIMATION_DURATION } from '@/features/charging/map/map-region';
import type { ChargePointsMapHandle, MyCharge } from '@/features/charging/map/map-types';
import { useMapCenter } from '@/features/charging/map/use-map-center';
import { useNightStatusBar } from '@/features/charging/use-night-status-bar';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { haptics } from '@/lib/haptics';

type ViewMode = 'map' | 'list';

const noChargePoints: ChargePoint[] = [];

const CARD_HEIGHT = 76;
const CARD_GAP = 24;
const CONTROLS_GAP = 64;
const TOP_OVERLAY_HEIGHT = 130;

const enter = (index: number) =>
  FadeInDown.duration(motion.duration.reveal)
    .delay(motion.revealStagger * index)
    .easing(motion.easing.out);

export function ChargePointsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const toast = useToast();
  const { data, isPending, isError, refetch, isRefetching } = useChargePoints();
  const { data: activeSession } = useActiveSession();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);
  const showError = isError && !data;
  const [filters, setFilters] = useState<ChargePointFilters>(DEFAULT_CHARGE_POINT_FILTERS);
  const [isFiltering, setFiltering] = useState(false);
  const [query, setQuery] = useState('');
  const [preferredMode, setPreferredMode] = useState<ViewMode>('map');
  const [hasMapFailed, setMapFailed] = useState(!isMapSupported);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSearching, setSearching] = useState(false);
  const mapRef = useRef<ChargePointsMapHandle>(null);
  const centeredOn = useRef<'none' | 'points' | 'user'>('none');

  const mode: ViewMode = hasMapFailed ? 'list' : preferredMode;
  useNightStatusBar(mode === 'map');
  useTabSchemeOverride('points', mode === 'list' ? 'light' : null);
  const chargePoints = data ?? noChargePoints;
  const visible = filterChargePoints(chargePoints, filters, query);
  const location = useMapCenter({ enabled: true, chargePoints: data, isLoading: isPending });
  const reference = location.coordinates;
  const ranked = rankChargePointsByDistance(visible, reference);
  const selected = ranked.find((item) => item.chargePoint.id === selectedId) ?? ranked[0] ?? null;
  const isDemoCenter = location.source === 'demo';
  const activeFilterCount = countActiveFilters(filters);
  const openSession = hasOpenSession(activeSession) ? activeSession : null;
  const myCharge: MyCharge | null = openSession
    ? {
        chargePointId: openSession.chargePoint.id,
        label: openSession.socPercent === null ? null : `${Math.round(openSession.socPercent)}%`,
      }
    : null;

  const hasLocationSettled = location.status === 'denied' || location.status === 'unavailable';
  const cardBottom = tabBarHeight + CARD_GAP;

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
    haptics.impactLight();
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
    if (mode === 'list') {
      centeredOn.current = location.coordinates ? 'user' : chargePoints.length > 0 ? 'points' : 'none';
    }
    setPreferredMode(mode === 'map' ? 'list' : 'map');
  };

  const searchRow = (
    <View style={styles.searchRow}>
      <ChargePointSearchField value={query} onChangeText={setQuery} />
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={activeFilterCount > 0 ? `Filtros, ${activeFilterCount} ativos` : 'Filtros'}
        onPress={() => setFiltering(true)}
        haptic="selection"
        scaleTo={0.92}
        style={styles.roundWhite}
      >
        <Icon icon={Funnel} size={18} color={colors.textTitle} />
        {activeFilterCount > 0 ? <View testID="filters-badge" style={styles.filterBadge} /> : null}
      </PressableScale>
      {hasMapFailed ? null : (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={mode === 'map' ? 'Ver lista' : 'Ver mapa'}
          onPress={toggleMode}
          scaleTo={0.92}
        >
          <GlassSurface style={styles.roundGlass}>
            <Icon icon={mode === 'map' ? List : MapIcon} size={20} color={nightColors.textTitle} />
          </GlassSurface>
        </PressableScale>
      )}
    </View>
  );

  const errorCard = (
    <View style={styles.messageCard}>
      <Text style={styles.messageText}>Não foi possível carregar os pontos de recarga.</Text>
      <Button
        label="Tentar novamente"
        icon={RotateCw}
        variant="secondary"
        scheme="night"
        size="sm"
        loading={isRefetching}
        onPress={() => refetch()}
      />
    </View>
  );

  const emptyCard = (
    <View style={styles.messageCard}>
      <Text style={styles.messageTitle}>Nenhum ponto encontrado</Text>
      <Text style={styles.messageText}>
        {activeFilterCount === 0 && query.trim().length === 0
          ? 'Ainda não há pontos disponíveis para você. Entre em um condomínio pelo convite do gestor.'
          : 'Nenhum ponto corresponde a esta busca agora.'}
      </Text>
    </View>
  );

  const filterSheet = (
    <ChargePointFilterSheet
      visible={isFiltering}
      value={filters}
      resultCount={visible.length}
      onChange={setFilters}
      onClose={() => setFiltering(false)}
    />
  );

  if (mode === 'map') {
    return (
      <View style={styles.screen}>
        <MapErrorBoundary onError={() => setMapFailed(true)}>
          <ChargePointsMap
            ref={mapRef}
            chargePoints={visible}
            selectedId={selected?.chargePoint.id ?? null}
            myCharge={myCharge}
            userCoordinates={location.coordinates}
            userLabel={isDemoCenter ? 'Você' : null}
            initialRegion={initialRegion}
            padding={{
              top: insets.top + TOP_OVERLAY_HEIGHT,
              right: 0,
              bottom: cardBottom + CARD_HEIGHT,
              left: 0,
            }}
            onSelect={selectChargePoint}
          />
        </MapErrorBoundary>
        <View style={[styles.overlayTop, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
          <Animated.View entering={FadeInDown.duration(motion.duration.reveal).easing(motion.easing.out)}>
            {searchRow}
          </Animated.View>
          <ChargePointFilterChips value={filters} onChange={setFilters} delay={motion.revealStagger} />
        </View>
        <MapControls
          locateLabel={isDemoCenter ? 'Centralizar no condomínio' : 'Minha localização'}
          onLocate={locateUser}
          onZoomIn={() => mapRef.current?.zoomBy(1)}
          onZoomOut={() => mapRef.current?.zoomBy(-1)}
          style={[styles.controls, { bottom: cardBottom + CARD_HEIGHT + CONTROLS_GAP }]}
        />
        <View style={[styles.bottom, { bottom: cardBottom }]} pointerEvents="box-none">
          {isPending ? (
            <View style={styles.messageCard}>
              <ActivityIndicator accessibilityLabel="Carregando pontos de recarga" color={nightColors.textTitle} />
            </View>
          ) : showError ? (
            errorCard
          ) : selected ? (
            <Animated.View
              key={selected.chargePoint.id}
              entering={FadeInUp.duration(motion.duration.reveal).easing(motion.easing.out)}
            >
              <ChargePointMapCard
                chargePoint={selected.chargePoint}
                distanceMeters={selected.distanceMeters}
                onPress={() => openChargePoint(selected.chargePoint.id)}
              />
            </Animated.View>
          ) : (
            emptyCard
          )}
        </View>
        {filterSheet}
      </View>
    );
  }

  const myChargeSummary: MyChargeSummary | null = openSession
    ? {
        socPercent: openSession.socPercent,
        limitSocPercent: openSession.limit.type === 'PERCENT' ? openSession.limit.socPercent : null,
        readyAt: openSession.projectedChargingEndsAt ? formatTime(openSession.projectedChargingEndsAt) : null,
      }
    : null;
  const showSearch = isSearching || query.length > 0;

  return (
    <View style={styles.listScreen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + spacing.sm, paddingBottom: tabBarHeight + spacing.xxl },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <Animated.View entering={enter(0)} style={styles.listTop}>
          <View accessibilityRole="tablist" style={styles.modeToggle}>
            {hasMapFailed ? null : (
              <PressableScale
                accessibilityRole="tab"
                accessibilityLabel="Ver mapa"
                accessibilityState={{ selected: false }}
                onPress={toggleMode}
                scaleTo={0.97}
                style={styles.modeOption}
              >
                <Icon icon={MapIcon} size={18} color={colors.textMuted} />
                <Text style={styles.modeLabel}>Mapa</Text>
              </PressableScale>
            )}
            <View
              accessibilityRole="tab"
              accessibilityLabel="Lista"
              accessibilityState={{ selected: true }}
              style={[styles.modeOption, styles.modeOptionActive]}
            >
              <Icon icon={List} size={18} color={colors.textOnAccent} />
              <Text style={[styles.modeLabel, styles.modeLabelActive]}>Lista</Text>
            </View>
          </View>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={showSearch ? 'Fechar busca' : 'Buscar ponto'}
            onPress={() => {
              if (showSearch) setQuery('');
              setSearching(!showSearch);
            }}
            haptic="selection"
            scaleTo={0.92}
            style={styles.roundWhite}
          >
            <Icon icon={showSearch ? X : Search} size={20} color={colors.textTitle} />
          </PressableScale>
        </Animated.View>
        {showSearch ? (
          <Animated.View entering={enter(0)} style={styles.listSearch}>
            <ChargePointSearchField value={query} onChangeText={setQuery} />
          </Animated.View>
        ) : null}
        {hasMapFailed && isMapSupported ? (
          <View style={styles.banner}>
            <InfoBanner tone="info">O mapa não pôde ser carregado. Mostrando os pontos em lista.</InfoBanner>
          </View>
        ) : null}
        <Animated.View entering={enter(1)} style={styles.chipsRow}>
          <View style={styles.flex}>
            <ChargePointFilterChips value={filters} onChange={setFilters} scheme="light" />
          </View>
          <Text style={styles.count}>{visible.length === 1 ? '1 ponto' : `${visible.length} pontos`}</Text>
        </Animated.View>
        <View style={styles.list}>
          {isPending ? (
            <ActivityIndicator accessibilityLabel="Carregando pontos de recarga" color={colors.accent} />
          ) : showError ? (
            <View style={styles.lightMessage}>
              <Text style={styles.lightMessageText}>Não foi possível carregar os pontos de recarga.</Text>
              <Button
                label="Tentar novamente"
                icon={RotateCw}
                variant="secondary"
                size="sm"
                loading={isRefetching}
                onPress={() => refetch()}
              />
            </View>
          ) : visible.length === 0 ? (
            <View style={styles.lightMessage}>
              <Text style={styles.lightMessageTitle}>Nenhum ponto encontrado</Text>
              <Text style={styles.lightMessageText}>
                {activeFilterCount === 0 && query.trim().length === 0
                  ? 'Ainda não há pontos disponíveis para você. Entre em um condomínio pelo convite do gestor.'
                  : 'Nenhum ponto corresponde a esta busca agora.'}
              </Text>
            </View>
          ) : (
            ranked.map(({ chargePoint, distanceMeters }, index) => (
              <Animated.View key={chargePoint.id} entering={enter(index + 2)}>
                <ChargePointCard
                  chargePoint={chargePoint}
                  distanceMeters={distanceMeters}
                  myCharge={openSession?.chargePoint.id === chargePoint.id ? myChargeSummary : null}
                  onPress={() => openChargePoint(chargePoint.id)}
                />
              </Animated.View>
            ))
          )}
          <Text style={styles.legal}>
            Pontos do Grupo A repassam a energia a custo, sem margem (ANEEL RN 1.000/2021). O fator de demanda vale só
            para os pontos comerciais.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: nightColors.bgBase,
  },
  listScreen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  listTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
  },
  modeToggle: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceCard,
  },
  modeOption: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.pill,
  },
  modeOptionActive: {
    backgroundColor: colors.accent,
  },
  modeLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  modeLabelActive: {
    fontFamily: fonts.bold,
    color: colors.textOnAccent,
  },
  listSearch: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  count: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  lightMessage: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xxl - 4,
    backgroundColor: colors.surfaceCard,
  },
  lightMessageTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  lightMessageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  overlayTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    gap: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
  },
  roundWhite: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
  },
  roundGlass: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 12,
    right: 13,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.surfaceCard,
    backgroundColor: colors.energy,
  },
  controls: {
    position: 'absolute',
    right: spacing.lg,
  },
  bottom: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  messageCard: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.card + 4,
    borderWidth: 1,
    borderColor: nightColors.borderSubtle,
    backgroundColor: nightColors.surfaceCard,
  },
  messageTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: nightColors.textTitle,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
  },
  listContent: {
    gap: spacing.md,
  },
  banner: {
    paddingHorizontal: spacing.lg,
  },
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  legal: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: nightColors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
});
