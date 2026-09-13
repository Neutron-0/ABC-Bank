import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../theme';
import { useCustomerStore } from '../state/customerStore';
import { getTranslation } from '../i18n';
import { MainTabType } from '../types';

// Screens
import { AdaptiveHomeScreen } from '../features/home/AdaptiveHomeScreen';
import { PaymentsScreen } from '../features/payments/PaymentsScreen';
import { TransactionsScreen } from '../features/transactions/TransactionsScreen';
import { InsightsScreen } from '../features/insights/InsightsScreen';
import { MitraChatScreen } from '../features/assistant/MitraChatScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { MoreViewScreen } from '../features/more/MoreViewScreen';
import { AuthScreen } from '../features/auth/AuthScreen';

// Modals
import { WhyThisCard } from '../components/common/WhyThisCard';
import { PrototypeLabModal } from '../features/demo/PrototypeLabModal';
import { ArchitectureFlowModal } from '../features/demo/ArchitectureFlowModal';
import { KycModal } from '../features/journeys/KycModal';
import { ResponsibleLoanModal } from '../features/journeys/ResponsibleLoanModal';
import { MedicalAssistanceModal } from '../features/journeys/MedicalAssistanceModal';
import { SavingsInvestModal } from '../features/journeys/SavingsInvestModal';
import { FraudAlertModal } from '../features/journeys/FraudAlertModal';
import { FinancialStressModal } from '../features/journeys/FinancialStressModal';
import { CreditScoreModal } from '../features/journeys/CreditScoreModal';
import { DebitCardModal } from '../features/journeys/DebitCardModal';
import { OnboardingModal } from '../features/onboarding/OnboardingModal';
import { PaymentAuthModal } from '../components/common/PaymentAuthModal';
import { InsuranceModal } from '../features/journeys/InsuranceModal';
import { DigitalRupeeModal } from '../features/journeys/DigitalRupeeModal';
import { IpoBiddingModal } from '../features/journeys/IpoBiddingModal';
import { RelationshipManagerModal } from '../features/journeys/RelationshipManagerModal';
import { ChequeServicesModal } from '../features/journeys/ChequeServicesModal';
import { FastagRechargeModal } from '../features/journeys/FastagRechargeModal';
import { ForexTravelCardModal } from '../features/journeys/ForexTravelCardModal';
import { BankingSmsToast } from '../components/common/BankingSmsToast';

// Icons
import {
  Home,
  Send,
  Clock,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Bot,
  Grid,
} from 'lucide-react-native';

