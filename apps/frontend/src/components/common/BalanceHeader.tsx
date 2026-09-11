import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { Eye, EyeOff, ShieldCheck, ArrowUpRight, TrendingUp } from 'lucide-react-native';

export const BalanceHeader: React.FC = () => {
  const { balance, isBalanceHidden, toggleBalanceHide, language, financialHealth, currentState } =
    useCustomerStore();
  const t = getTranslation(language);

  const getStatusBadge = () => {
    if (currentState === 'fraud_alert') {
      return { text: 'Security Guard Active', color: colors.danger, bg: colors.dangerLight };
    }
    if (financialHealth.status === 'stress') {
      return { text: 'Cash Flow Tighter', color: colors.accentWarm, bg: colors.warningLight };
    }
    if (financialHealth.status === 'thriving') {
      return { text: 'Surplus Cash Flow', color: colors.success, bg: colors.successLight };
    }
    return { text: 'Cash Flow Stable', color: colors.accent, bg: colors.infoLight };
  };

  const badge = getStatusBadge();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{t.home.availableBalance}</Text>
          <TouchableOpacity onPress={toggleBalanceHide} style={styles.eyeBtn}>
            {isBalanceHidden ? (
              <EyeOff size={16} color={colors.textSecondary} />
            ) : (
              <Eye size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
          <ShieldCheck size={12} color={badge.color} />
          <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.currency}>₹</Text>
        <Text style={styles.amount}>
          {isBalanceHidden ? '••••••' : balance.available.toLocaleString('en-IN')}
        </Text>
        <Text style={styles.fraction}>{isBalanceHidden ? '' : '.00'}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.subBalanceItem}>
          <Text style={styles.subBalanceLabel}>{t.home.savingsBalance}</Text>
          <Text style={styles.subBalanceValue}>
            {isBalanceHidden ? '••••••' : `₹${balance.savings.toLocaleString('en-IN')}`}
          </Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.subBalanceItem}>
          <Text style={styles.subBalanceLabel}>Emergency Buffer</Text>
          <Text style={styles.subBalanceValue}>
            {financialHealth.emergencyFundMonths} Months
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eyeBtn: {
    padding: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusText: {
    ...typography.tiny,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  currency: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 4,
  },
  amount: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  fraction: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subBalanceItem: {
    flex: 1,
  },
  subBalanceLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  subBalanceValue: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
  },
});
