import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { ShieldCheck, X, CheckCircle2, ArrowRight, Camera, FileCheck } from 'lucide-react-native';

export const KycModal: React.FC = () => {
  const { activeJourney, closeJourney, showToast } = useCustomerStore();
  const [step, setStep] = useState<number>(1);
  const [panInput, setPanInput] = useState('ABCDE1234F');
  const [aadhaarInput, setAadhaarInput] = useState('9876 5432 1098');

  if (activeJourney !== 'kyc') return null;

  const handleFinish = () => {
    showToast('Digital KYC Completed Successfully!');
    closeJourney();
    setStep(1);
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <ShieldCheck size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Simplified Digital KYC</Text>
                <Text style={styles.subtitle}>Step {step} of 4 • Paperless & Instant</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${(step / 4) * 100}%` }]} />
          </View>

          {step === 1 && (
            <View style={styles.content}>
              <Text style={styles.stepHeading}>Verify Identity Documents</Text>
              <Text style={styles.stepDesc}>
                We use secure DigiLocker tokenization to fetch government-verified ID.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PAN Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={panInput}
                  onChangeText={setPanInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Aadhaar Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={aadhaarInput}
                  onChangeText={setAadhaarInput}
                />
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
                <Text style={styles.primaryBtnText}>Verify via OTP</Text>
                <ArrowRight size={16} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.content}>
              <Text style={styles.stepHeading}>Address Verification</Text>
              <Text style={styles.stepDesc}>
                Address retrieved from UIDAI matching your primary account:
              </Text>

              <View style={styles.addressBox}>
                <Text style={styles.addressTitle}>Residential Address</Text>
                <Text style={styles.addressText}>
                  Tower 4, Flat 1204, Cyber Heights, Sector 62, Noida, Uttar Pradesh - 201309
                </Text>
                <View style={styles.verifiedRow}>
                  <CheckCircle2 size={14} color={colors.success} />
                  <Text style={styles.verifiedText}>Aadhaar Geo-Matched</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(3)}>
                <Text style={styles.primaryBtnText}>Confirm Address</Text>
                <ArrowRight size={16} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.content}>
              <Text style={styles.stepHeading}>Video KYC (Simulated Step)</Text>
              <Text style={styles.stepDesc}>
                Instant 30-second live biometric selfie check.
              </Text>

              <View style={styles.cameraBox}>
                <Camera size={36} color={colors.primary} />
                <Text style={styles.cameraText}>Face positioned within frame</Text>
                <View style={styles.livenessBadge}>
                  <CheckCircle2 size={14} color={colors.success} />
                  <Text style={styles.livenessText}>Liveness Detected: 99.8%</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(4)}>
                <Text style={styles.primaryBtnText}>Capture & Submit</Text>
                <ArrowRight size={16} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          )}

          {step === 4 && (
            <View style={styles.content}>
              <View style={styles.successIconWrap}>
                <FileCheck size={48} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>KYC Verification Complete!</Text>
              <Text style={styles.successDesc}>
                Your account is now upgraded to Tier-2 Full KYC. All transaction limits unlocked.
              </Text>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
                <Text style={styles.primaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
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
    marginBottom: spacing.sm,
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
  progressTrack: {
    height: 4,
    backgroundColor: colors.cardBgSecondary,
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    paddingBottom: spacing.md,
  },
  stepHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stepDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    padding: spacing.md,
    ...typography.bodyBold,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressBox: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  addressTitle: {
    ...typography.captionMedium,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  addressText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginTop: 4,
    lineHeight: 20,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  verifiedText: {
    ...typography.tiny,
    color: colors.success,
    fontWeight: '700',
  },
  cameraBox: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
  },
  cameraText: {
    ...typography.captionMedium,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  livenessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginTop: spacing.md,
  },
  livenessText: {
    ...typography.tiny,
    color: colors.success,
    fontWeight: '700',
  },
  successIconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  successDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
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
