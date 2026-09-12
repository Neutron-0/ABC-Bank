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
} from 'lucide-react-native';

export const AppNavigator: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const { activeTab, setActiveTab, language, toastMessage, currentState, activeJourney, closeJourney } = useCustomerStore();
  const t = getTranslation(language);

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Motion refs for individual tab icon bouncing
  const iconScales = useRef<{ [key: string]: Animated.Value }>({
    home: new Animated.Value(1),
    payments: new Animated.Value(1),
    assistant: new Animated.Value(1),
    activity: new Animated.Value(1),
    insights: new Animated.Value(1),
    profile: new Animated.Value(1),
  }).current;

  // Motion refs for screen transitions
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateX = useRef(new Animated.Value(0)).current;
  const screenScale = useRef(new Animated.Value(1)).current;
  const prevTabRef = useRef<MainTabType>(activeTab);

  const tabs: { id: MainTabType; label: string; icon: any }[] = [
    { id: 'home', label: t.tabs.home || 'Home', icon: Home },
    { id: 'payments', label: language === 'hi' ? 'भुगतान' : language === 'gu' ? 'ચુકવણી' : 'Pay & Transfer', icon: Send },
    { id: 'assistant', label: language === 'hi' ? 'मित्तर AI' : language === 'gu' ? 'મિત્તર AI' : 'Mittar AI', icon: Bot },
    { id: 'activity', label: language === 'hi' ? 'पासबुक' : language === 'gu' ? 'પાસબુક' : 'Passbook', icon: Clock },
    { id: 'insights', label: language === 'hi' ? 'संपत्ति' : language === 'gu' ? 'સંપત્તિ' : 'Wealth', icon: TrendingUp },
    { id: 'profile', label: language === 'hi' ? 'सेवाएं' : language === 'gu' ? 'સેવાઓ' : 'Services', icon: ShieldCheck },
  ];

  const TAB_ORDER: Record<string, number> = {
    home: 0,
    payments: 1,
    assistant: 2,
    activity: 3,
    insights: 4,
    profile: 5,
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
      default:
        return <AdaptiveHomeScreen />;
    }
  };

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
        {activeTab !== 'assistant' && (
          <TouchableOpacity
            style={[styles.floatingChatButton, { backgroundColor: themeColors.primary }]}
            onPress={() => setActiveTab('assistant')}
            activeOpacity={0.88}
          >
            <View style={styles.floatingChatInner}>
              <View style={[styles.floatingChatIconCircle, { backgroundColor: '#2C2B29' }]}>
                <Bot size={14} color="#FFFFFF" />
              </View>
              <View style={styles.floatingChatTextWrap}>
                <Text style={styles.floatingChatTitle}>Ask Mitra</Text>
                <Text style={[styles.floatingChatSub, { color: '#D6D2CC' }]}>Edge AI</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Anchored Institutional Banking Navigation Bar */}
        <View style={[styles.dockContainer, { backgroundColor: themeColors.cardBg, borderTopColor: themeColors.border }]}>
          <View style={styles.tabBar}>
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const IconComp = tab.icon;
              const scaleValue = iconScales[tab.id] || new Animated.Value(1);

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
                      active
                        ? [styles.activePipVisible, { backgroundColor: themeColors.primary }]
                        : styles.activePipHidden,
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
                      color={active ? themeColors.primary : themeColors.iconNeutral}
                      strokeWidth={active ? 2.3 : 1.7}
                    />
                  </Animated.View>
                  <Text
                    style={[
                      styles.tabLabel,
                      active
                        ? [styles.activeTabLabel, { color: themeColors.primary }]
                        : [styles.inactiveTabLabel, { color: themeColors.textSecondary }],
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
    backgroundColor: '#FAF8F5',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EAE6DF',
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 72 : 58,
    paddingBottom: Platform.OS === 'ios' ? 14 : 4,
    paddingTop: 2,
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
    backgroundColor: colors.primary,
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
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: colors.textSecondary,
  },
  floatingChatButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 82 : 68,
    right: 16,
    borderRadius: 99,
    paddingVertical: 7,
    paddingHorizontal: 12,
    zIndex: 999,
    borderWidth: 1,
    borderColor: '#262626',
  },
  floatingChatInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingChatIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingChatTextWrap: {
    flexDirection: 'column',
  },
  floatingChatTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FAF8F5',
    letterSpacing: 0.2,
  },
  floatingChatSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#A3A3A3',
    letterSpacing: 0.2,
  },
});
