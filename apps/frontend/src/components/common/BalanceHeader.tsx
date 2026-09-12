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
      {/* Financial Anchor - Content-First Editorial Typography */}
      <View style={styles.anchorSection}>
        {/* Label & Privacy Row */}
        <View style={styles.labelRow}>
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

        {/* Large Financial Figure */}
        <View style={styles.amountRow}>
          <View style={styles.balanceAmountWrap}>
            <AnimatedBalance
              value={balance.available}
              isPrivacyHidden={isBalanceHidden}
              currencyPrefix="₹"
              fractionSuffix=".00"
            />
          </View>
        </View>

        {/* Account Meta & Copyable UPI ID */}
        <View style={styles.accountMetaRow}>
          <Text style={[styles.accountMetaText, { color: themeColors.textSecondary }]}>
            Savings · •••• 4092
          </Text>
          <Text style={[styles.metaDot, { color: themeColors.border }]}>·</Text>
          <TouchableOpacity
            style={styles.upiInlineBtn}
            onPress={handleCopyUpiId}
            activeOpacity={0.7}
          >
            <Text style={[styles.upiInlineText, { color: themeColors.textSecondary }]}>rahul@abcbank</Text>
            <Copy size={11} color={themeColors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Structured Financial Metadata Strip */}
        <View style={[styles.metricsStrip, { borderTopColor: themeColors.borderLight }]}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>
              {language === 'hi' ? 'कुल जमा' : language === 'gu' ? 'કુલ ડિપોઝિટ' : 'Total Deposits'}
            </Text>
            <Text style={[styles.metricVal, { color: themeColors.textPrimary }]}>
              {isBalanceHidden ? '••••••' : '₹72,500'}
            </Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: themeColors.borderLight }]} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>
              {language === 'hi' ? 'ऑटो-स्वीप' : language === 'gu' ? 'ઑટો-સ્વીપ' : 'Auto-Sweep FD'}
            </Text>
            <Text style={[styles.metricVal, { color: themeColors.brandSecondary }]}>
              {isBalanceHidden ? '••••••' : '₹18,000 (7.2%)'}
            </Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: themeColors.borderLight }]} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>IFSC</Text>
            <Text style={[styles.metricVal, { color: themeColors.textPrimary }]}>ABCD0001048</Text>
          </View>
        </View>
      </View>

      {/* Action Band: Send · Receive · Pay · More */}
      <View style={[styles.actionBand, { borderTopColor: themeColors.borderLight, borderBottomColor: themeColors.borderLight }]}>
        {/* 1. Send */}
        <TouchableOpacity
          style={styles.actionBandItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
            <Send size={17} color={themeColors.primary} />
          </View>
          <Text style={[styles.actionBandLabel, { color: themeColors.textPrimary }]}>
            {language === 'hi' ? 'भेजें' : language === 'gu' ? 'મોકલો' : 'Send'}
          </Text>
        </TouchableOpacity>

        {/* 2. Receive / QR */}
        <TouchableOpacity
          style={styles.actionBandItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
            <QrCode size={17} color={themeColors.primary} />
          </View>
          <Text style={[styles.actionBandLabel, { color: themeColors.textPrimary }]}>
            {language === 'hi' ? 'प्राप्त करें' : language === 'gu' ? 'મેળવો' : 'Receive'}
          </Text>
        </TouchableOpacity>

        {/* 3. Pay */}
        <TouchableOpacity
          style={styles.actionBandItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
            <Receipt size={17} color={themeColors.primary} />
          </View>
          <Text style={[styles.actionBandLabel, { color: themeColors.textPrimary }]}>
            {language === 'hi' ? 'भुगतान' : language === 'gu' ? 'ચુકવો' : 'Pay'}
          </Text>
        </TouchableOpacity>

        {/* 4. More */}
        <TouchableOpacity
          style={styles.actionBandItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
            <Building2 size={17} color={themeColors.primary} />
          </View>
          <Text style={[styles.actionBandLabel, { color: themeColors.textPrimary }]}>
            {language === 'hi' ? 'अन्य' : language === 'gu' ? 'વધુ' : 'More'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  // Financial Anchor
  anchorSection: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  eyeBtn: {
    padding: 2,
  },
  amountRow: {
    marginVertical: 4,
  },
  balanceAmountWrap: {
    marginVertical: 2,
  },
  accountMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  accountMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 14,
    fontWeight: '600',
  },
  upiInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upiInlineText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Structured Metadata Strip
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    marginTop: 2,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },

  // Compact Action Band: Send · Receive · Pay · More
  actionBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  actionBandItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBandLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
