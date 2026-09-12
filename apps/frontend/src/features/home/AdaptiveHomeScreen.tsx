import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { AdaptiveHeader } from '../../components/common/AdaptiveHeader';
import { BalanceHeader } from '../../components/common/BalanceHeader';
import { ContextCardStack } from '../../components/context/ContextCardStack';
import { useCustomerStore } from '../../state/customerStore';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import { serifFont } from '../../theme/typography';
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
  Bot,
  Zap,
  Home,
  Wifi,
  ChevronUp,
  ShieldCheck,
  FileCheck,
  CreditCard,
  Smartphone,
  Tv,
  Award,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RepeatedIntentItem {
  id: 'metro' | 'power' | 'rent' | 'mobile';
  shortTitle: string;
  fullTitle: string;
  subtitle: string;
  amount: number;
  amountFormatted: string;
  merchant: string;
  category: 'transport' | 'bills' | 'transfers';
  icon: typeof Train;
  iconColor: string;
  iconBg: string;
  recurrenceTag: string;
  description: string;
  actionLabel: string;
}

export const AdaptiveHomeScreen: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const {
    cards,
    fetchStateAndContext,
    language,
    setActiveTab,
    openJourney,
    currentState,
    performPayment,
    requestPaymentAuth,
    showToast,
    transactions,
    balance,
    setSelectedTransaction,
    profile,
    signals,
  } = useCustomerStore();
  const t = getTranslation(language);
  const [refreshing, setRefreshing] = useState(false);
  const [isMetroPaid, setIsMetroPaid] = useState(false);
  const [isPayingMetro, setIsPayingMetro] = useState(false);
  const [expandedIntentId, setExpandedIntentId] = useState<string | null>(null);
  const [processingIntentId, setProcessingIntentId] = useState<string | null>(null);
  const [paidIntents, setPaidIntents] = useState<Record<string, boolean>>({});

  // Hero scale and entrance animations
  const heroScaleAnim = useRef(new Animated.Value(1)).current;
  const heroFadeAnim = useRef(new Animated.Value(1)).current;
  const heroTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchStateAndContext();
  }, []);

  // When switching personas, reset local metro paid state, reorder layout, and animate hero entrance
  useEffect(() => {
    setIsMetroPaid(false);
    setPaidIntents({});
    setExpandedIntentId(null);
    motion.reorderLayout();

    heroFadeAnim.setValue(0.25);
    heroTranslateY.setValue(12);
    Animated.parallel([
      Animated.timing(heroFadeAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentState]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStateAndContext();
    setRefreshing(false);
  };

  // 4 Repeated Intent definitions learned from customer habits
  const repeatedIntents: RepeatedIntentItem[] = [
    {
      id: 'metro',
      shortTitle: language === 'hi' ? 'मेट्रो' : language === 'gu' ? 'મેટ્રો' : 'Metro',
      fullTitle: t.heroes.metroTitle,
      subtitle: t.heroes.metroSubtitle,
      amount: 40,
      amountFormatted: '₹40',
      merchant: 'Delhi Metro Smart Card',
      category: 'transport',
      icon: Train,
      iconColor: themeColors.iconNeutral,
      iconBg: themeColors.cardBgSecondary,
      recurrenceTag: language === 'hi' ? 'दैनिक आदत • सुबह 8:40' : language === 'gu' ? 'દૈનિક ટેવ • સવારે 8:40' : 'DAILY HABIT • 8:40 AM',
      description: t.heroes.metroDesc,
      actionLabel: t.heroes.payAgain,
    },
    {
      id: 'power',
      shortTitle: language === 'hi' ? 'बिजली' : language === 'gu' ? 'વીજળી' : 'Power',
      fullTitle: language === 'hi' ? 'टाटा पावर बिजली बिल' : language === 'gu' ? 'ટાટા પાવર વીજળી બિલ' : 'Tata Power Electricity',
      subtitle: language === 'hi' ? '₹1,450 · मासिक बिल' : language === 'gu' ? '₹1,450 · માસિક બિલ' : '₹1,450 · Monthly Bill',
      amount: 1450,
      amountFormatted: '₹1,450',
      merchant: 'Tata Power Residential',
      category: 'bills',
      icon: Zap,
      iconColor: themeColors.iconNeutral,
      iconBg: themeColors.cardBgSecondary,
      recurrenceTag: language === 'hi' ? 'मासिक मैंडेट • 15 तारीख' : language === 'gu' ? 'માસિક મેન્ડેટ • 15 તારીખ' : 'MONTHLY MANDATE • 15TH',
      description: language === 'hi'
        ? 'नियमित मासिक आवासीय बिजली बिल। सत्यापित उपभोक्ता मैंडेट के साथ स्वचालित चालान समाधान।'
        : language === 'gu'
        ? 'નિયમિત માસિક રહેણાંક વીજળી બિલ. આપોઆપ ઇન્વૉઇસ સમાધાન સાથે સીધું ચુકવણું.'
        : 'Regular monthly power utility bill. Direct institutional clearing with automated invoice reconciliation.',
      actionLabel: language === 'hi' ? '₹1,450 भरें →' : language === 'gu' ? '₹1,450 ભરો →' : 'Pay ₹1,450 via UPI →',
    },
    {
      id: 'rent',
      shortTitle: language === 'hi' ? 'किराया' : language === 'gu' ? 'ભાડું' : 'Rent',
      fullTitle: language === 'hi' ? 'अपार्टमेंट किराया' : language === 'gu' ? 'એપાર્ટમેન્ટ ભાડું' : 'House Rent Transfer',
      subtitle: language === 'hi' ? '₹18,000 · मकान मालिक' : language === 'gu' ? '₹18,000 · મકાનમાલિક' : '₹18,000 · Landlord Account',
      amount: 18000,
      amountFormatted: '₹18,000',
      merchant: 'Monthly House Rent',
      category: 'transfers',
      icon: Home,
      iconColor: themeColors.iconNeutral,
      iconBg: themeColors.cardBgSecondary,
      recurrenceTag: language === 'hi' ? 'मासिक मैंडेट • 1 तारीख' : language === 'gu' ? 'માસિક મેન્ડેટ • 1 તારીખ' : 'MONTHLY MANDATE • 1ST',
      description: language === 'hi'
        ? 'मकान मालिक के पंजीकृत खाते में मासिक किराया ट्रांसफर। शून्य लेनदेन शुल्क के साथ त्वरित सुरक्षित यूपीआई।'
        : language === 'gu'
        ? 'મકાનમાલિકના નોંધાયેલા ખાતામાં માસિક એપાર્ટમેન્ટ ભાડું ટ્રાન્સફર. શૂન્ય શુલ્ક સુરક્ષિત બેંકિંગ.'
        : 'Monthly residential apartment rent transfer to landlord registered account. Zero transaction fees via instant UPI.',
      actionLabel: language === 'hi' ? '₹18,000 भेजें →' : language === 'gu' ? '₹18,000 મોકલો →' : 'Pay ₹18,000 via UPI →',
    },
    {
      id: 'mobile',
      shortTitle: language === 'hi' ? 'मोबाइल' : language === 'gu' ? 'મોબાઇલ' : 'Mobile',
      fullTitle: language === 'hi' ? 'एयरटेल 5G रिचार्ज' : language === 'gu' ? 'એરટેલ 5G રિચાર્જ' : 'Airtel 5G Unlimited',
      subtitle: language === 'hi' ? '₹499 · 28-दिवसीय चक्र' : language === 'gu' ? '₹499 · 28-દિવસનું ચક્ર' : '₹499 · 28-Day Plan Cycle',
      amount: 499,
      amountFormatted: '₹499',
      merchant: 'Airtel Prepaid Recharge',
      category: 'bills',
      icon: Wifi,
      iconColor: themeColors.iconNeutral,
      iconBg: themeColors.cardBgSecondary,
      recurrenceTag: language === 'hi' ? '28-दिवसीय चक्र • नियमित' : language === 'gu' ? '28-દિવસનું ચક્ર • નિયમિત' : '28-DAY CYCLE • RECURRING',
      description: language === 'hi'
        ? 'प्राथमिक पंजीकृत नंबर के लिए 28-दिवसीय असीमित 5G डेटा और कॉलिंग प्लान नवीनीकरण।'
        : language === 'gu'
        ? 'પ્રાથમિક નોંધાયેલા નંબર માટે 28 દિવસનું અમર્યાદિત 5G ડેટા અને કૉલિંગ પ્લાન નવીકરણ.'
        : '28-day cycle renewal for primary registered mobile number with unlimited 5G data & calling.',
      actionLabel: language === 'hi' ? '₹499 रिचार्ज करें →' : language === 'gu' ? '₹499 રિચાર્જ કરો →' : 'Recharge ₹499 via UPI →',
    },
  ];

  // Fluid toggle between compact 4-component view and expanded card
  const toggleExpandIntent = (id: string | null) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIntentId(current => (current === id ? null : id));
  };

  // 1-Tap Routine Payment Handler for Repeated Intents
  const handlePayRepeatedIntent = async (item: RepeatedIntentItem) => {
    const alreadyPaid = paidIntents[item.id] || (item.id === 'metro' && isMetroPaid);
    if (alreadyPaid) {
      showToast(
        language === 'hi'
          ? `${item.shortTitle} का भुगतान पहले ही हो चुका है`
          : language === 'gu'
          ? `${item.shortTitle} ની ચુકવણી પહેલેથી જ થઈ ગઈ છે`
          : `${item.shortTitle} payment already completed`
      );
      return;
    }

    setProcessingIntentId(item.id);
    if (item.id === 'metro') setIsPayingMetro(true);

    Animated.sequence([
      Animated.timing(heroScaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(heroScaleAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }),
    ]).start();

    // Trigger universal security authentication sheet (PIN / Biometrics)
    requestPaymentAuth(
      {
        amount: item.amount,
        merchant: item.merchant,
        category: item.category,
        description: item.description,
      },
      () => {
        setProcessingIntentId(null);
        setIsPayingMetro(false);
        setPaidIntents((prev) => ({ ...prev, [item.id]: true }));
        if (item.id === 'metro') {
          setIsMetroPaid(true);
          setTimeout(() => {
            motion.reorderLayout();
          }, 400);
        }
      }
    );
    // Reset transient tap state after launching auth modal
    setTimeout(() => {
      setProcessingIntentId(null);
      setIsPayingMetro(false);
    }, 600);
  };

  const handlePayMetro = async () => {
    await handlePayRepeatedIntent(repeatedIntents[0]);
  };

  // =========================================================================
  // DYNAMIC CONTEXTUAL HERO WIDGET (Sections 10, 13-18)
  // =========================================================================
  const renderHighestPriorityContext = () => {
    // 1. FRAUD ALERT MODE - Hoisted to the top alert banner
    if (currentState === 'fraud_alert') {
      return null;
    }

    // 2. MEDICAL CARE MODE (Section 16) - Empathetic Care & Assistance First
    if (currentState === 'medical_event') {
      return (
        <View style={styles.heroSection}>
          <Text style={[styles.sectionEyebrow, { color: themeColors.textMuted }]}>{t.heroes.medicalTag}</Text>
          <View style={[styles.medicalBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.medicalHeader}>
              <View style={[styles.medicalIconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
                <HeartHandshake size={20} color={themeColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.medicalHospital, { color: themeColors.textPrimary }]}>{t.heroes.medicalHospital}</Text>
                <Text style={[styles.medicalAmount, { color: themeColors.textSecondary }]}>{t.heroes.medicalAmount}</Text>
              </View>
            </View>
            <Text style={[styles.medicalText, { color: themeColors.textSecondary }]}>{t.heroes.medicalDesc}</Text>
            <View style={styles.medicalActionRow}>
              <TouchableOpacity
                style={[styles.medicalPrimaryBtn, { backgroundColor: themeColors.primary }]}
                onPress={() => openJourney('medical_assistance')}
                delayPressIn={0}
                activeOpacity={0.8}
              >
                <Text style={styles.medicalPrimaryBtnText}>{t.heroes.getAssistance}</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.medicalSecondaryBtn, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
                onPress={() => setActiveTab('assistant')}
                delayPressIn={0}
                activeOpacity={0.8}
              >
                <Text style={[styles.medicalSecondaryBtnText, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'मित्रा से बात करें' : language === 'gu' ? 'મિત્ર સાથે વાત કરો' : 'Talk to Mitra'}
                </Text>
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
          <Text style={[styles.sectionEyebrow, { color: themeColors.textMuted }]}>{t.heroes.stressTag}</Text>
          <View style={[styles.stressBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.stressHeader}>
              <View style={[styles.stressIconWrap, { backgroundColor: themeColors.brandSecondarySubtle }]}>
                <AlertCircle size={20} color={themeColors.brandSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stressTitle, { color: themeColors.textPrimary }]}>{t.heroes.stressTitle}</Text>
                <Text style={[styles.stressSubtitle, { color: themeColors.brandSecondary }]}>
                  {language === 'hi' ? 'आगामी जिम्मेदारियां: ₹32,000' : language === 'gu' ? 'આગામી જવાબદારીઓ: ₹32,000' : 'Upcoming obligations: ₹32,000'}
                </Text>
              </View>
            </View>
            <Text style={[styles.stressText, { color: themeColors.textSecondary }]}>{t.heroes.stressDesc}</Text>
            <View style={styles.stressActionRow}>
              <TouchableOpacity
                style={[styles.stressPrimaryBtn, { backgroundColor: themeColors.primary }]}
                onPress={() => openJourney('financial_stress')}
                delayPressIn={0}
                activeOpacity={0.8}
              >
                <Text style={styles.stressPrimaryBtnText}>{t.heroes.reviewCashFlow}</Text>
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
          <Text style={[styles.sectionEyebrow, { color: themeColors.textMuted }]}>{t.heroes.surplusTag}</Text>
          <View style={[styles.surplusBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.surplusHeader}>
              <View style={[styles.surplusIconWrap, { backgroundColor: themeColors.brandSecondarySubtle }]}>
                <TrendingUp size={20} color={themeColors.brandSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.surplusTitle, { color: themeColors.textPrimary }]}>{t.heroes.surplusTitle}</Text>
                <Text style={[styles.surplusSubtitle, { color: themeColors.brandSecondary }]}>{t.heroes.surplusSubtitle}</Text>
              </View>
            </View>
            <Text style={[styles.surplusText, { color: themeColors.textSecondary }]}>{t.heroes.surplusDesc}</Text>
            <View style={styles.surplusActionRow}>
              <TouchableOpacity
                style={[styles.surplusPrimaryBtn, { backgroundColor: themeColors.primary }]}
                onPress={() => openJourney('savings_invest')}
                delayPressIn={0}
                activeOpacity={0.8}
              >
                <Text style={styles.surplusPrimaryBtnText}>{t.heroes.autoSweep}</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // 5. NORMAL STATE - JioFinance-Style Smart Routine Payments Carousel
    if (!expandedIntentId) {
      return (
        <Animated.View style={[styles.heroSection, { transform: [{ scale: heroScaleAnim }] }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Text style={[styles.sectionTitleText, { color: themeColors.textSecondary }]}>
                {language === 'hi' ? 'बिल एवं रीचार्ज' : language === 'gu' ? 'બિલ અને રિચાર્જ' : 'BILLS & RECHARGES'}
              </Text>
            </View>
            <View style={[styles.mandateCountBadge, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
              <Text style={[styles.mandateCountText, { color: themeColors.textSecondary }]}>4 DUE</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScrollContent}
          >
            {repeatedIntents.map((item) => {
              const isPaid = paidIntents[item.id] || (item.id === 'metro' && isMetroPaid);
              const isProcessing = processingIntentId === item.id;
              const IconComponent = item.icon;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.routineCard,
                    { backgroundColor: themeColors.cardBg, borderColor: themeColors.border },
                    isPaid && { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight }
                  ]}
                  onPress={() => handlePayRepeatedIntent(item)}
                  onLongPress={() => toggleExpandIntent(item.id)}
                  delayLongPress={300}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <View style={styles.routineCardTop}>
                    <View style={[styles.routineIconCircle, { backgroundColor: isPaid ? themeColors.cardBgSecondary : item.iconBg }]}>
                      {isPaid ? (
                        <CheckCircle2 size={16} color={themeColors.textSecondary} />
                      ) : (
                        <IconComponent size={16} color={item.iconColor} />
                      )}
                    </View>
                    <View style={[styles.routineCategoryBadge, { backgroundColor: themeColors.cardBgSecondary }]}>
                      <Text style={[styles.routineCategoryText, { color: themeColors.textSecondary }]}>{item.category.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={[styles.routineCardTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
                    {item.shortTitle}
                  </Text>
                  <Text style={[styles.routineCardSub, { color: themeColors.textMuted }]} numberOfLines={1}>
                    {item.recurrenceTag}
                  </Text>

                  <View style={[styles.routineCardBottom, { borderTopColor: themeColors.borderLight }]}>
                    <Text style={[styles.routineCardAmount, { color: themeColors.textPrimary }, isPaid && { color: themeColors.textSecondary }]}>
                      {item.amountFormatted}
                    </Text>

                    {isPaid ? (
                      <View style={[styles.routinePaidBadge, { backgroundColor: themeColors.cardBgSecondary }]}>
                        <CheckCircle2 size={11} color={themeColors.textSecondary} />
                        <Text style={[styles.routinePaidBadgeText, { color: themeColors.textSecondary }]}>
                          {language === 'hi' ? 'सफल' : language === 'gu' ? 'સફળ' : 'Paid'}
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.routinePayBtn, { backgroundColor: themeColors.primary }]}>
                        <Text style={[styles.routinePayBtnText, { color: '#FFFFFF' }]}>
                          {isProcessing ? '...' : (language === 'hi' ? 'भरें →' : language === 'gu' ? 'ચૂકવો →' : 'Pay →')}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      );
    }

    // EXPANDED NORMAL CARD COMPONENT (Triggered on holding any repeated intent button)
    const expandedItem = repeatedIntents.find(i => i.id === expandedIntentId) || repeatedIntents[0];
    const isExpandedPaid = paidIntents[expandedItem.id] || (expandedItem.id === 'metro' && isMetroPaid);
    const isExpandedProcessing = processingIntentId === expandedItem.id;
    const ExpandedIconComponent = expandedItem.icon;

    return (
      <Animated.View style={[styles.heroSection, { transform: [{ scale: heroScaleAnim }] }]}>
        <View style={styles.heroSectionHeader}>
          <Text style={[styles.sectionEyebrow, { color: themeColors.textMuted }]}>{t.heroes.metroTag}</Text>
          <TouchableOpacity
            style={[styles.collapseHeaderBtn, { backgroundColor: themeColors.cardBgSecondary }]}
            onPress={() => toggleExpandIntent(null)}
            delayPressIn={0}
            activeOpacity={0.7}
          >
            <Text style={[styles.collapseHeaderBtnText, { color: themeColors.textSecondary }]}>
              {language === 'hi' ? 'संक्षिप्त करें' : language === 'gu' ? 'સંક્ષિપ્ત કરો' : 'Collapse'}
            </Text>
            <ChevronUp size={14} color={themeColors.iconNeutral} />
          </TouchableOpacity>
        </View>

        <View style={[styles.metroBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={styles.metroTopRow}>
            <View style={[styles.metroIconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
              <ExpandedIconComponent size={20} color={themeColors.iconNeutral} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.metroTitle, { color: themeColors.textPrimary }]}>{expandedItem.fullTitle}</Text>
              <Text style={[styles.metroSubtitle, { color: themeColors.textSecondary }]}>{expandedItem.subtitle}</Text>
            </View>
            <TouchableOpacity
              style={[styles.collapseIconBtn, { backgroundColor: themeColors.cardBgSecondary }]}
              onPress={() => toggleExpandIntent(null)}
              delayPressIn={0}
              activeOpacity={0.7}
            >
              <ChevronUp size={16} color={themeColors.iconNeutral} />
            </TouchableOpacity>
          </View>

          <View style={styles.expandedTagRow}>
            <View style={[styles.expandedTagBadge, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight }]}>
              <ShieldCheck size={12} color={themeColors.iconNeutral} />
              <Text style={[styles.expandedTagText, { color: themeColors.textPrimary }]}>{expandedItem.recurrenceTag}</Text>
            </View>
            <Text style={[styles.expandedTagCategory, { color: themeColors.textMuted }]}>{expandedItem.category.toUpperCase()}</Text>
          </View>

          <Text style={[styles.metroDesc, { color: themeColors.textSecondary }]}>{expandedItem.description}</Text>

          <View style={styles.expandedActionRow}>
            <TouchableOpacity
              style={[
                styles.metroActionBtn,
                { backgroundColor: themeColors.primary },
                isExpandedPaid && { backgroundColor: themeColors.cardBgSecondary }
              ]}
              onPress={() => handlePayRepeatedIntent(expandedItem)}
              disabled={isExpandedProcessing || isExpandedPaid}
              delayPressIn={0}
              activeOpacity={0.82}
            >
              {isExpandedPaid ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} color={themeColors.textSecondary} />
                  <Text style={[styles.metroActionBtnText, { color: themeColors.textSecondary }]}>
                    {language === 'hi' ? 'भुगतान सफल' : language === 'gu' ? 'ચુકવણી સફળ' : 'Payment Cleared'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.metroActionBtnText}>
                  {isExpandedProcessing
                    ? (language === 'hi' ? 'भुगतान हो रहा है...' : language === 'gu' ? 'ચુકવણી થઈ રહી છે...' : 'Processing...')
                    : expandedItem.actionLabel}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.collapseSecondaryBtn, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight }]}
              onPress={() => toggleExpandIntent(null)}
              delayPressIn={0}
              activeOpacity={0.75}
            >
              <Text style={[styles.collapseSecondaryBtnText, { color: themeColors.textPrimary }]}>
                {language === 'hi' ? '4 शॉर्टकट' : language === 'gu' ? '4 શોર્ટકટ્સ' : '4 Shortcuts'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  // =========================================================================
  // UPCOMING COMMITMENT ROW (Section 23)
  // =========================================================================
  const renderUpcomingCommitment = () => {
    if (currentState === 'fraud_alert') return null; // Low-density in fraud mode

    return (
      <View style={styles.upcomingSection}>
        <Text style={[styles.sectionEyebrow, { color: themeColors.textMuted }]}>{t.heroes.upcomingTag}</Text>
        <View style={[styles.upcomingRow, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={[styles.upcomingIconCircle, { backgroundColor: themeColors.cardBgSecondary }]}>
            <Calendar size={16} color={themeColors.iconNeutral} />
          </View>
          <View style={styles.upcomingTextWrap}>
            <Text style={[styles.upcomingTitle, { color: themeColors.textPrimary }]}>{t.heroes.emiTitle}</Text>
            <Text style={[styles.upcomingSubtitle, { color: themeColors.textSecondary }]}>{t.heroes.emiSubtitle}</Text>
          </View>
          <TouchableOpacity
            style={[styles.upcomingPayBtn, { backgroundColor: themeColors.primary }]}
            onPress={() => setActiveTab('payments')}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <Text style={styles.upcomingPayBtnText}>{t.heroes.manageAutoDebit} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // RECHARGE & BILL PAYMENTS HUB (JioFinance Iconic Utility Categories)
  // =========================================================================
  const renderRechargeAndBillPay = () => {
    const billers = [
      { id: 'mobile', name: language === 'hi' ? 'मोबाइल' : language === 'gu' ? 'મોબાઇલ' : 'Mobile', sub: 'Jio / Airtel', icon: Smartphone },
      { id: 'electricity', name: language === 'hi' ? 'बिजली' : language === 'gu' ? 'વીજળી' : 'Electricity', sub: 'BESCOM', icon: Zap },
      { id: 'dth', name: language === 'hi' ? 'डीटीएच' : language === 'gu' ? 'DTH' : 'DTH / Cable', sub: 'Tata Play', icon: Tv },
      { id: 'broadband', name: language === 'hi' ? 'ब्रॉडबैंड' : language === 'gu' ? 'બ્રોડબેન્ડ' : 'FASTag', sub: 'NHAI / Net', icon: Wifi },
    ];

    return (
      <View style={styles.rechargeSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Text style={[styles.sectionTitleText, { color: themeColors.textSecondary }]}>
              {language === 'hi' ? 'रीचार्ज एवं बिल भुगतान' : language === 'gu' ? 'રિચાર્જ અને બિલ ચુકવણી' : 'RECHARGE & PAY BILLS'}
            </Text>
          </View>
        </View>

        <View style={[styles.rechargeCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={styles.rechargeRow}>
            {billers.map((b) => {
              const IconComp = b.icon;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={styles.rechargeCol}
                  onPress={() => setActiveTab('payments')}
                  delayPressIn={0}
                  activeOpacity={0.75}
                >
                  <View style={[styles.rechargeIconCircle, { backgroundColor: themeColors.cardBgSecondary }]}>
                    <IconComp size={20} color={themeColors.iconNeutral} />
                  </View>
                  <Text style={[styles.rechargeTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>{b.name}</Text>
                  <Text style={[styles.rechargeSub, { color: themeColors.textMuted }]} numberOfLines={1}>{b.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  // =========================================================================
  // FINANCIAL PRODUCTS & SERVICES HUB (JioFinance 2x2 Rich Product Showcase)
  // =========================================================================
  const renderDirectBankingHub = () => {
    return (
      <View style={styles.servicesSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Text style={[styles.sectionTitleText, { color: themeColors.textSecondary }]}>
              {language === 'hi' ? 'वित्तीय उत्पाद' : language === 'gu' ? 'નાણાકીય ઉત્પાદનો' : 'FINANCIAL PRODUCTS'}
            </Text>
          </View>
        </View>

        <View style={styles.productsGrid}>
          {/* 1. Quick Personal Loan */}
          <TouchableOpacity
            style={[styles.productCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => openJourney('loan')}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <View style={styles.productCardTop}>
              <View style={[styles.productIconCircle, { backgroundColor: themeColors.brandSecondarySubtle }]}>
                <CreditCard size={18} color={themeColors.brandSecondary} />
              </View>
              <View style={[styles.productBadge, { backgroundColor: themeColors.brandSecondarySubtle }]}>
                <Text style={[styles.productBadgeText, { color: themeColors.brandSecondary }]}>Pre-Approved</Text>
              </View>
            </View>
            <Text style={[styles.productTitle, { color: themeColors.textPrimary }]}>Personal Loan</Text>
            <Text style={[styles.productSub, { color: themeColors.textSecondary }]}>Up to ₹1,50,000 instant credit</Text>
            <View style={[styles.productActionRow, { borderTopColor: themeColors.borderLight }]}>
              <Text style={[styles.productActionText, { color: themeColors.primary }]}>
                {language === 'hi' ? 'आवेदन करें' : language === 'gu' ? 'અરજી કરો' : 'Apply Now'}
              </Text>
              <ArrowRight size={12} color={themeColors.primary} />
            </View>
          </TouchableOpacity>

          {/* 2. Smart Auto-Sweep FD */}
          <TouchableOpacity
            style={[styles.productCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => openJourney('savings_invest')}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <View style={styles.productCardTop}>
              <View style={[styles.productIconCircle, { backgroundColor: themeColors.cardBgSecondary }]}>
                <TrendingUp size={18} color={themeColors.primary} />
              </View>
              <View style={[styles.productBadge, { backgroundColor: themeColors.brandSecondarySubtle }]}>
                <Text style={[styles.productBadgeText, { color: themeColors.brandSecondary }]}>7.2% p.a.</Text>
              </View>
            </View>
            <Text style={[styles.productTitle, { color: themeColors.textPrimary }]}>Smart Auto-Sweep</Text>
            <Text style={[styles.productSub, { color: themeColors.textSecondary }]}>Higher returns on idle cash</Text>
            <View style={[styles.productActionRow, { borderTopColor: themeColors.borderLight }]}>
              <Text style={[styles.productActionText, { color: themeColors.primary }]}>
                {language === 'hi' ? 'शुरू करें' : language === 'gu' ? 'શરૂ કરો' : 'Start Sweep'}
              </Text>
              <ArrowRight size={12} color={themeColors.primary} />
            </View>
          </TouchableOpacity>

          {/* 3. Digital KYC Verification */}
          <TouchableOpacity
            style={[styles.productCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => openJourney('kyc')}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <View style={styles.productCardTop}>
              <View style={[styles.productIconCircle, { backgroundColor: themeColors.cardBgSecondary }]}>
                <FileCheck size={18} color={themeColors.iconNeutral} />
              </View>
              <View style={[styles.productBadge, { backgroundColor: themeColors.cardBgSecondary }]}>
                <Text style={[styles.productBadgeText, { color: themeColors.textSecondary }]}>Tier-2 Active</Text>
              </View>
            </View>
            <Text style={[styles.productTitle, { color: themeColors.textPrimary }]}>Digital KYC</Text>
            <Text style={[styles.productSub, { color: themeColors.textSecondary }]}>Zero limit verified banking</Text>
            <View style={[styles.productActionRow, { borderTopColor: themeColors.borderLight }]}>
              <Text style={[styles.productActionText, { color: themeColors.primary }]}>
                {language === 'hi' ? 'विवरण देखें' : language === 'gu' ? 'વિગતો જુઓ' : 'View Details'}
              </Text>
              <ArrowRight size={12} color={themeColors.primary} />
            </View>
          </TouchableOpacity>

          {/* 4. Debit Card & Protection */}
          <TouchableOpacity
            style={[styles.productCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => openJourney('debit_card')}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <View style={styles.productCardTop}>
              <View style={[styles.productIconCircle, { backgroundColor: themeColors.cardBgSecondary }]}>
                <ShieldCheck size={18} color={themeColors.iconNeutral} />
              </View>
              <View style={[styles.productBadge, { backgroundColor: themeColors.cardBgSecondary }]}>
                <Text style={[styles.productBadgeText, { color: themeColors.textSecondary }]}>Controls</Text>
              </View>
            </View>
            <Text style={[styles.productTitle, { color: themeColors.textPrimary }]}>Card Safety</Text>
            <Text style={[styles.productSub, { color: themeColors.textSecondary }]}>Manage virtual card & freeze</Text>
            <View style={[styles.productActionRow, { borderTopColor: themeColors.borderLight }]}>
              <Text style={[styles.productActionText, { color: themeColors.primary }]}>
                {language === 'hi' ? 'प्रबंधित करें' : language === 'gu' ? 'સંચાલિત કરો' : 'Manage Card'}
              </Text>
              <ArrowRight size={12} color={themeColors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // 1. HINGE VITALS & ATTRIBUTES BLOCK (Exact Match to Block 2 from Image)
  // =========================================================================
  const renderAccountGroup = () => {
    const accLastFour = (profile as any)?.accountNumber ? (profile as any).accountNumber.slice(-4) : '4092';
    const cibilScore = profile.creditScore || 785;
    const savingsAmount = balance.savings || 185000;
    const isKycVerified = profile.kycStatus === 'verified';

    return (
      <View style={styles.vitalsCard}>
        {/* Dynamic Editorial Vitals Strip with Interactive Access */}
        <View style={styles.vitalsTopRow}>
          <TouchableOpacity
            style={styles.vitalsTopCol}
            onPress={() => openJourney('kyc')}
            activeOpacity={0.7}
          >
            <ShieldCheck size={16} color="#141414" />
            <Text style={styles.vitalsTopText}>
              {isKycVerified
                ? (language === 'hi' ? 'केवाईसी सत्यापित' : language === 'gu' ? 'KYC ચકાસાયેલ' : 'KYC Verified')
                : (language === 'hi' ? 'केवाईसी लंबित' : language === 'gu' ? 'KYC બાકી' : 'KYC Pending')}
            </Text>
          </TouchableOpacity>
          <View style={styles.vitalsVerticalLine} />
          <TouchableOpacity
            style={styles.vitalsTopCol}
            onPress={() => openJourney('credit_score')}
            activeOpacity={0.7}
          >
            <Award size={16} color="#141414" />
            <Text style={styles.vitalsTopText}>CIBIL {cibilScore}</Text>
          </TouchableOpacity>
          <View style={styles.vitalsVerticalLine} />
          <TouchableOpacity
            style={styles.vitalsTopCol}
            onPress={() => openJourney('savings_invest')}
            activeOpacity={0.7}
          >
            <TrendingUp size={16} color="#B45309" />
            <Text style={[styles.vitalsTopText, { color: '#B45309' }]}>7.2% Yield</Text>
          </TouchableOpacity>
        </View>

        {/* Row 1: Primary Savings Account */}
        <View style={styles.vitalsRowDivider} />
        <TouchableOpacity
          style={styles.vitalsRow}
          onPress={() => setActiveTab('activity')}
          activeOpacity={0.7}
        >
          <View style={styles.vitalsIconWrap}>
            <CreditCard size={18} color="#141414" />
          </View>
          <View style={styles.vitalsRowBody}>
            <Text style={styles.vitalsRowTitle}>Savings Account · •••• {accLastFour}</Text>
            <Text style={styles.vitalsRowDesc}>ABC Bank · Primary liquidity account</Text>
          </View>
          <Text style={styles.vitalsRowRightAmount}>₹{balance.available.toLocaleString('en-IN')}</Text>
        </TouchableOpacity>

        {/* Row 2: Auto-Sweep FD */}
        <View style={styles.vitalsRowDivider} />
        <TouchableOpacity
          style={styles.vitalsRow}
          onPress={() => openJourney('savings_invest')}
          activeOpacity={0.7}
        >
          <View style={styles.vitalsIconWrap}>
            <Layers size={18} color="#141414" />
          </View>
          <View style={styles.vitalsRowBody}>
            <Text style={styles.vitalsRowTitle}>Auto-Sweep Liquid Deposit</Text>
            <Text style={styles.vitalsRowDesc}>Earning 7.2% tax-free · Zero penalty breakable</Text>
          </View>
          <Text style={[styles.vitalsRowRightAmount, { color: '#B45309' }]}>
            ₹{savingsAmount.toLocaleString('en-IN')}
          </Text>
        </TouchableOpacity>

        {/* Row 3: Debit Card Controls */}
        <View style={styles.vitalsRowDivider} />
        <TouchableOpacity
          style={styles.vitalsRow}
          onPress={() => openJourney('debit_card')}
          activeOpacity={0.7}
        >
          <View style={styles.vitalsIconWrap}>
            <Smartphone size={18} color="#141414" />
          </View>
          <View style={styles.vitalsRowBody}>
            <Text style={styles.vitalsRowTitle}>Platinum Contactless Debit Card</Text>
            <Text style={styles.vitalsRowDesc}>Tap & Pay enabled · International transactions active</Text>
          </View>
        </TouchableOpacity>

        {/* Row 4: Daily UPI & Limits */}
        <View style={styles.vitalsRowDivider} />
        <TouchableOpacity
          style={styles.vitalsRow}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.7}
        >
          <View style={styles.vitalsIconWrap}>
            <Zap size={18} color="#141414" />
          </View>
          <View style={styles.vitalsRowBody}>
            <Text style={styles.vitalsRowTitle}>Daily UPI Allowance & Autopay</Text>
            <Text style={styles.vitalsRowDesc}>₹1,00,000 daily limit · 2 active mandates</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // =========================================================================
  // 2. HINGE PROMPT CARD: MONTHLY FINANCIAL HABIT (Exact Match to Image Block 1)
  // =========================================================================
  const renderFinancialObservation = () => {
    const sweepPotential = signals.surplusAmount && signals.surplusAmount > 0
      ? signals.surplusAmount
      : Math.min(25000, Math.round(balance.available * 0.4));

    return (
      <View style={styles.hingePromptCard}>
        <Text style={styles.hingePromptHeader}>
          {language === 'hi' ? 'वित्तीय आदत एवं विश्लेषण' : language === 'gu' ? 'નાણાકીય આદત અને વિશ્લેષણ' : 'My monthly financial habit'}
        </Text>
        <Text style={styles.hingePromptSerifAnswer}>
          {signals.surplusAmount && signals.surplusAmount > 0
            ? `Discretionary spend is calm this cycle. You have ₹${sweepPotential.toLocaleString('en-IN')} available to sweep into 7.2% tax-free yield.`
            : `Spending is 8% below your monthly average. You have ₹${sweepPotential.toLocaleString('en-IN')} ready to sweep into 7.2% yield.`}
        </Text>

        <View style={styles.hingePromptMetaRow}>
          <Text style={styles.hingePromptMetaText}>
            Pacing: ₹{Math.round(balance.available * 0.35).toLocaleString('en-IN')} spend baseline · Balanced outflow
          </Text>
        </View>

        {/* Hinge Bottom-Right Round Black Action Circle */}
        <TouchableOpacity
          style={styles.hingePromptCircleBtn}
          onPress={() => openJourney('savings_invest')}
          activeOpacity={0.85}
        >
          <TrendingUp size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  // =========================================================================
  // 3. EDITORIAL ACTIVITY LEDGER IN CRISP HINGE SHEET
  // =========================================================================
  const renderActivityLedger = () => {
    const displayTx = transactions.slice(0, 4);

    return (
      <View style={styles.ledgerSheet}>
        <View style={styles.ledgerHeaderRow}>
          <Text style={styles.ledgerPromptHeader}>
            {language === 'hi' ? 'हालिया लेनदेन' : language === 'gu' ? 'તાજેતરના વ્યવહારો' : 'Recent activity'}
          </Text>
          <TouchableOpacity
            onPress={() => setActiveTab('activity')}
            delayPressIn={0}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>
              {language === 'hi' ? 'पासबुक →' : language === 'gu' ? 'પાસબુક →' : 'Passbook →'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ledgerFeed}>
          {displayTx.map((tx, idx) => {
            const isCredit = tx.type === 'credit';
            const timeStr = new Date(tx.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <View key={tx.id}>
                {idx > 0 && <View style={styles.ledgerRowDivider} />}
                <TouchableOpacity
                  style={styles.ledgerRow}
                  onPress={() => setSelectedTransaction(tx)}
                  activeOpacity={0.65}
                >
                  <View style={styles.ledgerLeft}>
                    <Text style={styles.ledgerMerchant} numberOfLines={1}>
                      {tx.merchant}
                    </Text>
                    <Text style={styles.ledgerMeta}>
                      {tx.category === 'transport' ? 'UPI · Commute' :
                       tx.category === 'food' ? 'UPI · Dining' :
                       tx.category === 'bills' ? 'BBPS · Utility' :
                       tx.category === 'salary' ? 'NEFT · Salary' :
                       tx.category === 'emi' ? 'NACH · Auto-Debit' : 'UPI Transfer'}
                    </Text>
                  </View>
                  <View style={styles.ledgerRight}>
                    <Text
                      style={[
                        styles.ledgerAmount,
                        tx.status === 'flagged' && { color: '#DC2626' },
                      ]}
                    >
                      {isCredit ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.ledgerTime}>{timeStr}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // =========================================================================
  // 4. HINGE PROMPT CARD: PEACE OF MIND
  // =========================================================================
  const renderPeaceOfMindPrompt = () => {
    return (
      <View style={styles.hingePromptCard}>
        <Text style={styles.hingePromptHeader}>
          {language === 'hi' ? 'आपातकालीन सुरक्षा' : language === 'gu' ? 'કટોકટી સુરક્ષા' : 'Financial peace of mind'}
        </Text>
        <Text style={styles.hingePromptSerifAnswer}>
          Your emergency reserves cover 4.2 months of essential living expenses without touching any investments.
        </Text>

        <View style={styles.hingePromptMetaRow}>
          <Text style={styles.hingePromptMetaText}>
            Liquid Safety: ₹94,680 available · High liquidity rating
          </Text>
        </View>

        {/* Hinge Bottom-Right Round Black Action Circle */}
        <TouchableOpacity
          style={styles.hingePromptCircleBtn}
          onPress={() => openJourney('financial_stress')}
          activeOpacity={0.85}
        >
          <ShieldCheck size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };


  // Hoist top-priority urgent security/warning cards to the very top of the feed
  const topWarningCard = cards.find(
    (c) => c.type === 'warning' || c.priority >= 80 || c.id.includes('fraud')
  );
  const remainingCards = cards.filter((c) => c.id !== topWarningCard?.id);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <AdaptiveHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top-Priority Urgent Security / Warning Alert Banner */}
        {topWarningCard && (
          <View style={[styles.topWarningBanner, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.topWarningLeft}>
              <View style={[styles.topWarningIconCircle, { backgroundColor: themeColors.cardBgSecondary }]}>
                <ShieldAlert size={16} color={themeColors.danger} />
              </View>
              <View style={styles.topWarningTextWrap}>
                <Text style={[styles.topWarningTag, { color: themeColors.danger }]}>
                  {topWarningCard.badgeText || (language === 'hi' ? 'सुरक्षा अलर्ट' : language === 'gu' ? 'સુરક્ષા ચેતવણી' : 'SECURITY ALERT')}
                </Text>
                <Text style={[styles.topWarningTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
                  {topWarningCard.title}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.topWarningBtn, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
              onPress={() => {
                const action = topWarningCard.primaryAction;
                const journeyId = action?.journeyId || 'fraud_alert';
                openJourney(journeyId, action?.payload);
              }}
              delayPressIn={0}
              activeOpacity={0.8}
            >
              <Text style={[styles.topWarningBtnText, { color: themeColors.danger }]}>
                {topWarningCard.primaryAction?.label || (language === 'hi' ? 'जांचें' : language === 'gu' ? 'તપાસો' : 'Review')}
              </Text>
              <ArrowRight size={12} color={themeColors.danger} />
            </TouchableOpacity>
          </View>
        )}

        {/* Calm Editorial Balance Header & Action Band */}
        <BalanceHeader />

        {/* 1. Hinge Vitals & Attributes Sheet (Block 2 from image) */}
        {renderAccountGroup()}

        {/* 2. Hinge Prompt Card: Monthly Financial Habit */}
        {renderFinancialObservation()}

        {/* 3. Recent Activity Ledger Sheet */}
        {renderActivityLedger()}

        {/* 4. Hinge Prompt Card: Financial Peace of Mind */}
        {renderPeaceOfMindPrompt()}

        {/* Contextual Experience (if active state: medical, financial stress, surplus) */}
        {currentState !== 'normal' && (
          <Animated.View
            style={{
              opacity: heroFadeAnim,
              transform: [{ translateY: heroTranslateY }],
            }}
          >
            {renderHighestPriorityContext()}
          </Animated.View>
        )}

        {/* Recharge & Pay Bills Utility Row */}
        {renderRechargeAndBillPay()}

        {/* Financial Products & Services */}
        {renderDirectBankingHub()}

        {/* Upcoming Financial Obligations Strip */}
        {renderUpcomingCommitment()}

        {/* Adaptive Attention Hierarchy Stack (Filtered: No warnings duplicated at bottom) */}
        <ContextCardStack cards={remainingCards} />

        {/* Quiet Institutional Banking Footer */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            ABC Bank • Regulated by RBI • DICGC Insured
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
    paddingBottom: 36,
  },

  // Top-Priority Warning Banner (hoisted to top of feed)
  topWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#FECACA',
    ...shadows.sm,
  },
  topWarningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  topWarningIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topWarningTextWrap: {
    flex: 1,
  },
  topWarningTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  topWarningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
  },
  topWarningBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  topWarningBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
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

  // Header row for hero with hold hint / collapse toggle
  heroSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  holdHintText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8C95A6',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  // Compact 4-Component Repeated Intent Grid (fits in half the space)
  compactIntentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  compactTile: {
    width: '48.5%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: 8,
    shadowColor: '#111318',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  compactTilePaid: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  compactTileIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTileTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  compactTileTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111318',
    letterSpacing: -0.1,
  },
  compactTileAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#141414',
  },
  compactTileAmountPaid: {
    color: '#059669',
  },

  // Normal Hero: Metro Commute & Expanded Repeated Intent Card
  metroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...shadows.sm,
  },
  metroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  collapseHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4F5F7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
  },
  collapseHeaderBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#525866',
  },
  collapseIconBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 2,
  },
  expandedTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F4F8',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D9E2EC',
  },
  expandedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: 0.3,
  },
  expandedTagCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C95A6',
    letterSpacing: 0.5,
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
  expandedActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metroActionBtn: {
    backgroundColor: '#111318',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  metroActionBtnPaid: {
    backgroundColor: '#059669',
  },
  metroActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  collapseSecondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    backgroundColor: '#F8F9FA',
  },
  collapseSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#525866',
  },
  paidMetroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.card,
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
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    ...shadows.sm,
  },
  fraudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  fraudIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
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
    borderRadius: radii.md,
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
    borderRadius: radii.md,
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
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    ...shadows.sm,
  },
  medicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  medicalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
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
    borderRadius: radii.md,
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
    borderRadius: radii.md,
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
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...shadows.sm,
  },
  stressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
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
    borderRadius: radii.md,
  },
  stressPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Surplus Hero
  surplusBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    ...shadows.sm,
  },
  surplusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  surplusIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
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
    borderRadius: radii.md,
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
    borderRadius: radii.card,
    paddingVertical: 12,
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

  // Section Header Row (JioFinance-style clean uppercase title with subtle subtitle)
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flex: 1,
  },
  sectionTitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionSubText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  mandateCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  mandateCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: 0.4,
  },

  // Smart Routine Payments Carousel (Horizontal Cards)
  carouselScrollContent: {
    paddingRight: spacing.lg,
    gap: 12,
  },
  routineCard: {
    width: 154,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...shadows.sm,
    justifyContent: 'space-between',
  },
  routineCardPaid: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  routineCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  routineIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
    backgroundColor: '#F1F5F9',
  },
  routineCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  routineCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  routineCardSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 10,
  },
  routineCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  routineCardAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  routineCardAmountPaid: {
    color: '#64748B',
  },
  routinePaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radii.sm,
    backgroundColor: '#ECFDF5',
  },
  routinePaidBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  routinePayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: '#002970',
  },
  routinePayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Recharge & Pay Bills Hub
  rechargeSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  rechargeCard: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rechargeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  rechargeCol: {
    alignItems: 'center',
    flex: 1,
  },
  rechargeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  rechargeTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  rechargeSub: {
    fontSize: 9,
    fontWeight: '400',
    marginTop: 1,
    textAlign: 'center',
  },

  // Financial Products & Services List
  servicesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48.5%',
    borderRadius: 8,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  productCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  productBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  productSub: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
    marginBottom: 8,
  },
  productActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  productActionText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // 1. Hinge Vitals & Attributes Block Styles (Block 2 from image)
  vitalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  vitalsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  vitalsTopCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  vitalsTopText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: -0.2,
  },
  vitalsVerticalLine: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: '#E8E8E6',
  },
  vitalsRowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8E6',
    marginLeft: 48,
  },
  vitalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  vitalsIconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalsRowBody: {
    flex: 1,
  },
  vitalsRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141414',
    letterSpacing: -0.2,
  },
  vitalsRowDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: '#737373',
    marginTop: 2,
    lineHeight: 16,
  },
  vitalsRowRightAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141414',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },

  // 2. Hinge Prompt Card Styles (Blocks 1 & 3 from image)
  hingePromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E6',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  hingePromptHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  hingePromptSerifAnswer: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    color: '#141414',
    letterSpacing: -0.3,
    marginBottom: 16,
    paddingRight: 44, // Leave breathing room for bottom-right circular button
  },
  hingePromptMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 48,
  },
  hingePromptMetaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#737373',
  },
  hingePromptCircleBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // 3. Activity Ledger Sheet Styles
  ledgerSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ledgerPromptHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141414',
  },
  ledgerFeed: {
    marginTop: 2,
  },
  ledgerRowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8E6',
    marginVertical: 4,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  ledgerLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  ledgerMerchant: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141414',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  ledgerMeta: {
    fontSize: 12,
    fontWeight: '400',
    color: '#737373',
  },
  ledgerRight: {
    alignItems: 'flex-end',
  },
  ledgerAmount: {
    fontFamily: serifFont,
    fontSize: 15,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  ledgerTime: {
    fontSize: 11,
    fontWeight: '400',
    color: '#A3A3A3',
  },

  // Quiet Institutional Banking Footer
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
