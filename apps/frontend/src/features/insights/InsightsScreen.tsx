import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppTheme, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { BespokeFinancialGraph } from '../../components/common/BespokeFinancialGraph';
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
  const { colors, isDark } = useAppTheme();
  const { financialHealth, signals, language, openJourney } = useCustomerStore();
  const t = getTranslation(language);

  const getHealthBadge = () => {
    switch (financialHealth.status) {
      case 'thriving':
        return {
          label: t.insights.statusThriving,
          color: colors.success,
          bg: isDark ? '#064E3B' : colors.successLight,
        };
      case 'stress':
        return {
          label: t.insights.statusStress,
          color: colors.accentWarm,
          bg: isDark ? '#451A03' : colors.warningLight,
        };
      case 'tighter_than_usual':
        return {
          label: t.insights.statusTight,
          color: '#D97706',
          bg: isDark ? '#451A03' : '#FEF3C7',
        };
      default:
        return {
          label: t.insights.statusStable,
          color: isDark ? '#38BDF8' : colors.primaryRoyal,
          bg: isDark ? '#0C4A6E' : colors.pastelBlue,
        };
    }
  };

  const badge = getHealthBadge();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t.insights.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.insights.subtitle}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 110, paddingTop: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Premier Bespoke Financial Cash Flow Graph */}
        <View style={styles.graphContainer}>
          <BespokeFinancialGraph />
        </View>

        {/* Overall Health Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.statusTop}>
            <Text style={[styles.statusCardLabel, { color: colors.textSecondary }]}>
              {t.insights.overallPicture}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
          </View>

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={[styles.metricItem, { backgroundColor: colors.cardBgSecondary }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {t.insights.cashFlowStability}
              </Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {financialHealth.cashFlowStabilityScore} / 100
              </Text>
            </View>

            <View style={[styles.metricItem, { backgroundColor: colors.cardBgSecondary }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {t.insights.savingsRate}
              </Text>
              <Text style={[styles.metricVal, { color: colors.success }]}>
                {financialHealth.savingsRatePercent}%
              </Text>
            </View>

            <View style={[styles.metricItem, { backgroundColor: colors.cardBgSecondary }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {t.insights.debtToIncome}
              </Text>
              <Text
                style={[
                  styles.metricVal,
                  financialHealth.debtToIncomeRatio > 0.4
                    ? { color: colors.danger }
                    : { color: colors.textPrimary },
                ]}
              >
                {Math.round(financialHealth.debtToIncomeRatio * 100)}%
              </Text>
            </View>

            <View style={[styles.metricItem, { backgroundColor: colors.cardBgSecondary }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {t.insights.emergencyFund}
              </Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {financialHealth.emergencyFundMonths} Months
              </Text>
            </View>
          </View>
        </View>

        {/* Positive & Caution Statements */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            {t.insights.positiveFactors}
          </Text>
          {financialHealth.statements.positive.map((stmt, idx) => (
            <View
              key={idx}
              style={[
                styles.statementRow,
                { backgroundColor: colors.cardBg, borderColor: colors.border },
              ]}
            >
              <CheckCircle2 size={16} color={colors.success} style={styles.iconOffset} />
              <Text style={[styles.statementText, { color: colors.textPrimary }]}>{stmt}</Text>
            </View>
          ))}

          {financialHealth.statements.caution.length > 0 && (
            <>
              <Text
                style={[
                  styles.sectionHeading,
                  { color: colors.textSecondary, marginTop: spacing.md },
                ]}
              >
                {t.insights.cautionFactors}
              </Text>
              {financialHealth.statements.caution.map((stmt, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.statementRowCaution,
                    {
                      backgroundColor: isDark ? '#451A03' : '#FFFBEB',
                      borderColor: isDark ? '#78350F' : '#FDE68A',
                    },
                  ]}
                >
                  <AlertTriangle size={16} color={colors.accentWarm} style={styles.iconOffset} />
                  <Text
                    style={[
                      styles.statementTextCaution,
                      { color: isDark ? '#FDE68A' : '#92400E' },
                    ]}
                  >
                    {stmt}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* What Changed Section */}
        <View style={styles.section}>
          <View
            style={[
              styles.whatChangedCard,
              {
                backgroundColor: isDark ? '#172554' : '#EFF6FF',
                borderColor: isDark ? '#1E3A8A' : '#BFDBFE',
              },
            ]}
          >
            <View style={styles.whatChangedHeader}>
              <Sparkles size={18} color={isDark ? '#38BDF8' : colors.primaryRoyal} />
              <Text
                style={[
                  styles.whatChangedTitle,
                  { color: isDark ? '#38BDF8' : colors.primaryRoyal },
                ]}
              >
                {t.insights.whatChanged}
              </Text>
            </View>
            {financialHealth.statements.whatChanged.map((change, idx) => (
              <View key={idx} style={styles.changeItem}>
                <Text
                  style={[
                    styles.changeBullet,
                    { color: isDark ? '#38BDF8' : colors.primaryRoyal },
                  ]}
                >
                  •
                </Text>
                <Text
                  style={[
                    styles.changeText,
                    { color: isDark ? '#93C5FD' : '#1E3A8A' },
                  ]}
                >
                  {change}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Natural Language Digest Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            Natural-Language Digest
          </Text>

          <View
            style={[
              styles.digestCard,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.digestTag, { color: isDark ? '#38BDF8' : colors.primaryRoyal }]}>
              COMMUTE & HABITS
            </Text>
            <Text style={[styles.digestTitle, { color: colors.textPrimary }]}>
              Delhi Metro is your most frequent weekday routine (22 trips/mo).
            </Text>
            <Text style={[styles.digestDesc, { color: colors.textSecondary }]}>
              Repeated spending averages ₹80/day with high temporal consistency around 8:40 AM.
            </Text>
          </View>

          <View
            style={[
              styles.digestCard,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.digestTag, { color: isDark ? '#38BDF8' : colors.primaryRoyal }]}>
              UTILITIES & BILLS
            </Text>
            <Text style={[styles.digestTitle, { color: colors.textPrimary }]}>
              Electricity bill remained stable for 4 consecutive months.
            </Text>
            <Text style={[styles.digestDesc, { color: colors.textSecondary }]}>
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
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  graphContainer: {
    paddingHorizontal: spacing.md,
  },
  statusCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
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
    padding: spacing.md,
    borderRadius: radii.md,
  },
  metricLabel: {
    ...typography.caption,
  },
  metricVal: {
    ...typography.h3,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    ...typography.captionMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  statementRowCaution: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  iconOffset: {
    marginTop: 2,
  },
  statementText: {
    ...typography.body,
    flex: 1,
  },
  statementTextCaution: {
    ...typography.body,
    flex: 1,
  },
  whatChangedCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  whatChangedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  whatChangedTitle: {
    ...typography.bodyBold,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    gap: 6,
  },
  changeBullet: {
    fontSize: 16,
  },
  changeText: {
    ...typography.caption,
    flex: 1,
  },
  digestCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  digestTag: {
    ...typography.tiny,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  digestTitle: {
    ...typography.bodyBold,
  },
  digestDesc: {
    ...typography.caption,
    marginTop: 2,
  },
});
