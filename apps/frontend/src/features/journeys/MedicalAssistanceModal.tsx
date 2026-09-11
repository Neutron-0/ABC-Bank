import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
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
  const { activeJourney, closeJourney, journeyPayload, showToast, setActiveTab } =
    useCustomerStore();

  const [claimStep, setClaimStep] = useState<number>(1);
  const hospital = journeyPayload?.hospital || 'Max Super Speciality Hospital';
  const amount = journeyPayload?.amount || 48200;

  if (activeJourney !== 'medical_assistance') return null;

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <HeartHandshake size={20} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.title}>Medical Expense Support</Text>
                <Text style={styles.subtitle}>Empathy First • Reimbursement & Care</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Empathy Banner */}
            <View style={styles.empathyBanner}>
              <Text style={styles.empathyTitle}>We are here to support your recovery</Text>
              <Text style={styles.empathyText}>
                We noticed your recent payment of ₹{amount.toLocaleString('en-IN')} to {hospital}.
                Our digital desk is ready to help you gather bills, file reimbursement claims, and reorganize upcoming monthly cash flow.
              </Text>
            </View>

            {/* Assistance Options */}
            <Text style={styles.sectionHeader}>How would you like help?</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                showToast('Initiating Digital Insurance Claim Filing...');
                closeJourney();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconBox}>
                <FileText size={22} color="#0284C7" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>File Insurance Reimbursement Claim</Text>
                <Text style={styles.actionDesc}>
                  Upload hospital discharge summary and inpatient receipts for fast-track processing.
                </Text>
              </View>
              <ArrowRight size={18} color="#0284C7" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                closeJourney();
                setActiveTab('assistant');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Bot size={22} color={colors.success} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Plan Cash Flow with Mitra</Text>
                <Text style={styles.actionDesc}>
                  Review remaining liquid funds and adjust upcoming bill dates to stay stress-free.
                </Text>
              </View>
              <ArrowRight size={18} color={colors.success} />
            </TouchableOpacity>

            {/* Optional Financial Protection Review (Ethically surfaced gently) */}
            <View style={styles.protectionCard}>
              <View style={styles.protectionHeader}>
                <Shield size={16} color={colors.primary} />
                <Text style={styles.protectionTitle}>Long-Term Protection Check (Optional)</Text>
              </View>
              <Text style={styles.protectionDesc}>
                Once you are settled, review if higher cashless coverage would benefit your family without out-of-pocket stress.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={closeJourney}>
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
