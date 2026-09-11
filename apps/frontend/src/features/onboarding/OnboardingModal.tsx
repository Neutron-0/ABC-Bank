import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { LanguageCode } from '../../types';
import {
  Sparkles,
  Globe,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Layers,
  Check,
} from 'lucide-react-native';

interface Props {
  visible: boolean;
  onFinish: () => void;
}

export const OnboardingModal: React.FC<Props> = ({ visible, onFinish }) => {
  const { language, setLanguage } = useCustomerStore();
  const t = getTranslation(language);
  const [step, setStep] = useState<number>(1);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.container}>
        {/* Step 1: Welcome & Language */}
        {step === 1 && (
          <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
            <View style={styles.heroLogoWrap}>
              <Sparkles size={36} color={colors.primary} />
            </View>
            <Text style={styles.heroTitle}>{t.onboarding.welcomeTitle}</Text>
            <Text style={styles.heroSubtitle}>{t.onboarding.welcomeSubtitle}</Text>

            <View style={styles.langPickerCard}>
              <Text style={styles.cardHeader}>{t.onboarding.chooseLanguage}</Text>
              {[
                { code: 'en' as LanguageCode, label: 'English', sub: 'Default' },
                { code: 'hi' as LanguageCode, label: 'हिंदी (Hindi)', sub: 'सुगम बैंकिंग' },
                { code: 'gu' as LanguageCode, label: 'ગુજરાતી (Gujarati)', sub: 'સરળ બેંકિંગ' },
              ].map((item) => {
                const active = language === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.langRow, active && styles.activeLangRow]}
                    onPress={() => setLanguage(item.code)}
                  >
                    <View>
                      <Text style={[styles.langName, active && styles.activeLangName]}>
                        {item.label}
                      </Text>
                      <Text style={styles.langSub}>{item.sub}</Text>
                    </View>
                    {active && <Check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => setStep(2)}
              delayPressIn={0}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>
                {language === 'hi'
                  ? 'गोपनीयता सहमति पर आगे बढ़ें'
                  : language === 'gu'
                  ? 'ગોપનીયતા સંમતિ પર આગળ વધો'
                  : 'Continue to Privacy Consent'}
              </Text>
              <ArrowRight size={18} color={colors.textWhite} />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Step 2: Transparent Consent & Guardrails */}
        {step === 2 && (
          <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.heroLogoWrap, { backgroundColor: colors.successLight }]}>
              <ShieldCheck size={36} color={colors.success} />
            </View>
            <Text style={styles.heroTitle}>{t.onboarding.consentTitle}</Text>
            <Text style={styles.heroSubtitle}>{t.onboarding.consentExplain}</Text>

            <View style={styles.consentCard}>
              <View style={styles.pillar}>
                <Text style={styles.pillarTitle}>1. {t.onboarding.whatWeUse}</Text>
                <Text style={styles.pillarDesc}>{t.onboarding.whatWeUseDesc}</Text>
              </View>

              <View style={styles.pillar}>
                <Text style={styles.pillarTitle}>2. {t.onboarding.whyWeUse}</Text>
                <Text style={styles.pillarDesc}>{t.onboarding.whyWeUseDesc}</Text>
              </View>

              <View style={[styles.pillar, styles.neverPillar]}>
                <Text style={[styles.pillarTitle, { color: colors.danger }]}>
                  3. {t.onboarding.whatWeNeverDo}
                </Text>
                <Text style={styles.pillarDesc}>{t.onboarding.whatWeNeverDoDesc}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={onFinish}
              delayPressIn={0}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>{t.onboarding.getStarted}</Text>
              <ArrowRight size={18} color={colors.textWhite} />
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContent: {
    padding: spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
  },
  heroLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  langPickerCard: {
    width: '100%',
    backgroundColor: colors.cardBg,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  cardHeader: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.cardBgSecondary,
  },
  activeLangRow: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  langName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  activeLangName: {
    color: colors.primary,
  },
  langSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  consentCard: {
    width: '100%',
    backgroundColor: colors.cardBg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    gap: spacing.md,
    ...shadows.sm,
  },
  pillar: {
    backgroundColor: colors.cardBgSecondary,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  neverPillar: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  pillarTitle: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: 4,
  },
  pillarDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  continueBtnText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
});
