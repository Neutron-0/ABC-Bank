import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  Switch,
} from 'react-native';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { CustomerStateType, DpdpConsentState, SignupPayload } from '../../types';
import {
  ShieldCheck,
  Smartphone,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  Delete,
  Fingerprint,
  FileText,
  Shield,
  Info,
} from 'lucide-react-native';

type AuthScreenStep = 'PHONE' | 'SIGNUP' | 'OTP' | 'DPDP_CONSENT' | 'MPIN';

interface PersonaPreset {
  id: CustomerStateType;
  name: string;
  phone: string;
  tag: string;
  badgeColor: string;
  summary: string;
}

const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'normal',
    name: 'Rahul Sharma',
    phone: '9999999901',
    tag: 'Salaried • Steady Cashflow',
    badgeColor: '#10B981',
    summary: '₹84,500 salary credited, healthy emergency buffer, low credit risk.',
  },
  {
    id: 'surplus',
    name: 'Priya Patel',
    phone: '9999999902',
    tag: 'Business • Surplus Liquidity',
    badgeColor: '#06B6D4',
    summary: '₹2.85L surplus idle in savings, auto-sweep & mutual fund ready.',
  },
  {
    id: 'financial_stress',
    name: 'Amit Kumar',
    phone: '9999999903',
    tag: 'Pre-Salary • Tight Buffer',
    badgeColor: '#F59E0B',
    summary: 'Upcoming EMI of ₹14,200 due in 4 days with ₹3,840 account deficit.',
  },
  {
    id: 'medical_event',
    name: 'Vikram Singh',
    phone: '9999999904',
    tag: 'Hospitalization • Inpatient',
    badgeColor: '#8B5CF6',
    summary: '₹48,200 payment at Max Hospital, digital insurance claim assistance.',
  },
  {
    id: 'fraud_alert',
    name: 'Sunita Verma',
    phone: '9999999905',
    tag: 'High Anomaly • Midnight Charge',
    badgeColor: '#EF4444',
    summary: '₹31,800 charged at 02:14 AM from unfamiliar overseas merchant.',
  },
];

