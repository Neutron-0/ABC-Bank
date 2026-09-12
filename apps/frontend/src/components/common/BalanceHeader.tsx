import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { AnimatedBalance } from './AnimatedBalance';
import {
  Eye,
  EyeOff,
  QrCode,
  Send,
  Building2,
  Receipt,
  Copy,
  Plus,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ArrowLeftRight,
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
    showToast,
  } = useCustomerStore();
  const t = getTranslation(language);
  const bh = t.balanceHeader;

  const handleCopyUpiId = () => {
    showToast(
      language === 'hi'
        ? 'यूपीआई आईडी कॉपी की गई: rahul@abcbank'
        : language === 'gu'
        ? 'UPI ID કૉપિ થઈ: rahul@abcbank'
        : 'UPI ID copied: rahul@abcbank'
    );
  };

  return (
    <View style={styles.container}>
      {/* Signature Jio Payments Bank Luxury Account Card */}
      <View style={styles.heroCard}>
        {/* Top Account Identifier Row */}
        <View style={styles.cardTopRow}>
          <View style={styles.bankTagGroup}>
            <View style={styles.shieldIconWrap}>
              <ShieldCheck size={14} color="#002970" />
            </View>
            <View>
              <Text style={styles.bankTagTitle}>ABC PAYMENTS BANK</Text>
              <Text style={styles.accountNumberText}>Savings A/C •••• 4092</Text>
            </View>
          </View>

          {/* UPI ID Pill with Copy */}
          <TouchableOpacity
            style={styles.upiPill}
            onPress={handleCopyUpiId}
            activeOpacity={0.7}
          >
            <Text style={styles.upiPillText}>rahul@abcbank</Text>
            <Copy size={11} color="#0052CC" />
          </TouchableOpacity>
        </View>

        {/* Available Balance Figure */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceLabelRow}>
            <Text style={styles.balanceLabel}>
              {language === 'hi' ? 'उपलब्ध शेष राशि' : language === 'gu' ? 'ઉપલબ્ધ બેલેન્સ' : 'AVAILABLE BALANCE'}
            </Text>
            <TouchableOpacity
              onPress={toggleBalanceHide}
              style={styles.eyeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              {isBalanceHidden ? (
                <EyeOff size={15} color="#64748B" />
              ) : (
                <Eye size={15} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.balanceRowWithAdd}>
            <View style={styles.balanceAmountWrap}>
              <AnimatedBalance
                value={balance.available}
                isPrivacyHidden={isBalanceHidden}
                currencyPrefix="₹"
                fractionSuffix=".00"
              />
            </View>

            <TouchableOpacity
              style={styles.addMoneyPill}
              onPress={() => setActiveTab('payments')}
              activeOpacity={0.8}
            >
              <Plus size={13} color="#002970" />
              <Text style={styles.addMoneyPillText}>
                {language === 'hi' ? 'पैसे जोड़ें' : language === 'gu' ? 'પૈસા ઉમેરો' : 'Add Money'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Secondary Ledger Metrics Row (Jio Payments Bank Depth) */}
        <View style={styles.ledgerRow}>
          <View style={styles.ledgerCol}>
            <Text style={styles.ledgerLabel}>
              {language === 'hi' ? 'कुल बैलेंस' : language === 'gu' ? 'કુલ બેલેન્સ' : 'Total Deposits'}
            </Text>
            <Text style={styles.ledgerValue}>
              {isBalanceHidden ? '••••••' : '₹72,500'}
            </Text>
          </View>
          <View style={styles.ledgerDivider} />
          <View style={styles.ledgerCol}>
            <Text style={styles.ledgerLabel}>
              {language === 'hi' ? 'ऑटो-स्वीप एफडी' : language === 'gu' ? 'ઑટો-સ્વીપ FD' : 'Auto-Sweep FD'}
            </Text>
            <Text style={[styles.ledgerValue, { color: '#059669' }]}>
              {isBalanceHidden ? '••••••' : '₹18,000 (7.2%)'}
            </Text>
          </View>
          <View style={styles.ledgerDivider} />
          <View style={styles.ledgerCol}>
            <Text style={styles.ledgerLabel}>
              {language === 'hi' ? 'आईएफएससी' : language === 'gu' ? 'IFSC' : 'IFSC Code'}
            </Text>
            <Text style={styles.ledgerValue}>ABCD0001048</Text>
          </View>
        </View>
      </View>

      {/* JioFinance-Style 4-Column Primary Transfer Hub */}
      <View style={styles.quickActionsBar}>
        {/* 1. Scan QR */}
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.quickActionCircle, { backgroundColor: '#EFF6FF' }]}>
            <QrCode size={20} color="#0052CC" />
          </View>
          <Text style={styles.quickActionLabel}>
            {language === 'hi' ? 'स्कैन क्यूआर' : language === 'gu' ? 'સ્કેન QR' : 'Scan QR'}
          </Text>
        </TouchableOpacity>

        {/* 2. To Mobile / Contact */}
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.quickActionCircle, { backgroundColor: '#ECFDF5' }]}>
            <Smartphone size={20} color="#059669" />
          </View>
          <Text style={styles.quickActionLabel}>
            {language === 'hi' ? 'मोबाइल पे' : language === 'gu' ? 'મોબાઇલ પે' : 'To Mobile'}
          </Text>
        </TouchableOpacity>

        {/* 3. To Bank Account */}
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.quickActionCircle, { backgroundColor: '#FEF3C7' }]}>
            <Building2 size={20} color="#D97706" />
          </View>
          <Text style={styles.quickActionLabel}>
            {language === 'hi' ? 'बैंक खाता' : language === 'gu' ? 'બેંક ખાતું' : 'To Bank'}
          </Text>
        </TouchableOpacity>

        {/* 4. To Self / UPI ID */}
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.quickActionCircle, { backgroundColor: '#F3E8FF' }]}>
            <ArrowLeftRight size={19} color="#7C3AED" />
          </View>
          <Text style={styles.quickActionLabel}>
            {language === 'hi' ? 'यूपीआई आईडी' : language === 'gu' ? 'UPI ID' : 'To UPI ID'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bankTagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankTagTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#002970',
    letterSpacing: 0.5,
  },
  accountNumberText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  upiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  upiPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0052CC',
  },
  balanceContainer: {
    marginBottom: 0,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  eyeBtn: {
    padding: 2,
  },
  balanceRowWithAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmountWrap: {
    marginVertical: 2,
  },
  addMoneyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  addMoneyPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002970',
  },

  // Secondary Ledger Metrics
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  ledgerValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.1,
  },

  // 4-Column Quick Actions Bar
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    paddingVertical: 14,
    paddingHorizontal: 12,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
});
