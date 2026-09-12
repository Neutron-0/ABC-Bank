import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { X, FileText, ShieldCheck, ArrowRight, Share2, HelpCircle } from 'lucide-react-native';

export const TransactionDetailModal: React.FC = () => {
  const { colors: themeColors, isDark } = useAppTheme();
  const { selectedTransaction, setSelectedTransaction, openJourney, showToast, language } = useCustomerStore();

  if (!selectedTransaction) return null;

  const isCredit = selectedTransaction.type === 'credit';
  const isFlagged = selectedTransaction.status === 'flagged';

  const handleShareReceipt = () => {
    showToast(
      language === 'hi'
        ? `रसीद साझा की गई: ${selectedTransaction.id}`
        : language === 'gu'
        ? `રસીદ શેર કરવામાં આવી: ${selectedTransaction.id}`
        : `Receipt shared: ${selectedTransaction.id}`
    );
  };

  return (
    <Modal
      visible={Boolean(selectedTransaction)}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedTransaction(null)}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: themeColors.cardBg }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.sheetTitle, { color: themeColors.textPrimary }]}>Transaction Receipt</Text>
            <TouchableOpacity
              onPress={() => setSelectedTransaction(null)}
              style={styles.closeBtn}
            >
              <X size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount Banner */}
            <View style={[styles.amountBox, { borderBottomColor: themeColors.borderLight }]}>
              <Text style={[styles.amount, { color: themeColors.textPrimary }, isCredit && { color: themeColors.success }]}>
                {isCredit ? '+' : '−'}₹{selectedTransaction.amount.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.merchant, { color: themeColors.textPrimary }]}>{selectedTransaction.merchant}</Text>
              <Text style={[styles.timestamp, { color: themeColors.textMuted }]}>
                {new Date(selectedTransaction.timestamp).toLocaleString()}
              </Text>
            </View>

            {/* Reconciliation & Pattern Advisory */}
            {selectedTransaction.aiExplanation && (
              <View style={[styles.aiBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <View style={styles.aiHeader}>
                  <FileText size={15} color={themeColors.textPrimary} />
                  <Text style={[styles.aiTitle, { color: themeColors.textPrimary }]}>Reconciliation & Ledger Note</Text>
                </View>
                <Text style={[styles.aiText, { color: themeColors.textSecondary }]}>{selectedTransaction.aiExplanation}</Text>
              </View>
            )}

            {/* Key Metadata Table */}
            <View style={[styles.metaTable, { backgroundColor: themeColors.cardBgSecondary }]}>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Status</Text>
                <Text
                  style={[
                    styles.metaVal,
                    isFlagged ? { color: themeColors.danger } : { color: themeColors.success },
                  ]}
                >
                  {isFlagged ? 'FLAGGED FOR VERIFICATION' : 'SETTLED & COMPLETED'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Debited Account</Text>
                <Text style={[styles.metaVal, { color: themeColors.textPrimary }]}>ABC Bank Savings •••• 4092</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Category</Text>
                <Text style={[styles.metaVal, { color: themeColors.textPrimary }]}>{selectedTransaction.category.toUpperCase()}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Payment Cadence</Text>
                <Text style={[styles.metaVal, { color: themeColors.textPrimary }]}>
                  {selectedTransaction.isRecurring
                    ? `Recurring (${selectedTransaction.recurringFrequency || 'Routine'})`
                    : 'One-off Transaction'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Reference / UPI ID</Text>
                <Text style={[styles.metaVal, { color: themeColors.textPrimary }]}>{selectedTransaction.id}</Text>
              </View>
            </View>

            {/* Contextual Action if Flagged or Medical */}
            {isFlagged && (
              <TouchableOpacity
                style={[styles.flaggedActionBtn, { backgroundColor: themeColors.danger }]}
                onPress={() => {
                  setSelectedTransaction(null);
                  openJourney('fraud_alert');
                }}
              >
                <Text style={styles.flaggedActionText}>Resolve Security Flag</Text>
                <ArrowRight size={16} color="#FFFFFF" />
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
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* Share Receipt Action */}
            <TouchableOpacity
              style={[styles.shareBtn, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
              onPress={handleShareReceipt}
            >
              <Share2 size={15} color={themeColors.textPrimary} />
              <Text style={[styles.shareBtnText, { color: themeColors.textPrimary }]}>Share Payment Receipt</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: themeColors.primary }]}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  shareBtnText: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  doneBtn: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  doneBtnText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});

