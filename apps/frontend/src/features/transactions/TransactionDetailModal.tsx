import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { X, Sparkles, ShieldCheck, ArrowRight, Share2, HelpCircle } from 'lucide-react-native';

export const TransactionDetailModal: React.FC = () => {
  const { selectedTransaction, setSelectedTransaction, openJourney } = useCustomerStore();

  if (!selectedTransaction) return null;

  const isCredit = selectedTransaction.type === 'credit';
  const isFlagged = selectedTransaction.status === 'flagged';

  return (
    <Modal
      visible={Boolean(selectedTransaction)}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedTransaction(null)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Transaction Details</Text>
            <TouchableOpacity
              onPress={() => setSelectedTransaction(null)}
              style={styles.closeBtn}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount Banner */}
            <View style={styles.amountBox}>
              <Text style={[styles.amount, isCredit && styles.creditAmount]}>
                {isCredit ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.merchant}>{selectedTransaction.merchant}</Text>
              <Text style={styles.timestamp}>
                {new Date(selectedTransaction.timestamp).toLocaleString()}
              </Text>
            </View>

            {/* AI Pattern Understanding */}
            {selectedTransaction.aiExplanation && (
              <View style={styles.aiBox}>
                <View style={styles.aiHeader}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={styles.aiTitle}>AI Pattern Understanding</Text>
                </View>
                <Text style={styles.aiText}>{selectedTransaction.aiExplanation}</Text>
              </View>
            )}

            {/* Key Metadata Table */}
            <View style={styles.metaTable}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Status</Text>
                <Text
                  style={[
                    styles.metaVal,
                    isFlagged ? { color: colors.danger } : { color: colors.success },
                  ]}
                >
                  {isFlagged ? 'FLAGGED FOR VERIFICATION' : 'COMPLETED'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaVal}>{selectedTransaction.category.toUpperCase()}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Recurring Signal</Text>
                <Text style={styles.metaVal}>
                  {selectedTransaction.isRecurring
                    ? `Yes (${selectedTransaction.recurringFrequency || 'Routine'})`
                    : 'One-off Transaction'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Transaction ID</Text>
                <Text style={styles.metaVal}>{selectedTransaction.id}</Text>
              </View>
            </View>

            {/* Contextual Action if Flagged or Medical */}
            {isFlagged && (
              <TouchableOpacity
                style={styles.flaggedActionBtn}
                onPress={() => {
                  setSelectedTransaction(null);
                  openJourney('fraud_alert');
                }}
              >
                <Text style={styles.flaggedActionText}>Resolve Security Alert</Text>
                <ArrowRight size={16} color={colors.textWhite} />
              </TouchableOpacity>
            )}

            {selectedTransaction.category === 'healthcare' && selectedTransaction.amount >= 20000 && (
              <TouchableOpacity
                style={styles.medicalActionBtn}
                onPress={() => {
                  setSelectedTransaction(null);
                  openJourney('medical_assistance');
                }}
              >
                <Text style={styles.medicalActionText}>Get Insurance Claim Assistance</Text>
                <ArrowRight size={16} color={colors.textWhite} />
              </TouchableOpacity>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => setSelectedTransaction(null)}
          >
            <Text style={styles.doneBtnText}>Close</Text>
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
    maxHeight: '85%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  amountBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  creditAmount: {
    color: colors.success,
  },
  merchant: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  aiBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: spacing.md,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  aiTitle: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  aiText: {
    ...typography.body,
    color: '#1E40AF',
  },
  metaTable: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaVal: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  flaggedActionBtn: {
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  flaggedActionText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
  medicalActionBtn: {
    backgroundColor: '#0284C7',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  medicalActionText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
  doneBtn: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  doneBtnText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
});
