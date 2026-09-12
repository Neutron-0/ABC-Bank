import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { typography, spacing, radii, shadows } from '../../theme';
import { serifFont } from '../../theme/typography';
import { useAppTheme } from '../../theme/ThemeContext';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { SmartAction } from '../../components/payments/SmartAction';
import { FrequentContact } from '../../components/payments/FrequentContact';
import {
  QrCode,
  Users,
  Building2,
  FileText,
  Smartphone,
  Train,
  Zap,
  Heart,
  Home,
  Wifi,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  Fingerprint,
  ShieldCheck,
  CreditCard,
} from 'lucide-react-native';

export const PaymentsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const {
    balance,
    language,
    performPayment,
    validatePin,
    triggerBiometricAuth,
    biometricsEnabled,
  } = useCustomerStore();
  const t = getTranslation(language);

  // Payment Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [payStep, setPayStep] = useState<'input' | 'pin' | 'success'>('input');
  const [payRecipient, setPayRecipient] = useState('');
  const [payCategory, setPayCategory] = useState<any>('other');
  const [payAmount, setPayAmount] = useState('');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTxId, setLastTxId] = useState('');
  const [timestamp, setTimestamp] = useState('');

  const openPayFlow = (recipient: string, defaultAmount = '', category = 'transfers') => {
    setPayRecipient(recipient);
    setPayAmount(defaultAmount ? String(defaultAmount) : '');
    setPayCategory(category);
    setPayStep('input');
    setPin('');
    setModalVisible(true);
  };

  const handleProceedToPin = () => {
    const trimmed = payAmount.trim();
    const num = parseFloat(trimmed);
    if (!trimmed || isNaN(num) || num <= 0 || !/^\d+(\.\d{1,2})?$/.test(trimmed)) {
      alert('Please enter a valid positive payment amount.');
      return;
    }
    if (num > balance.available) {
      alert(`Insufficient balance. Your available balance is ₹${balance.available.toLocaleString('en-IN')}`);
      return;
    }
    setPayStep('pin');
  };

  const handleConfirmPayment = async () => {
    const trimmed = payAmount.trim();
    const amountNum = parseFloat(trimmed);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Invalid payment amount.');
      return;
    }

    const authRes = await validatePin(pin);
    if (!authRes.valid) {
      alert(authRes.message || 'Incorrect PIN. Please try again.');
      return;
    }

    setIsProcessing(true);
    const ok = await performPayment({
      amount: amountNum,
      merchant: payRecipient,
      category: payCategory,
      description: `UPI Payment to ${payRecipient}`,
    });

    setIsProcessing(false);
    if (ok) {
      setLastTxId(`UPI/2026/${Math.floor(10000000 + Math.random() * 90000000)}`);
      setTimestamp(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
      setPayStep('success');
    } else {
      alert('Payment failed. Please check available balance.');
    }
  };

  const handleBiometricPayment = async () => {
    const trimmed = payAmount.trim();
    const amountNum = parseFloat(trimmed);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Invalid payment amount.');
      return;
    }

    setIsProcessing(true);
    const bioOk = await triggerBiometricAuth();
    if (!bioOk) {
      setIsProcessing(false);
      alert('Biometric authentication failed. Please enter your 4-digit PIN.');
      return;
    }

    const ok = await performPayment({
      amount: amountNum,
      merchant: payRecipient,
      category: payCategory,
      description: `UPI Payment to ${payRecipient}`,
    });

    setIsProcessing(false);
    if (ok) {
      setLastTxId(`UPI/2026/${Math.floor(10000000 + Math.random() * 90000000)}`);
      setTimestamp(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
      setPayStep('success');
    } else {
      alert('Payment failed. Please check available balance.');
    }
  };

  const closePayModal = () => {
    setModalVisible(false);
    setPayStep('input');
    setPayAmount('');
    setPin('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Institutional Top Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t.payments.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.payments.subtitle}</Text>
        </View>
        <View style={[styles.npciBadge, { backgroundColor: colors.cardBgSecondary, borderColor: colors.borderLight }]}>
          <ShieldCheck size={13} color={colors.primary} />
          <Text style={[styles.npciBadgeText, { color: colors.primary }]}>UPI 2.0 Secure</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Snapshot Bar */}
        <View style={[styles.balanceStrip, { backgroundColor: colors.cardBgSecondary, borderBottomColor: colors.border }]}>
          <View style={styles.balanceInfoLeft}>
            <CreditCard size={14} color={colors.textSecondary} />
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>ABC Savings •••• 4092</Text>
          </View>
          <View style={styles.balanceInfoRight}>
            <Text style={[styles.balanceLabelSmall, { color: colors.textMuted }]}>Available:</Text>
            <Text style={[styles.balanceValue, { color: colors.primary }]}>₹{balance.available.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Primary UPI Transfer Hub */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Instant Transfers</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Direct zero-fee IMPS & UPI transfers across all Indian banks
          </Text>
          <View style={[styles.actionsGrid, { borderTopColor: colors.borderLight, borderBottomColor: colors.borderLight }]}>
            <SmartAction
              label={t.payments.scanPay}
              sublabel="Any QR"
              icon={QrCode}
              onPress={() => openPayFlow('Store Merchant QR', '150', 'shopping')}
            />
            <SmartAction
              label={t.payments.payContact}
              sublabel="Phone/UPI"
              icon={Users}
              onPress={() => openPayFlow('Phone Contact UPI', '500', 'transfers')}
            />
            <SmartAction
              label={t.payments.bankTransfer}
              sublabel="A/c + IFSC"
              icon={Building2}
              onPress={() => openPayFlow('Beneficiary Account', '5000', 'transfers')}
            />
            <SmartAction
              label={t.payments.bills}
              sublabel="BBPS"
              icon={FileText}
              onPress={() => openPayFlow('Utility Bill Payment', '1450', 'bills')}
            />
          </View>
        </View>

        {/* Routine & Frequent Shortcuts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.payments.frequentShortcuts}</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            1-Tap routine transfers learned from your recurring commute and utility cycle
          </Text>

          <FrequentContact
            title="Delhi Metro Smart Card"
            subtitle="Weekday Morning Commute • 8:40 AM"
            amount={40}
            badge="Top Habit"
            icon={Train}
            onPress={() => openPayFlow('Delhi Metro Smart Card', '40', 'transport')}
          />

          <FrequentContact
            title="Tata Power Electricity"
            subtitle="Monthly Residential Bill • Due Soon"
            amount={1450}
            icon={Zap}
            onPress={() => openPayFlow('Tata Power Electricity', '1450', 'bills')}
          />

          <FrequentContact
            title="Dad (Family Support)"
            subtitle="Monthly Family Transfer • Primary Savings"
            amount={10000}
            icon={Heart}
            onPress={() => openPayFlow('Dad (Family Support)', '10000', 'transfers')}
          />

          <FrequentContact
            title="Monthly House Rent"
            subtitle="Landlord Apartment Account"
            amount={18000}
            icon={Home}
            onPress={() => openPayFlow('Monthly House Rent', '18000', 'transfers')}
          />

          <FrequentContact
            title="Airtel Prepaid Recharge"
            subtitle="Primary Mobile 5G Unlimited"
            amount={499}
            icon={Wifi}
            onPress={() => openPayFlow('Airtel Prepaid Recharge', '499', 'bills')}
          />
        </View>
      </ScrollView>

      {/* Interactive Payment Flow Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closePayModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.cardBg }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {payStep === 'input'
                    ? 'Send Payment'
                    : payStep === 'pin'
                    ? 'Authorize Transfer'
                    : 'Transfer Receipt'}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  ABC Payments Bank • Instant IMPS / UPI
                </Text>
              </View>
              <TouchableOpacity onPress={closePayModal} style={[styles.closeBtn, { backgroundColor: colors.cardBgSecondary }]}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* STEP 1: Editorial Payment Form */}
            {payStep === 'input' && (
              <View style={styles.stepBox}>
                <View style={styles.editorialField}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>RECIPIENT</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{payRecipient}</Text>
                </View>

                <View style={[styles.editorialField, { marginTop: spacing.md }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>AMOUNT</Text>
                  <View style={[styles.amountInputWrap, { backgroundColor: colors.cardBgSecondary, borderColor: colors.borderLight }]}>
                    <Text style={[styles.amountPrefix, { color: colors.textPrimary }]}>₹</Text>
                    <TextInput
                      style={[styles.amountInput, { color: colors.textPrimary }]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={payAmount}
                      onChangeText={(val) => setPayAmount(val.replace(/[^0-9.]/g, ''))}
                      autoFocus
                    />
                  </View>
                </View>

                <View style={[styles.editorialField, { marginTop: spacing.md }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>FROM</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                    ABC Bank Savings · •••• 4092
                  </Text>
                  <Text style={[styles.fieldSubValue, { color: colors.textSecondary }]}>
                    Available balance: ₹{balance.available.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* Quick Chips */}
                <View style={styles.chipsRow}>
                  {['100', '500', '1000', '2000', '5000'].map((chip) => (
                    <TouchableOpacity
                      key={chip}
                      style={[styles.chip, { backgroundColor: colors.cardBgSecondary, borderColor: colors.borderLight }]}
                      onPress={() => setPayAmount(chip)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, { color: colors.textPrimary }]}>+₹{Number(chip).toLocaleString('en-IN')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {(() => {
                  const val = parseFloat(payAmount.trim());
                  const isInvalid = !payAmount.trim() || isNaN(val) || val <= 0 || val > balance.available;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.primaryActionBtn,
                        { backgroundColor: colors.primary, marginTop: spacing.lg },
                        isInvalid && styles.disabledBtn,
                      ]}
                      onPress={handleProceedToPin}
                      disabled={isInvalid}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryActionBtnText}>Proceed to Secure PIN</Text>
                      <ArrowRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  );
                })()}
              </View>
            )}

            {/* STEP 2: UPI PIN */}
            {payStep === 'pin' && (
              <View style={styles.stepBox}>
                <View style={styles.pinLockHeader}>
                  <View style={[styles.pinIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                    <Lock size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.pinHeaderTitle, { color: colors.textPrimary }]}>Enter 4-Digit UPI PIN</Text>
                  <Text style={[styles.pinHeaderSubtitle, { color: colors.textSecondary }]}>
                    Authorizing ₹{Number(payAmount).toLocaleString('en-IN')} to {payRecipient}
                  </Text>
                </View>

                <View style={styles.pinBoxWrap}>
                  <TextInput
                    style={[styles.pinInput, { color: colors.textPrimary, backgroundColor: colors.cardBgSecondary, borderColor: colors.border }]}
                    placeholder="••••"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                    value={pin}
                    onChangeText={setPin}
                    autoFocus
                  />
                  <Text style={[styles.pinHint, { color: colors.textMuted }]}>
                    Default simulator PIN is 1234
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: colors.primary },
                    pin.length < 4 && styles.disabledBtn,
                  ]}
                  onPress={handleConfirmPayment}
                  disabled={pin.length < 4 || isProcessing}
                  activeOpacity={0.85}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryActionBtnText}>Confirm Payment</Text>
                  )}
                </TouchableOpacity>

                {biometricsEnabled && (
                  <>
                    <View style={styles.orDividerRow}>
                      <View style={[styles.orDividerLine, { backgroundColor: colors.border }]} />
                      <Text style={[styles.orDividerText, { color: colors.textMuted }]}>OR USE BIOMETRICS</Text>
                      <View style={[styles.orDividerLine, { backgroundColor: colors.border }]} />
                    </View>

                    <TouchableOpacity
                      style={[styles.paymentsBioBtn, { backgroundColor: colors.cardBgSecondary, borderColor: colors.border }]}
                      onPress={handleBiometricPayment}
                      disabled={isProcessing}
                      activeOpacity={0.8}
                    >
                      <Fingerprint size={20} color={colors.primary} />
                      <Text style={[styles.paymentsBioBtnText, { color: colors.primary }]}>Authorize with Biometrics</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION RECEIPT */}
            {payStep === 'success' && (
              <View style={styles.successBox}>
                <View style={[styles.successIconCircle, { backgroundColor: colors.cardBgSecondary, borderWidth: 1, borderColor: colors.borderLight }]}>
                  <CheckCircle2 size={36} color={colors.primary} />
                </View>
                <Text style={[styles.successTitle, { color: colors.textPrimary }]}>{t.payments.paymentSuccess}</Text>
                <Text style={[styles.successAmount, { color: colors.textPrimary }]}>₹{Number(payAmount).toLocaleString('en-IN')}</Text>
                <Text style={[styles.successRecipient, { color: colors.textSecondary }]}>Transferred to {payRecipient}</Text>

                {/* Institutional Payment Slip */}
                <View style={[styles.receiptCard, { backgroundColor: colors.cardBgSecondary, borderColor: colors.border }]}>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>UPI Reference No.</Text>
                    <Text style={[styles.receiptVal, { color: colors.textPrimary }]}>{lastTxId}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Date & Time</Text>
                    <Text style={[styles.receiptVal, { color: colors.textPrimary }]}>{timestamp || 'Just Now'}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Debited From</Text>
                    <Text style={[styles.receiptVal, { color: colors.textPrimary }]}>ABC Bank A/c •••• 4092</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Transfer Status</Text>
                    <Text style={[styles.receiptVal, { color: colors.success }]}>Success (NPCI Cleared)</Text>
                  </View>
                  <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Updated Available Balance</Text>
                    <Text style={[styles.receiptVal, { color: colors.primary }]}>₹{balance.available.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: colors.primary, width: '100%' }]}
                  onPress={closePayModal}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryActionBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  npciBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  npciBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  balanceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  balanceInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceLabel: {
    ...typography.captionMedium,
    fontSize: 12,
  },
  balanceInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceLabelSmall: {
    fontSize: 11,
  },
  balanceValue: {
    ...typography.captionMedium,
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: spacing.lg,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.full,
  },
  stepBox: {
    paddingVertical: spacing.xs,
  },
  editorialField: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  fieldSubValue: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  amountPrefix: {
    fontFamily: serifFont,
    fontSize: 30,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  amountInput: {
    fontFamily: serifFont,
    fontSize: 32,
    fontWeight: '700',
    minWidth: 120,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  accountChoice: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  accountChoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountChoiceLabel: {
    ...typography.tiny,
    textTransform: 'uppercase',
  },
  accountChoiceType: {
    fontSize: 11,
    fontWeight: '600',
  },
  accountChoiceValue: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  accountChoiceBalance: {
    ...typography.caption,
    marginTop: 2,
  },
  primaryActionBtn: {
    paddingVertical: 14,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  primaryActionBtnText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  pinLockHeader: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  pinIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  pinHeaderTitle: {
    ...typography.h3,
    fontSize: 17,
  },
  pinHeaderSubtitle: {
    ...typography.caption,
    marginTop: 2,
    textAlign: 'center',
  },
  pinBoxWrap: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  pinInput: {
    fontSize: 28,
    letterSpacing: 14,
    textAlign: 'center',
    width: 160,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  pinHint: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  successTitle: {
    ...typography.h3,
    fontSize: 18,
  },
  successAmount: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: 4,
  },
  successRecipient: {
    ...typography.caption,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  receiptCard: {
    width: '100%',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  receiptLabel: {
    ...typography.caption,
    fontSize: 12,
  },
  receiptVal: {
    ...typography.captionMedium,
    fontWeight: '600',
    fontSize: 12,
  },
  receiptDivider: {
    height: 1,
    marginVertical: 4,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: spacing.md,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
  },
  orDividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  paymentsBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.md,
    paddingVertical: 12,
    borderWidth: 1,
  },
  paymentsBioBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
