import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { useAppTheme, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import {
  User,
  Globe,
  Sliders,
  ShieldCheck,
  Cpu,
  RefreshCw,
  ArrowRight,
  Lock,
  Check,
} from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const {
    profile,
    language,
    setLanguage,
    consent,
    updateConsent,
    openJourney,
    switchCustomerState,
    currentState,
  } = useCustomerStore();
  const t = getTranslation(language);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t.profile.title}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{profile.name}</Text>
            <Text style={[styles.userSub, { color: colors.textSecondary }]}>{profile.phone}</Text>
            <Text style={[styles.userSub, { color: colors.textSecondary }]}>{profile.email}</Text>
            <View style={[styles.kycBadge, { backgroundColor: colors.cardBgSecondary }]}>
              <Check size={12} color={colors.primary} />
              <Text style={[styles.kycBadgeText, { color: colors.textPrimary }]}>
                {profile.kycStatus === 'verified'
                  ? 'KYC Verified • Tier 3 Verified Account'
                  : 'KYC Pending • Tier 1 Basic'}
              </Text>
            </View>
          </View>
        </View>

        {/* PROTOTYPE LAB & DEMO CONTROLS (JUDGE SPOTLIGHT) */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            Judge & Developer Controls
          </Text>

          <TouchableOpacity
            style={[
              styles.labCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              },
            ]}
            onPress={() => openJourney('prototype_lab')}
            activeOpacity={0.85}
          >
            <View style={styles.labLeft}>
              <View style={[styles.labIconWrap, { backgroundColor: colors.cardBgSecondary }]}>
                <Sliders size={22} color={colors.primary} />
              </View>
              <View style={styles.labInfo}>
                <Text style={[styles.labTitle, { color: colors.textPrimary }]}>
                  Prototype Lab (State Switcher)
                </Text>
                <Text style={[styles.labSubtitle, { color: colors.textSecondary }]}>
                  Current Active State:{' '}
                  <Text style={{ fontWeight: '700', color: colors.primary }}>
                    {currentState.toUpperCase()}
                  </Text>
                </Text>
                <Text style={[styles.labHint, { color: colors.textSecondary }]}>
                  Tap to switch between 5 customer states & see live UI adaptation.
                </Text>
              </View>
            </View>
            <ArrowRight size={18} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.archCard,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
            ]}
            onPress={() => openJourney('architecture_flow')}
            activeOpacity={0.85}
          >
            <View style={styles.labLeft}>
              <View style={[styles.labIconWrap, { backgroundColor: colors.cardBgSecondary }]}>
                <Cpu size={22} color={colors.primary} />
              </View>
              <View style={styles.labInfo}>
                <Text style={[styles.archTitle, { color: colors.textPrimary }]}>
                  System Architecture Visualizer
                </Text>
                <Text style={[styles.labSubtitle, { color: colors.textSecondary }]}>
                  Data Sources → Signal Detectors → Priority Scoring → Attention Stack
                </Text>
              </View>
            </View>
            <ArrowRight size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Vernacular Language Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t.profile.language}
          </Text>
          <View style={styles.langGrid}>
            {[
              { code: 'en' as const, label: 'English' },
              { code: 'hi' as const, label: 'हिंदी (Hindi)' },
              { code: 'gu' as const, label: 'ગુજરાતી (Gujarati)' },
            ].map((langItem) => {
              const active = language === langItem.code;
              return (
                <TouchableOpacity
                  key={langItem.code}
                  style={[
                    styles.langOption,
                    { backgroundColor: colors.cardBg, borderColor: colors.border },
                    active && [
                      styles.activeLangOption,
                      {
                        borderColor: colors.primary,
                        backgroundColor: colors.cardBgSecondary,
                      },
                    ],
                  ]}
                  onPress={() => setLanguage(langItem.code)}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      { color: colors.textPrimary },
                      active && {
                        color: colors.primary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {langItem.label}
                  </Text>
                  {active && (
                    <Check size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Personalization & Privacy Consent Toggles */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t.profile.personalizationSettings}
          </Text>

          <View style={[styles.toggleRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.toggleTextWrap}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                {t.profile.useTransactionData}
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Enables attention stack to prioritize repeated actions (e.g. morning Metro).
              </Text>
            </View>
            <Switch
              value={consent.useTransactionData}
              onValueChange={(val) => updateConsent({ useTransactionData: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBg}
            />
          </View>

          <View style={[styles.toggleRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.toggleTextWrap}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                {t.profile.personalizedProducts}
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Allows surfacing ethical suggestions (strictly suppressed during stress).
              </Text>
            </View>
            <Switch
              value={consent.personalizedProducts}
              onValueChange={(val) => updateConsent({ personalizedProducts: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBg}
            />
          </View>

          <View style={[styles.toggleRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.toggleTextWrap}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                {t.profile.financialInsights}
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Computes non-gamified cash flow digests and resilience checkpoints.
              </Text>
            </View>
            <Switch
              value={consent.financialInsights}
              onValueChange={(val) => updateConsent({ financialInsights: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBg}
            />
          </View>

          <View style={[styles.toggleRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.toggleTextWrap}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                {t.profile.assistantContext}
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Allows Mitra to understand active medical, savings, or bill events.
              </Text>
            </View>
            <Switch
              value={consent.assistantContextAccess}
              onValueChange={(val) => updateConsent({ assistantContextAccess: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBg}
            />
          </View>
        </View>

        {/* Banking Demo Journeys */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            Demo Journeys (Challenge #2)
          </Text>
          <TouchableOpacity
            style={[styles.journeyBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => openJourney('onboarding')}
          >
            <Text style={[styles.journeyBtnText, { color: colors.textPrimary }]}>
              App Onboarding & Language Selection
            </Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.journeyBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => openJourney('kyc')}
          >
            <Text style={[styles.journeyBtnText, { color: colors.textPrimary }]}>
              Digital KYC Journey
            </Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.journeyBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => openJourney('loan')}
          >
            <Text style={[styles.journeyBtnText, { color: colors.textPrimary }]}>
              Responsible Affordability Loan
            </Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.journeyBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => openJourney('savings_invest')}
          >
            <Text style={[styles.journeyBtnText, { color: colors.textPrimary }]}>
              Surplus Savings & Investments
            </Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.h2,
  },
  scroll: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    ...shadows.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
  },
  userSub: {
    ...typography.caption,
    marginTop: 1,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  kycBadgeText: {
    ...typography.tiny,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.captionMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  themeCard: {
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    ...shadows.sm,
  },
  themeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  themeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeTitle: {
    ...typography.bodyBold,
  },
  themeDesc: {
    ...typography.caption,
    marginTop: 1,
  },
  themePillsRow: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: 3,
    borderWidth: 1,
    gap: 4,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  themePillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  themePillText: {
    ...typography.captionMedium,
  },
  labCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  archCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  labLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  labIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labInfo: {
    flex: 1,
  },
  labTitle: {
    ...typography.bodyBold,
  },
  archTitle: {
    ...typography.bodyBold,
  },
  labSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  labHint: {
    ...typography.tiny,
    marginTop: 2,
  },
  langGrid: {
    gap: spacing.xs,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  activeLangOption: {
    borderWidth: 1.5,
  },
  langOptionText: {
    ...typography.body,
  },
  activeLangOptionText: {
    ...typography.bodyBold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    ...typography.bodyBold,
  },
  toggleDesc: {
    ...typography.caption,
    marginTop: 2,
  },
  journeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  journeyBtnText: {
    ...typography.body,
  },
});
