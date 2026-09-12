import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { CustomerStateType } from '../../types';
import {
  X,
  CheckCircle2,
  ShieldAlert,
  HeartHandshake,
  TrendingUp,
  Train,
  AlertTriangle,
  Cpu,
  RefreshCw,
} from 'lucide-react-native';

export const PrototypeLabModal: React.FC = () => {
  const { colors: themeColors, isDark } = useAppTheme();
  const {
    activeJourney,
    closeJourney,
    currentState,
    switchCustomerState,
    signals,
    financialHealth,
    risk,
    cards,
    isLoading,
  } = useCustomerStore();

  if (activeJourney !== 'prototype_lab') return null;

  const statesList: {
    id: CustomerStateType;
    title: string;
    subtitle: string;
    icon: any;
  }[] = [
    {
      id: 'normal',
      title: 'State A: Normal Workday',
      subtitle: 'Routine commute (8:40 AM Metro), salary & predictable bills',
      icon: Train,
    },
    {
      id: 'surplus',
      title: 'State B: Surplus / Saving Moment',
      subtitle: 'Salary credited, surplus ₹38,400, emergency fund 105%',
      icon: TrendingUp,
    },
    {
      id: 'financial_stress',
      title: 'State C: Financial Stress',
      subtitle: 'Tight cash flow, high EMI obligations -> LOANS SUPPRESSED',
      icon: AlertTriangle,
    },
    {
      id: 'medical_event',
      title: 'State D: Large Medical Expense',
      subtitle: '₹48,200 hospital debit -> EMPATHY & claim assistance first',
      icon: HeartHandshake,
    },
    {
      id: 'fraud_alert',
      title: 'State E: Fraud / Security Alert',
      subtitle: '₹31,800 suspicious debit -> Urgent protection & card lock',
      icon: ShieldAlert,
    },
  ];

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: themeColors.cardBg }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
                <Cpu size={20} color={themeColors.iconNeutral} />
              </View>
              <View>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>Prototype Lab: State Switcher</Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Test real-time AI UI adaptation</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>Select Synthetic Customer State:</Text>

            {/* State Buttons */}
            <View style={styles.statesList}>
              {statesList.map((st) => {
                const active = currentState === st.id;
                const IconComponent = st.icon;
                return (
                  <TouchableOpacity
                    key={st.id}
                    style={[
                      styles.stateCard,
                      { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border },
                      active && [
                        styles.activeStateCard,
                        {
                          backgroundColor: isDark ? '#172554' : '#FFFFFF',
                          borderColor: themeColors.primary,
                        },
                      ],
                    ]}
                    onPress={() => switchCustomerState(st.id)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.stateIcon, { backgroundColor: themeColors.cardBgSecondary }]}>
                      <IconComponent size={20} color={active ? themeColors.primary : themeColors.iconNeutral} />
                    </View>
                    <View style={styles.stateInfo}>
                      <View style={styles.stateTitleRow}>
                        <Text
                          style={[
                            styles.stateTitle,
                            { color: themeColors.textPrimary },
                            active && { color: themeColors.textPrimary, fontWeight: '700' },
                          ]}
                        >
                          {st.title}
                        </Text>
                        {active && (
                          <View
                            style={[
                              styles.activeBadge,
                              { backgroundColor: themeColors.primary },
                            ]}
                          >
                            <Text style={[styles.activeBadgeText, { color: '#FFFFFF' }]}>
                              ACTIVE
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.stateSubtitle, { color: themeColors.textSecondary }]}>{st.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live Telemetry Checklist */}
            <View style={styles.telemetrySection}>
              <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>Live Detected Signals (Extracted Features):</Text>
              <View style={[styles.telemetryCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <View style={styles.signalRow}>
                  <CheckCircle2
                    size={16}
                    color={signals.salaryRecentlyCredited ? themeColors.primary : themeColors.textMuted}
                  />
                  <Text style={[styles.signalText, { color: themeColors.textPrimary }]}>
                    Salary Recently Credited: {signals.salaryRecentlyCredited ? 'YES (Sep 10)' : 'NO'}
                  </Text>
                </View>

                <View style={styles.signalRow}>
                  <CheckCircle2
                    size={16}
                    color={signals.medicalEventDetected ? themeColors.danger : themeColors.textMuted}
                  />
                  <Text style={[styles.signalText, { color: themeColors.textPrimary }]}>
                    Medical Outflow Surge: {signals.medicalEventDetected ? 'DETECTED (₹48,200)' : 'None'}
                  </Text>
                </View>

                <View style={styles.signalRow}>
                  <CheckCircle2
                    size={16}
                    color={risk.anomalyDetected ? themeColors.danger : themeColors.textMuted}
                  />
                  <Text style={[styles.signalText, { color: themeColors.textPrimary }]}>
                    Security Risk Anomaly: {risk.anomalyDetected ? `HIGH (Score ${risk.anomalyScore})` : 'Normal (4/100)'}
                  </Text>
                </View>

                <View style={styles.signalRow}>
                  <CheckCircle2
                    size={16}
                    color={financialHealth.status === 'stress' ? themeColors.danger : themeColors.primary}
                  />
                  <Text style={[styles.signalText, { color: themeColors.textPrimary }]}>
                    Cash-Flow Health Status: {financialHealth.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Decision Engine Order */}
            <View style={styles.telemetrySection}>
              <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>Resulting AI Attention Stack ({cards.length} Cards):</Text>
              <View style={[styles.cardsOrderBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                {cards.map((c, i) => (
                  <View key={c.id} style={[styles.cardOrderItem, { borderBottomColor: themeColors.border }]}>
                    <Text style={[styles.orderRank, { color: themeColors.primary }]}>#{i + 1}</Text>
                    <View style={styles.orderInfo}>
                      <Text style={[styles.orderTitle, { color: themeColors.textPrimary }]}>{c.title}</Text>
                      <Text style={[styles.orderMeta, { color: themeColors.textSecondary }]}>
                        Layer: {c.layer} • Priority: {c.priority} • Type: {c.type}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: themeColors.primary }]}
            onPress={closeJourney}
          >
            <Text style={[styles.doneBtnText, { color: '#FFFFFF' }]}>Apply & Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '90%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  content: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  statesList: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgSecondary,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  activeStateCard: {
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  stateIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateInfo: {
    flex: 1,
  },
  stateTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stateTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  activeBadgeText: {
    ...typography.tiny,
    color: colors.textWhite,
    fontWeight: '800',
  },
  stateSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  telemetrySection: {
    marginBottom: spacing.lg,
  },
  telemetryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signalText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  cardsOrderBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardOrderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  orderRank: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
    width: 24,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  orderMeta: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneBtnText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
});
