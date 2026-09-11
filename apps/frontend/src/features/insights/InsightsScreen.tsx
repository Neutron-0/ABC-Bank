import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import {
  Activity,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react-native';

export const InsightsScreen: React.FC = () => {
  const { financialHealth, signals, language, openJourney } = useCustomerStore();
  const t = getTranslation(language);

  const getHealthBadge = () => {
    switch (financialHealth.status) {
      case 'thriving':
        return { label: t.insights.statusThriving, color: colors.success, bg: colors.successLight };
      case 'stress':
        return { label: t.insights.statusStress, color: colors.accentWarm, bg: colors.warningLight };
      case 'tighter_than_usual':
        return { label: t.insights.statusTight, color: '#D97706', bg: '#FEF3C7' };
      default:
        return { label: t.insights.statusStable, color: colors.primary, bg: colors.primarySubtle };
    }
  };

  const badge = getHealthBadge();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.insights.title}</Text>
        <Text style={styles.subtitle}>{t.insights.subtitle}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overall Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <Text style={styles.statusCardLabel}>{t.insights.overallPicture}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
          </View>

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{t.insights.cashFlowStability}</Text>
              <Text style={styles.metricVal}>{financialHealth.cashFlowStabilityScore} / 100</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{t.insights.savingsRate}</Text>
              <Text style={[styles.metricVal, { color: colors.success }]}>
                {financialHealth.savingsRatePercent}%
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{t.insights.debtToIncome}</Text>
              <Text
                style={[
                  styles.metricVal,
                  financialHealth.debtToIncomeRatio > 0.4 ? { color: colors.danger } : {},
                ]}
              >
                {Math.round(financialHealth.debtToIncomeRatio * 100)}%
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{t.insights.emergencyFund}</Text>
              <Text style={styles.metricVal}>{financialHealth.emergencyFundMonths} Months</Text>
            </View>
          </View>
        </View>

        {/* Positive & Caution Statements */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>{t.insights.positiveFactors}</Text>
          {financialHealth.statements.positive.map((stmt, idx) => (
            <View key={idx} style={styles.statementRow}>
              <CheckCircle2 size={16} color={colors.success} style={styles.iconOffset} />
              <Text style={styles.statementText}>{stmt}</Text>
            </View>
          ))}

          {financialHealth.statements.caution.length > 0 && (
            <>
              <Text style={[styles.sectionHeading, { marginTop: spacing.md }]}>
                {t.insights.cautionFactors}
              </Text>
              {financialHealth.statements.caution.map((stmt, idx) => (
                <View key={idx} style={styles.statementRowCaution}>
                  <AlertTriangle size={16} color={colors.accentWarm} style={styles.iconOffset} />
                  <Text style={styles.statementTextCaution}>{stmt}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* What Changed Section */}
        <View style={styles.section}>
          <View style={styles.whatChangedCard}>
            <View style={styles.whatChangedHeader}>
              <Sparkles size={18} color={colors.primary} />
              <Text style={styles.whatChangedTitle}>{t.insights.whatChanged}</Text>
            </View>
            {financialHealth.statements.whatChanged.map((change, idx) => (
              <View key={idx} style={styles.changeItem}>
                <Text style={styles.changeBullet}>•</Text>
                <Text style={styles.changeText}>{change}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Natural Language Digest Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Natural-Language Digest</Text>

          <View style={styles.digestCard}>
            <Text style={styles.digestTag}>COMMUTE & HABITS</Text>
            <Text style={styles.digestTitle}>
              Delhi Metro is your most frequent weekday routine (22 trips/mo).
            </Text>
            <Text style={styles.digestDesc}>
              Repeated spending averages ₹80/day with high temporal consistency around 8:40 AM.
            </Text>
          </View>

          <View style={styles.digestCard}>
            <Text style={styles.digestTag}>UTILITIES & BILLS</Text>
            <Text style={styles.digestTitle}>
              Electricity bill remained stable for 4 consecutive months.
            </Text>
            <Text style={styles.digestDesc}>
              Average billing is ₹1,450 without sudden consumption spikes.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  statusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusCardLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  statusBadgeText: {
    ...typography.tiny,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricItem: {
    width: '46%',
    backgroundColor: colors.cardBgSecondary,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metricVal: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  statementRowCaution: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  iconOffset: {
    marginTop: 2,
  },
  statementText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  statementTextCaution: {
    ...typography.body,
    color: '#92400E',
    flex: 1,
  },
  whatChangedCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  whatChangedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  whatChangedTitle: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    gap: 6,
  },
  changeBullet: {
    fontSize: 16,
    color: colors.primary,
  },
  changeText: {
    ...typography.caption,
    color: '#1E3A8A',
    flex: 1,
  },
  digestCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  digestTag: {
    ...typography.tiny,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  digestTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  digestDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
