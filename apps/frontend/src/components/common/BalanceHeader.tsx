import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { AnimatedBalance } from './AnimatedBalance';
import {
  Eye,
  EyeOff,
  QrCode,
  Send,
  FileText,
  CreditCard,
  ShieldCheck,
} from 'lucide-react-native';

export const BalanceHeader: React.FC = () => {
  const {
    balance,
    isBalanceHidden,
    toggleBalanceHide,
    language,
    financialHealth,
    currentState,
    setActiveTab,
    openJourney,
  } = useCustomerStore();
  const t = getTranslation(language);

  const getSubtleContextText = () => {
    const bh = t.balanceHeader;
    if (currentState === 'fraud_alert') {
      return bh.fraudProtocol;
    }
    if (currentState === 'medical_event') {
      return bh.medicalTagged;
    }
    if (financialHealth.status === 'stress') {
      return bh.liquidityGuard;
    }
    if (financialHealth.status === 'thriving') {
      return `${bh.surplusCashFlow} • ${financialHealth.emergencyFundMonths} ${bh.moReserve}`;
    }
    return `${bh.operatingReserve}: ${financialHealth.emergencyFundMonths} ${bh.months} • ${bh.autoSweepActive}`;
  };

  const bh = t.balanceHeader;

  return (
    <View style={styles.container}>
      {/* Institutional Account Card */}
      <View style={styles.accountCard}>
        {/* Top Card Row */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.accountTypeWrap}>
            <Text style={styles.accountTypeText}>{bh.primarySavings}</Text>
            <Text style={styles.accountNumText}>{bh.accountNumber}</Text>
          </View>
          <TouchableOpacity
            onPress={toggleBalanceHide}
            style={styles.eyeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            {isBalanceHidden ? (
              <EyeOff size={16} color="#64748B" />
            ) : (
              <Eye size={16} color="#64748B" />
            )}
          </TouchableOpacity>
        </View>

        {/* Available Balance Large Numerical Figure */}
        <View style={styles.balanceWrap}>
          <Text style={styles.balanceLabel}>{bh.availableForWithdrawal}</Text>
          <AnimatedBalance
            value={balance.available}
            isPrivacyHidden={isBalanceHidden}
            currencyPrefix="₹"
            fractionSuffix=".00"
          />
        </View>

        {/* Secondary Financial Ledger Metrics */}
        <View style={styles.ledgerRow}>
          <View style={styles.ledgerCol}>
            <Text style={styles.ledgerLabel}>{bh.totalDeposits}</Text>
            <Text style={styles.ledgerValue}>
              {isBalanceHidden ? '••••••' : `₹${(balance.savings || 185000).toLocaleString('en-IN')}`}
            </Text>
          </View>
          <View style={styles.ledgerDivider} />
          <View style={styles.ledgerCol}>
            <Text style={styles.ledgerLabel}>{bh.autoSweepFd}</Text>
            <Text style={styles.ledgerValue}>
              {isBalanceHidden ? '••••••' : `₹${(balance.fixedDeposits || 250000).toLocaleString('en-IN')}`}
            </Text>
          </View>
          <View style={styles.ledgerDivider} />
          <View style={styles.ledgerCol}>
            <Text style={styles.ledgerLabel}>{bh.ifscCode}</Text>
            <Text style={styles.ledgerValue}>ABCD0001048</Text>
          </View>
        </View>

        {/* Regulatory Protection Trust Mark */}
        <View style={styles.trustMarkRow}>
          <ShieldCheck size={13} color="#059669" />
          <Text style={styles.trustMarkText}>{getSubtleContextText()}</Text>
        </View>
      </View>

      {/* Authoritative Banking Actions */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={styles.actionIconWrap}>
            <Send size={16} color="#0F294A" />
          </View>
          <Text style={styles.actionBtnText}>{bh.transfer}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={styles.actionIconWrap}>
            <QrCode size={16} color="#0F294A" />
          </View>
          <Text style={styles.actionBtnText}>{bh.scanQr}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setActiveTab('activity')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={styles.actionIconWrap}>
            <FileText size={16} color="#0F294A" />
          </View>
          <Text style={styles.actionBtnText}>{bh.passbook}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => openJourney('debit_card')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={styles.actionIconWrap}>
            <CreditCard size={16} color="#0F294A" />
          </View>
          <Text style={styles.actionBtnText}>{bh.cards}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.md + 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  accountTypeWrap: {
    gap: 2,
  },
  accountTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  accountNumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  eyeBtn: {
    padding: 4,
  },
  balanceWrap: {
    marginVertical: 4,
  },
  balanceLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ledgerCol: {
    flex: 1,
    alignItems: 'center',
  },
  ledgerDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
  ledgerLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  ledgerValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  trustMarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  trustMarkText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 5,
  },
  actionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
});