export const AppNavigator: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const { activeTab, setActiveTab, language, toastMessage, currentState, activeJourney, closeJourney, openJourney, isAuthenticated } = useCustomerStore();
  const t = getTranslation(language);

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Motion refs for individual tab icon bouncing
  const iconScales = useRef<{ [key: string]: Animated.Value }>({
    home: new Animated.Value(1),
    payments: new Animated.Value(1),
    assistant: new Animated.Value(1),
    activity: new Animated.Value(1),
    more: new Animated.Value(1),
    insights: new Animated.Value(1),
    profile: new Animated.Value(1),
  }).current;

  // Motion refs for screen transitions
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateX = useRef(new Animated.Value(0)).current;
  const screenScale = useRef(new Animated.Value(1)).current;
  const prevTabRef = useRef<MainTabType>(activeTab);

  const tabs: { id: MainTabType; label: string; icon: any; isCenter?: boolean }[] = [
    { id: 'home', label: t.tabs.home || 'Home', icon: Home },
    { id: 'payments', label: language === 'hi' ? 'भुगतान' : language === 'gu' ? 'ચુકવણી' : 'Pay & Transfer', icon: Send },
    { id: 'assistant', label: language === 'hi' ? 'मित्तर AI' : language === 'gu' ? 'મિત્તર AI' : 'Mittar AI', icon: Bot, isCenter: true },
    { id: 'activity', label: language === 'hi' ? 'पासबुक' : language === 'gu' ? 'પાસબુક' : 'Passbook', icon: Clock },
    { id: 'more', label: language === 'hi' ? 'अन्य' : language === 'gu' ? 'વધુ' : 'More', icon: Grid },
  ];

  const TAB_ORDER: Record<string, number> = {
    home: 0,
    payments: 1,
    assistant: 2,
    activity: 3,
    more: 4,
    insights: 5,
    profile: 6,
  };

  // Animate tab icon bounce & screen transition when activeTab changes
  useEffect(() => {
    // 1. Icon spring bounce for newly active tab
    if (iconScales[activeTab]) {
      Animated.sequence([
        Animated.timing(iconScales[activeTab], {
          toValue: 1.2,
          duration: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(iconScales[activeTab], {
          toValue: 1.0,
          friction: 6,
          tension: 110,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // 2. Directional screen cross-fade transition
    if (prevTabRef.current !== activeTab) {
      const prevIdx = TAB_ORDER[prevTabRef.current] ?? 0;
      const nextIdx = TAB_ORDER[activeTab] ?? 0;
      const direction = nextIdx >= prevIdx ? 1 : -1;

      screenOpacity.setValue(0.7);
      screenTranslateX.setValue(direction * 10);
      screenScale.setValue(0.99);

      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenTranslateX, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(screenScale, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      prevTabRef.current = activeTab;
    }

    // Micro pulse on active tab icon
    if (iconScales[activeTab]) {
      Animated.sequence([
        Animated.timing(iconScales[activeTab], {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(iconScales[activeTab], {
          toValue: 1.0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeTab]);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <AdaptiveHomeScreen />;
      case 'payments':
        return <PaymentsScreen />;
      case 'activity':
        return <TransactionsScreen />;
      case 'insights':
        return <InsightsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'assistant':
        return <MitraChatScreen />;
      case 'more':
        return (
          <MoreViewScreen
            onNavigate={(route) => setActiveTab(route as any)}
            onOpenModal={(modalId) => openJourney(modalId)}
          />
        );
      default:
        return <AdaptiveHomeScreen />;
    }
  };

  // Auth Gate: Render AuthScreen if user is not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={themeColors.bg} />
        <View style={[styles.responsiveShell, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
          <AuthScreen />
        </View>
        <BankingSmsToast />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.bg} />

      <View style={[styles.responsiveShell, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
        {/* Discreet Institutional Sandbox Strip if state is simulated */}
        {currentState !== 'normal' && (
          <View style={[styles.stateNoticeStrip, { backgroundColor: themeColors.cardBgSecondary, borderBottomColor: themeColors.border }]}>
            <ShieldAlert size={12} color={themeColors.textSecondary} />
            <Text style={[styles.stateNoticeText, { color: themeColors.textSecondary }]}>
              AUDIT SANDBOX: <Text style={{ fontWeight: '700', color: themeColors.textPrimary }}>{currentState.toUpperCase().replace('_', ' ')}</Text>
            </Text>
          </View>
        )}

        {/* Toast Banner */}
        {toastMessage && (
          <View style={[styles.toastBanner, { backgroundColor: themeColors.primary }]} pointerEvents="none">
            <CheckCircle2 size={16} color={themeColors.success} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Smooth Directional Screen Transition Container */}
        <Animated.View
          style={[
            styles.screenContainer,
            {
              opacity: screenOpacity,
              transform: [
                { translateX: screenTranslateX },
                { scale: screenScale },
              ],
            },
          ]}
        >
          {renderActiveScreen()}
        </Animated.View>

        {/* Floating Mitra AI Pill Button */}
        {/* Anchored Institutional Banking Navigation Bar (Hinge Obsidian Dock) */}
        <View style={styles.dockContainer}>
          <View style={styles.tabBar}>
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const IconComp = tab.icon;
              const scaleValue = iconScales[tab.id] || new Animated.Value(1);

              if (tab.isCenter) {
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={styles.centerTabItem}
                    onPress={() => setActiveTab(tab.id)}
                    delayPressIn={0}
                    activeOpacity={0.85}
                  >
                    <Animated.View
                      style={[
                        styles.centerIconCircle,
                        active && styles.centerIconCircleActive,
                        { transform: [{ scale: scaleValue }] },
                      ]}
                    >
                      <IconComp
                        size={22}
                        color="#FFFFFF"
                        strokeWidth={2.4}
                      />
                      <View style={styles.centerAiPulse} />
                    </Animated.View>
                    <Text
                      style={[
                        styles.tabLabel,
                        styles.centerTabLabel,
                        active ? styles.activeTabLabel : styles.inactiveTabLabel,
                      ]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={styles.tabItem}
                  onPress={() => setActiveTab(tab.id)}
                  delayPressIn={0}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.activePip,
                      active ? styles.activePipVisible : styles.activePipHidden,
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.iconContainer,
                      { transform: [{ scale: scaleValue }] },
                    ]}
                  >
                    <IconComp
                      size={20}
                      color={active ? '#FFFFFF' : '#737373'}
                      strokeWidth={active ? 2.3 : 1.7}
                    />
                  </Animated.View>
                  <Text
                    style={[
                      styles.tabLabel,
                      active ? styles.activeTabLabel : styles.inactiveTabLabel,
                    ]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Authentic Regulatory SMS Alert Toast */}
      <BankingSmsToast />

      {/* Global Modals & Journeys */}
      <WhyThisCard />
      <PrototypeLabModal />
      <ArchitectureFlowModal />
      <KycModal />
      <ResponsibleLoanModal />
      <MedicalAssistanceModal />
      <SavingsInvestModal />
      <FraudAlertModal />
      <FinancialStressModal />
      <CreditScoreModal />
      <DebitCardModal />
      <PaymentAuthModal />
      <InsuranceModal
        visible={activeJourney === 'insurance' || activeJourney === 'insurance_modal'}
        onClose={closeJourney}
      />
      <DigitalRupeeModal
        visible={activeJourney === 'digital_rupee' || activeJourney === 'digital_rupee_modal' || activeJourney === 'cbdc'}
        onClose={closeJourney}
      />
      <IpoBiddingModal
        visible={activeJourney === 'ipo' || activeJourney === 'ipo_modal' || activeJourney === 'asba'}
        onClose={closeJourney}
      />
      <RelationshipManagerModal
        visible={activeJourney === 'rm' || activeJourney === 'rm_modal' || activeJourney === 'manager'}
        onClose={closeJourney}
      />
      <ChequeServicesModal
        visible={activeJourney === 'cheque' || activeJourney === 'cheque_modal' || activeJourney === 'cheques'}
        onClose={closeJourney}
      />
      <FastagRechargeModal
        visible={activeJourney === 'fastag' || activeJourney === 'fastag_modal'}
        onClose={closeJourney}
      />
      <ForexTravelCardModal
        visible={activeJourney === 'forex' || activeJourney === 'forex_modal'}
        onClose={closeJourney}
      />
      <OnboardingModal
        visible={showOnboarding || activeJourney === 'onboarding'}
        onFinish={() => {
          setShowOnboarding(false);
          closeJourney();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
  },
  responsiveShell: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 520 : undefined,
    borderLeftWidth: Platform.OS === 'web' ? StyleSheet.hairlineWidth : 0,
    borderRightWidth: Platform.OS === 'web' ? StyleSheet.hairlineWidth : 0,
    borderColor: '#EAE6DF',
    overflow: 'hidden',
  },
  stateNoticeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3EFEA',
    paddingVertical: 5,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EAE6DF',
  },

  stateNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#525252',
    letterSpacing: 0.3,
  },
  toastBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: '#141414',
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  dockContainer: {
    backgroundColor: '#121212',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#262626',
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 74 : 60,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  activePip: {
    width: 14,
    height: 2,
    borderRadius: 1,
    marginBottom: 4,
  },
  activePipVisible: {
    backgroundColor: '#FFFFFF',
  },
  activePipHidden: {
    backgroundColor: 'transparent',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
  },
  badgePip: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePipText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: '#737373',
  },
  centerTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  centerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#800020',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#262626',
    shadowColor: '#800020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  centerIconCircleActive: {
    backgroundColor: '#9B1130',
    borderColor: '#FFFFFF',
    shadowOpacity: 0.7,
  },
  centerAiPulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
  },
  centerTabLabel: {
    marginTop: 3,
    fontWeight: '700',
  },
});
