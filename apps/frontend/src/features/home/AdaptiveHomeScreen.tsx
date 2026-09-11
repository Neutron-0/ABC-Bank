import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { AdaptiveHeader } from '../../components/common/AdaptiveHeader';
import { BalanceHeader } from '../../components/common/BalanceHeader';
import { ContextCardStack } from '../../components/context/ContextCardStack';
import { useCustomerStore } from '../../state/customerStore';
import { colors, typography, spacing, radii } from '../../theme';
import { getTranslation } from '../../i18n';
import { motion } from '../../motion';
import {
  Train,
  ShieldAlert,
  HeartHandshake,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Bot,
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
  const [isMetroPaid, setIsMetroPaid] = useState(false);
  const [isPayingMetro, setIsPayingMetro] = useState(false);

  // Hero scale animation
  const heroScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchStateAndContext();
  }, []);

  // When switching personas, reset local metro paid state and reorder
  useEffect(() => {
    setIsMetroPaid(false);
    motion.reorderLayout();
  }, [currentState]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStateAndContext();
    setRefreshing(false);
  };

  // 1-Tap Routine Payment Handler with smooth Hero Demotion (Section 32)
  const handlePayMetro = async () => {
    setIsPayingMetro(true);
    // Subtle tactile scale
    Animated.sequence([
      Animated.timing(heroScaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(heroScaleAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }),
    ]).start();

    // Perform payment through customerStore (updates balance smoothly)
    await performPayment({
      amount: 40,
      merchant: 'Delhi Metro Smart Card',
      category: 'transport',
      description: 'Daily 8:40 AM Metro Commute recharge',
    });

    setIsPayingMetro(false);
    setIsMetroPaid(true);

    // Trigger layout reorder so the compressed hero shrinks and next priorities rise!
    setTimeout(() => {
      motion.reorderLayout();
    }, 400);
  };

  // =========================================================================
  // DYNAMIC CONTEXTUAL HERO WIDGET (Sections 10, 13-18)
  // =========================================================================
  const renderHighestPriorityContext = () => {
    // 1. FRAUD ALERT MODE (Section 18) - Ultra-focused security
    if (currentState === 'fraud_alert') {
      return (
        <View style={styles.heroSection}>
          <Text style={styles.sectionEyebrow}>URGENT SECURITY ATTENTION</Text>
          <View style={styles.fraudBox}>
            <View style={styles.fraudHeader}>
              <View style={styles.fraudIconWrap}>
                <ShieldAlert size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fraudMerchant}>Unrecognized International Debit</Text>
                <Text style={styles.fraudAmount}>₹31,800 · New Merchant</Text>
              </View>
            </View>
            <Text style={styles.fraudText}>
              This transaction is significantly different from your usual activity in Noida.
            </Text>
            <View style={styles.fraudActionRow}>
              <TouchableOpacity
                style={styles.freezeBtn}
                onPress={() => openJourney('fraud_alert')}
                activeOpacity={0.8}
              >
                <Text style={styles.freezeBtnText}>Secure & Freeze Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={() => openJourney('fraud_alert')}
                activeOpacity={0.8}
              >
                <Text style={styles.verifyBtnText}>Yes, was me</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // 2. MEDICAL CARE MODE (Section 16) - Empathetic Care & Assistance First
    if (currentState === 'medical_event') {
      return (
        <View style={styles.heroSection}>
          <Text style={styles.sectionEyebrow}>EMERGENCY ASSISTANCE</Text>
          <View style={styles.medicalBox}>
            <View style={styles.medicalHeader}>
              <View style={styles.medicalIconWrap}>
                <HeartHandshake size={20} color="#0D9488" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.medicalHospital}>Max Super Speciality Hospital</Text>
                <Text style={styles.medicalAmount}>₹48,200 · Today</Text>
              </View>
            </View>
            <Text style={styles.medicalText}>
              We noticed a significant medical payment. Need help filing insurance reimbursement or reviewing emergency reserves?
            </Text>
            <View style={styles.medicalActionRow}>
              <TouchableOpacity
                style={styles.medicalPrimaryBtn}
                onPress={() => openJourney('medical_assistance')}
                activeOpacity={0.8}
              >
                <Text style={styles.medicalPrimaryBtnText}>Get Assistance</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.medicalSecondaryBtn}
                onPress={() => setActiveTab('assistant')}
                activeOpacity={0.8}
              >
                <Text style={styles.medicalSecondaryBtnText}>Talk to Mitra</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // 3. FINANCIAL STRESS MODE (Section 17) - Supportive Guidance, Zero Predatory Loans
    if (currentState === 'financial_stress') {
      return (
        <View style={styles.heroSection}>
          <Text style={styles.sectionEyebrow}>FINANCIAL GUIDANCE</Text>
          <View style={styles.stressBox}>
            <View style={styles.stressHeader}>
              <View style={styles.stressIconWrap}>
                <AlertCircle size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stressTitle}>Cash flow tighter than usual</Text>
                <Text style={styles.stressSubtitle}>Upcoming obligations: ₹32,000</Text>
              </View>
            </View>
            <Text style={styles.stressText}>
              Your upcoming EMI commitments are higher this cycle. We've temporarily suppressed credit promotions to help you preserve emergency buffers.
            </Text>
            <View style={styles.stressActionRow}>
              <TouchableOpacity
                style={styles.stressPrimaryBtn}
                onPress={() => openJourney('financial_stress')}
                activeOpacity={0.8}
              >
                <Text style={styles.stressPrimaryBtnText}>Review Commitments</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // 4. SURPLUS OPPORTUNITY MODE (Section 15) - Positive Wealth Opportunity
    if (currentState === 'surplus') {
      return (
        <View style={styles.heroSection}>
          <Text style={styles.sectionEyebrow}>OPPORTUNITY</Text>
          <View style={styles.surplusBox}>
            <View style={styles.surplusHeader}>
              <View style={styles.surplusIconWrap}>
                <TrendingUp size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.surplusTitle}>₹24,000 surplus available</Text>
                <Text style={styles.surplusSubtitle}>Salary credited • Higher buffer than usual</Text>
              </View>
            </View>
            <Text style={styles.surplusText}>
              You have extra liquidity above your 4.2-month reserve. Put it to work in high-yield auto-sweep or start a flexible SIP.
            </Text>
            <View style={styles.surplusActionRow}>
              <TouchableOpacity
                style={styles.surplusPrimaryBtn}
                onPress={() => openJourney('savings_invest')}
                activeOpacity={0.8}
              >
                <Text style={styles.surplusPrimaryBtnText}>Auto-Sweep to 7.2%</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // 5. NORMAL STATE (Section 11, 20) - 1-Tap Repeated Habit (Metro Commute)
    if (!isMetroPaid) {
      return (
        <Animated.View style={[styles.heroSection, { transform: [{ scale: heroScaleAnim }] }]}>
          <Text style={styles.sectionEyebrow}>YOUR REPEATED INTENT</Text>
          <View style={styles.metroBox}>
            <View style={styles.metroTopRow}>
              <View style={styles.metroIconWrap}>
                <Train size={20} color="#111318" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metroTitle}>Your usual Metro</Text>
                <Text style={styles.metroSubtitle}>₹40 · Daily 8:40 AM Commute</Text>
              </View>
            </View>

            <Text style={styles.metroDesc}>
              You normally recharge around this time before boarding Noida Sec 62.
            </Text>

            <TouchableOpacity
              style={styles.metroActionBtn}
              onPress={handlePayMetro}
              disabled={isPayingMetro}
              activeOpacity={0.82}
            >
              <Text style={styles.metroActionBtnText}>
                {isPayingMetro ? 'Recharging...' : 'Pay again ₹40 →'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    // When Metro is paid, compress gracefully (Section 32)
    return (
      <View style={styles.heroSection}>
        <View style={styles.paidMetroRow}>
          <CheckCircle2 size={16} color="#059669" />
          <Text style={styles.paidMetroText}>Metro recharge ₹40 completed for 8:40 AM</Text>
        </View>
      </View>
    );
  };

  // =========================================================================
  // UPCOMING COMMITMENT ROW (Section 23)
  // =========================================================================
  const renderUpcomingCommitment = () => {
    if (currentState === 'fraud_alert') return null; // Low-density in fraud mode

    return (
      <View style={styles.upcomingSection}>
        <Text style={styles.sectionEyebrow}>UPCOMING OBLIGATION</Text>
        <View style={styles.upcomingRow}>
          <View style={styles.upcomingIconCircle}>
            <Calendar size={16} color="#525866" />
          </View>
          <View style={styles.upcomingTextWrap}>
            <Text style={styles.upcomingTitle}>HDFC Home Loan EMI</Text>
            <Text style={styles.upcomingSubtitle}>₹12,500 · Due in 3 days</Text>
          </View>
          <TouchableOpacity
            style={styles.upcomingPayBtn}
            onPress={() => setActiveTab('payments')}
            activeOpacity={0.8}
          >
            <Text style={styles.upcomingPayBtnText}>Pay / Schedule →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AdaptiveHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111318" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Calm Editorial Balance Header with Animated Counter */}
        <BalanceHeader />

        {/* Highest-Priority Contextual Experience (Hero Surface) */}
        {renderHighestPriorityContext()}

        {/* Upcoming Financial Obligations Strip */}
        {renderUpcomingCommitment()}

        {/* Adaptive Attention Hierarchy Stack (Different visual patterns per type) */}
        <ContextCardStack cards={cards} />

        {/* Conversational Mitra Assistant Entry (Section 39) */}
        <View style={styles.assistantCard}>
          <View style={styles.assistantHeader}>
            <View style={styles.assistantIconCircle}>
              <Bot size={18} color="#111318" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assistantTitle}>Mitra understands your money</Text>
              <Text style={styles.assistantSubtitle}>
                Ask about repeat payments, upcoming bills, or hospital tax rebates.
              </Text>
            </View>
          </View>

          <View style={styles.promptChips}>
            <TouchableOpacity
              style={styles.chip}
              onPress={() => setActiveTab('assistant')}
              activeOpacity={0.75}
            >
              <Text style={styles.chipText}>🚇 Metro Recharge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chip}
              onPress={() => setActiveTab('assistant')}
              activeOpacity={0.75}
            >
              <Text style={styles.chipText}>📊 Spending Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chip}
              onPress={() => setActiveTab('assistant')}
              activeOpacity={0.75}
            >
              <Text style={styles.chipText}>🛡️ Hospital Assistance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quiet Editorial Footer */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Personalized with calm, privacy-first ethical rules for Bharat
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFB',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C95A6',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md + 2,
  },

  // Normal Hero: Metro Commute
  metroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#111318',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  metroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  metroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.3,
  },
  metroSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#525866',
    marginTop: 2,
  },
  metroDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: '#525866',
    lineHeight: 18,
    marginBottom: 16,
  },
  metroActionBtn: {
    backgroundColor: '#111318',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  metroActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  paidMetroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidMetroText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },

  // Fraud Hero
  fraudBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  fraudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  fraudIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fraudMerchant: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    letterSpacing: -0.3,
  },
  fraudAmount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#B91C1C',
    marginTop: 2,
  },
  fraudText: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 16,
  },
  fraudActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  freezeBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 99,
  },
  freezeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifyBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  verifyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
  },

  // Medical Care Hero
  medicalBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  medicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  medicalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalHospital: {
    fontSize: 16,
    fontWeight: '700',
    color: '#134E4A',
    letterSpacing: -0.3,
  },
  medicalAmount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F766E',
    marginTop: 2,
  },
  medicalText: {
    fontSize: 13,
    color: '#115E59',
    lineHeight: 18,
    marginBottom: 16,
  },
  medicalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  medicalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 99,
  },
  medicalPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  medicalSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  medicalSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
  },

  // Financial Stress Hero
  stressBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  stressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stressIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: -0.3,
  },
  stressSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#B45309',
    marginTop: 2,
  },
  stressText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 16,
  },
  stressActionRow: {
    flexDirection: 'row',
  },
  stressPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 99,
  },
  stressPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Surplus Hero
  surplusBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  surplusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  surplusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surplusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: -0.3,
  },
  surplusSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#047857',
    marginTop: 2,
  },
  surplusText: {
    fontSize: 13,
    color: '#064E3B',
    lineHeight: 18,
    marginBottom: 16,
  },
  surplusActionRow: {
    flexDirection: 'row',
  },
  surplusPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 99,
  },
  surplusPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Upcoming Row Section
  upcomingSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: 12,
  },
  upcomingIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingTextWrap: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111318',
    letterSpacing: -0.2,
  },
  upcomingSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#525866',
    marginTop: 2,
  },
  upcomingPayBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 99,
    backgroundColor: '#F4F5F7',
  },
  upcomingPayBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111318',
  },

  // Conversational Assistant Surface
  assistantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  assistantIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.2,
  },
  assistantSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#525866',
    marginTop: 2,
    lineHeight: 16,
  },
  promptChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: '#F4F5F7',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111318',
  },
  footerNote: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8C95A6',
    textAlign: 'center',
  },
});
