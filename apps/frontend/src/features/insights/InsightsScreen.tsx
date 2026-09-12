import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppTheme, typography, spacing, radii, shadows } from '../../theme';
import { serifFont } from '../../theme/typography';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { BespokeFinancialGraph } from '../../components/common/BespokeFinancialGraph';
import {
  Activity,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react-native';

export const InsightsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { financialHealth, signals, language, openJourney } = useCustomerStore();
  const t = getTranslation(language);

  const getHealthBadge = () => {
    switch (financialHealth.status) {
      case 'thriving':
        return {
          label: t.insights.statusThriving,
          color: colors.primary,
          bg: colors.cardBgSecondary,
        };
      case 'stress':
        return {
          label: t.insights.statusStress,
          color: colors.brandSecondary,
          bg: colors.brandSecondarySubtle,
        };
      case 'tighter_than_usual':
        return {
          label: t.insights.statusTight,
          color: colors.brandSecondary,
          bg: colors.brandSecondarySubtle,
        };
      default:
        return {
          label: t.insights.statusStable,
          color: colors.primary,
          bg: colors.cardBgSecondary,
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

      {/* Overall Health Status & Metrics Table */}
      <View style={styles.statusSection}>
        <View style={styles.statusTop}>
          <Text style={[styles.statusCardLabel, { color: colors.textSecondary }]}>
            {t.insights.overallPicture}
          </Text>
          <View style={[styles.statusBadge, { borderColor: colors.borderLight }]}>
            <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {/* 4-Pillars Aligned Metric Grid */}
        <View style={[styles.metricsGrid, { borderTopColor: colors.borderLight }]}>
          <View style={[styles.metricItem, { borderBottomColor: colors.borderLight, borderRightColor: colors.borderLight }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t.insights.cashFlowStability}
            </Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {financialHealth.cashFlowStabilityScore} / 100
            </Text>
          </View>

          <View style={[styles.metricItem, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t.insights.savingsRate}
            </Text>
            <Text style={[styles.metricVal, { color: colors.primary }]}>
              {financialHealth.savingsRatePercent}%
            </Text>
          </View>

          <View style={[styles.metricItem, { borderRightColor: colors.borderLight }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t.insights.debtToIncome}
            </Text>
            <Text
              style={[
                styles.metricVal,
                financialHealth.debtToIncomeRatio > 0.4
                  ? { color: colors.brandSecondary }
                  : { color: colors.textPrimary },
              ]}
            >
              {Math.round(financialHealth.debtToIncomeRatio * 100)}%
            </Text>
          </View>

          <View style={styles.metricItem}>
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
        <View style={[styles.statementList, { borderTopColor: colors.borderLight }]}>
          {financialHealth.statements.positive.map((stmt, idx) => (
            <View
              key={idx}
              style={[
                styles.statementRow,
                { borderBottomColor: colors.borderLight },
              ]}
            >
              <CheckCircle2 size={14} color={colors.primary} style={styles.iconOffset} />
              <Text style={[styles.statementText, { color: colors.textPrimary }]}>{stmt}</Text>
            </View>
          ))}
        </View>

        {financialHealth.statements.caution.length > 0 && (
          <>
            <Text
              style={[
                styles.sectionHeading,
                { color: colors.textSecondary, marginTop: spacing.lg },
              ]}
            >
              {t.insights.cautionFactors}
            </Text>
            <View style={[styles.statementList, { borderTopColor: colors.borderLight }]}>
              {financialHealth.statements.caution.map((stmt, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.statementRowCaution,
                    { borderBottomColor: colors.borderLight },
                  ]}
                >
                  <AlertTriangle size={14} color={colors.brandSecondary} style={styles.iconOffset} />
                  <Text
                    style={[
                      styles.statementTextCaution,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {stmt}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Natural Language Digest */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          Financial Insights & Habits
        </Text>

        <View style={[styles.digestList, { borderTopColor: colors.borderLight }]}>
          <View style={[styles.digestItem, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.digestTag, { color: colors.textMuted }]}>
              COMMUTE & HABITS
            </Text>
            <Text style={[styles.digestTitle, { color: colors.textPrimary }]}>
              Delhi Metro is your most frequent weekday routine (22 trips/mo).
            </Text>
            <Text style={[styles.digestDesc, { color: colors.textSecondary }]}>
              Repeated spending averages ₹80/day with high temporal consistency around 8:40 AM.
            </Text>
          </View>

          <View style={[styles.digestItem, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.digestTag, { color: colors.textMuted }]}>
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
    fontFamily: serifFont,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
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
    marginBottom: spacing.md,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metricItem: {
    width: '50%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricVal: {
    fontFamily: serifFont,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  statementList: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  statementRowCaution: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  iconOffset: {
    marginTop: 2,
  },
  statementText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  statementTextCaution: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  digestList: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  digestItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  digestTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  digestTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  digestDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
});
