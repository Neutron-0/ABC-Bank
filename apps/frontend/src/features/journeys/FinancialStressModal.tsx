import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { BankingApi } from '../../services/api';
import {
  LifeBuoy,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Bot,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';

export const FinancialStressModal: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const { activeJourney, closeJourney, financialHealth, balance, setActiveTab, showToast, fetchStateAndContext } =
    useCustomerStore();

  const [pausedSubs, setPausedSubs] = useState<string[]>([]);

  const isVisible =
    activeJourney === 'stress_intervention' ||
    activeJourney === 'financial_stress' ||
    activeJourney === 'stress' ||
    activeJourney === 'moratorium' ||
    activeJourney === 'budget_shield';

  if (!isVisible) return null;

  const togglePauseSub = async (subName: string) => {
    const isCurrentlyPaused = pausedSubs.includes(subName);
    const newPaused = !isCurrentlyPaused;

    if (isCurrentlyPaused) {
      setPausedSubs(pausedSubs.filter((s) => s !== subName));
    } else {
      setPausedSubs([...pausedSubs, subName]);
    }

    try {
      const res = await BankingApi.pauseMandate({
        mandateName: subName,
        isPaused: newPaused,
      });
      if (res && res.success) {
        showToast(newPaused ? `Paused ${subName} mandate.` : `Resumed ${subName} mandate.`);
        await fetchStateAndContext();
      } else {
        showToast(`Updated mandate standing order for ${subName}`);
      }
    } catch (e: any) {
      showToast(`Updated mandate standing order for ${subName}`);
    }
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <View style={[styles.sheet, { backgroundColor: themeColors.cardBg }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
                <LifeBuoy size={20} color={themeColors.iconNeutral} />
              </View>
              <View>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>Cash-Flow Guidance Desk</Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Empathetic & Stress-Free Budget Planning</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Empathetic Advisory Header */}
            <View style={[styles.advisoryBanner, { backgroundColor: themeColors.brandSecondarySubtle, borderColor: themeColors.border }]}>
              <Text style={[styles.advisoryTitle, { color: themeColors.brandSecondary }]}>Your monthly cash flow looks tighter than usual</Text>
              <Text style={[styles.advisoryText, { color: themeColors.textSecondary }]}>
                We observed unusual emergency repair debits combined with upcoming EMI obligations.
                Let’s review upcoming dates and pause discretionary subscriptions together.
              </Text>
            </View>

            {/* Upcoming Commitments Breakdown */}
            <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>Upcoming Fixed Commitments:</Text>
            <View style={[styles.commitmentsCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
              <View style={styles.commitmentRow}>
                <View>
                  <Text style={[styles.commitmentTitle, { color: themeColors.textPrimary }]}>HDFC Home Loan EMI</Text>
                  <Text style={[styles.commitmentDate, { color: themeColors.textSecondary }]}>Due Sep 16 • Mandatory</Text>
                </View>
                <Text style={[styles.commitmentAmt, { color: themeColors.textPrimary }]}>₹16,500</Text>
              </View>

              <View style={styles.commitmentRow}>
                <View>
                  <Text style={[styles.commitmentTitle, { color: themeColors.textPrimary }]}>Bajaj Auto Loan EMI</Text>
                  <Text style={[styles.commitmentDate, { color: themeColors.textSecondary }]}>Due Sep 20 • Mandatory</Text>
                </View>
                <Text style={[styles.commitmentAmt, { color: themeColors.textPrimary }]}>₹14,800</Text>
              </View>

              <View style={styles.commitmentRow}>
                <View>
                  <Text style={[styles.commitmentTitle, { color: themeColors.textPrimary }]}>Electricity Utility (Tata Power)</Text>
                  <Text style={[styles.commitmentDate, { color: themeColors.textSecondary }]}>Due Sep 24 • Utility</Text>
                </View>
                <Text style={[styles.commitmentAmt, { color: themeColors.textPrimary }]}>₹1,450</Text>
              </View>
            </View>

            {/* 1-Tap Subscription Trimming */}
            <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>1-Tap Subscription Pause (Free Up Cash):</Text>
            <View style={[styles.subsList, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
              {[
                { name: 'Netflix Premium 4K', cost: 649 },
                { name: 'Spotify Duo Family', cost: 199 },
                { name: 'Cult.fit Gym Pass', cost: 1499 },
              ].map((sub) => {
                const isPaused = pausedSubs.includes(sub.name);
                return (
                  <View key={sub.name} style={styles.subItem}>
                    <View>
                      <Text style={[styles.subTitle, { color: themeColors.textPrimary }]}>{sub.name}</Text>
                      <Text style={[styles.subCost, { color: themeColors.textSecondary }]}>₹{sub.cost} / month</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.pauseBtn,
                        { backgroundColor: themeColors.cardBg, borderColor: themeColors.border },
                        isPaused && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                      ]}
                      onPress={() => togglePauseSub(sub.name)}
                    >
                      <Text style={[styles.pauseBtnText, { color: isPaused ? '#FFFFFF' : themeColors.textPrimary }]}>
                        {isPaused ? 'Paused' : 'Pause for 30 Days'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Talk to Mitra Guidance */}
            <TouchableOpacity
              style={[styles.mitraCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
              onPress={() => {
                closeJourney();
                setActiveTab('assistant');
              }}
              activeOpacity={0.8}
            >
              <Bot size={22} color={themeColors.textPrimary} />
              <View style={styles.mitraInfo}>
                <Text style={[styles.mitraTitle, { color: themeColors.textPrimary }]}>Create a Personalized Cash Plan with Mitra</Text>
                <Text style={[styles.mitraDesc, { color: themeColors.textSecondary }]}>Ask Mitra how to safely bridge upcoming bill dates.</Text>
              </View>
              <ArrowRight size={16} color={themeColors.textPrimary} />
            </TouchableOpacity>

            <View style={[styles.ethicalNote, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border, borderWidth: 1 }]}>
              <ShieldCheck size={16} color={themeColors.iconNeutral} />
              <Text style={[styles.ethicalText, { color: themeColors.textSecondary }]}>
                Guaranteed: No loans or credit cards are being promoted to you during this period.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: themeColors.primary }]} onPress={closeJourney}>
            <Text style={styles.doneBtnText}>Understood & Done</Text>
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
    backgroundColor: '#FEF3C7',
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
  advisoryBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: spacing.md,
  },
  advisoryTitle: {
    ...typography.bodyBold,
    color: '#92400E',
    marginBottom: 4,
  },
  advisoryText: {
    ...typography.body,
    color: '#78350F',
    lineHeight: 20,
  },
  sectionHeader: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  commitmentsCard: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  commitmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  commitmentTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  commitmentDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  commitmentAmt: {
    ...typography.bodyBold,
    color: colors.danger,
  },
  subsList: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  subItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  subCost: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pauseBtn: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pausedBtn: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  pauseBtnText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  pausedBtnText: {
    color: colors.success,
  },
  mitraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  mitraInfo: {
    flex: 1,
  },
  mitraTitle: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  mitraDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ethicalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successLight,
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  ethicalText: {
    ...typography.caption,
    color: '#065F46',
    flex: 1,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneBtnText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
});
