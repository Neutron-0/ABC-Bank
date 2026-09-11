import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { TrendingUp, X, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react-native';

export const SavingsInvestModal: React.FC = () => {
  const { activeJourney, closeJourney, balance, signals, showToast } = useCustomerStore();
  const [selectedPlan, setSelectedPlan] = useState<'smart_fd' | 'index_sip'>('smart_fd');

  if (activeJourney !== 'savings_invest') return null;

  const surplus = signals.surplusAmount > 0 ? signals.surplusAmount : 38400;

  const handleDeposit = () => {
    showToast('₹25,000 moved to High-Yield Smart Savings!');
    closeJourney();
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <TrendingUp size={20} color={colors.success} />
              </View>
              <View>
                <Text style={styles.title}>Put Surplus Cash to Work</Text>
                <Text style={styles.subtitle}>High Yield • 100% Liquid Safety</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Surplus Explanation */}
            <View style={styles.surplusBox}>
              <Text style={styles.surplusLabel}>Detected Surplus Balance</Text>
              <Text style={styles.surplusAmount}>₹{surplus.toLocaleString('en-IN')}</Text>
              <Text style={styles.surplusDesc}>
                Available balance is ₹{balance.available.toLocaleString('en-IN')} with all monthly commitments covered.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>Select Allocation Preference:</Text>

            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'smart_fd' && styles.activePlanCard]}
              onPress={() => setSelectedPlan('smart_fd')}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Smart High-Yield Deposit</Text>
                <View style={styles.returnBadge}>
                  <Text style={styles.returnText}>7.85% p.a.</Text>
                </View>
              </View>
              <Text style={styles.planDesc}>
                Instant auto-sweep back to your UPI account whenever balance drops. Zero lock-in.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'index_sip' && styles.activePlanCard]}
              onPress={() => setSelectedPlan('index_sip')}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Disciplined Index SIP</Text>
                <View style={[styles.returnBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.returnText, { color: '#15803D' }]}>₹2,500/mo</Text>
                </View>
              </View>
              <Text style={styles.planDesc}>
                Automated monthly wealth building into Bharat 50 index fund suited for moderate risk.
              </Text>
            </TouchableOpacity>

            <View style={styles.safetyCard}>
              <ShieldCheck size={16} color={colors.success} />
              <Text style={styles.safetyText}>
                DICGC Insured up to ₹5,00,000. Capital is protected.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleDeposit}>
            <Text style={styles.primaryBtnText}>Confirm Allocation</Text>
            <ArrowRight size={16} color={colors.textWhite} />
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
    backgroundColor: colors.successLight,
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
  surplusBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  surplusLabel: {
    ...typography.tiny,
    color: '#166534',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  surplusAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 2,
  },
  surplusDesc: {
    ...typography.caption,
    color: '#166534',
    marginTop: 2,
  },
  sectionHeader: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  planCard: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  activePlanCard: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.success,
    ...shadows.sm,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  returnBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  returnText: {
    ...typography.tiny,
    color: '#92400E',
    fontWeight: '800',
  },
  planDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  safetyText: {
    ...typography.caption,
    color: colors.textSecondary,
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
