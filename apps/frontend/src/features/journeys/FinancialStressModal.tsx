import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
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
  const { activeJourney, closeJourney, financialHealth, balance, setActiveTab, showToast } =
    useCustomerStore();

  const [pausedSubs, setPausedSubs] = useState<string[]>([]);

  if (activeJourney !== 'stress_intervention') return null;

  const togglePauseSub = (subName: string) => {
    if (pausedSubs.includes(subName)) {
      setPausedSubs(pausedSubs.filter((s) => s !== subName));
    } else {
      setPausedSubs([...pausedSubs, subName]);
      showToast(`Temporarily paused ${subName}. Saved monthly outflow.`);
    }
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <LifeBuoy size={20} color="#D97706" />
              </View>
              <View>
                <Text style={styles.title}>Cash-Flow Guidance Desk</Text>
                <Text style={styles.subtitle}>Empathetic & Stress-Free Budget Planning</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Empathetic Advisory Header */}
            <View style={styles.advisoryBanner}>
              <Text style={styles.advisoryTitle}>Your monthly cash flow looks tighter than usual</Text>
              <Text style={styles.advisoryText}>
                We observed unusual emergency repair debits combined with upcoming EMI obligations.
                Let’s review upcoming dates and pause discretionary subscriptions together.
              </Text>
            </View>

            {/* Upcoming Commitments Breakdown */}
            <Text style={styles.sectionHeader}>Upcoming Fixed Commitments:</Text>
            <View style={styles.commitmentsCard}>
              <View style={styles.commitmentRow}>
                <View>
                  <Text style={styles.commitmentTitle}>HDFC Home Loan EMI</Text>
                  <Text style={styles.commitmentDate}>Due Sep 16 • Mandatory</Text>
                </View>
                <Text style={styles.commitmentAmt}>₹16,500</Text>
              </View>

              <View style={styles.commitmentRow}>
                <View>
                  <Text style={styles.commitmentTitle}>Bajaj Auto Loan EMI</Text>
                  <Text style={styles.commitmentDate}>Due Sep 20 • Mandatory</Text>
                </View>
                <Text style={styles.commitmentAmt}>₹14,800</Text>
              </View>

              <View style={styles.commitmentRow}>
                <View>
                  <Text style={styles.commitmentTitle}>Electricity Utility (Tata Power)</Text>
                  <Text style={styles.commitmentDate}>Due Sep 24 • Utility</Text>
                </View>
                <Text style={styles.commitmentAmt}>₹1,450</Text>
              </View>
            </View>

            {/* 1-Tap Subscription Trimming */}
            <Text style={styles.sectionHeader}>1-Tap Subscription Pause (Free Up Cash):</Text>
            <View style={styles.subsList}>
              {[
                { name: 'Netflix Premium 4K', cost: 649 },
                { name: 'Spotify Duo Family', cost: 199 },
                { name: 'Cult.fit Gym Pass', cost: 1499 },
              ].map((sub) => {
                const isPaused = pausedSubs.includes(sub.name);
                return (
                  <View key={sub.name} style={styles.subItem}>
                    <View>
                      <Text style={styles.subTitle}>{sub.name}</Text>
                      <Text style={styles.subCost}>₹{sub.cost} / month</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.pauseBtn, isPaused && styles.pausedBtn]}
                      onPress={() => togglePauseSub(sub.name)}
                    >
                      <Text style={[styles.pauseBtnText, isPaused && styles.pausedBtnText]}>
                        {isPaused ? 'Paused ✓' : 'Pause for 30 Days'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Talk to Mitra Guidance */}
            <TouchableOpacity
              style={styles.mitraCard}
              onPress={() => {
                closeJourney();
                setActiveTab('assistant');
              }}
              activeOpacity={0.8}
            >
              <Bot size={22} color={colors.primary} />
              <View style={styles.mitraInfo}>
                <Text style={styles.mitraTitle}>Create a Personalized Cash Plan with Mitra</Text>
                <Text style={styles.mitraDesc}>Ask Mitra how to safely bridge upcoming bill dates.</Text>
              </View>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.ethicalNote}>
              <ShieldCheck size={16} color={colors.success} />
              <Text style={styles.ethicalText}>
                Guaranteed: No loans or credit cards are being promoted to you during this period.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={closeJourney}>
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
