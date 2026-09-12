import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import {
  HeartHandshake,
  X,
  CheckCircle2,
  FileText,
  UploadCloud,
  ArrowRight,
  Shield,
  Bot,
} from 'lucide-react-native';

export const MedicalAssistanceModal: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const { activeJourney, closeJourney, journeyPayload, showToast, setActiveTab } =
    useCustomerStore();

  const [claimStep, setClaimStep] = useState<number>(1);
  const hospital = journeyPayload?.hospital || 'Max Super Speciality Hospital';
  const amount = journeyPayload?.amount || 48200;

  const isVisible =
    activeJourney === 'medical_assistance' ||
    activeJourney === 'medical_claim' ||
    activeJourney === 'medical' ||
    activeJourney === 'claim';

  if (!isVisible) return null;

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <View style={[styles.sheet, { backgroundColor: themeColors.cardBg }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
                <HeartHandshake size={20} color={themeColors.iconNeutral} />
              </View>
              <View>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>Medical Expense Support</Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Empathy First • Reimbursement & Care</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Empathy Banner */}
            <View style={[styles.empathyBanner, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
              <Text style={[styles.empathyTitle, { color: themeColors.textPrimary }]}>We are here to support your recovery</Text>
              <Text style={[styles.empathyText, { color: themeColors.textSecondary }]}>
                We noticed your recent payment of ₹{amount.toLocaleString('en-IN')} to {hospital}.
                Our digital desk is ready to help you gather bills, file reimbursement claims, and reorganize upcoming monthly cash flow.
              </Text>
            </View>

            {/* Assistance Options */}
            <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>How would you like help?</Text>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
              onPress={() => {
                showToast('Initiating Digital Insurance Claim Filing...');
                closeJourney();
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: themeColors.cardBg }]}>
                <FileText size={22} color={themeColors.iconNeutral} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: themeColors.textPrimary }]}>File Insurance Reimbursement Claim</Text>
                <Text style={[styles.actionDesc, { color: themeColors.textSecondary }]}>
                  Upload hospital discharge summary and inpatient receipts for fast-track processing.
                </Text>
              </View>
              <ArrowRight size={18} color={themeColors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
              onPress={() => {
                closeJourney();
                setActiveTab('assistant');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: themeColors.cardBg }]}>
                <Bot size={22} color={themeColors.iconNeutral} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: themeColors.textPrimary }]}>Plan Cash Flow with Mitra</Text>
                <Text style={[styles.actionDesc, { color: themeColors.textSecondary }]}>
                  Review remaining liquid funds and adjust upcoming bill dates to stay stress-free.
                </Text>
              </View>
              <ArrowRight size={18} color={themeColors.primary} />
            </TouchableOpacity>

            {/* Optional Financial Protection Review (Ethically surfaced gently) */}
            <View style={[styles.protectionCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
              <View style={styles.protectionHeader}>
                <Shield size={16} color={themeColors.iconNeutral} />
                <Text style={[styles.protectionTitle, { color: themeColors.textPrimary }]}>Long-Term Protection Check (Optional)</Text>
              </View>
              <Text style={[styles.protectionDesc, { color: themeColors.textSecondary }]}>
                Once you are settled, review if higher cashless coverage would benefit your family without out-of-pocket stress.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: themeColors.primary }]} onPress={closeJourney}>
            <Text style={[styles.doneBtnText, { color: '#FFFFFF' }]}>Close</Text>
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
    backgroundColor: '#E0F2FE',
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
  empathyBanner: {
    backgroundColor: '#F0F9FF',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: spacing.lg,
  },
  empathyTitle: {
    ...typography.bodyBold,
    color: '#0369A1',
    marginBottom: 4,
  },
  empathyText: {
    ...typography.body,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  sectionHeader: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  actionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  protectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  protectionTitle: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  protectionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  doneBtn: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneBtnText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
});
