import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import {
  Fingerprint,
  ShieldCheck,
  Delete,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Receipt,
  ArrowRight,
} from 'lucide-react-native';

export const PaymentAuthModal: React.FC = () => {
  const {
    authModal,
    closePaymentAuth,
    performPayment,
    validatePin,
    triggerBiometricAuth,
    biometricsEnabled,
    balance,
    language,
  } = useCustomerStore();
  const t = getTranslation(language);

  // Stage: 'auth' | 'receipt'
  const [stage, setStage] = useState<'auth' | 'receipt'>('auth');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthenticatingBio, setIsAuthenticatingBio] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [txRefId, setTxRefId] = useState<string>('');
  const [authMethodUsed, setAuthMethodUsed] = useState<'PIN' | 'Biometrics'>('PIN');

  // Animations
  const [pulseAnim] = useState(new Animated.Value(1));
  const [receiptAnim] = useState(new Animated.Value(0));
  const [shakeAnim] = useState(new Animated.Value(0));
  const autoDismissTimerRef = useRef<any>(null);

  useEffect(() => {
    if (authModal?.isOpen) {
      setStage('auth');
      setPin('');
      setErrorMsg(null);
      setIsAuthenticatingBio(false);
      setBioSuccess(false);
      setIsProcessingTx(false);
      setTxRefId(`UPI/2026/09/ABC${Math.floor(10000000 + Math.random() * 90000000)}`);
      receiptAnim.setValue(0);
      shakeAnim.setValue(0);
    } else {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    }
  }, [authModal?.isOpen]);

  if (!authModal?.isOpen || !authModal.paymentData) {
    return null;
  }

  const { paymentData, onAuthSuccess } = authModal;

  const triggerErrorShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (digit: string) => {
    if (isProcessingTx || bioSuccess || stage !== 'auth') return;
    setErrorMsg(null);
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPinAndExecute(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (isProcessingTx || bioSuccess || stage !== 'auth') return;
    setErrorMsg(null);
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const verifyPinAndExecute = async (inputPin: string) => {
    setIsProcessingTx(true);
    const valid = validatePin(inputPin);
    if (!valid) {
      triggerErrorShake();
      setTimeout(() => {
        setIsProcessingTx(false);
        setPin('');
        setErrorMsg(
          language === 'hi'
            ? 'गलत 4-अंकीय पिन दर्ज किया गया। पुनः प्रयास करें।'
            : language === 'gu'
            ? 'ખોટો 4-અંકનો PIN દાખલ કર્યો. ફરી પ્રયાસ કરો.'
            : 'Incorrect 4-digit PIN entered. Please try again.'
        );
      }, 400);
      return;
    }

    // PIN is valid: execute payment and transition to receipt
    setAuthMethodUsed('PIN');
    const success = await performPayment(paymentData);
    setIsProcessingTx(false);
    if (success) {
      if (onAuthSuccess) onAuthSuccess();
      transitionToReceipt();
    } else {
      triggerErrorShake();
      setErrorMsg(
        language === 'hi'
          ? 'अपर्याप्त शेष राशि या लेनदेन त्रुटि।'
          : language === 'gu'
          ? 'અપૂરતું બેલેન્સ અથવા વ્યવહાર નિષ્ફળ.'
          : 'Insufficient balance or payment processing failed.'
      );
    }
  };

  const handleBiometricAuth = async () => {
    if (isProcessingTx || isAuthenticatingBio || stage !== 'auth') return;
    setIsAuthenticatingBio(true);
    setErrorMsg(null);

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.18, duration: 250, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 250, useNativeDriver: true }),
    ]).start();

    const ok = await triggerBiometricAuth();
    if (ok) {
      setBioSuccess(true);
      setIsAuthenticatingBio(false);
      setIsProcessingTx(true);
      setAuthMethodUsed('Biometrics');

      const success = await performPayment(paymentData);
      setIsProcessingTx(false);
      if (success) {
        if (onAuthSuccess) onAuthSuccess();
        transitionToReceipt();
      } else {
        setBioSuccess(false);
        triggerErrorShake();
        setErrorMsg(
          language === 'hi'
            ? 'अपर्याप्त शेष राशि।'
            : language === 'gu'
            ? 'અપૂરતું બેલેન્સ.'
            : 'Insufficient available balance.'
        );
      }
    } else {
      setIsAuthenticatingBio(false);
      triggerErrorShake();
      setErrorMsg(
        language === 'hi'
          ? 'बायोमेट्रिक प्रमाणीकरण विफल रहा। पिन दर्ज करें।'
          : language === 'gu'
          ? 'બાયોમેટ્રિક નિષ્ફળ. કૃપા કરીને PIN દાખલ કરો.'
          : 'Biometric authorization failed. Please enter PIN.'
      );
    }
  };

  const transitionToReceipt = () => {
    setStage('receipt');
    Animated.spring(receiptAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Auto-dismiss after 3.2 seconds
    autoDismissTimerRef.current = setTimeout(() => {
      handleFinish();
    }, 3200);
  };

  const handleFinish = () => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }
    closePaymentAuth();
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={handleFinish}>
      <View style={styles.overlay}>
        {stage === 'auth' ? (
          // =========================================================================
          // STAGE 1: INSTITUTIONAL PAYMENT AUTHORIZATION SHEET
          // =========================================================================
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.topRow}>
              <View style={styles.securityTag}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.securityTagText}>
                  {language === 'hi'
                    ? 'सुरक्षित बैंक भुगतान प्राधिकरण'
                    : language === 'gu'
                    ? 'સુરક્ષિત બેંક ચુકવણી પ્રમાણીકરણ'
                    : 'INSTITUTIONAL PAYMENT AUTHORIZATION'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closePaymentAuth}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                disabled={isProcessingTx}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Transaction Overview Card */}
            <View style={styles.paymentSummaryCard}>
              <View style={styles.merchantHeaderRow}>
                <View style={styles.merchantAvatarCircle}>
                  <Building2 size={18} color="#0F294A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payingToLabel}>
                    {language === 'hi' ? 'भुगतान प्राप्तकर्ता' : language === 'gu' ? 'ચુકવણી પ્રાપ્તકર્તા' : 'PAYING TO'}
                  </Text>
                  <Text style={styles.merchantTitle} numberOfLines={1}>
                    {paymentData.merchant}
                  </Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{(paymentData.category || 'UPI').toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.amountWrap}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <Text style={styles.amountDisplay}>
                  {paymentData.amount.toLocaleString('en-IN')}.00
                </Text>
              </View>

              <View style={styles.debitInfoRow}>
                <Text style={styles.accountSourceText}>
                  Debiting A/C 5010 •••• 4092
                </Text>
                <View style={styles.balanceBadge}>
                  <Text style={styles.balanceBadgeText}>
                    Available ₹{balance.available.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Biometrics Option */}
            {biometricsEnabled && (
              <TouchableOpacity
                style={[
                  styles.biometricButton,
                  bioSuccess && styles.biometricButtonSuccess,
                  isAuthenticatingBio && styles.biometricButtonScanning,
                ]}
                onPress={handleBiometricAuth}
                activeOpacity={0.8}
                disabled={isProcessingTx || bioSuccess}
              >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  {bioSuccess ? (
                    <CheckCircle2 size={22} color="#059669" />
                  ) : isAuthenticatingBio ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <Fingerprint size={22} color="#0F294A" />
                  )}
                </Animated.View>
                <View style={styles.biometricTextWrap}>
                  <Text
                    style={[
                      styles.biometricButtonTitle,
                      bioSuccess && { color: '#059669' },
                    ]}
                  >
                    {bioSuccess
                      ? language === 'hi'
                        ? 'बायोमेट्रिक सत्यापित'
                        : language === 'gu'
                        ? 'બાયોમેટ્રિક ચકાસાયેલ'
                        : 'Biometric Verified'
                      : isAuthenticatingBio
                      ? language === 'hi'
                        ? 'स्कैनिंग फिंगरप्रिंट / फेस आईडी...'
                        : language === 'gu'
                        ? 'સ્કેનિંગ ફિંગરપ્રિન્ટ / ફેસ આઈડી...'
                        : 'Scanning Fingerprint / Face ID...'
                      : language === 'hi'
                      ? 'बायोमेट्रिक से 1-टैप भुगतान करें'
                      : language === 'gu'
                      ? 'બાયોમેટ્રિકથી 1-ટેપ ચુકવણી કરો'
                      : 'Authorize via Fingerprint / Face ID'}
                  </Text>
                  <Text style={styles.biometricButtonSubtitle}>
                    {language === 'hi'
                      ? 'सुरक्षित हार्डवेयर टोकन'
                      : language === 'gu'
                      ? 'સુરક્ષિત હાર્ડવેર ટોકન'
                      : 'Hardware-backed biometric enclave'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.separatorRow}>
              <View style={styles.sepLine} />
              <Text style={styles.sepText}>
                {language === 'hi'
                  ? 'या 4-अंकीय यूपीआई पिन दर्ज करें'
                  : language === 'gu'
                  ? 'અથવા 4-અંકનો UPI PIN દાખલ કરો'
                  : 'OR ENTER 4-DIGIT SECURITY PIN'}
              </Text>
              <View style={styles.sepLine} />
            </View>

            {/* PIN Dots Area */}
            <Animated.View style={[styles.pinSection, { transform: [{ translateX: shakeAnim }] }]}>
              <View style={styles.pinDotsRow}>
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.pinDot,
                        filled && styles.pinDotFilled,
                        errorMsg && styles.pinDotError,
                      ]}
                    />
                  );
                })}
              </View>

              {errorMsg && (
                <View style={styles.errorRow}>
                  <AlertCircle size={13} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {isProcessingTx && (
                <View style={styles.processingRow}>
                  <ActivityIndicator size="small" color="#0F294A" />
                  <Text style={styles.processingText}>
                    {language === 'hi'
                      ? 'लेनदेन सुरक्षित रूप से संसाधित हो रहा है...'
                      : language === 'gu'
                      ? 'વ્યવહાર સુરક્ષિત રીતે પ્રક્રિયા થઈ રહ્યો છે...'
                      : 'Authorizing institutional transfer...'}
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Numeric Keypad */}
            <View style={styles.keypad}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['', '0', 'del'],
              ].map((row, rowIdx) => (
                <View key={rowIdx} style={styles.keypadRow}>
                  {row.map((key, colIdx) => {
                    if (key === '') {
                      return <View key={colIdx} style={styles.keypadEmptyKey} />;
                    }
                    if (key === 'del') {
                      return (
                        <TouchableOpacity
                          key={colIdx}
                          style={styles.keypadKey}
                          onPress={handleDelete}
                          activeOpacity={0.6}
                          disabled={isProcessingTx}
                        >
                          <Delete size={20} color="#334155" />
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={colIdx}
                        style={styles.keypadKey}
                        onPress={() => handleKeyPress(key)}
                        activeOpacity={0.6}
                        disabled={isProcessingTx}
                      >
                        <Text style={styles.keypadKeyText}>{key}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        ) : (
          // =========================================================================
          // STAGE 2: INSTITUTIONAL PAYMENT RECEIPT & CONFIRMATION SCREEN
          // =========================================================================
          <Animated.View
            style={[
              styles.receiptSheet,
              {
                opacity: receiptAnim,
                transform: [
                  {
                    scale: receiptAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.93, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Top Success Badge */}
            <View style={styles.receiptTopCircle}>
              <CheckCircle2 size={36} color="#059669" />
            </View>

            <Text style={styles.receiptSuccessTitle}>
              {language === 'hi'
                ? 'भुगतान सफलतापूर्वक पूरा हुआ'
                : language === 'gu'
                ? 'ચુકવણી સફળતાપૂર્વક પૂર્ણ થઈ'
                : 'Payment Successful'}
            </Text>

            <Text style={styles.receiptMerchantSubtitle}>
              {language === 'hi' ? 'भुगतान प्राप्तकर्ता:' : language === 'gu' ? 'ચુકવણી પ્રાપ્તકર્તા:' : 'Paid to'}{' '}
              <Text style={{ fontWeight: '700', color: '#0F172A' }}>{paymentData.merchant}</Text>
            </Text>

            <View style={styles.receiptAmountBox}>
              <Text style={styles.receiptAmountText}>
                ₹{paymentData.amount.toLocaleString('en-IN')}.00
              </Text>
              <View style={styles.receiptStatusPill}>
                <ShieldCheck size={12} color="#059669" />
                <Text style={styles.receiptStatusPillText}>
                  {authMethodUsed === 'Biometrics' ? 'Verified by Biometrics' : 'Authorized by UPI PIN'}
                </Text>
              </View>
            </View>

            {/* Official Receipt Ledger Card */}
            <View style={styles.receiptLedgerCard}>
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>UPI Ref Number</Text>
                <Text style={styles.ledgerValue}>{txRefId}</Text>
              </View>
              <View style={styles.ledgerDivider} />
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>Debited From</Text>
                <Text style={styles.ledgerValue}>ABC Bank A/C •••• 4092</Text>
              </View>
              <View style={styles.ledgerDivider} />
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>Updated Balance</Text>
                <Text style={[styles.ledgerValue, { color: '#059669' }]}>
                  ₹{balance.available.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.ledgerDivider} />
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>Payment Mode</Text>
                <Text style={styles.ledgerValue}>Instant Institutional UPI</Text>
              </View>
            </View>

            {/* Done Button */}
            <TouchableOpacity
              style={styles.receiptDoneButton}
              onPress={handleFinish}
              activeOpacity={0.85}
            >
              <Text style={styles.receiptDoneButtonText}>
                {language === 'hi' ? 'संपन्न (Done)' : language === 'gu' ? 'સંપન્ન (Done)' : 'Done'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.receiptDismissHint}>
              {language === 'hi'
                ? 'स्वचालित रूप से बंद हो रहा है...'
                : language === 'gu'
                ? 'આપોઆપ બંધ થઈ રહ્યું છે...'
                : 'Closing automatically...'}
            </Text>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    ...shadows.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  securityTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.sm,
  },
  merchantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  merchantAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payingToLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  merchantTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  rupeeSymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F294A',
    marginRight: 2,
  },
  amountDisplay: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F294A',
    letterSpacing: -0.5,
  },
  debitInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
  },
  accountSourceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  balanceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  balanceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: spacing.xs,
  },
  biometricButtonScanning: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  biometricButtonSuccess: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  biometricTextWrap: {
    flex: 1,
  },
  biometricButtonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F294A',
  },
  biometricButtonSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  sepLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  sepText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  pinSection: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#0F294A',
    borderColor: '#0F294A',
  },
  pinDotError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  processingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F294A',
  },
  keypad: {
    marginTop: 4,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  keypadKey: {
    width: 68,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keypadEmptyKey: {
    width: 68,
    height: 44,
  },
  keypadKeyText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F294A',
  },

  // Receipt Styles
  receiptSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  receiptTopCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    borderWidth: 3,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  receiptSuccessTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  receiptMerchantSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: spacing.md,
  },
  receiptAmountBox: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  receiptAmountText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: -0.5,
  },
  receiptStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginTop: 6,
  },
  receiptStatusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  receiptLedgerCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  ledgerValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  ledgerDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  receiptDoneButton: {
    width: '100%',
    backgroundColor: '#0F294A',
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  receiptDoneButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  receiptDismissHint: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
});
