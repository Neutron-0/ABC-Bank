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
      {/* JioFinance-Style Floating Account Balance Hero Card */}
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
                <EyeOff size={16} color="#64748B" />
              ) : (
                <Eye size={16} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.balanceAmountWrap}>
            <AnimatedBalance
              value={balance.available}
              isPrivacyHidden={isBalanceHidden}
              currencyPrefix="₹"
              fractionSuffix=".00"
            />
          </View>
        </View>

        {/* Integrated Quick Action Strip inside Hero Card */}
        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.addMoneyBtn}
            onPress={() => setActiveTab('payments')}
            activeOpacity={0.8}
          >
            <Plus size={14} color="#002970" />
            <Text style={styles.addMoneyText}>
              {language === 'hi' ? 'पैसे जोड़ें' : language === 'gu' ? 'પૈસા ઉમેરો' : 'Add Money'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.viewPassbookBtn}
            onPress={() => setActiveTab('activity')}
            activeOpacity={0.8}
          >
            <Text style={styles.viewPassbookText}>
              {language === 'hi' ? 'पासबुक देखें' : language === 'gu' ? 'પાસબુક જુઓ' : 'View Passbook'}
            </Text>
            <ArrowRight size={13} color="#0052CC" />
          </TouchableOpacity>
        </View>

        {/* Micro Trust & Regulatory Footnote */}
        <View style={styles.cardFooterRow}>
          <Text style={styles.cardFooterText}>
            DICGC Insured up to ₹5 Lakhs • RBI Regulated
          </Text>
          {currentState === 'surplus' && (
            <View style={styles.surplusBadge}>
              <Text style={styles.surplusBadgeText}>7.2% Sweep Active</Text>
            </View>
          )}
        </View>
      </View>

      {/* JioFinance-Style 4-Column Quick Actions Bar */}
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
            {language === 'hi' ? 'क्यूआर स्कैन' : language === 'gu' ? 'QR સ્કેન' : 'Scan QR'}
          </Text>
        </TouchableOpacity>

        {/* 2. Pay to UPI / Mobile */}
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.quickActionCircle, { backgroundColor: '#F5F3FF' }]}>
            <Send size={19} color="#7C3AED" />
          </View>
          <Text style={styles.quickActionLabel}>
            {language === 'hi' ? 'यूपीआई पे' : language === 'gu' ? 'UPI પે' : 'To Mobile'}
          </Text>
        </TouchableOpacity>

        {/* 3. To Bank Account */}
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => setActiveTab('payments')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.quickActionCircle, { backgroundColor: '#ECFDF5' }]}>
            <Building2 size={20} color="#059669" />
          </View>
          <Text style={styles.quickActionLabel}>
            {language === 'hi' ? 'बैंक खाता' : language === 'gu' ? 'બેંક ખાતું' : 'To Bank'}
          </Text>
        </TouchableOpacity>

        {/* 4. Passbook / Check Balance */}
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => setActiveTab('activity')}
          delayPressIn={0}
          activeOpacity={0.75}
        >
          <View style={[styles.quickActionCircle, { backgroundColor: '#FEF3C7' }]}>
            <Receipt size={20} color="#D97706" />
          </View>
          <Text style={styles.quickActionLabel}>
            {language === 'hi' ? 'पासबुक' : language === 'gu' ? 'પાસબુક' : 'Passbook'}
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
    marginBottom: spacing.md,
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
  balanceAmountWrap: {
    marginVertical: 2,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addMoneyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002970',
  },
  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
  },
  viewPassbookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewPassbookText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052CC',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardFooterText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#94A3B8',
  },
  surplusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  surplusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
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
