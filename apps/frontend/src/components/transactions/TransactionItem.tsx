import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../../types';
import { spacing, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';

interface Props {
  transaction: Transaction;
}

export const TransactionItem: React.FC<Props> = ({ transaction }) => {
  const { colors: themeColors } = useAppTheme();
  const { setSelectedTransaction } = useCustomerStore();

  const isCredit = transaction.type === 'credit';
  const isFlagged = transaction.status === 'flagged';

  const formatCategory = (cat: string) => {
    switch (cat) {
      case 'transport': return 'UPI · Commute';
      case 'food': return 'UPI · Dining';
      case 'bills': return 'BBPS · Utility';
      case 'salary': return 'NEFT · Payroll';
      case 'emi': return 'NACH · Auto-Debit';
      case 'healthcare': return 'UPI · Healthcare';
      case 'shopping': return 'UPI · Shopping';
      default: return 'UPI Transfer';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderBottomColor: themeColors.borderLight },
        isFlagged && { backgroundColor: themeColors.cardBgSecondary }
      ]}
      onPress={() => setSelectedTransaction(transaction)}
      activeOpacity={0.65}
    >
      <View style={styles.left}>
        <View style={styles.merchantRow}>
          <Text style={[styles.merchant, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {transaction.merchant}
          </Text>
          {isFlagged && (
            <View style={[styles.flaggedTag, { borderColor: themeColors.danger }]}>
              <Text style={[styles.flaggedText, { color: themeColors.danger }]}>VERIFY</Text>
            </View>
          )}
        </View>
        <Text style={[styles.metadata, { color: themeColors.textSecondary }]} numberOfLines={1}>
          {formatCategory(transaction.category)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: themeColors.textPrimary },
            isCredit && { color: themeColors.textPrimary },
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
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flex: 1,
    paddingRight: spacing.md,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  merchant: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  flaggedTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
  },
  flaggedText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metadata: {
    fontSize: 12,
    fontWeight: '400',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    fontWeight: '400',
  },
});
