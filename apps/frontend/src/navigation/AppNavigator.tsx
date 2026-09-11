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
  Activity,
  Bot,
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
    { id: 'payments', label: t.tabs.payments, icon: Send },
    { id: 'activity', label: t.tabs.activity, icon: Clock },
    { id: 'insights', label: t.tabs.insights, icon: Activity },
    { id: 'assistant', label: t.tabs.assistant, icon: Bot },
    { id: 'profile', label: t.tabs.profile, icon: User },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

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
          <CheckCircle2 size={16} color={colors.success} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Screen Container */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const IconComp = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrap, active && styles.activeTabIconWrap]}>
                <IconComp
                  size={20}
                  color={active ? colors.primary : colors.textSecondary}
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
    backgroundColor: colors.bg,
  },
  stateNoticeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  stateNoticeText: {
    ...typography.tiny,
    color: '#92400E',
  },
  toastBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.cardBg,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  toastText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 20 : spacing.xs,
    paddingHorizontal: spacing.xs,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  tabIconWrap: {
    padding: 4,
    borderRadius: radii.full,
  },
  activeTabIconWrap: {
    backgroundColor: colors.primarySubtle,
  },
  tabLabel: {
    ...typography.tiny,
    marginTop: 2,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: colors.textSecondary,
  },
});
