import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
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

  const tabs: { id: MainTabType; label: string; icon: any }[] = [
    { id: 'home', label: t.tabs.home, icon: Home },
    { id: 'payments', label: 'Pay', icon: Send },
    { id: 'activity', label: t.tabs.activity, icon: Clock },
    { id: 'insights', label: 'Money', icon: TrendingUp },
    { id: 'profile', label: t.tabs.profile, icon: User },
  ];

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
        <View style={styles.toastBanner}>
          <CheckCircle2 size={16} color="#10B981" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Screen Container */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Calm Editorial Floating Dock Tab Bar */}
      <View style={styles.dockContainer}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, active && styles.activeTabItem]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <IconComp
                    size={19}
                    color={active ? '#111318' : '#8E8E93'}
                    strokeWidth={active ? 2.4 : 1.7}
                  />
                </View>
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
    paddingHorizontal: 8,
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
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    flex: 1,
  },
  activeTabItem: {
    backgroundColor: '#F5F5F7',
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
