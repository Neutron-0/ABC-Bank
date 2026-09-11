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
        title: 'Your 8:40 AM Metro Commute',
        subtitle: 'Tap to instantly pay ₹40 with 1-click UPI',
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
      };
    }
    if (currentState === 'fraud_alert') {
      return {
        title: 'Security Alert: ₹31,800 Unverified Charge',
        subtitle: 'Review this debit immediately or freeze your card',
        actionLabel: 'Review Now',
        action: () => openJourney('fraud_alert'),
        icon: ShieldAlert,
        accent: colors.danger,
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Area */}
        <BalanceHeader />

        {/* Hero Repeated Intent / Urgent Alert Banner */}
        {heroIntent && (
          <View style={[styles.heroBox, { borderLeftColor: heroIntent.accent }]}>
            <View style={styles.heroLeft}>
              <View style={[styles.heroIconBox, { backgroundColor: `${heroIntent.accent}18` }]}>
                <heroIntent.icon size={20} color={heroIntent.accent} />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>{heroIntent.title}</Text>
                <Text style={styles.heroSubtitle}>{heroIntent.subtitle}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.heroActionBtn, { backgroundColor: heroIntent.accent }]}
              onPress={heroIntent.action}
              activeOpacity={0.8}
            >
              <Text style={styles.heroActionText}>{heroIntent.actionLabel}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI-Composed Attention Hierarchy Stack */}
        <ContextCardStack cards={cards} />

        {/* Floating Contextual Mitra Assistant Promo */}
        <TouchableOpacity
          style={styles.assistantPromoCard}
          onPress={() => setActiveTab('assistant')}
          activeOpacity={0.85}
        >
          <View style={styles.promoLeft}>
            <View style={styles.promoIcon}>
              <Bot size={22} color={colors.primary} />
            </View>
            <View style={styles.promoTextWrap}>
              <Text style={styles.promoTitle}>Have a question, Rahul?</Text>
              <Text style={styles.promoSubtitle}>
                Mitra understands your transactions, bills, and savings.
              </Text>
            </View>
          </View>
          <View style={styles.promoArrow}>
            <ArrowRight size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Sparkles size={12} color={colors.textMuted} />
          <Text style={styles.footerText}>
            Personalized with privacy-first ethical rules for Bharat
          </Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  heroIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  heroSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroActionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginLeft: spacing.sm,
  },
  heroActionText: {
    ...typography.captionMedium,
    color: colors.textWhite,
    fontWeight: '700',
  },
  assistantPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  promoIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTextWrap: {
    flex: 1,
  },
  promoTitle: {
    ...typography.bodyBold,
    color: '#166534',
  },
  promoSubtitle: {
    ...typography.caption,
    color: '#15803D',
    marginTop: 2,
  },
  promoArrow: {
    paddingLeft: spacing.xs,
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
    ...typography.tiny,
    color: colors.textMuted,
  },
});
