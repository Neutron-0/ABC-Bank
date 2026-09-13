import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useCustomerStore } from '../../state/customerStore';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import {
  Globe,
  X,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from 'lucide-react-native';

interface ForexTravelCardModalProps {
  visible: boolean;
  onClose: () => void;
}

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

const FOREX_RATES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 83.85 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 91.20 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 108.40 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 22.84 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 64.50 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 61.30 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 0.56 },
};

export const ForexTravelCardModal: React.FC<ForexTravelCardModalProps> = ({
  visible,
  onClose,
}) => {
  const { balance, bookForexOrder, pushBankingSms } = useCustomerStore();
  const { colors: themeColors } = useAppTheme();

  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [foreignAmount, setForeignAmount] = useState<string>('500');
  const [isLoading, setIsLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{
    orderId: string;
    currency: string;
    foreignAmount: number;
    inrAmount: number;
    rate: number;
  } | null>(null);

  const activeCurrency = FOREX_RATES[selectedCurrency] || FOREX_RATES.USD;
  const numForeign = Number(foreignAmount) || 0;
  const inrAmount = Math.round(numForeign * activeCurrency.rate);
  const isInsufficient = inrAmount > balance.available;

  const handleProceed = () => {
    if (numForeign <= 0 || isInsufficient) return;
    setIsLoading(true);

    setTimeout(() => {
      const res = bookForexOrder(
        selectedCurrency,
        numForeign,
        activeCurrency.rate,
        inrAmount
      );
      setSuccessOrder({
        orderId: res.orderId,
        currency: selectedCurrency,
        foreignAmount: numForeign,
        inrAmount,
        rate: activeCurrency.rate,
      });
      setIsLoading(false);

      // Push authentic regulatory SMS
      pushBankingSms({
        sender: 'VK-ABCBNK',
        body: `Acct XX8492 debited for INR ${inrAmount.toLocaleString('en-IN')} on ${new Date().toLocaleDateString('en-GB')} for RuPay Forex Card Reload (${selectedCurrency} ${numForeign}). Order: ${res.orderId}.`,
        type: 'debit',
        amount: inrAmount,
        referenceId: res.orderId,
      });
    }, 800);
  };

  const handleClose = () => {
    setSuccessOrder(null);
    setIsLoading(false);
    setForeignAmount('500');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: themeColors.cardBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Globe size={20} color="#4F46E5" />
              </View>
              <View>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                  Forex Multi-Currency Card
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  Instant Card Reload • Zero Cross-Currency Markup
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!successOrder ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Currency Selector */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: themeColors.textPrimary }]}>
                  Select Foreign Currency
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currScroll}>
                  <View style={styles.currRow}>
                    {Object.values(FOREX_RATES).map((curr) => {
                      const isSelected = selectedCurrency === curr.code;
                      return (
                        <TouchableOpacity
                          key={curr.code}
                          onPress={() => setSelectedCurrency(curr.code)}
                          style={[
                            styles.currChip,
                            {
                              backgroundColor: isSelected ? '#312E81' : themeColors.cardBgSecondary,
                              borderColor: isSelected ? '#4338CA' : themeColors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.currSymbol, { color: isSelected ? '#A5B4FC' : themeColors.textSecondary }]}>
                            {curr.symbol}
                          </Text>
                          <Text style={[styles.currCode, { color: isSelected ? '#FFFFFF' : themeColors.textPrimary }]}>
                            {curr.code}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Conversion Calculator */}
              <View style={[styles.calcCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <View style={styles.rateHeader}>
                  <Text style={[styles.rateLabel, { color: themeColors.textSecondary }]}>
                    Live Interbank Rate
                  </Text>
                  <Text style={[styles.rateValue, { color: themeColors.textPrimary }]}>
                    1 {selectedCurrency} = ₹{activeCurrency.rate.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.calcInputsRow}>
                  <View style={styles.calcField}>
                    <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>
                      You Load ({selectedCurrency})
                    </Text>
                    <View style={[styles.inputBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
                      <Text style={styles.inputPrefix}>{activeCurrency.symbol}</Text>
                      <TextInput
                        value={foreignAmount}
                        onChangeText={setForeignAmount}
                        keyboardType="numeric"
                        style={[styles.inputText, { color: themeColors.textPrimary }]}
                      />
                    </View>
                  </View>

                  <View style={styles.calcField}>
                    <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>
                      You Pay (INR)
                    </Text>
                    <View style={[styles.inrDisplayBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
                      <Text style={[styles.inrDisplayText, { color: themeColors.textPrimary }]}>
                        ₹{inrAmount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Target Travel Card Preview */}
              <View style={[styles.cardTargetBox, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                <View style={styles.cardTargetLeft}>
                  <View style={styles.cardIconWrap}>
                    <CreditCard size={18} color="#4F46E5" />
                  </View>
                  <View>
                    <Text style={styles.cardTargetTitle}>RuPay Platinum Multi-Currency Card</Text>
                    <Text style={styles.cardTargetSub}>Ending in •••• 8492 • Chip & PIN Protected</Text>
                  </View>
                </View>
                <View style={styles.zeroMarkupBadge}>
                  <Text style={styles.zeroMarkupText}>0% Markup</Text>
                </View>
              </View>

              {/* Account Balance Note */}
              <View style={styles.availBalRow}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={[styles.availBalText, { color: themeColors.textSecondary }]}>
                  Debited from DigiSavings • Available: ₹{balance.available.toLocaleString('en-IN')}
                </Text>
              </View>

              {isInsufficient && (
                <View style={styles.errorBox}>
                  <AlertCircle size={14} color="#DC2626" />
                  <Text style={styles.errorText}>Insufficient balance for this forex conversion.</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleProceed}
                disabled={numForeign <= 0 || isInsufficient || isLoading}
                style={[
                  styles.submitBtn,
                  (numForeign <= 0 || isInsufficient || isLoading) && styles.disabledBtn,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Sparkles size={16} color="#FDE047" />
                    <Text style={styles.submitBtnText}>
                      Reload Card (₹{inrAmount.toLocaleString('en-IN')})
                    </Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Success View */
            <View style={styles.successBody}>
              <View style={styles.successIconWrap}>
                <CheckCircle2 size={42} color="#059669" />
              </View>

              <Text style={[styles.successTitle, { color: themeColors.textPrimary }]}>
                Forex Travel Card Reloaded!
              </Text>
              <Text style={[styles.successSub, { color: themeColors.textSecondary }]}>
                {activeCurrency.symbol}{successOrder.foreignAmount} credited to your RuPay Multi-Currency Card.
              </Text>

              <View style={[styles.receiptBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>Amount in INR</Text>
                  <Text style={[styles.receiptValStrong, { color: themeColors.textPrimary }]}>
                    ₹{successOrder.inrAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>Applied Rate</Text>
                  <Text style={[styles.receiptVal, { color: themeColors.textSecondary }]}>
                    1 {successOrder.currency} = ₹{successOrder.rate.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>Order Reference</Text>
                  <Text style={[styles.receiptMono, { color: themeColors.textPrimary }]}>
                    {successOrder.orderId}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>Status</Text>
                  <Text style={[styles.receiptStatus, { color: '#059669' }]}>Settled • Instant Card Balance</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                style={[styles.doneBtn, { backgroundColor: '#4F46E5' }]}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontFamily: typography.fontFamilies.bold,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.regular,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.bold,
  },
  currScroll: {
    marginTop: 4,
  },
  currRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  currChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 56,
  },
  currSymbol: {
    fontSize: 10,
    fontFamily: typography.fontFamilies.regular,
  },
  currCode: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.bold,
  },
  calcCard: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.medium,
  },
  rateValue: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.bold,
  },
  calcInputsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  calcField: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.medium,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  inputPrefix: {
    fontSize: 14,
    color: '#68645E',
    marginRight: 4,
    fontFamily: typography.fontFamilies.bold,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamilies.bold,
  },
  inrDisplayBox: {
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  inrDisplayText: {
    fontSize: 14,
    fontFamily: typography.fontFamilies.bold,
  },
  cardTargetBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  cardTargetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTargetTitle: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.bold,
    color: '#1E1B4B',
  },
  cardTargetSub: {
    fontSize: 10,
    color: '#6B7280',
  },
  zeroMarkupBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  zeroMarkupText: {
    fontSize: 9,
    fontFamily: typography.fontFamilies.bold,
    color: '#047857',
  },
  availBalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availBalText: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.regular,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    fontFamily: typography.fontFamilies.medium,
  },
  submitBtn: {
    backgroundColor: '#312E81',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radii.lg,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: typography.fontFamilies.bold,
  },
  successBody: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 17,
    fontFamily: typography.fontFamilies.bold,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.regular,
    textAlign: 'center',
    marginTop: -4,
  },
  receiptBox: {
    width: '100%',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.regular,
  },
  receiptVal: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.medium,
  },
  receiptValStrong: {
    fontSize: 14,
    fontFamily: typography.fontFamilies.bold,
  },
  receiptMono: {
    fontSize: 11,
    fontFamily: 'Courier',
    fontWeight: '600',
  },
  receiptStatus: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.bold,
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: typography.fontFamilies.bold,
  },
});
