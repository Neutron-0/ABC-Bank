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
  User,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';

export const AppNavigator: React.FC = () => {
  const { activeTab, setActiveTab, language, toastMessage, currentState } = useCustomerStore();
  const t = getTranslation(language);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dockWidth, setDockWidth] = useState(0);

  // Motion refs for sliding indicator pill
  const pillTranslateX = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;

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
    { id: 'home', label: t.tabs.home, icon: Home },
    { id: 'payments', label: 'Pay', icon: Send },
    { id: 'activity', label: t.tabs.activity, icon: Clock },
    { id: 'insights', label: 'Money', icon: TrendingUp },
    { id: 'profile', label: t.tabs.profile, icon: User },
  ];

  const TAB_ORDER: Record<string, number> = {
    home: 0,
    payments: 1,
    activity: 2,
    insights: 3,
    profile: 4,
    assistant: 5,
  };

  const activeTabIndex = tabs.findIndex((t) => t.id === activeTab);
  const tabItemWidth = dockWidth > 0 ? (dockWidth - 12) / tabs.length : 0;

  // Animate sliding indicator pill when activeTab or dockWidth changes
  useEffect(() => {
    if (dockWidth > 0 && activeTabIndex >= 0) {
      const targetX = 6 + activeTabIndex * tabItemWidth;

      Animated.parallel([
        Animated.spring(pillTranslateX, {
          toValue: targetX,
          friction: 8,
          tension: 75,
          useNativeDriver: true,
        }),
        Animated.timing(pillOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (activeTabIndex === -1) {
      // If in assistant or another non-dock tab, gently hide pill
      Animated.timing(pillOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [activeTab, dockWidth, activeTabIndex, tabItemWidth]);

  // Animate tab icon bounce & screen transition when activeTab changes
  useEffect(() => {
    // 1. Icon spring bounce for newly active tab
    if (iconScales[activeTab]) {
      Animated.sequence([
        Animated.timing(iconScales[activeTab], {
          toValue: 1.24,
          duration: 110,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(iconScales[activeTab], {
          toValue: 1.0,
          friction: 5,
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

      {/* Floating State Banner if not in normal */}
      {currentState !== 'normal' && (
        <View style={styles.stateNoticeStrip}>
          <Sparkles size={13} color="#92400E" />
          <Text style={styles.stateNoticeText}>
            Simulated Persona: <Text style={{ fontWeight: '800' }}>{currentState.toUpperCase()}</Text>
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

      {/* Fluid Floating Dock Tab Bar with Sliding Indicator Pill */}
      <View style={styles.dockContainer} pointerEvents="box-none">
        <View
          style={styles.tabBar}
          onLayout={(e) => setDockWidth(e.nativeEvent.layout.width)}
        >
          {/* Sliding Pill Indicator */}
          {dockWidth > 0 && tabItemWidth > 0 && (
            <Animated.View
              style={[
                styles.slidingPill,
                {
                  width: tabItemWidth,
                  opacity: pillOpacity,
                  transform: [{ translateX: pillTranslateX }],
                },
              ]}
              pointerEvents="none"
            />
          )}

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
                activeOpacity={0.75}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    { transform: [{ scale: scaleValue }] },
                  ]}
                >
                  <IconComp
                    size={19}
                    color={active ? '#111318' : '#8E8E93'}
                    strokeWidth={active ? 2.4 : 1.7}
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
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  stateNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  toastBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: '#111318',
    borderRadius: 14,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
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
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 7,
    paddingHorizontal: 6,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#111318',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 7,
    position: 'relative',
  },
  slidingPill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 20,
    flex: 1,
    zIndex: 2,
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
    color: '#111318',
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: '#8E8E93',
  },
});
