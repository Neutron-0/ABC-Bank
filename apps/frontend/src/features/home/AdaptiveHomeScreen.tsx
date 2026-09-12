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
import { colors, typography, spacing, radii, shadows } from '../../theme';
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
      iconColor: '#0F294A',
      iconBg: '#F0F4F8',
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
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
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
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
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
      iconColor: '#059669',
      iconBg: '#ECFDF5',
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
          <Text style={styles.sectionEyebrow}>{t.heroes.medicalTag}</Text>
          <View style={styles.medicalBox}>
            <View style={styles.medicalHeader}>
              <View style={styles.medicalIconWrap}>
                <HeartHandshake size={20} color="#0D9488" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.medicalHospital}>{t.heroes.medicalHospital}</Text>
                <Text style={styles.medicalAmount}>{t.heroes.medicalAmount}</Text>
              </View>
            </View>
            <Text style={styles.medicalText}>{t.heroes.medicalDesc}</Text>
            <View style={styles.medicalActionRow}>
              <TouchableOpacity
                style={styles.medicalPrimaryBtn}
                onPress={() => openJourney('medical_assistance')}
                delayPressIn={0}
                activeOpacity={0.8}
              >
                <Text style={styles.medicalPrimaryBtnText}>{t.heroes.getAssistance}</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.medicalSecondaryBtn}
                onPress={() => setActiveTab('assistant')}
                delayPressIn={0}
                activeOpacity={0.8}
              >
                <Text style={styles.medicalSecondaryBtnText}>
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
          <Text style={styles.sectionEyebrow}>{t.heroes.stressTag}</Text>
          <View style={styles.stressBox}>
            <View style={styles.stressHeader}>
              <View style={styles.stressIconWrap}>
                <AlertCircle size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stressTitle}>{t.heroes.stressTitle}</Text>
                <Text style={styles.stressSubtitle}>
                  {language === 'hi' ? 'आगामी जिम्मेदारियां: ₹32,000' : language === 'gu' ? 'આગામી જવાબદારીઓ: ₹32,000' : 'Upcoming obligations: ₹32,000'}
                </Text>
              </View>
            </View>
            <Text style={styles.stressText}>{t.heroes.stressDesc}</Text>
            <View style={styles.stressActionRow}>
              <TouchableOpacity
                style={styles.stressPrimaryBtn}
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
          <Text style={styles.sectionEyebrow}>{t.heroes.surplusTag}</Text>
          <View style={styles.surplusBox}>
            <View style={styles.surplusHeader}>
              <View style={styles.surplusIconWrap}>
                <TrendingUp size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.surplusTitle}>{t.heroes.surplusTitle}</Text>
                <Text style={styles.surplusSubtitle}>{t.heroes.surplusSubtitle}</Text>
              </View>
            </View>
            <Text style={styles.surplusText}>{t.heroes.surplusDesc}</Text>
            <View style={styles.surplusActionRow}>
              <TouchableOpacity
                style={styles.surplusPrimaryBtn}
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
              <Text style={styles.sectionTitleText}>
                {language === 'hi' ? 'बिल एवं रीचार्ज' : language === 'gu' ? 'બિલ અને રિચાર્જ' : 'BILLS & RECHARGES'}
              </Text>
            </View>
            <View style={styles.mandateCountBadge}>
              <Text style={styles.mandateCountText}>4 DUE</Text>
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
                  style={[styles.routineCard, isPaid && styles.routineCardPaid]}
                  onPress={() => handlePayRepeatedIntent(item)}
                  onLongPress={() => toggleExpandIntent(item.id)}
                  delayLongPress={300}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <View style={styles.routineCardTop}>
                    <View style={[styles.routineIconCircle, { backgroundColor: isPaid ? '#ECFDF5' : item.iconBg }]}>
                      {isPaid ? (
                        <CheckCircle2 size={16} color="#059669" />
                      ) : (
                        <IconComponent size={16} color={item.iconColor} />
                      )}
                    </View>
                    <View style={styles.routineCategoryBadge}>
                      <Text style={styles.routineCategoryText}>{item.category.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.routineCardTitle} numberOfLines={1}>
                    {item.shortTitle}
                  </Text>
                  <Text style={styles.routineCardSub} numberOfLines={1}>
                    {item.recurrenceTag}
                  </Text>

                  <View style={styles.routineCardBottom}>
                    <Text style={[styles.routineCardAmount, isPaid && styles.routineCardAmountPaid]}>
                      {item.amountFormatted}
                    </Text>

                    {isPaid ? (
                      <View style={styles.routinePaidBadge}>
                        <CheckCircle2 size={11} color="#059669" />
                        <Text style={styles.routinePaidBadgeText}>
                          {language === 'hi' ? 'सफल' : language === 'gu' ? 'સફળ' : 'Paid'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.routinePayBtn}>
                        <Text style={styles.routinePayBtnText}>
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
          <Text style={styles.sectionEyebrow}>{t.heroes.metroTag}</Text>
          <TouchableOpacity
            style={styles.collapseHeaderBtn}
            onPress={() => toggleExpandIntent(null)}
            delayPressIn={0}
            activeOpacity={0.7}
          >
            <Text style={styles.collapseHeaderBtnText}>
              {language === 'hi' ? 'संक्षिप्त करें' : language === 'gu' ? 'સંક્ષિપ્ત કરો' : 'Collapse'}
            </Text>
            <ChevronUp size={14} color="#525866" />
          </TouchableOpacity>
        </View>

        <View style={styles.metroBox}>
          <View style={styles.metroTopRow}>
            <View style={[styles.metroIconWrap, { backgroundColor: expandedItem.iconBg }]}>
              <ExpandedIconComponent size={20} color={expandedItem.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metroTitle}>{expandedItem.fullTitle}</Text>
              <Text style={styles.metroSubtitle}>{expandedItem.subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.collapseIconBtn}
              onPress={() => toggleExpandIntent(null)}
              delayPressIn={0}
              activeOpacity={0.7}
            >
              <ChevronUp size={16} color="#525866" />
            </TouchableOpacity>
          </View>

          <View style={styles.expandedTagRow}>
            <View style={styles.expandedTagBadge}>
              <ShieldCheck size={12} color="#0F294A" />
              <Text style={styles.expandedTagText}>{expandedItem.recurrenceTag}</Text>
            </View>
            <Text style={styles.expandedTagCategory}>{expandedItem.category.toUpperCase()}</Text>
          </View>

          <Text style={styles.metroDesc}>{expandedItem.description}</Text>

          <View style={styles.expandedActionRow}>
            <TouchableOpacity
              style={[styles.metroActionBtn, isExpandedPaid && styles.metroActionBtnPaid]}
              onPress={() => handlePayRepeatedIntent(expandedItem)}
              disabled={isExpandedProcessing || isExpandedPaid}
              delayPressIn={0}
              activeOpacity={0.82}
            >
              {isExpandedPaid ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} color="#FFFFFF" />
                  <Text style={styles.metroActionBtnText}>
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
              style={styles.collapseSecondaryBtn}
              onPress={() => toggleExpandIntent(null)}
              delayPressIn={0}
              activeOpacity={0.75}
            >
              <Text style={styles.collapseSecondaryBtnText}>
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
        <Text style={styles.sectionEyebrow}>{t.heroes.upcomingTag}</Text>
        <View style={styles.upcomingRow}>
          <View style={styles.upcomingIconCircle}>
            <Calendar size={16} color="#525866" />
          </View>
          <View style={styles.upcomingTextWrap}>
            <Text style={styles.upcomingTitle}>{t.heroes.emiTitle}</Text>
            <Text style={styles.upcomingSubtitle}>{t.heroes.emiSubtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.upcomingPayBtn}
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
      { id: 'mobile', name: language === 'hi' ? 'मोबाइल' : language === 'gu' ? 'મોબાઇલ' : 'Mobile', sub: 'Jio / Airtel', icon: Smartphone, bg: '#EFF6FF', color: '#0052CC' },
      { id: 'electricity', name: language === 'hi' ? 'बिजली' : language === 'gu' ? 'વીજળી' : 'Electricity', sub: 'BESCOM', icon: Zap, bg: '#FEF3C7', color: '#D97706' },
      { id: 'dth', name: language === 'hi' ? 'डीटीएच' : language === 'gu' ? 'DTH' : 'DTH / Cable', sub: 'Tata Play', icon: Tv, bg: '#F3E8FF', color: '#7C3AED' },
      { id: 'broadband', name: language === 'hi' ? 'ब्रॉडबैंड' : language === 'gu' ? 'બ્રોડબેન્ડ' : 'FASTag', sub: 'NHAI / Net', icon: Wifi, bg: '#ECFDF5', color: '#059669' },
    ];

    return (
      <View style={styles.rechargeSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Text style={styles.sectionTitleText}>
              {language === 'hi' ? 'रीचार्ज एवं बिल भुगतान' : language === 'gu' ? 'રિચાર્જ અને બિલ ચુકવણી' : 'RECHARGE & PAY BILLS'}
            </Text>
          </View>
        </View>

        <View style={styles.rechargeCard}>
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
                  <View style={[styles.rechargeIconCircle, { backgroundColor: b.bg }]}>
                    <IconComp size={20} color={b.color} />
                  </View>
                  <Text style={styles.rechargeTitle} numberOfLines={1}>{b.name}</Text>
                  <Text style={styles.rechargeSub} numberOfLines={1}>{b.sub}</Text>
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
            <Text style={styles.sectionTitleText}>
              {language === 'hi' ? 'वित्तीय उत्पाद' : language === 'gu' ? 'નાણાકીય ઉત્પાદનો' : 'FINANCIAL PRODUCTS'}
            </Text>
          </View>
        </View>

        <View style={styles.productsGrid}>
          {/* 1. Quick Personal Loan */}
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => openJourney('loan')}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <View style={styles.productCardTop}>
              <View style={[styles.productIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <CreditCard size={18} color="#D97706" />
              </View>
              <View style={[styles.productBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.productBadgeText, { color: '#B45309' }]}>Pre-Approved</Text>
              </View>
            </View>
            <Text style={styles.productTitle}>Personal Loan</Text>
            <Text style={styles.productSub}>Up to ₹1,50,000 instant credit</Text>
            <View style={styles.productActionRow}>
              <Text style={styles.productActionText}>
                {language === 'hi' ? 'आवेदन करें' : language === 'gu' ? 'અરજી કરો' : 'Apply Now'}
              </Text>
              <ArrowRight size={12} color="#0052CC" />
            </View>
          </TouchableOpacity>

          {/* 2. Smart Auto-Sweep FD */}
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => openJourney('savings_invest')}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <View style={styles.productCardTop}>
              <View style={[styles.productIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <TrendingUp size={18} color="#059669" />
              </View>
              <View style={[styles.productBadge, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.productBadgeText, { color: '#059669' }]}>7.2% p.a.</Text>
              </View>
            </View>
            <Text style={styles.productTitle}>Smart Auto-Sweep</Text>
            <Text style={styles.productSub}>Higher returns on idle cash</Text>
            <View style={styles.productActionRow}>
              <Text style={styles.productActionText}>
                {language === 'hi' ? 'शुरू करें' : language === 'gu' ? 'શરૂ કરો' : 'Start Sweep'}
              </Text>
              <ArrowRight size={12} color="#0052CC" />
            </View>
          </TouchableOpacity>

          {/* 3. Digital KYC Verification */}
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => openJourney('kyc')}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <View style={styles.productCardTop}>
              <View style={[styles.productIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <FileCheck size={18} color="#0052CC" />
              </View>
              <View style={[styles.productBadge, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.productBadgeText, { color: '#0052CC' }]}>Tier-2 Active</Text>
              </View>
            </View>
            <Text style={styles.productTitle}>Digital KYC</Text>
            <Text style={styles.productSub}>Zero limit verified banking</Text>
            <View style={styles.productActionRow}>
              <Text style={styles.productActionText}>
                {language === 'hi' ? 'विवरण देखें' : language === 'gu' ? 'વિગતો જુઓ' : 'View Details'}
              </Text>
              <ArrowRight size={12} color="#0052CC" />
            </View>
          </TouchableOpacity>

          {/* 4. Debit Card & Protection */}
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => openJourney('debit_card')}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <View style={styles.productCardTop}>
              <View style={[styles.productIconCircle, { backgroundColor: '#ECFEFF' }]}>
                <ShieldCheck size={18} color="#0891B2" />
              </View>
              <View style={[styles.productBadge, { backgroundColor: '#F1F5F9' }]}>
                <Text style={[styles.productBadgeText, { color: '#475569' }]}>Controls</Text>
              </View>
            </View>
            <Text style={styles.productTitle}>Card Safety</Text>
            <Text style={styles.productSub}>Manage virtual card & freeze</Text>
            <View style={styles.productActionRow}>
              <Text style={styles.productActionText}>
                {language === 'hi' ? 'प्रबंधित करें' : language === 'gu' ? 'સંચાલિત કરો' : 'Manage Card'}
              </Text>
              <ArrowRight size={12} color="#0052CC" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // RECENT TRANSACTIONS / PASSBOOK SNIPPET (Authentic Live Passbook Feed)
  // =========================================================================
  const renderRecentTransactionsPeek = () => {
    const recentTx = [
      { id: 'tx_1', name: 'Delhi Metro Smart Card', time: 'Today, 08:45 AM', amount: '-₹40.00', icon: Train, bg: '#EFF6FF', color: '#0052CC' },
      { id: 'tx_2', name: 'BESCOM Electricity Bill', time: 'Yesterday, 18:20', amount: '-₹1,450.00', icon: Zap, bg: '#FEF3C7', color: '#D97706' },
    ];

    return (
      <View style={styles.recentSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Text style={styles.sectionTitleText}>
              {language === 'hi' ? 'हालिया लेनदेन' : language === 'gu' ? 'તાજેતરના વ્યવહારો' : 'RECENT TRANSACTIONS'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setActiveTab('activity')}
            delayPressIn={0}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>
              {language === 'hi' ? 'पासबुक देखें →' : language === 'gu' ? 'પાસબુક જુઓ →' : 'Passbook →'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentCard}>
          {recentTx.map((tx, idx) => {
            const IconComp = tx.icon;
            return (
              <View key={tx.id}>
                <View style={styles.recentTxRow}>
                  <View style={[styles.recentIconCircle, { backgroundColor: tx.bg }]}>
                    <IconComp size={16} color={tx.color} />
                  </View>
                  <View style={styles.recentTextWrap}>
                    <Text style={styles.recentTxName} numberOfLines={1}>{tx.name}</Text>
                    <Text style={styles.recentTxTime}>{tx.time}</Text>
                  </View>
                  <Text style={styles.recentTxAmount}>{tx.amount}</Text>
                </View>
                {idx < recentTx.length - 1 && <View style={styles.recentDivider} />}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Hoist top-priority urgent security/warning cards to the very top of the feed
  const topWarningCard = cards.find(
    (c) => c.type === 'warning' || c.priority >= 80 || c.id.includes('fraud')
  );
  const remainingCards = cards.filter((c) => c.id !== topWarningCard?.id);

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
        {/* Top-Priority Urgent Security / Warning Alert Banner */}
        {topWarningCard && (
          <View style={styles.topWarningBanner}>
            <View style={styles.topWarningLeft}>
              <View style={styles.topWarningIconCircle}>
                <ShieldAlert size={16} color="#DC2626" />
              </View>
              <View style={styles.topWarningTextWrap}>
                <Text style={styles.topWarningTag}>
                  {topWarningCard.badgeText || (language === 'hi' ? 'सुरक्षा अलर्ट' : language === 'gu' ? 'સુરક્ષા ચેતવણી' : 'SECURITY ALERT')}
                </Text>
                <Text style={styles.topWarningTitle} numberOfLines={1}>
                  {topWarningCard.title}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.topWarningBtn}
              onPress={() => {
                const action = topWarningCard.primaryAction;
                const journeyId = action?.journeyId || 'fraud_alert';
                openJourney(journeyId, action?.payload);
              }}
              delayPressIn={0}
              activeOpacity={0.8}
            >
              <Text style={styles.topWarningBtnText}>
                {topWarningCard.primaryAction?.label || (language === 'hi' ? 'जांचें' : language === 'gu' ? 'તપાસો' : 'Review')}
              </Text>
              <ArrowRight size={12} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}

        {/* Calm Editorial Balance Header with Animated Counter */}
        <BalanceHeader />

        {/* Highest-Priority Contextual Experience: Smart Routine Payments Carousel */}
        <Animated.View
          style={{
            opacity: heroFadeAnim,
            transform: [{ translateY: heroTranslateY }],
          }}
        >
          {renderHighestPriorityContext()}
        </Animated.View>

        {/* Recharge & Pay Bills Hub */}
        {renderRechargeAndBillPay()}

        {/* Financial Products 2x2 Showcase */}
        {renderDirectBankingHub()}

        {/* Recent Transactions / Passbook Peek */}
        {renderRecentTransactionsPeek()}

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
    color: '#0F294A',
  },
  compactTileAmountPaid: {
    color: '#059669',
  },

  // Normal Hero: Metro Commute & Expanded Repeated Intent Card
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
  collapseHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4F5F7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 99,
  },
  collapseHeaderBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#525866',
  },
  collapseIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    color: '#0F294A',
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 99,
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
    color: '#0052CC',
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
    borderRadius: 18,
    padding: 14,
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
    marginBottom: 12,
  },
  routineIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    marginBottom: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
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
    borderRadius: 9999,
    backgroundColor: '#002970',
  },
  routinePayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Recharge & Pay Bills Hub (JioFinance Iconic Grid)
  rechargeSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md + 4,
  },
  rechargeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...shadows.sm,
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
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  rechargeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  rechargeSub: {
    fontSize: 9,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 1,
    textAlign: 'center',
  },

  // Financial Products 2x2 Rich Showcase
  servicesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md + 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...shadows.sm,
  },
  productCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  productSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 10,
  },
  productActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  productActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
  },

  // Recent Transactions Passbook Snippet
  recentSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md + 4,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...shadows.sm,
  },
  recentTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  recentIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTextWrap: {
    flex: 1,
  },
  recentTxName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  recentTxTime: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  recentTxAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  recentDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
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
