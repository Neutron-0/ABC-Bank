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
      {/* Hinge-Signature White Prompt Sheet */}
      <View style={styles.sheet}>
        {/* Prompt Header Label */}
        <View style={styles.promptHeaderRow}>
          <Text style={styles.promptLabel}>
            {language === 'hi' ? 'उपलब्ध शेष राशि' : language === 'gu' ? 'ઉપલબ્ધ બેલેન્સ' : 'Available balance'}
          </Text>
          <TouchableOpacity
            onPress={toggleBalanceHide}
            style={styles.eyeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            {isBalanceHidden ? (
              <EyeOff size={16} color="#737373" />
            ) : (
              <Eye size={16} color="#737373" />
            )}
          </TouchableOpacity>
        </View>

        {/* Large Financial Figure in Georgia Serif */}
        <View style={styles.amountRow}>
          <AnimatedBalance
            value={balance.available}
            isPrivacyHidden={isBalanceHidden}
            currencyPrefix="₹"
            fractionSuffix=".00"
          />
        </View>

        {/* Account Details & Copyable Handle */}
        <View style={styles.accountMetaRow}>
          <Text style={styles.accountMetaText}>
            Savings · •••• 4092
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <TouchableOpacity
            style={styles.upiInlineBtn}
            onPress={handleCopyUpiId}
            activeOpacity={0.7}
          >
            <Text style={styles.upiInlineText}>rahul@abcbank</Text>
            <Copy size={11} color="#A3A3A3" />
          </TouchableOpacity>
        </View>

        {/* 3-Column Vitals Strip with Vertical Hairlines */}
        <View style={styles.vitalsStrip}>
          <View style={styles.vitalsCol}>
            <Text style={styles.vitalsLabel}>TOTAL DEPOSITS</Text>
            <Text style={styles.vitalsVal}>{isBalanceHidden ? '••••••' : '₹1,42,680'}</Text>
          </View>
          <View style={styles.vitalsDivider} />
          <View style={styles.vitalsCol}>
            <Text style={styles.vitalsLabel}>AUTO-SWEEP YIELD</Text>
            <Text style={[styles.vitalsVal, { color: '#B45309' }]}>7.2% p.a.</Text>
          </View>
          <View style={styles.vitalsDivider} />
          <View style={styles.vitalsCol}>
            <Text style={styles.vitalsLabel}>IFSC CODE</Text>
            <Text style={styles.vitalsVal}>ABCD0001048</Text>
          </View>
        </View>

        {/* Hinge-Signature Bottom-Right Round Black Action Circle */}
        <TouchableOpacity
          style={styles.hingeActionCircle}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.85}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Action Band: Quick Navigation Strip */}
      <View style={styles.actionBand}>
        <TouchableOpacity
          style={styles.actionBandItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={styles.actionIconWrap}>
            <Send size={18} color="#141414" />
          </View>
          <Text style={styles.actionBandLabel}>
            {language === 'hi' ? 'भेजें' : language === 'gu' ? 'મોકલો' : 'Send'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBandItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={styles.actionIconWrap}>
            <QrCode size={18} color="#141414" />
          </View>
          <Text style={styles.actionBandLabel}>
            {language === 'hi' ? 'स्कैन / प्राप्त' : language === 'gu' ? 'મેળવો' : 'Receive'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBandItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={styles.actionIconWrap}>
            <Receipt size={18} color="#141414" />
          </View>
          <Text style={styles.actionBandLabel}>
            {language === 'hi' ? 'बिल भुगतान' : language === 'gu' ? 'ચુકવો' : 'Pay Bills'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBandItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={styles.actionIconWrap}>
            <Building2 size={18} color="#141414" />
          </View>
          <Text style={styles.actionBandLabel}>
            {language === 'hi' ? 'बैंक ट्रांसफर' : language === 'gu' ? 'વધુ' : 'Transfer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E6',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  promptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: -0.2,
  },
  eyeBtn: {
    padding: 4,
  },
  amountRow: {
    marginVertical: 4,
  },
  accountMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 16,
  },
  accountMetaText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#737373',
  },
  metaDot: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A3A3A3',
  },
  upiInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upiInlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#737373',
  },

  // 3-Column Vitals Strip with Vertical Hairlines (as seen in Hinge screenshot)
  vitalsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8E8E6',
    marginRight: 48, // Leave room for circular action button
  },
  vitalsCol: {
    flex: 1,
  },
  vitalsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#737373',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  vitalsVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: -0.2,
  },
  vitalsDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: '#E8E8E6',
    marginHorizontal: 8,
  },

  // Hinge Bottom-Right Circular Black Action Button
  hingeActionCircle: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Compact Action Band: Send · Receive · Pay · More
  actionBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
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
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBandLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141414',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
