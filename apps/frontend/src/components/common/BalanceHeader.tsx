import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { AnimatedBalance } from './AnimatedBalance';
import { Eye, EyeOff, QrCode, Send, ArrowUpRight, TrendingUp } from 'lucide-react-native';

export const BalanceHeader: React.FC = () => {
  const {
    balance,
    isBalanceHidden,
    toggleBalanceHide,
    language,
    financialHealth,
    currentState,
    setActiveTab,
  } = useCustomerStore();
  const t = getTranslation(language);

  const getSubtleContextText = () => {
    if (currentState === 'fraud_alert') {
      return 'Account protection guard active';
    }
    if (currentState === 'medical_event') {
      return 'Emergency reserve allocated for hospital care';
    }
    if (financialHealth.status === 'stress') {
      return 'Buffer optimization active • Upcoming EMI scheduled';
    }
    if (financialHealth.status === 'thriving') {
      return `+₹14,200 surplus cash flow • ${financialHealth.emergencyFundMonths} mo runway`;
    }
    return `Cash flow stable • ${financialHealth.emergencyFundMonths} months runway buffer`;
  };

  return (
    <View style={styles.container}>
      {/* Eyebrow & Privacy Toggle */}
      <View style={styles.eyebrowRow}>
        <Text style={styles.eyebrowText}>AVAILABLE</Text>
        <TouchableOpacity
          onPress={toggleBalanceHide}
          style={styles.eyeBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          {isBalanceHidden ? (
            <EyeOff size={15} color={colors.textMuted} />
          ) : (
            <Eye size={15} color={colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>

      {/* Numerical Animated Balance */}
      <View style={styles.balanceWrap}>
        <AnimatedBalance
          value={balance.available}
          isPrivacyHidden={isBalanceHidden}
          currencyPrefix="₹"
          fractionSuffix=".00"
        />
      </View>

      {/* Contextual Subtext */}
      <Text style={styles.contextSubtext}>{getSubtleContextText()}</Text>

      {/* Clean Utility Action Strips */}
      <View style={styles.actionStrip}>
        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.8}
        >
          <QrCode size={15} color={colors.primary} />
          <Text style={styles.actionPillText}>Scan QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.8}
        >
          <Send size={15} color={colors.primary} />
          <Text style={styles.actionPillText}>Pay Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.8}
        >
          <ArrowUpRight size={15} color={colors.primary} />
          <Text style={styles.actionPillText}>Bank Transfer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C95A6',
    letterSpacing: 1.2,
  },
  eyeBtn: {
    padding: 2,
  },
  balanceWrap: {
    marginVertical: 2,
  },
  contextSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: '#525866',
    marginTop: 4,
    letterSpacing: -0.1,
  },
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.md + 4,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#111318',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111318',
  },
});