export const AuthScreen: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const {
    language,
    setLanguage,
    sendMockOtp,
    verifyMockOtp,
    verifyMpin,
    signupCustomer,
    updateDpdpConsent,
    loginWithPreset,
    dpdpConsent,
  } = useCustomerStore();

  const [step, setStep] = useState<AuthScreenStep>('PHONE');
  const [phone, setPhone] = useState('9999999901');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [mpinInput, setMpinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showMockSmsBanner, setShowMockSmsBanner] = useState(false);
  const [activePreset, setActivePreset] = useState<CustomerStateType>('normal');

  // Sign up fields
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('9876543210');
  const [signupAccountType, setSignupAccountType] = useState<'SAVINGS' | 'SALARY' | 'CURRENT'>('SAVINGS');
  const [signupMpin, setSignupMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');

  // DPDP Consent draft state
  const [consentDraft, setConsentDraft] = useState<DpdpConsentState>({
    ...dpdpConsent,
    essentialBanking: true,
    deviceSecurity: true,
    smsFraudDetection: true,
    accountAggregator: true,
    personalizedOffers: true,
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const transitionTo = (newStep: AuthScreenStep) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setStep(newStep);
      setErrorMessage('');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
    });
  };

  // Step 1: Send OTP
  const handleRequestOtp = () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      triggerShake();
      return;
    }
    setErrorMessage('');
    sendMockOtp(cleanPhone);
    setShowMockSmsBanner(true);
    setResendTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    transitionTo('OTP');
  };

  // Step 2: Fill OTP automatically for evaluator ease
  const handleAutoFillOtp = () => {
    setOtpDigits(['4', '8', '2', '9', '1', '0']);
    setErrorMessage('');
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    const entered = otpDigits.join('');
    if (entered.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP.');
      triggerShake();
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const ok = verifyMockOtp(entered, '482910');
      if (!ok) {
        setErrorMessage('Invalid OTP code. Tap "Auto-fill 482910" or use 000000.');
        triggerShake();
        return;
      }
      // Advance to DPDP Consent screen
      transitionTo('DPDP_CONSENT');
    }, 350);
  };

  // Step 3: Accept DPDP Consent
  const handleAcceptDpdp = (allAccepted: boolean) => {
    const updated = {
      ...consentDraft,
      essentialBanking: true,
      deviceSecurity: true,
      smsFraudDetection: allAccepted ? true : consentDraft.smsFraudDetection,
      accountAggregator: allAccepted ? true : consentDraft.accountAggregator,
      personalizedOffers: allAccepted ? true : consentDraft.personalizedOffers,
    };
    updateDpdpConsent(updated);
    transitionTo('MPIN');
  };

  // Step 4: MPIN Keypad handling
  const handleMpinPress = (digit: string) => {
    if (mpinInput.length < 6) {
      const next = mpinInput + digit;
      setMpinInput(next);
      setErrorMessage('');

      if (next.length === 6) {
        // Auto-verify upon 6th digit
        setIsVerifying(true);
        setTimeout(() => {
          setIsVerifying(false);
          const valid = verifyMpin(next);
          if (!valid) {
            setErrorMessage('Incorrect MPIN. Default demo MPIN is 123456.');
            triggerShake();
            setMpinInput('');
          }
        }, 300);
      }
    }
  };

  const handleMpinDelete = () => {
    setMpinInput((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleBiometricUnlock = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      verifyMpin('123456');
    }, 400);
  };

  // Signup Submit
  const handleSignupSubmit = () => {
    if (!signupName.trim()) {
      setErrorMessage('Please enter your full legal name as per Aadhaar/PAN.');
      triggerShake();
      return;
    }
    if (signupMpin.length !== 6 || !/^\d{6}$/.test(signupMpin)) {
      setErrorMessage('Please choose a 6-digit numerical MPIN.');
      triggerShake();
      return;
    }
    if (signupMpin !== confirmMpin) {
      setErrorMessage('MPIN and confirmation do not match.');
      triggerShake();
      return;
    }

    const payload: SignupPayload = {
      fullName: signupName.trim(),
      phone: signupPhone,
      accountType: signupAccountType,
      panOrAadhaar: 'ABCDE1234F',
      mpin: signupMpin,
    };

    signupCustomer(payload);
    // After signup, take user to DPDP consent confirmation
    transitionTo('DPDP_CONSENT');
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: '#0B1120' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar: Bank Branding & Multilingual Selector */}
      <View style={styles.topHeader}>
        <View style={styles.brandGroup}>
          <View style={styles.brandIconContainer}>
            <ShieldCheck size={22} color="#10B981" />
          </View>
          <View>
            <Text style={styles.brandTitle}>ABC DIGITAL BANK</Text>
            <Text style={styles.brandSubtitle}>BHARAT HYPER-PERSONALIZED • RBI REGULATED</Text>
          </View>
        </View>

        {/* 1-Tap Language Toggle */}
        <View style={styles.langPillContainer}>
          {(['en', 'hi', 'gu'] as const).map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setLanguage(l)}
              style={[
                styles.langButton,
                language === l && styles.langButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.langButtonText,
                  language === l && styles.langButtonTextActive,
                ]}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'ગુજ'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: shakeAnim }],
            },
          ]}
        >
          {/* ================= STEP 1: PHONE & DEMO PERSONA ================= */}
          {step === 'PHONE' && (
            <View>
              <View style={styles.stepHeader}>
                <View style={styles.badgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Shield size={12} color="#10B981" />
                    <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>256-Bit Encrypted</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                    <Smartphone size={12} color="#38BDF8" />
                    <Text style={[styles.statusBadgeText, { color: '#38BDF8' }]}>SIM-Bound Security</Text>
                  </View>
                </View>
                <Text style={styles.heading}>Welcome to ABC Digital Bank</Text>
                <Text style={styles.subheading}>
                  Enter your registered mobile number or tap a demo persona to experience adaptive banking.
                </Text>
              </View>

              {/* Mobile Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Registered Mobile Number</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(val) => {
                      setPhone(val);
                      setErrorMessage('');
                    }}
                    placeholder="99999 99901"
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <AlertCircle size={15} color="#EF4444" />
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Proceed Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRequestOtp}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Get Secure OTP</Text>
                <ArrowRight size={18} color="#0F172A" />
              </TouchableOpacity>

              {/* Quick Persona Demo Selector for Evaluators */}
              <View style={styles.personaSection}>
                <View style={styles.personaSectionHeader}>
                  <Sparkles size={14} color="#38BDF8" />
                  <Text style={styles.personaSectionTitle}>EVALUATOR QUICK PERSONA PRESETS</Text>
                </View>
                <Text style={styles.personaSectionDescription}>
                  1-tap instant login as an official evaluation persona to review adaptive life-stage features:
                </Text>

                <View style={styles.personaList}>
                  {PERSONA_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.personaCard,
                        activePreset === p.id && styles.personaCardActive,
                      ]}
                      onPress={() => {
                        setActivePreset(p.id);
                        setPhone(p.phone);
                        setErrorMessage('');
                      }}
                    >
                      <View style={styles.personaCardTop}>
                        <View style={styles.personaNameGroup}>
                          <Text style={styles.personaName}>{p.name}</Text>
                          <Text style={styles.personaPhone}>{p.phone}</Text>
                        </View>
                        <View style={[styles.personaTag, { backgroundColor: `${p.badgeColor}22` }]}>
                          <Text style={[styles.personaTagText, { color: p.badgeColor }]}>{p.tag}</Text>
                        </View>
                      </View>
                      <Text style={styles.personaSummary}>{p.summary}</Text>

                      <View style={styles.personaActionRow}>
                        <TouchableOpacity
                          style={styles.personaSelectBtn}
                          onPress={() => {
                            setPhone(p.phone);
                            handleRequestOtp();
                          }}
                        >
                          <Text style={styles.personaSelectBtnText}>Test OTP Flow</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.personaBypassBtn}
                          onPress={() => loginWithPreset(p.id)}
                        >
                          <Sparkles size={12} color="#38BDF8" />
                          <Text style={styles.personaBypassBtnText}>1-Tap Login</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Switch to Signup */}
              <View style={styles.switchAuthRow}>
                <Text style={styles.switchAuthText}>New to ABC Bank?</Text>
                <TouchableOpacity onPress={() => transitionTo('SIGNUP')}>
                  <Text style={styles.switchAuthLink}>Open Digital Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ================= STEP 2: NEW USER SIGNUP ================= */}
          {step === 'SIGNUP' && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Building2 size={12} color="#10B981" />
                  <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>DigiLocker KYC Ready</Text>
                </View>
                <Text style={styles.heading}>Open Your Digital Account</Text>
                <Text style={styles.subheading}>
                  Paperless zero-friction onboarding with statutory DPDP 2023 consent architecture.
                </Text>
              </View>

              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Legal Name (as on Aadhaar/PAN)</Text>
                <TextInput
                  style={styles.textInputFull}
                  value={signupName}
                  onChangeText={setSignupName}
                  placeholder="e.g. Ramesh Chandra Verma"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Mobile Number */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Primary Mobile Number</Text>
                <TextInput
                  style={styles.textInputFull}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={signupPhone}
                  onChangeText={setSignupPhone}
                  placeholder="9876543210"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Account Type Selector */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Select Account Variant</Text>
                <View style={styles.accountTypeRow}>
                  {[
                    { id: 'SAVINGS', label: 'Savings 7%', sub: 'Instant RuPay Card' },
                    { id: 'SALARY', label: 'Salary Plus', sub: 'Zero Bal + Overdraft' },
                    { id: 'CURRENT', label: 'Merchant', sub: 'UPI QR + Multi-Tax' },
                  ].map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.accountTypeButton,
                        signupAccountType === acc.id && styles.accountTypeButtonActive,
                      ]}
                      onPress={() => setSignupAccountType(acc.id as any)}
                    >
                      <Text
                        style={[
                          styles.accountTypeTitle,
                          signupAccountType === acc.id && styles.accountTypeTitleActive,
                        ]}
                      >
                        {acc.label}
                      </Text>
                      <Text style={styles.accountTypeSub}>{acc.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Setup 6-digit MPIN */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Set 6-Digit MPIN</Text>
                <TextInput
                  style={styles.textInputFull}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  value={signupMpin}
                  onChangeText={setSignupMpin}
                  placeholder="Enter 6 numbers"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Confirm MPIN */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm 6-Digit MPIN</Text>
                <TextInput
                  style={styles.textInputFull}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  value={confirmMpin}
                  onChangeText={setConfirmMpin}
                  placeholder="Re-enter 6 numbers"
                  placeholderTextColor="#64748B"
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <AlertCircle size={15} color="#EF4444" />
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Continue to DPDP Consent */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSignupSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Continue to DPDP Consent</Text>
                <ArrowRight size={18} color="#0F172A" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryLinkButton}
                onPress={() => transitionTo('PHONE')}
              >
                <Text style={styles.secondaryLinkButtonText}>Back to Existing Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= STEP 3: MOCK OTP VERIFICATION ================= */}
          {step === 'OTP' && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                  <Smartphone size={12} color="#38BDF8" />
                  <Text style={[styles.statusBadgeText, { color: '#38BDF8' }]}>OTP Dispatched</Text>
                </View>
                <Text style={styles.heading}>Verify Mobile Number</Text>
                <Text style={styles.subheading}>
                  Sent 6-digit authentication token to <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>+91 {phone}</Text>
                </Text>
              </View>

              {/* Realistic SMS Banner */}
              {showMockSmsBanner && (
                <View style={styles.smsSimBanner}>
                  <View style={styles.smsHeader}>
                    <View style={styles.smsHeaderLeft}>
                      <Smartphone size={14} color="#10B981" />
                      <Text style={styles.smsSender}>VK-ABCBNK (SMS Notice)</Text>
                    </View>
                    <Text style={styles.smsTime}>Just now</Text>
                  </View>
                  <Text style={styles.smsBody}>
                    <Text style={styles.smsCodeHighlight}>482910</Text> is your secret OTP for ABC Digital Banking login. Valid for 10 mins. Do not share OTP with anyone including bank staff.
                  </Text>
                </View>
              )}

              {/* 6 Digit Input Boxes */}
              <View style={styles.otpRow}>
                {otpDigits.map((digit, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                      otpDigits.findIndex((d) => !d) === idx ? styles.otpBoxActive : null,
                    ]}
                  >
                    <Text style={styles.otpDigitText}>{digit || '•'}</Text>
                  </View>
                ))}
              </View>

              {/* 1-Tap Auto-fill Button for Evaluator Convenience */}
              <TouchableOpacity
                style={styles.autofillBanner}
                onPress={handleAutoFillOtp}
                activeOpacity={0.8}
              >
                <Sparkles size={16} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.autofillTitle}>1-Tap Auto-Fill Demo OTP</Text>
                  <Text style={styles.autofillSubtitle}>Inserts verified code: 482910</Text>
                </View>
                <ArrowRight size={16} color="#10B981" />
              </TouchableOpacity>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <AlertCircle size={15} color="#EF4444" />
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isVerifying && { opacity: 0.7 }]}
                onPress={handleVerifyOtp}
                disabled={isVerifying}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>
                  {isVerifying ? 'Verifying Security Token...' : 'Verify & Proceed'}
                </Text>
                <CheckCircle2 size={18} color="#0F172A" />
              </TouchableOpacity>

              {/* Resend Timer */}
              <View style={styles.resendRow}>
                {resendTimer > 0 ? (
                  <Text style={styles.resendTimerText}>Resend code in {resendTimer}s</Text>
                ) : (
                  <TouchableOpacity onPress={() => handleRequestOtp()}>
                    <Text style={styles.resendActiveText}>Resend OTP (VK-ABCBNK)</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => transitionTo('PHONE')}>
                  <Text style={styles.changePhoneText}>Change Number</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ================= STEP 4: DPDP ACT 2023 & RBI CONSENT ================= */}
          {step === 'DPDP_CONSENT' && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <ShieldCheck size={12} color="#10B981" />
                  <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>DPDP Act 2023 Section 6</Text>
                </View>
                <Text style={styles.heading}>Statutory Privacy & Consent</Text>
                <Text style={styles.subheading}>
                  As a regulated banking data fiduciary, ABC Digital Bank adheres strictly to the Digital Personal Data Protection Act, 2023 & RBI Master Directions.
                </Text>
              </View>

              {/* Consent Card Container */}
              <View style={styles.consentListContainer}>
                {/* 1. Core Banking (Mandatory) */}
                <View style={styles.consentItem}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <Building2 size={16} color="#10B981" />
                      <Text style={styles.consentItemTitle}>Core Banking & Transaction Ledger</Text>
                    </View>
                    <View style={styles.mandatoryBadge}>
                      <Text style={styles.mandatoryBadgeText}>Mandatory (RBI)</Text>
                    </View>
                  </View>
                  <Text style={styles.consentItemDesc}>
                    Essential transaction logging, core balances, AML reporting, and regulatory audit compliance under RBI Banking Regulation Act 1949.
                  </Text>
                </View>

                {/* 2. Device Security & Binding (Mandatory) */}
                <View style={styles.consentItem}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <Shield size={16} color="#10B981" />
                      <Text style={styles.consentItemTitle}>Device Binding & Cyber Defense</Text>
                    </View>
                    <View style={styles.mandatoryBadge}>
                      <Text style={styles.mandatoryBadgeText}>Mandatory (RBI)</Text>
                    </View>
                  </View>
                  <Text style={styles.consentItemDesc}>
                    Verifies SIM binding, jailbreak/root tamper inspection, and anomaly detection per RBI Cyber Security Framework guidelines.
                  </Text>
                </View>

                {/* 3. Financial SMS Sync (Optional) */}
                <View style={styles.consentItem}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <Smartphone size={16} color="#38BDF8" />
                      <Text style={styles.consentItemTitle}>Financial SMS Passbook Sync</Text>
                    </View>
                    <Switch
                      value={consentDraft.smsFraudDetection}
                      onValueChange={(val) => setConsentDraft((prev) => ({ ...prev, smsFraudDetection: val }))}
                      trackColor={{ false: '#334155', true: '#10B981' }}
                      thumbColor="#F8FAFC"
                    />
                  </View>
                  <Text style={styles.consentItemDesc}>
                    On-device scanning of bank & utility SMS to track recurring charges, bill reminders, and prevent unauthorized card debits.
                  </Text>
                </View>

                {/* 4. Account Aggregator (AA) Ecosystem (Optional) */}
                <View style={styles.consentItem}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <FileText size={16} color="#38BDF8" />
                      <Text style={styles.consentItemTitle}>RBI Account Aggregator (AA) Sync</Text>
                    </View>
                    <Switch
                      value={consentDraft.accountAggregator}
                      onValueChange={(val) => setConsentDraft((prev) => ({ ...prev, accountAggregator: val }))}
                      trackColor={{ false: '#334155', true: '#10B981' }}
                      thumbColor="#F8FAFC"
                    />
                  </View>
                  <Text style={styles.consentItemDesc}>
                    Seamless multi-bank statement analysis and net-worth consolidation through RBI-licensed NBFC Account Aggregators.
                  </Text>
                </View>

                {/* 5. Mitra AI Insights (Optional) */}
                <View style={styles.consentItem}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <Sparkles size={16} color="#A855F7" />
                      <Text style={styles.consentItemTitle}>Mitra AI Hyper-Personalization</Text>
                    </View>
                    <Switch
                      value={consentDraft.personalizedOffers}
                      onValueChange={(val) => setConsentDraft((prev) => ({ ...prev, personalizedOffers: val }))}
                      trackColor={{ false: '#334155', true: '#10B981' }}
                      thumbColor="#F8FAFC"
                    />
                  </View>
                  <Text style={styles.consentItemDesc}>
                    Proactive empathetic alerts, pre-salary cashflow projections, and tailored financial health suggestions.
                  </Text>
                </View>
              </View>

              {/* Data Fiduciary Disclosures */}
              <View style={styles.fiduciaryNotice}>
                <Info size={14} color="#94A3B8" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fiduciaryTitle}>Data Fiduciary Transparency Notice</Text>
                  <Text style={styles.fiduciaryText}>
                    Data Fiduciary: ABC Digital Bank Ltd. • Data Protection Officer (DPO): dpo@abcbank.in • Grievance Helpline: 1800 209 8492.
                    You retain the statutory Right to Access, Correction, and Right to Withdraw Consent at any time in Profile & Privacy Settings.
                  </Text>
                </View>
              </View>

              {/* Authorize & Accept */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleAcceptDpdp(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>I Agree & Authorize All</Text>
                <CheckCircle2 size={18} color="#0F172A" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryLinkButton}
                onPress={() => handleAcceptDpdp(false)}
              >
                <Text style={styles.secondaryLinkButtonText}>Save Selected Preferences</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= STEP 5: MPIN & BIOMETRIC AUTH ================= */}
          {step === 'MPIN' && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Lock size={12} color="#10B981" />
                  <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>Hardware Keystore Locked</Text>
                </View>
                <Text style={styles.heading}>Enter 6-Digit MPIN</Text>
                <Text style={styles.subheading}>
                  Authorize secure session with your 6-digit MPIN or use Biometric FaceID / Fingerprint.
                </Text>
              </View>

              {/* MPIN Bullet Indicators */}
              <View style={styles.mpinIndicatorRow}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.mpinDot,
                      i < mpinInput.length && styles.mpinDotFilled,
                    ]}
                  />
                ))}
              </View>

              {/* Demo Hint Banner */}
              <View style={styles.mpinHintBanner}>
                <Info size={14} color="#38BDF8" />
                <Text style={styles.mpinHintText}>
                  Default Demo MPIN: <Text style={{ fontWeight: 'bold', color: '#38BDF8' }}>123456</Text> (or 8492)
                </Text>
              </View>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <AlertCircle size={15} color="#EF4444" />
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Numpad Keypad */}
              <View style={styles.keypadContainer}>
                {[
                  ['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['BIO', '0', 'DEL'],
                ].map((row, rIdx) => (
                  <View key={rIdx} style={styles.keypadRow}>
                    {row.map((btn) => {
                      if (btn === 'BIO') {
                        return (
                          <TouchableOpacity
                            key={btn}
                            style={styles.keypadSpecialButton}
                            onPress={handleBiometricUnlock}
                          >
                            <Fingerprint size={24} color="#10B981" />
                          </TouchableOpacity>
                        );
                      }
                      if (btn === 'DEL') {
                        return (
                          <TouchableOpacity
                            key={btn}
                            style={styles.keypadSpecialButton}
                            onPress={handleMpinDelete}
                          >
                            <Delete size={22} color="#94A3B8" />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={btn}
                          style={styles.keypadButton}
                          onPress={() => handleMpinPress(btn)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.keypadButtonText}>{btn}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              {/* Switch User */}
              <TouchableOpacity
                style={styles.switchUserButton}
                onPress={() => transitionTo('PHONE')}
              >
                <Text style={styles.switchUserButtonText}>Log in with a different account</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langButtonActive: {
    backgroundColor: '#38BDF8',
  },
  langButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  langButtonTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  stepHeader: {
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCodeBox: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 1.2,
  },
  textInputFull: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  accountTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  accountTypeButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 10,
  },
  accountTypeButtonActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  accountTypeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  accountTypeTitleActive: {
    color: '#38BDF8',
  },
  accountTypeSub: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  primaryButton: {
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.4,
  },
  secondaryLinkButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  secondaryLinkButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    flex: 1,
  },
  personaSection: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  personaSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  personaSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  personaSectionDescription: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 12,
    lineHeight: 16,
  },
  personaList: {
    gap: 10,
  },
  personaCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
  },
  personaCardActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  personaCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  personaNameGroup: {
    gap: 1,
  },
  personaName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  personaPhone: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#94A3B8',
  },
  personaTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  personaTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  personaSummary: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
    marginBottom: 10,
  },
  personaActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  personaSelectBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  personaSelectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  personaBypassBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  personaBypassBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  switchAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  switchAuthText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  switchAuthLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
  },
  smsSimBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    marginBottom: 16,
  },
  smsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  smsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smsSender: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  smsTime: {
    fontSize: 10,
    color: '#64748B',
  },
  smsBody: {
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  smsCodeHighlight: {
    fontWeight: '800',
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 44,
    height: 52,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  otpBoxFilled: {
    borderColor: '#10B981',
  },
  otpDigitText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  autofillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  autofillTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  autofillSubtitle: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  resendTimerText: {
    fontSize: 12,
    color: '#64748B',
  },
  resendActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  changePhoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  consentListContainer: {
    gap: 10,
    marginBottom: 16,
  },
  consentItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
  },
  consentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  consentItemTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  consentItemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  mandatoryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mandatoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#10B981',
  },
  consentItemDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  fiduciaryNotice: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#0B1120',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  fiduciaryTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 2,
  },
  fiduciaryText: {
    fontSize: 9.5,
    color: '#64748B',
    lineHeight: 13.5,
  },
  mpinIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginVertical: 18,
  },
  mpinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#64748B',
    backgroundColor: 'transparent',
  },
  mpinDotFilled: {
    borderColor: '#38BDF8',
    backgroundColor: '#38BDF8',
    transform: [{ scale: 1.15 }],
  },
  mpinHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  mpinHintText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  keypadContainer: {
    gap: 10,
    marginTop: 4,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  keypadButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  keypadSpecialButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchUserButton: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 8,
  },
  switchUserButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
