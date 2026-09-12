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
import { colors, typography, spacing, radii, shadows } from '../../theme';
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
} from 'lucide-react-native';

export const PaymentsScreen: React.FC = () => {
  const {
    balance,
    language,
    performPayment,
    transactions,
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

    if (!validatePin(pin)) {
      alert('Incorrect PIN. Please try again (default PIN is 1234).');
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.payments.title}</Text>
        <Text style={styles.subtitle}>{t.payments.subtitle}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Snapshot */}
        <View style={styles.balanceStrip}>
          <Text style={styles.balanceLabel}>UPI Linked Account Balance:</Text>
          <Text style={styles.balanceValue}>₹{balance.available.toLocaleString('en-IN')}</Text>
        </View>

        {/* Smart Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart UPI Actions</Text>
          <View style={styles.actionsGrid}>
            <SmartAction
              label={t.payments.scanPay}
              icon={QrCode}
              color="#2563EB"
              onPress={() => openPayFlow('Store Merchant QR', '150', 'shopping')}
            />
            <SmartAction
              label={t.payments.payContact}
              icon={Users}
              color="#0D9488"
              onPress={() => openPayFlow('Phone Contact UPI', '500', 'transfers')}
            />
            <SmartAction
              label={t.payments.bankTransfer}
              icon={Building2}
              color="#7C3AED"
              onPress={() => openPayFlow('Beneficiary Account', '5000', 'transfers')}
            />
            <SmartAction
              label={t.payments.bills}
              icon={FileText}
              color="#D97706"
              onPress={() => openPayFlow('Utility Bill Payment', '1450', 'bills')}
            />
          </View>
        </View>

        {/* Frequent Shortcuts with Repeated Intent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.payments.frequentShortcuts}</Text>
          <Text style={styles.sectionSubtitle}>
            Learned from your recurring habits and routine commute
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
            subtitle="Monthly Residential Bill"
            amount={1450}
            icon={Zap}
            onPress={() => openPayFlow('Tata Power Electricity', '1450', 'bills')}
          />

          <FrequentContact
            title="Dad (Family Support)"
            subtitle="Frequent Monthly UPI Transfer"
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
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {payStep === 'input'
                  ? 'Send UPI Payment'
                  : payStep === 'pin'
                  ? 'Authorize Payment'
                  : 'Payment Receipt'}
              </Text>
              <TouchableOpacity onPress={closePayModal} style={styles.closeBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* STEP 1: Enter Amount */}
            {payStep === 'input' && (
              <View style={styles.stepBox}>
                <Text style={styles.recipientLabel}>{t.payments.payingTo}</Text>
                <Text style={styles.recipientName}>{payRecipient}</Text>

                <View style={styles.amountInputWrap}>
                  <Text style={styles.amountPrefix}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={payAmount}
                    onChangeText={(val) => setPayAmount(val.replace(/[^0-9.]/g, ''))}
                    autoFocus
                  />
                </View>

                {/* Quick Chips */}
                <View style={styles.chipsRow}>
                  {['40', '500', '1000', '2000', '5000'].map((chip) => (
                    <TouchableOpacity
                      key={chip}
                      style={styles.chip}
                      onPress={() => setPayAmount(chip)}
                    >
                      <Text style={styles.chipText}>+₹{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.accountChoice}>
                  <Text style={styles.accountChoiceLabel}>Debiting Account</Text>
                  <Text style={styles.accountChoiceValue}>
                    Bharat Primary Savings (₹{balance.available.toLocaleString('en-IN')})
                  </Text>
                </View>

                {(() => {
                  const val = parseFloat(payAmount.trim());
                  const isInvalid = !payAmount.trim() || isNaN(val) || val <= 0 || val > balance.available;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.primaryActionBtn,
                        isInvalid && styles.disabledBtn,
                      ]}
                      onPress={handleProceedToPin}
                      disabled={isInvalid}
                    >
                      <Text style={styles.primaryActionBtnText}>Proceed to Secure PIN</Text>
                      <ArrowRight size={16} color={colors.textWhite} />
                    </TouchableOpacity>
                  );
                })()}
              </View>
            )}

            {/* STEP 2: UPI PIN */}
            {payStep === 'pin' && (
              <View style={styles.stepBox}>
                <View style={styles.pinLockHeader}>
                  <Lock size={24} color={colors.primary} />
                  <Text style={styles.pinHeaderTitle}>Enter 4-Digit UPI PIN</Text>
                  <Text style={styles.pinHeaderSubtitle}>
                    Authorizing ₹{Number(payAmount).toLocaleString('en-IN')} to {payRecipient}
                  </Text>
                </View>

                <View style={styles.pinBoxWrap}>
                  <TextInput
                    style={styles.pinInput}
                    placeholder="••••"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                    value={pin}
                    onChangeText={setPin}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, pin.length < 4 && styles.disabledBtn]}
                  onPress={handleConfirmPayment}
                  disabled={pin.length < 4 || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color={colors.textWhite} />
                  ) : (
                    <Text style={styles.primaryActionBtnText}>Confirm with PIN</Text>
                  )}
                </TouchableOpacity>

                {biometricsEnabled && (
                  <>
                    <View style={styles.orDividerRow}>
                      <View style={styles.orDividerLine} />
                      <Text style={styles.orDividerText}>OR</Text>
                      <View style={styles.orDividerLine} />
                    </View>

                    <TouchableOpacity
                      style={styles.paymentsBioBtn}
                      onPress={handleBiometricPayment}
                      disabled={isProcessing}
                      activeOpacity={0.8}
                    >
                      <Fingerprint size={20} color="#0F294A" />
                      <Text style={styles.paymentsBioBtnText}>Authorize via Fingerprint / Face ID</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* STEP 3: SUCCESS ANIMATION */}
            {payStep === 'success' && (
              <View style={styles.successBox}>
                <View style={styles.successIconCircle}>
                  <CheckCircle2 size={44} color={colors.success} />
                </View>
                <Text style={styles.successTitle}>{t.payments.paymentSuccess}</Text>
                <Text style={styles.successAmount}>₹{Number(payAmount).toLocaleString('en-IN')}</Text>
                <Text style={styles.successRecipient}>Transferred to {payRecipient}</Text>

                <View style={styles.receiptCard}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Reference ID</Text>
                    <Text style={styles.receiptVal}>{lastTxId}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Status</Text>
                    <Text style={[styles.receiptVal, { color: colors.success }]}>Completed</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>New Balance</Text>
                    <Text style={styles.receiptVal}>₹{balance.available.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                <Text style={styles.successSubtext}>{t.payments.paymentSubtext}</Text>

                <TouchableOpacity style={styles.primaryActionBtn} onPress={closePayModal}>
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
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  balanceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  balanceLabel: {
    ...typography.captionMedium,
    color: colors.primaryDark,
  },
  balanceValue: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    backgroundColor: colors.cardBg,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '90%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  stepBox: {
    paddingVertical: spacing.sm,
  },
  recipientLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  recipientName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  amountPrefix: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 120,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  accountChoice: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountChoiceLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  accountChoiceValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  primaryActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  primaryActionBtnText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  pinLockHeader: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  pinHeaderTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  pinHeaderSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  pinBoxWrap: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  pinInput: {
    fontSize: 32,
    letterSpacing: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    width: 180,
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  successTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  successRecipient: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  receiptVal: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  successSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
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
    backgroundColor: colors.border,
  },
  orDividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  paymentsBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  paymentsBioBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F294A',
  },
});
