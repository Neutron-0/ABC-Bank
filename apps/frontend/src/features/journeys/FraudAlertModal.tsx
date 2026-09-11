import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import {
  ShieldAlert,
  X,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
} from 'lucide-react-native';

export const FraudAlertModal: React.FC = () => {
  const { activeJourney, closeJourney, showToast } = useCustomerStore();
  const [resolution, setResolution] = useState<'prompt' | 'locked' | 'verified'>('prompt');

  if (activeJourney !== 'fraud_alert' && activeJourney !== 'freeze_card') return null;

  const handleFreeze = () => {
    setResolution('locked');
    showToast('Debit Card Temporarily Frozen for Security!');
  };

  const handleVerifyMe = () => {
    setResolution('verified');
    showToast('Transaction marked as verified.');
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <ShieldAlert size={20} color={colors.danger} />
              </View>
              <View>
                <Text style={styles.title}>Fraud Protection Intervention</Text>
                <Text style={styles.subtitle}>Behavioral Anomaly Detected</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {resolution === 'prompt' && (
              <View>
                <View style={styles.warningBox}>
                  <Text style={styles.amount}>₹31,800</Text>
                  <Text style={styles.merchant}>GlobalTech Gaming Digital Ltd</Text>
                  <Text style={styles.timeTag}>Today at 02:14 AM • Virtual POS</Text>
                </View>

                <View style={styles.anomalyReasonBox}>
                  <Text style={styles.anomalyHeading}>Why this triggered an alert:</Text>
                  <Text style={styles.anomalyBullet}>
                    • You have never made purchases at this international merchant category.
                  </Text>
                  <Text style={styles.anomalyBullet}>
                    • Unusual transaction time window (02:14 AM).
                  </Text>
                  <Text style={styles.anomalyBullet}>
                    • Geolocation IP differs from your regular Delhi-NCR phone network.
                  </Text>
                </View>

                <Text style={styles.question}>Was this payment authorized by you?</Text>

                <View style={styles.buttonStack}>
                  <TouchableOpacity style={styles.freezeBtn} onPress={handleFreeze} activeOpacity={0.85}>
                    <Lock size={18} color={colors.textWhite} />
                    <Text style={styles.freezeBtnText}>No, Freeze Card & Secure Account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyMe} activeOpacity={0.8}>
                    <CheckCircle2 size={18} color={colors.textSecondary} />
                    <Text style={styles.verifyBtnText}>Yes, this was me</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {resolution === 'locked' && (
              <View style={styles.resultBox}>
                <View style={[styles.resultIcon, { backgroundColor: colors.dangerLight }]}>
                  <Lock size={36} color={colors.danger} />
                </View>
                <Text style={styles.resultTitle}>Card Frozen & Account Secured</Text>
                <Text style={styles.resultDesc}>
                  Your primary debit card ending in 4102 has been temporarily locked. No further transactions can occur without biometric unlock.
                </Text>

                <View style={styles.supportBox}>
                  <PhoneCall size={16} color={colors.primary} />
                  <Text style={styles.supportText}>
                    Fraud desk ticket #FR-2026-904 opened. Our 24/7 security officer will reach out.
                  </Text>
                </View>

                <TouchableOpacity style={styles.doneBtn} onPress={closeJourney}>
                  <Text style={styles.doneBtnText}>Return to App</Text>
                </TouchableOpacity>
              </View>
            )}

            {resolution === 'verified' && (
              <View style={styles.resultBox}>
                <View style={[styles.resultIcon, { backgroundColor: colors.successLight }]}>
                  <CheckCircle2 size={36} color={colors.success} />
                </View>
                <Text style={styles.resultTitle}>Transaction Verified</Text>
                <Text style={styles.resultDesc}>
                  Thank you. We have updated your behavioral risk profile to reflect this approved merchant.
                </Text>
                <TouchableOpacity style={styles.doneBtn} onPress={closeJourney}>
                  <Text style={styles.doneBtnText}>Return to Home</Text>
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
    backgroundColor: '#FEE2E2',
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
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    marginBottom: spacing.md,
  },
  amount: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.danger,
  },
  merchant: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  timeTag: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  anomalyReasonBox: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  anomalyHeading: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  anomalyBullet: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  question: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  buttonStack: {
    gap: spacing.sm,
  },
  freezeBtn: {
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  freezeBtnText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
  verifyBtn: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifyBtnText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  resultBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  resultTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  resultDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySubtle,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  supportText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
  doneBtn: {
    width: '100%',
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
