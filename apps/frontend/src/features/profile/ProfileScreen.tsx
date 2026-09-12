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
import { colors, typography, spacing, radii, shadows } from '../../theme';
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
  Sparkles,
  Lock,
  Check,
} from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.profile.title}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userSub}>{profile.phone}</Text>
            <Text style={styles.userSub}>{profile.email}</Text>
            <View style={styles.kycBadge}>
              <Check size={12} color={colors.success} />
              <Text style={styles.kycBadgeText}>KYC Verified • Tier 2 Account</Text>
            </View>
          </View>
        </View>

        {/* PROTOTYPE LAB & DEMO CONTROLS (JUDGE SPOTLIGHT) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Judge & Developer Controls</Text>

          <TouchableOpacity
            style={styles.labCard}
            onPress={() => openJourney('prototype_lab')}
            activeOpacity={0.85}
          >
            <View style={styles.labLeft}>
              <View style={styles.labIconWrap}>
                <Sparkles size={22} color="#D97706" />
              </View>
              <View style={styles.labInfo}>
                <Text style={styles.labTitle}>Prototype Lab (State Switcher)</Text>
                <Text style={styles.labSubtitle}>
                  Current Active State: <Text style={{ fontWeight: '700', color: colors.primary }}>{currentState.toUpperCase()}</Text>
                </Text>
                <Text style={styles.labHint}>Tap to switch between 5 customer states & see live UI adaptation.</Text>
              </View>
            </View>
            <ArrowRight size={18} color="#D97706" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.archCard}
            onPress={() => openJourney('architecture_flow')}
            activeOpacity={0.85}
          >
            <View style={styles.labLeft}>
              <View style={[styles.labIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Cpu size={22} color={colors.primary} />
              </View>
              <View style={styles.labInfo}>
                <Text style={styles.archTitle}>System Architecture Visualizer</Text>
                <Text style={styles.labSubtitle}>
                  Data Sources → Signal Detectors → Priority Scoring → Attention Stack
                </Text>
              </View>
            </View>
            <ArrowRight size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Vernacular Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t.profile.language}</Text>
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
                  style={[styles.langOption, active && styles.activeLangOption]}
                  onPress={() => setLanguage(langItem.code)}
                >
                  <Text style={[styles.langOptionText, active && styles.activeLangOptionText]}>
                    {langItem.label}
                  </Text>
                  {active && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Personalization & Privacy Consent Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t.profile.personalizationSettings}</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>{t.profile.useTransactionData}</Text>
              <Text style={styles.toggleDesc}>
                Enables attention stack to prioritize repeated actions (e.g. morning Metro).
              </Text>
            </View>
            <Switch
              value={consent.useTransactionData}
              onValueChange={(val) => updateConsent({ useTransactionData: val })}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={colors.cardBg}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>{t.profile.personalizedProducts}</Text>
              <Text style={styles.toggleDesc}>
                Allows surfacing ethical suggestions (strictly suppressed during stress).
              </Text>
            </View>
            <Switch
              value={consent.personalizedProducts}
              onValueChange={(val) => updateConsent({ personalizedProducts: val })}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={colors.cardBg}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>{t.profile.financialInsights}</Text>
              <Text style={styles.toggleDesc}>
                Computes non-gamified cash flow digests and resilience checkpoints.
              </Text>
            </View>
            <Switch
              value={consent.financialInsights}
              onValueChange={(val) => updateConsent({ financialInsights: val })}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={colors.cardBg}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>{t.profile.assistantContext}</Text>
              <Text style={styles.toggleDesc}>
                Allows Mitra to understand active medical, savings, or bill events.
              </Text>
            </View>
            <Switch
              value={consent.assistantContextAccess}
              onValueChange={(val) => updateConsent({ assistantContextAccess: val })}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={colors.cardBg}
            />
          </View>
        </View>

        {/* Banking Demo Journeys */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Demo Journeys (Challenge #2)</Text>
          <TouchableOpacity
            style={styles.journeyBtn}
            onPress={() => openJourney('kyc')}
          >
            <Text style={styles.journeyBtnText}>Digital KYC Journey</Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.journeyBtn}
            onPress={() => openJourney('loan')}
          >
            <Text style={styles.journeyBtnText}>Responsible Affordability Loan</Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.journeyBtn}
            onPress={() => openJourney('savings_invest')}
          >
            <Text style={styles.journeyBtnText}>Surplus Savings & Investments</Text>
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
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
  },
  userSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  kycBadgeText: {
    ...typography.tiny,
    color: '#065F46',
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  labCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  archCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labInfo: {
    flex: 1,
  },
  labTitle: {
    ...typography.bodyBold,
    color: '#92400E',
  },
  archTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  labSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  labHint: {
    ...typography.tiny,
    color: '#B45309',
    marginTop: 2,
    fontStyle: 'italic',
  },
  langGrid: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activeLangOption: {
    backgroundColor: colors.primarySubtle,
  },
  langOptionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  activeLangOptionText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  toggleDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  journeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  journeyBtnText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
});
