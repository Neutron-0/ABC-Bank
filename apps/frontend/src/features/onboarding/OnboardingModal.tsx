import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { LanguageCode } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Fingerprint,
  Phone,
  MessageSquare,
  Check,
  AlertCircle,
  Delete,
  Building2,
  X,
} from 'lucide-react-native';

interface Props {
  visible: boolean;
  onFinish: () => void;
}

export const OnboardingModal: React.FC<Props> = ({ visible, onFinish }) => {
  const { language, setLanguage, setSecurityCredentials, showToast } = useCustomerStore();
  const t = getTranslation(language);

  // Steps: 1 = Language, 2 = Phone, 3 = OTP, 4 = Set PIN, 5 = Biometrics, 6 = Success
  const [step, setStep] = useState<number>(1);
  const [phone, setPhone] = useState<string>('9876543210');
  const [otp, setOtp] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [isConfirmingPin, setIsConfirmingPin] = useState<boolean>(false);
  const [biometricsOn, setBiometricsOn] = useState<boolean>(true);
  const [isBioTesting, setIsBioTesting] = useState<boolean>(false);
  const [bioTested, setBioTested] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bioPulse] = useState(new Animated.Value(1));

  if (!visible) return null;

  const handleSendOtp = () => {
    if (phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg(null);
    setStep(3);
    setOtp('');
  };

  const handleVerifyOtp = () => {
    if (otp.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP');
      return;
    }
    setErrorMsg(null);
    setStep(4);
    setPin('');
    setConfirmPin('');
    setIsConfirmingPin(false);
  };

  const handlePinKeyPress = (digit: string) => {
    setErrorMsg(null);
    if (!isConfirmingPin) {
      if (pin.length < 4) {
        const next = pin + digit;
        setPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            setIsConfirmingPin(true);
          }, 250);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const next = confirmPin + digit;
        setConfirmPin(next);
        if (next.length === 4) {
          if (next === pin) {
            setTimeout(() => {
              setStep(5);
            }, 300);
          } else {
            setErrorMsg('PIN mismatch. Please set PIN again.');
            setTimeout(() => {
              setPin('');
              setConfirmPin('');
              setIsConfirmingPin(false);
            }, 600);
          }
        }
      }
    }
  };

  const handlePinDelete = () => {
    setErrorMsg(null);
    if (!isConfirmingPin) {
      if (pin.length > 0) setPin(pin.slice(0, -1));
    } else {
      if (confirmPin.length > 0) setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleTestBiometrics = () => {
    setIsBioTesting(true);
    Animated.sequence([
      Animated.timing(bioPulse, { toValue: 1.25, duration: 250, useNativeDriver: true }),
      Animated.timing(bioPulse, { toValue: 1.0, duration: 250, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      setIsBioTesting(false);
      setBioTested(true);
      showToast('Biometric sensor verified!');
    }, 700);
  };

  const handleCompleteRegistration = () => {
    setSecurityCredentials(pin || '1234', biometricsOn, `+91 ${phone}`);
    setStep(6);
  };

  const handleFinishAndEnter = () => {
    onFinish();
    setStep(1);
  };

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onFinish}>
      <View style={styles.container}>
        {/* Progress Tracker */}
        <View style={styles.headerBar}>
          <Text style={styles.headerStepText}>
            STEP {step} OF 6 • {step === 1 ? 'LANGUAGE' : step === 2 ? 'MOBILE' : step === 3 ? 'VERIFY OTP' : step === 4 ? 'SECURITY PIN' : step === 5 ? 'BIOMETRICS' : 'LINKED'}
          </Text>
          <TouchableOpacity onPress={onFinish} style={styles.skipBtn}>
            <X size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${(step / 6) * 100}%` }]} />
        </View>

        {/* STEP 1: WELCOME & LANGUAGE SELECTION */}
        {step === 1 && (
          <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
            <View style={styles.heroLogoWrap}>
              <Building2 size={36} color="#0F294A" />
            </View>
            <Text style={styles.heroTitle}>{t.onboarding.welcomeTitle}</Text>
            <Text style={styles.heroSubtitle}>{t.onboarding.welcomeSubtitle}</Text>

            <View style={styles.cardContainer}>
              <Text style={styles.cardSectionLabel}>{t.onboarding.chooseLanguage}</Text>
              {[
                { code: 'en' as LanguageCode, label: 'English', sub: 'Institutional standard' },
                { code: 'hi' as LanguageCode, label: 'हिंदी (Hindi)', sub: 'सुगम और सुरक्षित बैंकिंग' },
                { code: 'gu' as LanguageCode, label: 'ગુજરાતી (Gujarati)', sub: 'સરળ અને ડિજિટલ બેંકિંગ' },
              ].map((item) => {
                const active = language === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.langRow, active && styles.activeLangRow]}
                    onPress={() => setLanguage(item.code)}
                  >
                    <View>
                      <Text style={[styles.langName, active && styles.activeLangName]}>
                        {item.label}
                      </Text>
                      <Text style={styles.langSub}>{item.sub}</Text>
                    </View>
                    {active && <Check size={18} color="#0F294A" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
              <Text style={styles.primaryBtnText}>
                {language === 'hi' ? 'आगे बढ़ें' : language === 'gu' ? 'આગળ વધો' : 'Continue'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 2: MOBILE NUMBER ENTRY */}
        {step === 2 && (
          <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.heroLogoWrap, { backgroundColor: '#EFF6FF' }]}>
              <Phone size={32} color="#2563EB" />
            </View>
            <Text style={styles.heroTitle}>
              {language === 'hi' ? 'अपना मोबाइल नंबर दर्ज करें' : language === 'gu' ? 'તમારો મોબાઇલ નંબર દાખલ કરો' : 'Enter Your Mobile Number'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {language === 'hi'
                ? 'हम आपके बैंक-लिंक्ड खाते को खोजने के लिए एक सुरक्षित ओटीपी भेजेंगे।'
                : language === 'gu'
                ? 'અમે તમારા બેંક ખાતા સાથે જોડાયેલ નંબર પર સુરક્ષિત OTP મોકલીશું.'
                : 'We will send a one-time passcode to securely link your bank account.'}
            </Text>

            <View style={styles.phoneInputCard}>
              <Text style={styles.inputPrefix}>+91</Text>
              <View style={styles.inputDivider} />
              <TextInput
                style={styles.phoneTextInput}
                value={phone}
                onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, '').slice(0, 10))}
                keyboardType="numeric"
                placeholder="9876543210"
                maxLength={10}
              />
            </View>

            {errorMsg && (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color="#DC2626" />
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.trustBadge}>
              <ShieldCheck size={16} color="#059669" />
              <Text style={styles.trustBadgeText}>
                RBI Regulated • 256-Bit Bank-Grade Tokenization
              </Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp}>
              <Text style={styles.primaryBtnText}>
                {language === 'hi' ? 'ओटीपी प्राप्त करें' : language === 'gu' ? 'OTP મેળવો' : 'Send 6-Digit OTP'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 3: 6-DIGIT OTP VERIFICATION */}
        {step === 3 && (
          <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
            {/* Simulated SMS Notification Banner */}
            <TouchableOpacity
              style={styles.smsBanner}
              onPress={() => setOtp('482910')}
              activeOpacity={0.85}
            >
              <View style={styles.smsHeader}>
                <MessageSquare size={13} color="#2563EB" />
                <Text style={styles.smsSender}>MESSAGES • ABC BANK</Text>
              </View>
              <Text style={styles.smsBody}>
                482910 is your ABC Bank registration code. Tap here to auto-fill.
              </Text>
            </TouchableOpacity>

            <Text style={styles.heroTitle}>
              {language === 'hi' ? 'ओटीपी सत्यापित करें' : language === 'gu' ? 'OTP ચકાસો' : 'Verify Mobile OTP'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {language === 'hi'
                ? `+91 ${phone} पर 6-अंकीय कोड भेजा गया है`
                : language === 'gu'
                ? `+91 ${phone} પર 6-અંકનો કોડ મોકલાયો છે`
                : `Enter the 6-digit code sent to +91 ${phone}`}
            </Text>

            {/* OTP 6-Box Display */}
            <View style={styles.otpBoxesRow}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <View
                  key={idx}
                  style={[
                    styles.otpBox,
                    otp.length > idx && styles.otpBoxFilled,
                  ]}
                >
                  <Text style={styles.otpBoxDigit}>{otp[idx] || ''}</Text>
                </View>
              ))}
            </View>

            {/* Hidden/Direct input */}
            <TextInput
              style={styles.hiddenInput}
              value={otp}
              onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />

            {errorMsg && (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color="#DC2626" />
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.autoFillButton}
              onPress={() => setOtp('482910')}
            >
              <Text style={styles.autoFillButtonText}>
                {language === 'hi' ? 'कोड 482910 स्वतः भरें' : language === 'gu' ? 'કોડ 482910 આપોઆપ ભરો' : 'Tap to Auto-Fill 482910'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp}>
              <Text style={styles.primaryBtnText}>
                {language === 'hi' ? 'ओटीपी सत्यापित करें' : language === 'gu' ? 'OTP ચકાસો' : 'Verify & Set PIN'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 4: SET 4-DIGIT SECURITY PIN */}
        {step === 4 && (
          <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.heroLogoWrap, { backgroundColor: '#F1F5F9' }]}>
              <Lock size={32} color="#0F294A" />
            </View>
            <Text style={styles.heroTitle}>
              {!isConfirmingPin
                ? language === 'hi'
                  ? '4-अंकीय सुरक्षा पिन सेट करें'
                  : language === 'gu'
                  ? '4-અંકનો સુરક્ષા PIN સેટ કરો'
                  : 'Set 4-Digit Security PIN'
                : language === 'hi'
                ? 'अपने पिन की पुष्टि करें'
                : language === 'gu'
                ? 'તમારા PIN ની પુષ્ટિ કરો'
                : 'Confirm Your 4-Digit PIN'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {!isConfirmingPin
                ? 'Use this PIN for fast sign-in and authorizing UPI transactions'
                : 'Re-enter your 4-digit PIN to ensure accuracy'}
            </Text>

            {/* PIN Dots */}
            <View style={styles.pinDotsContainer}>
              {[0, 1, 2, 3].map((idx) => {
                const currentStr = isConfirmingPin ? confirmPin : pin;
                const filled = currentStr.length > idx;
                return (
                  <View
                    key={idx}
                    style={[styles.pinCircle, filled && styles.pinCircleFilled]}
                  />
                );
              })}
            </View>

            {errorMsg && (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color="#DC2626" />
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            )}

            {/* Numeric Keypad */}
            <View style={styles.pinKeypad}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['', '0', 'del'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((val, cIdx) => {
                    if (val === '') return <View key={cIdx} style={styles.keypadEmpty} />;
                    if (val === 'del') {
                      return (
                        <TouchableOpacity
                          key={cIdx}
                          style={styles.keypadButton}
                          onPress={handlePinDelete}
                        >
                          <Delete size={20} color="#334155" />
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={cIdx}
                        style={styles.keypadButton}
                        onPress={() => handlePinKeyPress(val)}
                      >
                        <Text style={styles.keypadButtonText}>{val}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* STEP 5: BIOMETRIC REGISTRATION & TESTING */}
        {step === 5 && (
          <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.heroLogoWrap, { backgroundColor: '#ECFDF5' }]}>
              <Fingerprint size={36} color="#059669" />
            </View>
            <Text style={styles.heroTitle}>
              {language === 'hi' ? 'बायोमेट्रिक प्रमाणीकरण सक्षम करें' : language === 'gu' ? 'બાયોમેટ્રિક પ્રમાણીકરણ સક્ષમ કરો' : 'Enable Biometric Security'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {language === 'hi'
                ? 'फ़िंगरप्रिंट या फ़ेस आईडी से 1-टैप त्वरित और सुरक्षित लॉगिन एवं भुगतान'
                : language === 'gu'
                ? 'ફિંગરપ્રિન્ટ અથવા ફેસ આઈડી વડે 1-ટેપ ઝડપી અને સુરક્ષિત લૉગિન'
                : 'Unlock instant 1-tap payments and app login using Fingerprint or Face ID'}
            </Text>

            {/* Interactive Biometric Test Button */}
            <TouchableOpacity
              style={[
                styles.bioTestCard,
                bioTested && styles.bioTestCardSuccess,
                isBioTesting && styles.bioTestCardScanning,
              ]}
              onPress={handleTestBiometrics}
              activeOpacity={0.8}
            >
              <Animated.View style={{ transform: [{ scale: bioPulse }] }}>
                {bioTested ? (
                  <CheckCircle2 size={40} color="#059669" />
                ) : isBioTesting ? (
                  <ActivityIndicator size="large" color="#2563EB" />
                ) : (
                  <Fingerprint size={40} color="#0F294A" />
                )}
              </Animated.View>
              <Text style={styles.bioTestCardTitle}>
                {bioTested
                  ? language === 'hi'
                    ? 'बायोमेट्रिक सेंसर सत्यापित!'
                    : language === 'gu'
                    ? 'બાયોમેટ્રિક સેન્સર ચકાસાયેલ!'
                    : 'Biometric Sensor Verified!'
                  : isBioTesting
                  ? 'Testing biometric scanner...'
                  : language === 'hi'
                  ? 'सत्यापित करने हेतु फिंगरप्रिंट स्पर्श करें'
                  : language === 'gu'
                  ? 'ચકાસણી માટે ફિંગરપ્રિન્ટ સ્પર્શ કરો'
                  : 'Tap to Test Fingerprint / Face ID'}
              </Text>
              <Text style={styles.bioTestCardSub}>
                {bioTested
                  ? 'Hardware enclave authentication active'
                  : 'Device hardware sensor simulation active'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleCompleteRegistration}>
              <Text style={styles.primaryBtnText}>
                {language === 'hi' ? 'सहमति और पूर्ण करें' : language === 'gu' ? 'સંમતિ અને પૂર્ણ કરો' : 'Confirm & Complete'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 6: ACCOUNT LINKED SUCCESS */}
        {step === 6 && (
          <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.heroLogoWrap, { backgroundColor: '#ECFDF5' }]}>
              <CheckCircle2 size={42} color="#059669" />
            </View>
            <Text style={styles.heroTitle}>
              {language === 'hi' ? 'खाता सफलतापूर्वक लिंक हुआ!' : language === 'gu' ? 'ખાતું સફળતાપૂર્વક લિંક થયું!' : 'Account Linked & Verified!'}
            </Text>
            <Text style={styles.heroSubtitle}>
              Your ABC Bank Premier Savings account is ready with 4-digit PIN and Biometrics protection.
            </Text>

            <View style={styles.accountLinkedCard}>
              <View style={styles.accountHeaderRow}>
                <View>
                  <Text style={styles.accTypeLabel}>PRIMARY SAVINGS ACCOUNT</Text>
                  <Text style={styles.accNumber}>A/C 5010 •••• 4092</Text>
                </View>
                <View style={styles.kycVerifiedBadge}>
                  <ShieldCheck size={13} color="#059669" />
                  <Text style={styles.kycBadgeText}>KYC TIER 2</Text>
                </View>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.secRow}>
                <Text style={styles.secLabel}>SECURITY CREDENTIALS</Text>
                <Text style={styles.secValue}>PIN (••••) & Biometrics Active</Text>
              </View>
              <View style={styles.secRow}>
                <Text style={styles.secLabel}>REGISTERED MOBILE</Text>
                <Text style={styles.secValue}>+91 {phone}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleFinishAndEnter}>
              <Text style={styles.primaryBtnText}>
                {language === 'hi' ? 'एबीसी बैंक में प्रवेश करें' : language === 'gu' ? 'એબીસી બેંકમાં પ્રવેશ કરો' : 'Enter ABC Bank'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.xs,
  },
  headerStepText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F294A',
    letterSpacing: 1,
  },
  skipBtn: {
    padding: 6,
  },
  progressBarTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#E2E8F0',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0F294A',
  },
  centerContent: {
    padding: spacing.xl,
    alignItems: 'center',
    paddingBottom: 60,
  },
  heroLogoWrap: {
    width: 68,
    height: 68,
    borderRadius: radii.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  heroTitle: {
    ...typography.h2,
    color: '#0F294A',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    ...typography.body,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeLangRow: {
    borderColor: '#0F294A',
    backgroundColor: '#F1F5F9',
  },
  langName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeLangName: {
    color: '#0F294A',
  },
  langSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  phoneInputCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 56,
    marginBottom: spacing.md,
  },
  inputPrefix: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F294A',
  },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginHorizontal: spacing.sm,
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F294A',
    letterSpacing: 1,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  smsBanner: {
    width: '100%',
    backgroundColor: '#EFF6FF',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.lg,
  },
  smsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  smsSender: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  smsBody: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: '#0F294A',
    backgroundColor: '#FFFFFF',
  },
  otpBoxDigit: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F294A',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  autoFillButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.full,
    marginBottom: spacing.xl,
  },
  autoFillButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  pinCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: 'transparent',
  },
  pinCircleFilled: {
    backgroundColor: '#0F294A',
    borderColor: '#0F294A',
  },
  pinKeypad: {
    width: '100%',
    maxWidth: 280,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  keypadButton: {
    width: 64,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keypadEmpty: {
    width: 64,
    height: 50,
  },
  keypadButtonText: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0F294A',
  },
  bioTestCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: spacing.xl,
  },
  bioTestCardScanning: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  bioTestCardSuccess: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  bioTestCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: spacing.md,
    marginBottom: 4,
  },
  bioTestCardSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  accountLinkedCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.xl,
  },
  accountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  accTypeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  accNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F294A',
    marginTop: 2,
  },
  kycVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  kycBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: spacing.md,
  },
  secRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  secLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  secValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F294A',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#0F294A',
    borderRadius: radii.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
});
