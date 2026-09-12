import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../../types';
import { colors, typography, spacing, radii, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import {
  Train,
  Coffee,
  Zap,
  Briefcase,
  Home,
  ShieldAlert,
  HeartPulse,
  Pill,
  Wrench,
  Car,
  ShoppingCart,
  Utensils,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';

interface Props {
  transaction: Transaction;
}

export const TransactionItem: React.FC<Props> = ({ transaction }) => {
  const { colors: themeColors } = useAppTheme();
  const { setSelectedTransaction } = useCustomerStore();

  const getIcon = () => {
    const size = 18;
    const isCredit = transaction.type === 'credit';
    const isFlagged = transaction.status === 'flagged';

    if (isFlagged) {
      return <ShieldAlert size={size} color={themeColors.danger} />;
    }

    switch (transaction.category) {
      case 'transport':
        return <Train size={size} color={themeColors.iconNeutral} />;
      case 'food':
        return <Coffee size={size} color={themeColors.iconNeutral} />;
      case 'bills':
        return <Zap size={size} color={themeColors.iconNeutral} />;
      case 'salary':
        return <Briefcase size={size} color={themeColors.primary} />;
      case 'emi':
        return <Home size={size} color={themeColors.iconNeutral} />;
      case 'healthcare':
        return <HeartPulse size={size} color={themeColors.iconNeutral} />;
      case 'shopping':
        return <ShoppingCart size={size} color={themeColors.iconNeutral} />;
      default:
        return isCredit ? (
          <ArrowDownLeft size={size} color={themeColors.primary} />
        ) : (
          <ArrowUpRight size={size} color={themeColors.iconNeutral} />
        );
    }
  };

  const isCredit = transaction.type === 'credit';
  const isFlagged = transaction.status === 'flagged';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: themeColors.cardBg, borderBottomColor: themeColors.borderLight },
        isFlagged && { backgroundColor: themeColors.cardBgSecondary, borderLeftWidth: 3, borderLeftColor: themeColors.danger }
      ]}
      onPress={() => setSelectedTransaction(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: themeColors.cardBgSecondary },
            isFlagged && { backgroundColor: themeColors.cardBgSecondary },
          ]}
        >
          {getIcon()}
        </View>
        <View style={styles.details}>
          <View style={styles.merchantRow}>
            <Text style={[styles.merchant, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {transaction.merchant}
            </Text>
            {transaction.isRecurring && (
              <View style={[styles.recurringBadge, { backgroundColor: themeColors.cardBgSecondary }]}>
                <Text style={[styles.recurringText, { color: themeColors.textSecondary }]}>Repeat</Text>
              </View>
            )}
            {isFlagged && (
              <View style={[styles.flaggedBadge, { backgroundColor: themeColors.cardBgSecondary, borderWidth: 1, borderColor: themeColors.danger }]}>
                <Text style={[styles.flaggedText, { color: themeColors.danger }]}>Anomaly</Text>
              </View>
            )}
          </View>
          <Text style={[styles.description, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {transaction.description}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: themeColors.textPrimary },
            isFlagged && { color: themeColors.danger },
          ]}
        >
          {isCredit ? '+' : '−'}₹{transaction.amount.toLocaleString('en-IN')}
        </Text>
        <Text style={[styles.time, { color: themeColors.textMuted }]}>
          {new Date(transaction.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  flaggedContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    paddingRight: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.cardBgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditIconWrap: {
    backgroundColor: colors.successLight,
  },
  flaggedIconWrap: {
    backgroundColor: '#FEE2E2',
  },
  details: {
    flex: 1,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  merchant: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  recurringBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  recurringText: {
    ...typography.tiny,
    color: colors.primary,
    fontWeight: '700',
  },
  flaggedBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  flaggedText: {
    ...typography.tiny,
    color: colors.textWhite,
    fontWeight: '700',
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  creditAmount: {
    color: colors.success,
  },
  flaggedAmount: {
    color: colors.danger,
  },
  time: {
    ...typography.tiny,
    color: colors.textMuted,
    marginTop: 2,
  },
});
