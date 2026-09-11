import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { AdaptiveHeader } from '../../components/common/AdaptiveHeader';
import { BalanceHeader } from '../../components/common/BalanceHeader';
import { ContextCardStack } from '../../components/context/ContextCardStack';
import { useCustomerStore } from '../../state/customerStore';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { getTranslation } from '../../i18n';
import {
  Sparkles,
  Bot,
  Train,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
} from 'lucide-react-native';

export const AdaptiveHomeScreen: React.FC = () => {
  const {
    cards,
    fetchStateAndContext,
    language,
    setActiveTab,
    openJourney,
    currentState,
    performPayment,
  } = useCustomerStore();
  const t = getTranslation(language);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStateAndContext();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStateAndContext();
    setRefreshing(false);
  };

  const getHeroRepeatedIntent = () => {
    if (currentState === 'normal') {
      return {
        tag: 'ROUTINE COMMUTE',
        title: 'Morning Delhi Metro Trip',
        subtitle: 'Usual 8:40 AM Noida Sec 62 route • 1-Tap UPI recharge',
        actionLabel: 'Pay ₹40',
        action: () =>
          performPayment({
            amount: 40,
            merchant: 'Delhi Metro Smart Card',
            category: 'transport',
            description: 'Routine morning commute recharge',
          }),
        icon: Train,
        accent: '#2563EB',
        bg: '#F0F7FF',
        borderColor: '#BFDBFE',
      };
    }
    if (currentState === 'fraud_alert') {
      return {
        tag: 'URGENT SECURITY ALERT',
        title: '₹31,800 Unverified International Debit',
        subtitle: 'Suspicious card charge flagged. Instant biometric freeze available.',
        actionLabel: 'Freeze & Dispute',
        action: () => openJourney('fraud_alert'),
        icon: ShieldAlert,
        accent: '#EF4444',
        bg: '#FEF2F2',
        borderColor: '#FECACA',
      };
    }
    if (currentState === 'medical_event') {
      return {
        tag: 'ASSISTANCE & TAX RELIEF',
        title: 'Max Healthcare ₹48,200 Expenditure',
        subtitle: 'Hospital claim filing active. Section 80D tax receipt auto-tagged.',
        actionLabel: 'Claim Assistance',
        action: () => openJourney('medical_assistance'),
        icon: HeartHandshake,
        accent: '#0D9488',
        bg: '#F0FDFA',
        borderColor: '#99F6E4',
      };
    }
    if (currentState === 'financial_stress') {
      return {
        tag: 'BUDGET SHIELD • ZERO LOAN NUDGES',
        title: 'Upcoming EMI Burden: ₹32,000',
        subtitle: 'Cashflow tighter than usual. Flexible repayment helper unlocked.',
        actionLabel: 'Explore Relief',
        action: () => openJourney('financial_stress'),
        icon: ShieldAlert,
        accent: '#D97706',
        bg: '#FFFBEB',
        borderColor: '#FDE68A',
      };
    }
    if (currentState === 'surplus') {
      return {
        tag: 'IDLE SURPLUS OPPORTUNITY',
        title: '₹62,000 Surplus Idle in Savings',
        subtitle: 'Earning 3.0% base interest. Auto-sweep to 7.2% liquid deposit?',
        actionLabel: 'Auto-Sweep',
        action: () => openJourney('savings_invest'),
        icon: TrendingUp,
        accent: '#10B981',
        bg: '#ECFDF5',
        borderColor: '#A7F3D0',
      };
    }
    return null;
  };

  const heroIntent = getHeroRepeatedIntent();

  return (
    <View style={styles.container}>
      <AdaptiveHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Flagship Balance Card */}
        <BalanceHeader />

        {/* Hero Repeated Intent / Context Alert Banner */}
        {heroIntent && (
          <View style={[styles.heroBox, { backgroundColor: heroIntent.bg, borderColor: heroIntent.borderColor }]}>
            <View style={styles.heroTopTagRow}>
              <View style={[styles.heroTagPill, { backgroundColor: `${heroIntent.accent}20` }]}>
                <Text style={[styles.heroTagText, { color: heroIntent.accent }]}>{heroIntent.tag}</Text>
              </View>
            </View>

            <View style={styles.heroContentRow}>
              <View style={[styles.heroIconBox, { backgroundColor: `${heroIntent.accent}22` }]}>
                <heroIntent.icon size={20} color={heroIntent.accent} />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>{heroIntent.title}</Text>
                <Text style={styles.heroSubtitle}>{heroIntent.subtitle}</Text>
              </View>
            </View>

            <View style={styles.heroActionRow}>
              <TouchableOpacity
                style={[styles.heroActionBtn, { backgroundColor: heroIntent.accent }]}
                onPress={heroIntent.action}
                activeOpacity={0.82}
              >
                <Text style={styles.heroActionText}>{heroIntent.actionLabel}</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* AI-Composed Attention Hierarchy Stack */}
        <ContextCardStack cards={cards} />

        {/* Sleek Minimal Mitra Companion Box */}
        <View style={styles.assistantPromoCard}>
          <View style={styles.promoHeader}>
            <View style={styles.promoIcon}>
              <Bot size={20} color="#4F46E5" />
            </View>
            <View style={styles.promoTextWrap}>
              <Text style={styles.promoTitle}>Mitra Contextual AI</Text>
              <Text style={styles.promoSubtitle}>
                Ask about repeat payments, upcoming bills, or medical tax deductions.
              </Text>
            </View>
          </View>

          {/* Quick Prompt Chips */}
          <View style={styles.promptChipRow}>
            <TouchableOpacity
              style={styles.promptChip}
              onPress={() => setActiveTab('assistant')}
              activeOpacity={0.8}
            >
              <Text style={styles.promptChipText}>🚇 Pay Metro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.promptChip}
              onPress={() => setActiveTab('assistant')}
              activeOpacity={0.8}
            >
              <Text style={styles.promptChipText}>📊 Check Runway</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.promptChip}
              onPress={() => setActiveTab('assistant')}
              activeOpacity={0.8}
            >
              <Text style={styles.promptChipText}>🛡️ Hospital Bills</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerNote}>
          <Sparkles size={12} color="#94A3B8" />
          <Text style={styles.footerText}>
            Adaptive Banking for Bharat • Zero Predatory Loan Guardrails
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md + 2,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTopTagRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  heroTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  heroTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: spacing.md,
  },
  heroIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#475569',
    marginTop: 2,
    lineHeight: 18,
  },
  heroActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  heroActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  assistantPromoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    padding: spacing.md + 2,
    borderRadius: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTextWrap: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
    letterSpacing: -0.2,
  },
  promoSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6366F1',
    marginTop: 2,
  },
  promptChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  promptChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6D28D9',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
});
