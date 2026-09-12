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
import { colors, typography, spacing, radii, shadows } from '../theme';
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
import { OnboardingModal } from '../features/onboarding/OnboardingModal';

// Icons
import {
  Home,
  Send,
  Clock,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react-native';

export const AppNavigator: React.FC = () => {
  const { activeTab, setActiveTab, language, toastMessage, currentState } = useCustomerStore();
  const t = getTranslation(language);

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Motion refs for individual tab icon bouncing
  const iconScales = useRef<{ [key: string]: Animated.Value }>({
    home: new Animated.Value(1),
    payments: new Animated.Value(1),
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
    { id: 'activity', label: language === 'hi' ? 'पासबुक' : language === 'gu' ? 'પાસબુક' : 'Passbook', icon: Clock },
    { id: 'insights', label: language === 'hi' ? 'संपत्ति' : language === 'gu' ? 'સંપત્તિ' : 'Wealth', icon: TrendingUp },
    { id: 'profile', label: language === 'hi' ? 'सेवाएं' : language === 'gu' ? 'સેવાઓ' : 'Services', icon: ShieldCheck },
  ];

  const TAB_ORDER: Record<string, number> = {
    home: 0,
    payments: 1,
    activity: 2,
    insights: 3,
    profile: 4,
    assistant: 5,
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

      screenOpacity.setValue(0.2);
      screenTranslateX.setValue(direction * 18);
      screenScale.setValue(0.985);

      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 210,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenTranslateX, {
          toValue: 0,
          duration: 210,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenScale, {
          toValue: 1,
          duration: 210,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      prevTabRef.current = activeTab;
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
      case 'assistant':
        return <MitraChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <AdaptiveHomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFBFB" />

      {/* Discreet Institutional Sandbox Strip if state is simulated */}
      {currentState !== 'normal' && (
        <View style={styles.stateNoticeStrip}>
          <ShieldAlert size={12} color="#475569" />
          <Text style={styles.stateNoticeText}>
            AUDIT SANDBOX: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{currentState.toUpperCase().replace('_', ' ')}</Text>
          </Text>
        </View>
      )}

      {/* Toast Banner */}
      {toastMessage && (
        <View style={styles.toastBanner} pointerEvents="none">
          <CheckCircle2 size={16} color="#10B981" />
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

      {/* Anchored Institutional Banking Navigation Bar */}
      <View style={styles.dockContainer}>
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
                    color={active ? '#0F294A' : '#64748B'}
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
      <OnboardingModal
        visible={showOnboarding}
        onFinish={() => setShowOnboarding(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBFBFB',
  },
  stateNoticeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stateNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 0.2,
  },
  toastBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 76 : 60,
    paddingBottom: Platform.OS === 'ios' ? 18 : 6,
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
    width: 22,
    height: 3,
    borderRadius: 1.5,
    marginBottom: 4,
  },
  activePipVisible: {
    backgroundColor: '#0F294A',
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
    color: '#0F294A',
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: '#64748B',
  },
});
