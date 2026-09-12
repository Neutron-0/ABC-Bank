import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  ArrowRight,
  Camera,
  FileCheck,
  Briefcase,
  Home,
  TrendingUp,
} from 'lucide-react-native';

export const KycModal: React.FC = () => {
  const { colors: themeColors, isDark } = useAppTheme();
  const { activeJourney, closeJourney, showToast, language } = useCustomerStore();
  const t = getTranslation(language);
  const [step, setStep] = useState<number>(1);
  const [panInput, setPanInput] = useState('ABCDE1234F');
  const [aadhaarInput, setAadhaarInput] = useState('9876 5432 1098');

  if (activeJourney !== 'kyc' && !activeJourney?.startsWith('kyc') && activeJourney !== 'digital_kyc') return null;

  const handleFinish = () => {
    showToast(
      language === 'hi'
        ? 'डिजिटल केवाईसी सफलतापूर्वक पूर्ण हुआ!'
        : language === 'gu'
        ? 'ડિજિટલ KYC સફળતાપૂર્વક પૂર્ણ થયું!'
        : 'Digital KYC Completed Successfully!'
    );
    closeJourney();
    setStep(1);
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: themeColors.cardBg }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
                <ShieldCheck size={20} color={themeColors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'सरलीकृत डिजिटल केवाईसी' : language === 'gu' ? 'સરળ ડિજિટલ KYC' : 'Simplified Digital KYC'}
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  {language === 'hi'
                    ? `चरण ${step} / 4 • पेपरलेस और त्वरित`
                    : language === 'gu'
                    ? `પગલું ${step} / 4 • પેપરલેસ અને તાત્કાલિક`
                    : `Step ${step} of 4 • Paperless & Instant`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeJourney}
              style={styles.closeBtn}
              delayPressIn={0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressTrack, { backgroundColor: themeColors.border }]}>
            <View style={[styles.progressBar, { width: `${(step / 4) * 100}%`, backgroundColor: themeColors.primary }]} />
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* STEP 1: DigiLocker Identity */}
            {step === 1 && (
              <View style={styles.content}>
                <Text style={[styles.stepHeading, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'पहचान दस्तावेज सत्यापन' : language === 'gu' ? 'ઓળખ દસ્તાવેજ ચકાસણી' : 'Verify Identity Documents'}
                </Text>
                <Text style={[styles.stepDesc, { color: themeColors.textSecondary }]}>
                  {language === 'hi'
                    ? 'हम सुरक्षित डिजिलॉकर के माध्यम से सरकारी-प्रमाणित पहचान प्राप्त करते हैं।'
                    : language === 'gu'
                    ? 'અમે સુરક્ષિત ડિજીલૉકર દ્વારા સરકારી માન્ય ઓળખ મેળવીએ છીએ.'
                    : 'We use secure DigiLocker tokenization to fetch government-verified ID.'}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>PAN Number</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border, color: themeColors.textPrimary }]}
                    value={panInput}
                    onChangeText={setPanInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Aadhaar Number (Virtual ID)</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border, color: themeColors.textPrimary }]}
                    value={aadhaarInput}
                    onChangeText={setAadhaarInput}
                  />
                </View>

                <View style={[styles.securityBadge, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border, borderWidth: 1 }]}>
                  <ShieldCheck size={14} color={themeColors.primary} />
                  <Text style={[styles.securityBadgeText, { color: themeColors.textPrimary }]}>
                    {language === 'hi' ? '256-बिट बैंक एन्क्रिप्शन द्वारा सुरक्षित' : language === 'gu' ? '256-બીટ બેંક એન્ક્રિપ્શન દ્વારા સુરક્ષિત' : '256-bit bank-grade encryption'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
                  onPress={() => setStep(2)}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>
                    {language === 'hi' ? 'ओटीपी से पुष्टि करें' : language === 'gu' ? 'OTP દ્વારા ચકાસો' : 'Verify via OTP'}
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: Address & Live Geo-Match */}
            {step === 2 && (
              <View style={styles.content}>
                <Text style={[styles.stepHeading, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'पता और भू-स्थान सत्यापन' : language === 'gu' ? 'સરનામું અને સ્થાન ચકાસણી' : 'Address & Geo-Match Verification'}
                </Text>
                <Text style={[styles.stepDesc, { color: themeColors.textSecondary }]}>
                  {language === 'hi'
                    ? 'यूआईडीएआई से प्राप्त आपका आधिकारिक आवासीय पता:'
                    : language === 'gu'
                    ? 'UIDAI તરફથી મળેલું તમારું અધિકૃત રહેણાંક સરનામું:'
                    : 'Address retrieved from UIDAI matching your primary account:'}
                </Text>

                <View style={[styles.addressBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <Text style={[styles.addressTitle, { color: themeColors.textSecondary }]}>
                    {language === 'hi' ? 'आवासीय पता' : language === 'gu' ? 'રહેણાંક સરનામું' : 'Residential Address'}
                  </Text>
                  <Text style={[styles.addressText, { color: themeColors.textPrimary }]}>
                    Tower 4, Flat 1204, Cyber Heights, Sector 62, Noida, Uttar Pradesh - 201309
                  </Text>
                  <View style={styles.verifiedRow}>
                    <CheckCircle2 size={14} color={themeColors.primary} />
                    <Text style={[styles.verifiedText, { color: themeColors.primary }]}>Aadhaar & GPS Geo-Matched</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
                  onPress={() => setStep(3)}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>
                    {language === 'hi' ? 'पता की पुष्टि करें' : language === 'gu' ? 'સરનામું કન્ફર્મ કરો' : 'Confirm Address'}
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: Life-Stage Signals & Verification */}
            {step === 3 && (
              <View style={styles.content}>
                <Text style={[styles.stepHeading, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'वित्तीय स्थिति और आय सत्यापन' : language === 'gu' ? 'નાણાકીય સ્થિતિ અને આવક ચકાસણી' : 'Financial Signals & Income Verification'}
                </Text>
                <Text style={[styles.stepDesc, { color: themeColors.textSecondary }]}>
                  {language === 'hi'
                    ? 'अकाउंट एग्रीगेटर से प्राप्त आपके सत्यापित वित्तीय संकेत:'
                    : language === 'gu'
                    ? 'એકાઉન્ટ એગ્રીગેટર તરફથી ચકાસેલા નાણાકીય સંકેતો:'
                    : 'Authoritative cash-flow signals fetched via RBI Account Aggregator framework:'}
                </Text>

                <View style={[styles.signalCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <View style={styles.signalRow}>
                    <Briefcase size={16} color={themeColors.iconNeutral} />
                    <Text style={[styles.signalTitle, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'मासिक वेतन क्रेडिट स्थिरता' : language === 'gu' ? 'માસિક પગાર જમા સ્થિરતા' : 'Monthly Salary Credit Regularity'}
                    </Text>
                  </View>
                  <Text style={[styles.signalValue, { color: themeColors.textPrimary }]}>₹75,000 / month (100% on-time)</Text>
                  <Text style={[styles.signalNote, { color: themeColors.primary }]}>
                    {language === 'hi' ? 'नियोक्ता: टेक सॉल्यूशंस इंडिया प्राइवेट लिमिटेड' : language === 'gu' ? 'નોકરીદાતા: ટેક સોલ્યુશન્સ ઇન્ડિયા પ્રા. લી.' : 'Employer: Tech Solutions India Pvt Ltd'}
                  </Text>
                </View>

                <View style={[styles.signalCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <View style={styles.signalRow}>
                    <Home size={16} color={themeColors.iconNeutral} />
                    <Text style={[styles.signalTitle, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'मासिक देनदारियां और ईएमआई' : language === 'gu' ? 'માસિક જવાબદારીઓ અને EMI' : 'Monthly Obligations & EMIs'}
                    </Text>
                  </View>
                  <Text style={[styles.signalValue, { color: themeColors.textPrimary }]}>₹16,500 / month (DTI: 22%)</Text>
                  <Text style={[styles.signalNote, { color: themeColors.primary }]}>
                    {language === 'hi' ? '40% सुरक्षित सीमा से काफी नीचे' : language === 'gu' ? '40% સલામત મર્યાદા કરતાં ઘણું નીચે' : 'Well within the safe 40% benchmark'}
                  </Text>
                </View>

                <View style={[styles.signalCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <View style={styles.signalRow}>
                    <TrendingUp size={16} color={themeColors.iconNeutral} />
                    <Text style={[styles.signalTitle, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'औसत मासिक बचत व्यवहार' : language === 'gu' ? 'સરેરાશ માસિક બચત વર્તણૂક' : 'Average Monthly Savings Habit'}
                    </Text>
                  </View>
                  <Text style={[styles.signalValue, { color: themeColors.textPrimary }]}>₹24,000 / month surplus</Text>
                  <Text style={[styles.signalNote, { color: themeColors.primary }]}>
                    {language === 'hi' ? '3.8 महीने का लिक्विड इमरजेंसी बफर उपलब्ध' : language === 'gu' ? '3.8 મહિનાનું લિક્વિડ ઇમરજન્સી બફર ઉપલબ્ધ' : '3.8 months emergency runway preserved'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
                  onPress={() => setStep(4)}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>
                    {language === 'hi' ? 'अंतिम सत्यापन करें' : language === 'gu' ? 'અંતિમ ચકાસણી પૂર્ણ કરો' : 'Complete Final Verification'}
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 4: Success Certificate */}
            {step === 4 && (
              <View style={styles.content}>
                <View style={[styles.successIconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
                  <FileCheck size={48} color={themeColors.primary} />
                </View>
                <Text style={[styles.successTitle, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'केवाईसी सत्यापन सफल!' : language === 'gu' ? 'KYC ચકાસણી સફળ!' : 'KYC Verification Complete!'}
                </Text>
                <Text style={[styles.successDesc, { color: themeColors.textSecondary }]}>
                  {language === 'hi'
                    ? 'आपका खाता टियर-2 पूर्ण केवाईसी में अपग्रेड हो चुका है। सभी लेनदेन सीमाएं और व्यक्तिगत सुविधाएं सक्रिय हैं।'
                    : language === 'gu'
                    ? 'તમારું ખાતું ટિયર-2 પૂર્ણ KYC માં અપગ્રેડ થયું છે. તમામ વ્યવહાર મર્યાદાઓ અનલૉક થઈ છે.'
                    : 'Your account is now upgraded to Tier-2 Full KYC. All transaction limits and intelligent features are fully unlocked.'}
                </Text>

                <View style={[styles.badgeWrap, { backgroundColor: themeColors.cardBgSecondary, borderWidth: 1, borderColor: themeColors.border }]}>
                  <CheckCircle2 size={16} color={themeColors.primary} />
                  <Text style={[styles.badgeText, { color: themeColors.primary }]}>Verified ABC Bank Tier-2 Account</Text>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
                  onPress={handleFinish}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>{t.common.done}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 19, 24, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#525866',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F4F5F7',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#ECEEF2',
    width: '100%',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#111318',
  },
  scrollArea: {
    maxHeight: 520,
  },
  content: {
    padding: spacing.xl,
  },
  stepHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    color: '#525866',
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#525866',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    fontSize: 15,
    fontWeight: '600',
    color: '#111318',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  securityBadgeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  addressBox: {
    backgroundColor: '#F7F8F9',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: spacing.xl,
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#525866',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111318',
    lineHeight: 20,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D9E2EC',
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F294A',
    letterSpacing: 0.5,
  },
  signalCard: {
    backgroundColor: '#F7F8F9',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: 10,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  signalTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#525866',
  },
  signalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
    marginTop: 2,
  },
  signalNote: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginTop: 2,
  },
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111318',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    color: '#525866',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  primaryBtn: {
    backgroundColor: '#111318',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
