import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import {
  CreditCard,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Calculator,
} from 'lucide-react-native';

export const ResponsibleLoanModal: React.FC = () => {
  const { activeJourney, closeJourney, currentState, financialHealth, showToast } =
    useCustomerStore();

  const [loanAmount, setLoanAmount] = useState<number>(150000);
  const [tenureMonths, setTenureMonths] = useState<number>(24);

  if (activeJourney !== 'loan') return null;

  const isStress = currentState === 'financial_stress' || financialHealth.status === 'stress';

  const calculateEmi = (principal: number, months: number, annualRate = 11.5) => {
    const r = annualRate / (12 * 100);
    const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi);
  };

  const estimatedEmi = calculateEmi(loanAmount, tenureMonths);

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <CreditCard size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Responsible Credit Planning</Text>
                <Text style={styles.subtitle}>Affordability-first evaluation</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* ETHICAL GUARD: Financial Stress Warning */}
            {isStress ? (
              <View style={styles.stressWarningBox}>
                <AlertTriangle size={24} color={colors.danger} />
                <Text style={styles.stressTitle}>Credit Not Recommended Right Now</Text>
                <Text style={styles.stressDesc}>
                  Our responsible banking engine detected that your monthly cash flow is currently tighter than usual with elevated existing obligations.
                </Text>
                <Text style={styles.stressPledge}>
                  To protect your financial health, new loan disbursements are temporarily paused until your emergency buffer stabilizes.
                </Text>
                <TouchableOpacity
                  style={styles.stressHelpBtn}
                  onPress={() => {
                    closeJourney();
                    useCustomerStore.getState().openJourney('stress_intervention');
                  }}
                >
                  <Text style={styles.stressHelpBtnText}>View Cash-Flow Guidance Instead</Text>
                  <ArrowRight size={16} color={colors.textWhite} />
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Contextual Affordability Statement */}
                <View style={styles.affordabilityCard}>
                  <Text style={styles.affordabilityLabel}>Safe Cash-Flow Assessment</Text>
                  <Text style={styles.affordabilityHeading}>
                    Based on your monthly surplus, you can safely manage an EMI up to ₹12,500/mo.
                  </Text>
                  <Text style={styles.affordabilityDesc}>
                    Current debt-to-income: {Math.round(financialHealth.debtToIncomeRatio * 100)}% (Healthy baseline).
                  </Text>
                </View>

                {/* Amount Selector */}
                <Text style={styles.sectionHeader}>Select Loan Requirement:</Text>
                <View style={styles.chipsRow}>
                  {[50000, 100000, 150000, 250000].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.amtChip, loanAmount === amt && styles.activeAmtChip]}
                      onPress={() => setLoanAmount(amt)}
                    >
                      <Text style={[styles.amtChipText, loanAmount === amt && styles.activeAmtChipText]}>
                        ₹{amt.toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tenure Selector */}
                <Text style={styles.sectionHeader}>Repayment Tenure:</Text>
                <View style={styles.chipsRow}>
                  {[12, 24, 36, 48].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.amtChip, tenureMonths === m && styles.activeAmtChip]}
                      onPress={() => setTenureMonths(m)}
                    >
                      <Text style={[styles.amtChipText, tenureMonths === m && styles.activeAmtChipText]}>
                        {m} Months
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Live EMI Calculation Box */}
                <View style={styles.calcBox}>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Estimated Monthly EMI:</Text>
                    <Text style={styles.calcValue}>₹{estimatedEmi.toLocaleString('en-IN')} / mo</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Interest Rate (Transparent):</Text>
                    <Text style={styles.calcValue}>11.5% p.a. Fixed</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Pre-payment Penalty:</Text>
                    <Text style={[styles.calcValue, { color: colors.success }]}>₹0 (Zero Charges)</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    showToast('Loan Application Submitted for 1-Click Verification!');
                    closeJourney();
                  }}
                >
                  <Text style={styles.primaryBtnText}>Review & Proceed Safely</Text>
                  <ArrowRight size={16} color={colors.textWhite} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
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
    backgroundColor: colors.primarySubtle,
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
  stressWarningBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.md,
  },
  stressTitle: {
    ...typography.h3,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  stressDesc: {
    ...typography.body,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 20,
  },
  stressPledge: {
    ...typography.caption,
    color: '#7F1D1D',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  stressHelpBtn: {
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  stressHelpBtnText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
  affordabilityCard: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  affordabilityLabel: {
    ...typography.tiny,
    color: colors.primary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  affordabilityHeading: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    marginTop: 4,
  },
  affordabilityDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  amtChip: {
    backgroundColor: colors.cardBgSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeAmtChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  amtChipText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  activeAmtChipText: {
    color: colors.textWhite,
    fontWeight: '700',
  },
  calcBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  calcValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  primaryBtnText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
});
