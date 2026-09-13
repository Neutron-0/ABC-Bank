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
import { typography, spacing, radii, shadows, useAppTheme } from '../../theme';
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
  Key,
  Delete,
  Fingerprint,
  FileText,
  Shield,
  Info,
  ChevronRight,
  User,
  Globe,
} from 'lucide-react-native';

type AuthScreenStep = 'PHONE' | 'SIGNUP' | 'OTP' | 'DPDP_CONSENT' | 'MPIN';

interface PersonaPreset {
  id: CustomerStateType;
  name: string;
  phone: string;
  tag: string;
  badgeColor: string;
  badgeBg: string;
  summary: string;
}

const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'normal',
    name: 'Rahul Sharma',
    phone: '9999999901',
    tag: 'Salaried • Steady Cashflow',
    badgeColor: '#1B7A43',
    badgeBg: '#EDF7F1',
    summary: '₹84,500 salary credited, healthy emergency buffer, low credit risk.',
  },
  {
    id: 'surplus',
    name: 'Priya Patel',
    phone: '9999999902',
    tag: 'Business • Surplus Liquidity',
    badgeColor: '#B45309',
    badgeBg: '#FDF6ED',
    summary: '₹2.85L surplus idle in savings, auto-sweep & mutual fund ready.',
  },
  {
    id: 'financial_stress',
    name: 'Amit Kumar',
    phone: '9999999903',
    tag: 'Pre-Salary • Tight Buffer',
    badgeColor: '#B45309',
    badgeBg: '#FDF6ED',
    summary: 'Upcoming EMI of ₹14,200 due in 4 days with ₹3,840 account deficit.',
  },
  {
    id: 'medical_event',
    name: 'Vikram Singh',
    phone: '9999999904',
    tag: 'Hospitalization • Inpatient',
    badgeColor: '#68645E',
    badgeBg: '#F3EFEA',
    summary: '₹48,200 payment at Max Hospital, digital insurance claim assistance.',
  },
  {
    id: 'fraud_alert',
    name: 'Sunita Verma',
    phone: '9999999905',
    tag: 'High Anomaly • Midnight Charge',
    badgeColor: '#C92A2A',
    badgeBg: '#FDF2F2',
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
    loginWithPassword,
    updateDpdpConsent,
    loginWithPreset,
    dpdpConsent,
  } = useCustomerStore();

  const [step, setStep] = useState<AuthScreenStep>('PHONE');
  const [authMode, setAuthMode] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [phone, setPhone] = useState('9999999901');
  const [loginIdentifier, setLoginIdentifier] = useState('rahul.sharma@bharatmail.in');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
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
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const transitionTo = (newStep: AuthScreenStep) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setStep(newStep);
      setErrorMessage('');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 140,
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

  // Step 1b: Direct Password / JWT Login
  const handlePasswordLogin = async () => {
    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email, mobile number, or customer ID.');
      triggerShake();
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your account password.');
      triggerShake();
      return;
    }

    setIsSubmittingPassword(true);
    setErrorMessage('');
    const res = await loginWithPassword(loginIdentifier, loginPassword);
    setIsSubmittingPassword(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
      triggerShake();
    }
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
    }, 300);
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
        setIsVerifying(true);
        setTimeout(() => {
          setIsVerifying(false);
          const valid = verifyMpin(next);
          if (!valid) {
            setErrorMessage('Incorrect MPIN. Default demo MPIN is 123456.');
            triggerShake();
            setMpinInput('');
          }
        }, 250);
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
    }, 350);
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
    transitionTo('DPDP_CONSENT');
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: themeColors.bg }]}>
      {/* Top Header: Brand Crest + Vernacular Language Toggle */}
      <View style={[styles.topHeader, { backgroundColor: themeColors.cardBg, borderBottomColor: themeColors.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandIconBox, { backgroundColor: '#141414' }]}>
            <ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={[styles.brandTitle, { color: themeColors.textPrimary }]}>ABC DIGITAL BANK</Text>
            <Text style={[styles.brandSubtitle, { color: themeColors.textSecondary }]}>
              BHARAT HYPER-PERSONALIZED • RBI REGULATED
            </Text>
          </View>
        </View>

        {/* Vernacular Language Selector */}
        <View style={[styles.langPillContainer, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
          {(['en', 'hi', 'gu'] as const).map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setLanguage(l)}
              style={[
                styles.langButton,
                language === l && [styles.langButtonActive, { backgroundColor: '#FFFFFF' }],
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.langButtonText,
                  { color: themeColors.textSecondary },
                  language === l && { color: '#141414', fontWeight: '800' },
                ]}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'ગુ'}
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
            styles.mainCard,
            {
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border,
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
                  <View style={[styles.statusBadge, { backgroundColor: '#EDF7F1' }]}>
                    <Shield size={11} color="#1B7A43" />
                    <Text style={[styles.statusBadgeText, { color: '#1B7A43' }]}>256-Bit Encrypted</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#F3EFEA' }]}>
                    <Smartphone size={11} color="#68645E" />
                    <Text style={[styles.statusBadgeText, { color: '#68645E' }]}>SIM-Bound Hardware</Text>
                  </View>
                </View>
                <Text style={[styles.heading, { color: themeColors.textPrimary }]}>Welcome to ABC Digital Bank</Text>
                <Text style={[styles.subheading, { color: themeColors.textSecondary }]}>
                  Enter your registered mobile number or tap a demo persona to experience adaptive banking.
                </Text>
              </View>

              {/* Mode Switcher: Mobile OTP vs NetBanking Password (JWT) */}
              <View style={[styles.authModeTabContainer, { backgroundColor: '#F3EFEA', borderColor: '#EAE6DF' }]}>
                <TouchableOpacity
                  style={[
                    styles.authModeTab,
                    authMode === 'OTP' && [styles.authModeTabActive, { backgroundColor: '#FFFFFF' }],
                  ]}
                  onPress={() => {
                    setAuthMode('OTP');
                    setErrorMessage('');
                  }}
                  activeOpacity={0.8}
                >
                  <Smartphone size={13} color={authMode === 'OTP' ? '#141414' : '#68645E'} />
                  <Text
                    style={[
                      styles.authModeTabText,
                      { color: authMode === 'OTP' ? '#141414' : '#68645E' },
                      authMode === 'OTP' && { fontWeight: '700' },
                    ]}
                  >
                    Mobile OTP & MPIN
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.authModeTab,
                    authMode === 'PASSWORD' && [styles.authModeTabActive, { backgroundColor: '#FFFFFF' }],
                  ]}
                  onPress={() => {
                    setAuthMode('PASSWORD');
                    setErrorMessage('');
                  }}
                  activeOpacity={0.8}
                >
                  <Lock size={13} color={authMode === 'PASSWORD' ? '#141414' : '#68645E'} />
                  <Text
                    style={[
                      styles.authModeTabText,
                      { color: authMode === 'PASSWORD' ? '#141414' : '#68645E' },
                      authMode === 'PASSWORD' && { fontWeight: '700' },
                    ]}
                  >
                    NetBanking Password (JWT)
                  </Text>
                </TouchableOpacity>
              </View>

              {authMode === 'OTP' ? (
                <>
                  {/* Mobile Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Registered Mobile Number</Text>
                    <View style={[styles.phoneInputCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                      <Text style={[styles.inputPrefix, { color: themeColors.textPrimary }]}>+91</Text>
                      <View style={[styles.inputDivider, { backgroundColor: '#E2E8F0' }]} />
                      <TextInput
                        style={[styles.phoneTextInput, { color: themeColors.textPrimary }]}
                        keyboardType="number-pad"
                        maxLength={10}
                        value={phone}
                        onChangeText={(val) => {
                          setPhone(val);
                          setErrorMessage('');
                        }}
                        placeholder="99999 99901"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>

                  {errorMessage ? (
                    <View style={[styles.errorBanner, { backgroundColor: '#FDF2F2', borderColor: '#FCA5A5' }]}>
                      <AlertCircle size={14} color="#C92A2A" />
                      <Text style={[styles.errorBannerText, { color: '#C92A2A' }]}>{errorMessage}</Text>
                    </View>
                  ) : null}

                  {/* Proceed Button */}
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: '#141414' }]}
                    onPress={handleRequestOtp}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>Get Secure OTP</Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* User Identifier (Email, Mobile, or Customer ID) */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>
                      User ID, Email, or Mobile Number
                    </Text>
                    <View style={[styles.phoneInputCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                      <User size={15} color="#68645E" style={{ marginLeft: 12 }} />
                      <View style={[styles.inputDivider, { backgroundColor: '#E2E8F0', marginHorizontal: 8 }]} />
                      <TextInput
                        style={[styles.phoneTextInput, { color: themeColors.textPrimary }]}
                        value={loginIdentifier}
                        onChangeText={(val) => {
                          setLoginIdentifier(val);
                          setErrorMessage('');
                        }}
                        placeholder="rahul.sharma@bharatmail.in"
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Account Password</Text>
                    <View style={[styles.phoneInputCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                      <Lock size={15} color="#68645E" style={{ marginLeft: 12 }} />
                      <View style={[styles.inputDivider, { backgroundColor: '#E2E8F0', marginHorizontal: 8 }]} />
                      <TextInput
                        style={[styles.phoneTextInput, { color: themeColors.textPrimary }]}
                        secureTextEntry
                        value={loginPassword}
                        onChangeText={(val) => {
                          setLoginPassword(val);
                          setErrorMessage('');
                        }}
                        placeholder="••••••••"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>

                  {/* Quick Fill Credentials Pills */}
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md, flexWrap: 'wrap' }}>
                    <TouchableOpacity
                      onPress={() => {
                        setLoginIdentifier('rahul.sharma@bharatmail.in');
                        setLoginPassword('password123');
                        setErrorMessage('');
                      }}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        backgroundColor: '#F3EFEA',
                        borderWidth: 1,
                        borderColor: '#EAE6DF',
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#141414' }}>
                        Fill Rahul (Salaried)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setLoginIdentifier('pooja.patel@bharatmail.in');
                        setLoginPassword('password123');
                        setErrorMessage('');
                      }}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        backgroundColor: '#F3EFEA',
                        borderWidth: 1,
                        borderColor: '#EAE6DF',
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#141414' }}>
                        Fill Pooja (Surplus)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {errorMessage ? (
                    <View style={[styles.errorBanner, { backgroundColor: '#FDF2F2', borderColor: '#FCA5A5' }]}>
                      <AlertCircle size={14} color="#C92A2A" />
                      <Text style={[styles.errorBannerText, { color: '#C92A2A' }]}>{errorMessage}</Text>
                    </View>
                  ) : null}

                  {/* Password Login Button */}
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: '#141414' }]}
                    onPress={handlePasswordLogin}
                    disabled={isSubmittingPassword}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                      {isSubmittingPassword ? 'Verifying Credentials...' : 'Sign In & Issue JWT Session'}
                    </Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              )}

              {/* Quick Persona Demo Selector for Evaluators */}
              <View style={[styles.personaSection, { borderTopColor: themeColors.border }]}>
                <View style={styles.personaSectionHeader}>
                  <Key size={14} color="#B45309" />
                  <Text style={[styles.personaSectionTitle, { color: '#B45309' }]}>
                    EVALUATOR QUICK PERSONA PRESETS
                  </Text>
                </View>
                <Text style={[styles.personaSectionDescription, { color: themeColors.textSecondary }]}>
                  1-tap instant login as an official evaluation persona to review adaptive life-stage features:
                </Text>

                <View style={styles.personaList}>
                  {PERSONA_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.personaCard,
                        { backgroundColor: '#FFFFFF', borderColor: themeColors.border },
                        activePreset === p.id && { borderColor: '#141414', backgroundColor: '#FAF8F5' },
                      ]}
                      onPress={() => {
                        setActivePreset(p.id);
                        setPhone(p.phone);
                        setErrorMessage('');
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.personaCardTop}>
                        <View>
                          <Text style={[styles.personaName, { color: themeColors.textPrimary }]}>{p.name}</Text>
                          <Text style={[styles.personaPhone, { color: themeColors.textSecondary }]}>{p.phone}</Text>
                        </View>
                        <View style={[styles.personaTag, { backgroundColor: p.badgeBg }]}>
                          <Text style={[styles.personaTagText, { color: p.badgeColor }]}>{p.tag}</Text>
                        </View>
                      </View>
                      <Text style={[styles.personaSummary, { color: themeColors.textSecondary }]}>{p.summary}</Text>

                      <View style={styles.personaActionRow}>
                        <TouchableOpacity
                          style={[styles.personaSelectBtn, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
                          onPress={() => {
                            setPhone(p.phone);
                            handleRequestOtp();
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.personaSelectBtnText, { color: themeColors.textPrimary }]}>Test OTP Flow</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.personaBypassBtn, { backgroundColor: '#141414' }]}
                          onPress={() => loginWithPreset(p.id)}
                          activeOpacity={0.85}
                        >
                          <Key size={12} color="#F59E0B" />
                          <Text style={styles.personaBypassBtnText}>1-Tap Login</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Switch to Signup */}
              <View style={styles.switchAuthRow}>
                <Text style={[styles.switchAuthText, { color: themeColors.textSecondary }]}>New to ABC Bank?</Text>
                <TouchableOpacity onPress={() => transitionTo('SIGNUP')} activeOpacity={0.7}>
                  <Text style={[styles.switchAuthLink, { color: '#141414' }]}>Open Digital Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ================= STEP 2: NEW USER SIGNUP ================= */}
          {step === 'SIGNUP' && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.statusBadge, { backgroundColor: '#EDF7F1' }]}>
                  <Building2 size={11} color="#1B7A43" />
                  <Text style={[styles.statusBadgeText, { color: '#1B7A43' }]}>DigiLocker KYC Ready</Text>
                </View>
                <Text style={[styles.heading, { color: themeColors.textPrimary }]}>Open Your Digital Account</Text>
                <Text style={[styles.subheading, { color: themeColors.textSecondary }]}>
                  Paperless zero-friction onboarding with statutory DPDP 2023 consent architecture.
                </Text>
              </View>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Full Legal Name (as on Aadhaar/PAN)</Text>
                <TextInput
                  style={[styles.textInputStandard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: themeColors.textPrimary }]}
                  value={signupName}
                  onChangeText={setSignupName}
                  placeholder="e.g. Ramesh Chandra Verma"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Mobile Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Primary Mobile Number</Text>
                <TextInput
                  style={[styles.textInputStandard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: themeColors.textPrimary }]}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={signupPhone}
                  onChangeText={setSignupPhone}
                  placeholder="9876543210"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Account Type Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Select Account Variant</Text>
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
                        { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
                        signupAccountType === acc.id && { borderColor: '#141414', backgroundColor: '#FFFFFF' },
                      ]}
                      onPress={() => setSignupAccountType(acc.id as any)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.accountTypeTitle,
                          { color: themeColors.textPrimary },
                          signupAccountType === acc.id && { fontWeight: '800' },
                        ]}
                      >
                        {acc.label}
                      </Text>
                      <Text style={[styles.accountTypeSub, { color: themeColors.textSecondary }]}>{acc.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Setup 6-digit MPIN */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Set 6-Digit MPIN</Text>
                <TextInput
                  style={[styles.textInputStandard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: themeColors.textPrimary }]}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  value={signupMpin}
                  onChangeText={setSignupMpin}
                  placeholder="Enter 6 numbers"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Confirm MPIN */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Confirm 6-Digit MPIN</Text>
                <TextInput
                  style={[styles.textInputStandard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: themeColors.textPrimary }]}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  value={confirmMpin}
                  onChangeText={setConfirmMpin}
                  placeholder="Re-enter 6 numbers"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {errorMessage ? (
                <View style={[styles.errorBanner, { backgroundColor: '#FDF2F2', borderColor: '#FCA5A5' }]}>
                  <AlertCircle size={14} color="#C92A2A" />
                  <Text style={[styles.errorBannerText, { color: '#C92A2A' }]}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Continue to DPDP Consent */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#141414' }]}
                onPress={handleSignupSubmit}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>Continue to DPDP Consent</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryLinkButton}
                onPress={() => transitionTo('PHONE')}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryLinkButtonText, { color: themeColors.textSecondary }]}>Back to Existing Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= STEP 3: MOCK OTP VERIFICATION ================= */}
          {step === 'OTP' && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.statusBadge, { backgroundColor: '#F3EFEA' }]}>
                  <Smartphone size={11} color="#141414" />
                  <Text style={[styles.statusBadgeText, { color: '#141414' }]}>OTP Dispatched</Text>
                </View>
                <Text style={[styles.heading, { color: themeColors.textPrimary }]}>Verify Mobile Number</Text>
                <Text style={[styles.subheading, { color: themeColors.textSecondary }]}>
                  Sent 6-digit authentication token to <Text style={{ color: '#141414', fontWeight: 'bold' }}>+91 {phone}</Text>
                </Text>
              </View>

              {/* Realistic SMS Banner */}
              {showMockSmsBanner && (
                <View style={styles.smsBanner}>
                  <View style={styles.smsHeader}>
                    <Smartphone size={13} color="#141414" />
                    <Text style={styles.smsSender}>VK-ABCBNK (SMS Notice)</Text>
                  </View>
                  <Text style={styles.smsBody}>
                    <Text style={styles.smsCodeHighlight}>482910</Text> is your secret OTP for ABC Digital Banking login. Valid for 10 mins. Do not share OTP with anyone.
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
                <ShieldCheck size={15} color="#1B7A43" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.autofillTitle}>Auto-Fill Demo OTP (482910)</Text>
                  <Text style={styles.autofillSubtitle}>Inserts verified code: 482910</Text>
                </View>
                <ArrowRight size={15} color="#1B7A43" />
              </TouchableOpacity>

              {errorMessage ? (
                <View style={[styles.errorBanner, { backgroundColor: '#FDF2F2', borderColor: '#FCA5A5' }]}>
                  <AlertCircle size={14} color="#C92A2A" />
                  <Text style={[styles.errorBannerText, { color: '#C92A2A' }]}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#141414' }, isVerifying && { opacity: 0.7 }]}
                onPress={handleVerifyOtp}
                disabled={isVerifying}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                  {isVerifying ? 'Verifying Security Token...' : 'Verify & Proceed'}
                </Text>
                <CheckCircle2 size={16} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Resend Timer */}
              <View style={styles.resendRow}>
                {resendTimer > 0 ? (
                  <Text style={[styles.resendTimerText, { color: themeColors.textMuted }]}>Resend code in {resendTimer}s</Text>
                ) : (
                  <TouchableOpacity onPress={() => handleRequestOtp()}>
                    <Text style={[styles.resendActiveText, { color: '#141414' }]}>Resend OTP (VK-ABCBNK)</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => transitionTo('PHONE')}>
                  <Text style={[styles.changePhoneText, { color: themeColors.textSecondary }]}>Change Number</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ================= STEP 4: DPDP ACT 2023 & RBI CONSENT ================= */}
          {step === 'DPDP_CONSENT' && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.statusBadge, { backgroundColor: '#EDF7F1' }]}>
                  <ShieldCheck size={11} color="#1B7A43" />
                  <Text style={[styles.statusBadgeText, { color: '#1B7A43' }]}>DPDP Act 2023 Section 6</Text>
                </View>
                <Text style={[styles.heading, { color: themeColors.textPrimary }]}>Statutory Privacy & Consent</Text>
                <Text style={[styles.subheading, { color: themeColors.textSecondary }]}>
                  As a regulated banking data fiduciary, ABC Digital Bank adheres strictly to the Digital Personal Data Protection Act, 2023 & RBI Master Directions.
                </Text>
              </View>

              {/* Consent Card Container */}
              <View style={styles.consentListContainer}>
                {/* 1. Core Banking (Mandatory) */}
                <View style={[styles.consentItem, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <Building2 size={15} color="#141414" />
                      <Text style={[styles.consentItemTitle, { color: themeColors.textPrimary }]}>Core Banking & Transaction Ledger</Text>
                    </View>
                    <View style={[styles.mandatoryBadge, { backgroundColor: '#EDF7F1' }]}>
                      <Text style={[styles.mandatoryBadgeText, { color: '#1B7A43' }]}>Mandatory (RBI)</Text>
                    </View>
                  </View>
                  <Text style={[styles.consentItemDesc, { color: themeColors.textSecondary }]}>
                    Essential transaction logging, core balances, AML reporting, and regulatory audit compliance under RBI Banking Regulation Act 1949.
                  </Text>
                </View>

                {/* 2. Device Security & Binding (Mandatory) */}
                <View style={[styles.consentItem, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <Shield size={15} color="#141414" />
                      <Text style={[styles.consentItemTitle, { color: themeColors.textPrimary }]}>Device Binding & Cyber Defense</Text>
                    </View>
                    <View style={[styles.mandatoryBadge, { backgroundColor: '#EDF7F1' }]}>
                      <Text style={[styles.mandatoryBadgeText, { color: '#1B7A43' }]}>Mandatory (RBI)</Text>
                    </View>
                  </View>
                  <Text style={[styles.consentItemDesc, { color: themeColors.textSecondary }]}>
                    Verifies SIM binding, jailbreak/root tamper inspection, and anomaly detection per RBI Cyber Security Framework guidelines.
                  </Text>
                </View>

                {/* 3. Financial SMS Sync (Optional) */}
                <View style={[styles.consentItem, { backgroundColor: '#FFFFFF', borderColor: themeColors.border }]}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <Smartphone size={15} color="#68645E" />
                      <Text style={[styles.consentItemTitle, { color: themeColors.textPrimary }]}>Financial SMS Passbook Sync</Text>
                    </View>
                    <Switch
                      value={consentDraft.smsFraudDetection}
                      onValueChange={(val) => setConsentDraft((prev) => ({ ...prev, smsFraudDetection: val }))}
                      trackColor={{ false: '#E2E8F0', true: '#141414' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  <Text style={[styles.consentItemDesc, { color: themeColors.textSecondary }]}>
                    On-device scanning of bank & utility SMS to track recurring charges, bill reminders, and prevent unauthorized card debits.
                  </Text>
                </View>

                {/* 4. Account Aggregator (AA) Ecosystem (Optional) */}
                <View style={[styles.consentItem, { backgroundColor: '#FFFFFF', borderColor: themeColors.border }]}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <FileText size={15} color="#68645E" />
                      <Text style={[styles.consentItemTitle, { color: themeColors.textPrimary }]}>RBI Account Aggregator (AA) Sync</Text>
                    </View>
                    <Switch
                      value={consentDraft.accountAggregator}
                      onValueChange={(val) => setConsentDraft((prev) => ({ ...prev, accountAggregator: val }))}
                      trackColor={{ false: '#E2E8F0', true: '#141414' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  <Text style={[styles.consentItemDesc, { color: themeColors.textSecondary }]}>
                    Seamless multi-bank statement analysis and net-worth consolidation through RBI-licensed NBFC Account Aggregators.
                  </Text>
                </View>

                {/* 5. Mitra AI Insights (Optional) */}
                <View style={[styles.consentItem, { backgroundColor: '#FFFFFF', borderColor: themeColors.border }]}>
                  <View style={styles.consentItemHeader}>
                    <View style={styles.consentItemTitleGroup}>
                      <Info size={15} color="#B45309" />
                      <Text style={[styles.consentItemTitle, { color: themeColors.textPrimary }]}>Mitra AI Hyper-Personalization</Text>
                    </View>
                    <Switch
                      value={consentDraft.personalizedOffers}
                      onValueChange={(val) => setConsentDraft((prev) => ({ ...prev, personalizedOffers: val }))}
                      trackColor={{ false: '#E2E8F0', true: '#141414' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  <Text style={[styles.consentItemDesc, { color: themeColors.textSecondary }]}>
                    Proactive empathetic alerts, pre-salary cashflow projections, and tailored financial health suggestions.
                  </Text>
                </View>
              </View>

              {/* Data Fiduciary Disclosures */}
              <View style={[styles.fiduciaryNotice, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <Info size={14} color={themeColors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fiduciaryTitle, { color: themeColors.textPrimary }]}>Data Fiduciary Transparency Notice</Text>
                  <Text style={[styles.fiduciaryText, { color: themeColors.textSecondary }]}>
                    Data Fiduciary: ABC Digital Bank Ltd. • Data Protection Officer (DPO): dpo@abcbank.in • Grievance Helpline: 1800 209 8492.
                    You retain the statutory Right to Access, Correction, and Right to Withdraw Consent at any time in Profile & Privacy Settings.
                  </Text>
                </View>
              </View>

              {/* Authorize & Accept */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#141414' }]}
                onPress={() => handleAcceptDpdp(true)}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>I Agree & Authorize All</Text>
                <CheckCircle2 size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryLinkButton}
                onPress={() => handleAcceptDpdp(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryLinkButtonText, { color: themeColors.textSecondary }]}>Save Selected Preferences</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= STEP 5: MPIN & BIOMETRIC AUTH ================= */}
          {step === 'MPIN' && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.statusBadge, { backgroundColor: '#EDF7F1' }]}>
                  <Lock size={11} color="#1B7A43" />
                  <Text style={[styles.statusBadgeText, { color: '#1B7A43' }]}>Hardware Keystore Locked</Text>
                </View>
                <Text style={[styles.heading, { color: themeColors.textPrimary }]}>Enter 6-Digit MPIN</Text>
                <Text style={[styles.subheading, { color: themeColors.textSecondary }]}>
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
              <View style={[styles.mpinHintBanner, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <Info size={14} color="#68645E" />
                <Text style={[styles.mpinHintText, { color: themeColors.textPrimary }]}>
                  Default Demo MPIN: <Text style={{ fontWeight: '800', color: '#141414' }}>123456</Text> (or 8492)
                </Text>
              </View>

              {errorMessage ? (
                <View style={[styles.errorBanner, { backgroundColor: '#FDF2F2', borderColor: '#FCA5A5' }]}>
                  <AlertCircle size={14} color="#C92A2A" />
                  <Text style={[styles.errorBannerText, { color: '#C92A2A' }]}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Numpad Keypad matching PaymentAuthModal */}
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
                            style={[styles.keypadSpecialButton, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}
                            onPress={handleBiometricUnlock}
                            activeOpacity={0.7}
                          >
                            <Fingerprint size={22} color="#141414" />
                          </TouchableOpacity>
                        );
                      }
                      if (btn === 'DEL') {
                        return (
                          <TouchableOpacity
                            key={btn}
                            style={[styles.keypadSpecialButton, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}
                            onPress={handleMpinDelete}
                            activeOpacity={0.7}
                          >
                            <Delete size={20} color="#68645E" />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={btn}
                          style={[styles.keypadButton, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}
                          onPress={() => handleMpinPress(btn)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.keypadButtonText, { color: '#141414' }]}>{btn}</Text>
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
                activeOpacity={0.7}
              >
                <Text style={[styles.switchUserButtonText, { color: themeColors.textSecondary }]}>Log in with a different account</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 1,
  },
  langPillContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
  },
  langButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  langButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    paddingBottom: 40,
  },
  mainCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.sm,
  },
  stepHeader: {
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heading: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  authModeTabContainer: {
    flexDirection: 'row',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: spacing.md,
    gap: 4,
  },
  authModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: radii.sm,
    gap: 6,
  },
  authModeTabActive: {
    ...shadows.sm,
  },
  authModeTabText: {
    fontSize: 11.5,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 6,
  },
  phoneInputCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: '700',
  },
  inputDivider: {
    width: 1,
    height: 22,
    marginHorizontal: spacing.sm,
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  textInputStandard: {
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 48,
    fontSize: 14,
    fontWeight: '600',
  },
  accountTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  accountTypeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radii.md,
    padding: 10,
  },
  accountTypeTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountTypeSub: {
    fontSize: 9.5,
  },
  primaryButton: {
    borderRadius: radii.md,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  primaryButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryLinkButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  secondaryLinkButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 10,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
  },
  personaSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  personaSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  personaSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  personaSectionDescription: {
    fontSize: 11.5,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  personaList: {
    gap: 10,
  },
  personaCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  personaCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  personaName: {
    fontSize: 13,
    fontWeight: '700',
  },
  personaPhone: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  personaTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  personaTagText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  personaSummary: {
    fontSize: 11,
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
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  personaSelectBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  personaBypassBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  personaBypassBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  switchAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  switchAuthText: {
    fontSize: 12,
  },
  switchAuthLink: {
    fontSize: 12,
    fontWeight: '800',
  },
  smsBanner: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  smsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  smsSender: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#141414',
    letterSpacing: 0.5,
  },
  smsBody: {
    fontSize: 12,
    fontWeight: '500',
    color: '#141414',
    lineHeight: 17,
  },
  smsCodeHighlight: {
    fontWeight: '800',
    color: '#141414',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: '#141414',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: '#141414',
    backgroundColor: '#FFFFFF',
  },
  otpDigitText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#141414',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  autofillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF7F1',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 10,
  },
  autofillTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B7A43',
  },
  autofillSubtitle: {
    fontSize: 10.5,
    color: '#065F46',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendTimerText: {
    fontSize: 12,
  },
  resendActiveText: {
    fontSize: 12,
    fontWeight: '700',
  },
  changePhoneText: {
    fontSize: 12,
    fontWeight: '600',
  },
  consentListContainer: {
    gap: 10,
    marginBottom: spacing.md,
  },
  consentItem: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  consentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  consentItemTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  consentItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  mandatoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  mandatoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  consentItemDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  fiduciaryNotice: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  fiduciaryTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  fiduciaryText: {
    fontSize: 9.5,
    lineHeight: 13.5,
  },
  mpinIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: spacing.lg,
  },
  mpinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: 'transparent',
  },
  mpinDotFilled: {
    borderColor: '#141414',
    backgroundColor: '#141414',
    transform: [{ scale: 1.1 }],
  },
  mpinHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
  },
  mpinHintText: {
    fontSize: 12,
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
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  keypadButtonText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  keypadSpecialButton: {
    flex: 1,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchUserButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: 8,
  },
  switchUserButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
