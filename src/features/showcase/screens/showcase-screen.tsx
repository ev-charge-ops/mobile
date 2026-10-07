import { router } from 'expo-router';
import { Bell, Lock, Mail, Play, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card, Divider, SectionTitle } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { MetricTile } from '@/components/ui/metric-tile';
import { Sheet } from '@/components/ui/sheet';
import { StatusPill } from '@/components/ui/status-pill';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { colors, spacing, typography } from '@/constants/theme';
import { formatCurrency } from '@/utils/format-currency';
import { formatEnergy } from '@/utils/format-energy';

export function ShowcaseScreen() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isSheetVisible, setSheetVisible] = useState(false);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.screen}>
        <AppBar
          variant="large"
          title="EV ChargeOps"
          subtitle="Design system"
          onBack={() => router.back()}
          actions={
            <IconButton
              icon={Bell}
              tone="inset"
              accessibilityLabel="Notificações"
              onPress={() => toast.show('Nenhuma notificação nova', { tone: 'info' })}
            />
          }
        />
        <ScrollView contentContainerStyle={styles.content}>
          <SectionTitle>Botões</SectionTitle>
          <Card style={styles.stack}>
            <Button label="Iniciar recarga" icon={Zap} size="lg" block />
            <View style={styles.row}>
              <Button label="Secundário" variant="secondary" />
              <Button label="Contorno" variant="outline" />
              <Button label="Discreto" variant="ghost" />
            </View>
            <View style={styles.row}>
              <Button label="Desabilitado" disabled />
              <Button label="Carregando" loading />
              <Button label="Encerrar" variant="danger" size="sm" />
            </View>
          </Card>

          <SectionTitle>Status</SectionTitle>
          <Card style={styles.row}>
            <StatusPill status="available" label="Disponível" />
            <StatusPill status="charging" label="Carregando" />
            <StatusPill status="idle" label="Ocioso" />
            <StatusPill status="fault" label="Falha" />
            <StatusPill status="info" label="Informação" />
            <StatusPill status="offline" label="Offline" />
          </Card>

          <SectionTitle>Métricas</SectionTitle>
          <Card style={styles.stack}>
            <MetricTile value={formatEnergy(18.5, { withUnit: false })} unit="kWh" label="Energia entregue" size="xl" tone="charging" />
            <Divider />
            <View style={styles.row}>
              <MetricTile value="0,89" unit="R$/kWh" label="Tarifa agora" style={styles.flex} />
              <MetricTile value="4,5" unit="kW" label="Potência" tone="demand" style={styles.flex} />
              <MetricTile value="1" unit="falha" label="Hoje" tone="fault" style={styles.flex} />
            </View>
            <Text style={styles.caption}>Custo estimado: {formatCurrency(16.47)}</Text>
          </Card>

          <SectionTitle>Campos</SectionTitle>
          <Card style={styles.stack}>
            <TextField
              label="E-mail"
              required
              icon={Mail}
              placeholder="voce@exemplo.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              hint="Usaremos para enviar os recibos."
            />
            <TextField label="Senha" icon={Lock} placeholder="Sua senha" secureTextEntry error="Senha incorreta" />
          </Card>

          <SectionTitle>Feedback</SectionTitle>
          <Card style={styles.row}>
            <Button
              label="Mostrar toast"
              variant="secondary"
              onPress={() => toast.show('Recarga iniciada com sucesso')}
            />
            <Button label="Abrir sheet" variant="outline" icon={Play} onPress={() => setSheetVisible(true)} />
          </Card>
        </ScrollView>
      </SafeAreaView>

      <Sheet visible={isSheetVisible} onClose={() => setSheetVisible(false)}>
        <View style={styles.stack}>
          <Text style={typography.heading}>Confirmar recarga</Text>
          <Text style={typography.body}>
            A tarifa fica travada no início da sessão e o consumo é medido por kWh.
          </Text>
          <Button label="Confirmar" block onPress={() => setSheetVisible(false)} />
          <Button label="Cancelar" variant="ghost" block onPress={() => setSheetVisible(false)} />
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    gap: spacing.cardGap,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.massive,
  },
  stack: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  caption: {
    ...typography.caption,
  },
});
