import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radii, shadows, useAppTheme } from '../../theme';
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
  const { colors: themeColors } = useAppTheme();
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
      {/* Signature Institutional Banking Luxury Account Card */}
      <View style={[styles.heroCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        {/* Top Account Identifier Row */}
        <View style={styles.cardTopRow}>
          <View style={styles.bankTagGroup}>
            <View style={[styles.shieldIconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
              <ShieldCheck size={14} color={themeColors.primary} />
            </View>
            <View>
              <Text style={[styles.bankTagTitle, { color: themeColors.primary }]}>ABC PAYMENTS BANK</Text>
              <Text style={[styles.accountNumberText, { color: themeColors.textSecondary }]}>Savings A/C •••• 4092</Text>
            </View>
          </View>

          {/* UPI ID Pill with Copy */}
          <TouchableOpacity
            style={[styles.upiPill, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border, borderWidth: 1 }]}
            onPress={handleCopyUpiId}
            activeOpacity={0.7}
          >
            <Text style={[styles.upiPillText, { color: themeColors.textSecondary }]}>rahul@abcbank</Text>
            <Copy size={11} color={themeColors.iconNeutral} />
          </TouchableOpacity>
        </View>

        {/* Available Balance Figure */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceLabelRow}>
            <Text style={[styles.balanceLabel, { color: themeColors.textSecondary }]}>
              {language === 'hi' ? 'उपलब्ध शेष राशि' : language === 'gu' ? 'ઉપલબ્ધ બેલેન્સ' : 'AVAILABLE BALANCE'}
            </Text>
            <TouchableOpacity
              onPress={toggleBalanceHide}
              style={styles.eyeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              {isBalanceHidden ? (
                <EyeOff size={15} color={themeColors.textSecondary} />
              ) : (
                <Eye size={15} color={themeColors.textSecondary} />
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
              style={[
                styles.addMoneyPill,
                {
                  backgroundColor: themeColors.cardBgSecondary,
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() => setActiveTab('payments')}
              activeOpacity={0.8}
            >
              <Plus size={13} color={themeColors.primary} />
              <Text style={[styles.addMoneyPillText, { color: themeColors.primary }]}>
                {language === 'hi' ? 'पैसे जोड़ें' : language === 'gu' ? 'પૈસા ઉમેરો' : 'Add Money'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Secondary Ledger Metrics Row */}
        <View style={[styles.ledgerRow, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight }]}>
          <View style={styles.ledgerCol}>
            <Text style={[styles.ledgerLabel, { color: themeColors.textSecondary }]}>
              {language === 'hi' ? 'कुल बैलेंस' : language === 'gu' ? 'કુલ બેલેન્સ' : 'Total Deposits'}
            </Text>
            <Text style={[styles.ledgerValue, { color: themeColors.textPrimary }]}>
              {isBalanceHidden ? '••••••' : '₹72,500'}
            </Text>
          </View>
          <View style={[styles.ledgerDivider, { backgroundColor: themeColors.divider }]} />
          <View style={styles.ledgerCol}>
            <Text style={[styles.ledgerLabel, { color: themeColors.textSecondary }]}>
              {language === 'hi' ? 'ऑटो-स्वीप एफडी' : language === 'gu' ? 'ઑટો-સ્વીપ FD' : 'Auto-Sweep FD'}
            </Text>
            <Text style={[styles.ledgerValue, { color: themeColors.brandSecondary }]}>
              {isBalanceHidden ? '••••••' : '₹18,000 (7.2%)'}
            </Text>
          </View>
          <View style={[styles.ledgerDivider, { backgroundColor: themeColors.divider }]} />
          <View style={styles.ledgerCol}>
            <Text style={[styles.ledgerLabel, { color: themeColors.textSecondary }]}>
              {language === 'hi' ? 'आईएफएससी' : language === 'gu' ? 'IFSC' : 'IFSC Code'}
            </Text>
            <Text style={[styles.ledgerValue, { color: themeColors.textPrimary }]}>ABCD0001048</Text>
          </View>
        </View>
      </View>

      {/* 4-Column Primary Transfer Hub (Monochromatic Banking Actions) */}
      <View style={[styles.quickActionsBar, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        {/* 1. Scan QR */}
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.quickActionCircle, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight, borderWidth: 1 }]}>
            <QrCode size={19} color={themeColors.primary} />
          </View>
          <Text style={[styles.quickActionLabel, { color: themeColors.textPrimary }]}>
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
          <View style={[styles.quickActionCircle, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight, borderWidth: 1 }]}>
            <Smartphone size={19} color={themeColors.iconNeutral} />
          </View>
          <Text style={[styles.quickActionLabel, { color: themeColors.textPrimary }]}>
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
          <View style={[styles.quickActionCircle, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight, borderWidth: 1 }]}>
            <Building2 size={19} color={themeColors.iconNeutral} />
          </View>
          <Text style={[styles.quickActionLabel, { color: themeColors.textPrimary }]}>
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
          <View style={[styles.quickActionCircle, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight, borderWidth: 1 }]}>
            <ArrowLeftRight size={19} color={themeColors.iconNeutral} />
          </View>
          <Text style={[styles.quickActionLabel, { color: themeColors.textPrimary }]}>
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
    backgroundColor: colors.cardBg,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.cardBgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankTagTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  accountNumberText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 1,
  },
  upiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.cardBgSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  upiPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
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
    color: colors.textSecondary,
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
    backgroundColor: colors.primarySubtle,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  addMoneyPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  // Secondary Ledger Metrics
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ledgerCol: {
    flex: 1,
    alignItems: 'center',
  },
  ledgerDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.divider,
  },
  ledgerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  ledgerValue: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },

  // 4-Column Quick Actions Bar
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: radii.card,
    paddingVertical: 14,
    paddingHorizontal: 12,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
