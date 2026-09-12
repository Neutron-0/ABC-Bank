import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import {
  CreditCard,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Briefcase,
  TrendingUp,
  DollarSign,
  Layers,
  HeartHandshake,
} from 'lucide-react-native';

export const ResponsibleLoanModal: React.FC = () => {
  const { colors: themeColors, isDark } = useAppTheme();
  const {
    activeJourney,
    closeJourney,
    currentState,
    financialHealth,
    showToast,
    balance,
    transactions,
    language,
  } = useCustomerStore();
  const t = getTranslation(language);

  const [loanAmount, setLoanAmount] = useState<number>(150000);
  const [tenureMonths, setTenureMonths] = useState<number>(24);
  const [isDisbursed, setIsDisbursed] = useState<boolean>(false);
  const [disbursedTxId, setDisbursedTxId] = useState<string>('');

  if (activeJourney !== 'loan' && !activeJourney?.includes('loan')) return null;

  const isStress = currentState === 'financial_stress' || financialHealth.status === 'stress';

  const calculateEmi = (principal: number, months: number, annualRate = 11.5) => {
    const r = annualRate / (12 * 100);
    const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi);
  };

  const estimatedEmi = calculateEmi(loanAmount, tenureMonths);

  const handleDisburseLoan = () => {
    const txId = `ABC/LN/2026/${Math.floor(100000 + Math.random() * 900000)}`;
    setDisbursedTxId(txId);

    // Live state update: Credit to account balance & append transaction
    useCustomerStore.setState({
      balance: {
        ...balance,
        available: Math.round((balance.available + loanAmount) * 100) / 100,
        savings: Math.round(((balance.savings || 185000) + loanAmount) * 100) / 100,
      },
      transactions: [
        {
          id: `tx_loan_${Date.now()}`,
          amount: loanAmount,
          type: 'credit',
          category: 'salary',
          merchant: 'ABC Bank Instant Credit',
          description: `Disbursal of ₹${loanAmount.toLocaleString('en-IN')} Affordability Loan`,
          timestamp: new Date().toISOString(),
          status: 'completed',
          isRecurring: false,
          confidenceScore: 0.99,
          aiExplanation: 'Verified against salary regularity and healthy 22% DTI benchmark.',
        },
        ...transactions,
      ],
    });

    setIsDisbursed(true);
    showToast(
      language === 'hi'
        ? `₹${loanAmount.toLocaleString('en-IN')} आपके खाते में जमा कर दिए गए हैं!`
        : language === 'gu'
        ? `₹${loanAmount.toLocaleString('en-IN')} તમારા ખાતામાં જમા કરવામાં આવ્યા છે!`
        : `₹${loanAmount.toLocaleString('en-IN')} has been disbursed into your account!`
    );
  };

  const handleClose = () => {
    setIsDisbursed(false);
    closeJourney();
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: themeColors.cardBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: themeColors.cardBgSecondary }]}>
                <CreditCard size={20} color={themeColors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                  {language === 'hi'
                    ? 'क्षमता-आधारित सुरक्षित ऋण योजना'
                    : language === 'gu'
                    ? 'ક્ષમતા-આધારિત સુરક્ષિત લોન આયોજન'
                    : 'Affordability-First Loan Planning'}
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  {language === 'hi'
                    ? 'वास्तविक नकदी प्रवाह पर आधारित ज़िम्मेदार मूल्यांकन'
                    : language === 'gu'
                    ? 'વાસ્તવિક રોકડ પ્રવાહ આધારે જવાબદાર મૂલ્યાંકન'
                    : 'Evaluated on genuine cash flow, not arbitrary sales targets'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: themeColors.cardBgSecondary }]}
              delayPressIn={0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 1. DISBURSAL CELEBRATION RECEIPT */}
            {isDisbursed ? (
              <View style={styles.disbursedBox}>
                <View style={[styles.disbursedIconCircle, { backgroundColor: isDark ? '#0C2417' : '#F4F5F7' }]}>
                  <CheckCircle2 size={44} color={themeColors.success} />
                </View>
                <Text style={[styles.disbursedTitle, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'ऋण राशि तुरंत जमा हो गई!' : language === 'gu' ? 'લોન રકમ તાત્કાલિક જમા થઈ!' : 'Loan Disbursed Instantly!'}
                </Text>
                <Text style={[styles.disbursedAmount, { color: themeColors.success }]}>+₹{loanAmount.toLocaleString('en-IN')}</Text>
                <Text style={[styles.disbursedSub, { color: themeColors.textSecondary }]}>
                  {language === 'hi'
                    ? 'यह राशि सीधे आपके प्राथमिक खाते में जोड़ दी गई है।'
                    : language === 'gu'
                    ? 'આ રકમ સીધી તમારા પ્રાથમિક ખાતામાં જમા થઈ ગઈ છે.'
                    : 'Credited directly to your active ABC Bank account.'}
                </Text>

                <View style={[styles.receiptCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>Transaction Reference</Text>
                    <Text style={[styles.receiptVal, { color: themeColors.textPrimary }]}>{disbursedTxId}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>Repayment Tenure</Text>
                    <Text style={[styles.receiptVal, { color: themeColors.textPrimary }]}>{tenureMonths} Months</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>Monthly EMI</Text>
                    <Text style={[styles.receiptVal, { color: themeColors.textPrimary }]}>₹{estimatedEmi.toLocaleString('en-IN')} / mo</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>Updated Account Balance</Text>
                    <Text style={[styles.receiptVal, { color: themeColors.textPrimary, fontWeight: '800' }]}>
                      ₹{(balance.available).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
                  onPress={handleClose}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>{t.common.done}</Text>
                </TouchableOpacity>
              </View>
            ) : isStress ? (
              /* 2. ETHICAL SUPPRESSION: Financial Stress Warning */
              <View style={styles.stressWarningBox}>
                <AlertTriangle size={28} color={themeColors.danger} />
                <Text style={styles.stressTitle}>
                  {language === 'hi'
                    ? 'लोन प्रस्ताव रोक दिया गया है (सुरक्षा हेतु)'
                    : language === 'gu'
                    ? 'લોન ઑફર અટકાવી દેવાઈ છે (સુરક્ષા માટે)'
                    : 'Credit Paused for Your Protection'}
                </Text>
                <Text style={[styles.stressDesc, { color: themeColors.textSecondary }]}>
                  {language === 'hi'
                    ? 'हमारे जिम्मेदार बैंकिंग इंजन ने पाया कि इस महीने आपकी देनदारियां (₹32,000) सामान्य से अधिक हैं। आपको कर्ज के जाल से बचाने के लिए नए लोन को रोक दिया गया है।'
                    : language === 'gu'
                    ? 'અમારા જવાબદાર બેંકિંગ એન્જિને નોંધ્યું કે આ મહિને તમારી જવાબદારીઓ (₹32,000) સામાન્ય કરતાં વધુ છે. દેવાના બોજથી બચાવવા નવી લોન અટકાવાઈ છે.'
                    : 'Our responsible banking engine detected that your upcoming commitments (₹32,000) are elevated this cycle. Predatory credit is strictly paused.'}
                </Text>

                <View style={[styles.pledgeCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <ShieldCheck size={16} color={themeColors.primary} />
                  <Text style={[styles.pledgeText, { color: themeColors.textPrimary }]}>
                    {language === 'hi'
                      ? 'एबीसी बैंक की नैतिक प्रतिज्ञा: हम ग्राहकों को कभी भी वित्तीय तनाव के समय ऋण नहीं बेचते।'
                      : language === 'gu'
                      ? 'ABC બેંકની નૈતિક પ્રતિજ્ઞા: અમે નાણાકીય કટોકટીમાં ગ્રાહકોને ક્યારેય લોન નથી વેચતા.'
                      : 'ABC Bank Ethical Guarantee: We never sell debt during moments of customer financial strain.'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.stressHelpBtn, { backgroundColor: isDark ? '#27272A' : '#DC2626' }]}
                  onPress={() => {
                    closeJourney();
                    useCustomerStore.getState().openJourney('financial_stress');
                  }}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stressHelpBtnText}>
                    {language === 'hi' ? 'कैश-फ्लो राहत योजना देखें' : language === 'gu' ? 'રોકડ પ્રવાહ રાહત આયોજન જુઓ' : 'View Cash-Flow Guidance Instead'}
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              /* 3. VERIFIABLE RESPONSIBLE LOAN WORKFLOW */
              <View>
                {/* How AI Verified Eligibility (Real Transaction Signals) */}
                <View style={styles.signalHeaderRow}>
                  <ShieldCheck size={14} color={themeColors.primary} />
                  <Text style={[styles.signalHeaderText, { color: themeColors.textPrimary }]}>
                    {language === 'hi'
                      ? 'एआई ने आपके वास्तविक लेनदेन संकेतों का सत्यापन किया:'
                      : language === 'gu'
                      ? 'AI એ તમારા વાસ્તવિક વ્યવહાર સંકેતો ચકાસ્યા:'
                      : 'HOW AI VERIFIED YOUR REAL TRANSACTION SIGNALS'}
                  </Text>
                </View>

                <View style={[styles.signalBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <View style={styles.signalItem}>
                    <CheckCircle2 size={16} color={themeColors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.signalTitle, { color: themeColors.textPrimary }]}>
                        {language === 'hi' ? 'स्थिर वेतन क्रेडिट' : language === 'gu' ? 'સ્થિર પગાર જમા' : 'Salary Regularity'}
                      </Text>
                      <Text style={[styles.signalDetail, { color: themeColors.textSecondary }]}>₹75,000 received on 1st of every month (100% on-time)</Text>
                    </View>
                  </View>

                  <View style={styles.signalItem}>
                    <CheckCircle2 size={16} color={themeColors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.signalTitle, { color: themeColors.textPrimary }]}>
                        {language === 'hi' ? 'स्वस्थ ऋण-से-आय (DTI)' : language === 'gu' ? 'તંદુરસ્ત ઋણ-આવક ગુણોત્તર' : 'Debt-to-Income (DTI)'}
                      </Text>
                      <Text style={[styles.signalDetail, { color: themeColors.textSecondary }]}>22% DTI ratio (well below safe 40% regulatory cap)</Text>
                    </View>
                  </View>

                  <View style={styles.signalItem}>
                    <CheckCircle2 size={16} color={themeColors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.signalTitle, { color: themeColors.textPrimary }]}>
                        {language === 'hi' ? 'मासिक सरप्लस कुशन' : language === 'gu' ? 'માસિક સરપ્લસ કુશન' : 'Safe Monthly Disposable Cushion'}
                      </Text>
                      <Text style={[styles.signalDetail, { color: themeColors.textSecondary }]}>₹24,000 average surplus after rent and routine bills</Text>
                    </View>
                  </View>
                </View>

                {/* Amount Selector */}
                <Text style={[styles.sectionHeader, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'ऋण राशि चुनें:' : language === 'gu' ? 'લોન રકમ પસંદ કરો:' : 'Select Loan Amount:'}
                </Text>
                <View style={styles.chipsRow}>
                  {[50000, 100000, 150000, 250000, 500000].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.amtChip,
                        { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border },
                        loanAmount === amt && [styles.activeAmtChip, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }],
                      ]}
                      onPress={() => setLoanAmount(amt)}
                      delayPressIn={0}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.amtChipText, { color: themeColors.textSecondary }, loanAmount === amt && { color: '#FFFFFF', fontWeight: '700' }]}>
                        ₹{(amt >= 100000 ? `${amt / 100000} Lakh` : `${amt / 1000}k`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tenure Selector */}
                <Text style={[styles.sectionHeader, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'चुकौती अवधि:' : language === 'gu' ? 'ચુકવણી સમયગાળો:' : 'Repayment Tenure:'}
                </Text>
                <View style={styles.chipsRow}>
                  {[12, 24, 36].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.amtChip,
                        { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border },
                        tenureMonths === m && [styles.activeAmtChip, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }],
                      ]}
                      onPress={() => setTenureMonths(m)}
                      delayPressIn={0}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.amtChipText, { color: themeColors.textSecondary }, tenureMonths === m && { color: '#FFFFFF', fontWeight: '700' }]}>
                        {m} Months
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Live Transparent EMI Breakdown Box */}
                <View style={[styles.calcBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcLabel, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'अनुमानित मासिक ईएमआई:' : language === 'gu' ? 'અંદાજિત માસિક EMI:' : 'Estimated Monthly EMI:'}
                    </Text>
                    <Text style={[styles.calcValue, { color: themeColors.textPrimary }]}>₹{estimatedEmi.toLocaleString('en-IN')} / mo</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcLabel, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'ब्याज दर (पारदर्शी):' : language === 'gu' ? 'વ્યાજ દર (પારદર્શક):' : 'Fixed Interest Rate:'}
                    </Text>
                    <Text style={[styles.calcValue, { color: themeColors.brandSecondary }]}>11.5% p.a. Fixed</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcLabel, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'प्री-पेमेंट चार्ज:' : language === 'gu' ? 'પ્રી-પેમેન્ટ ચાર્જ:' : 'Pre-payment Penalty:'}
                    </Text>
                    <Text style={[styles.calcValue, { color: themeColors.textPrimary }]}>₹0 (Zero Charges)</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcLabel, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'दस्तावेजीकरण:' : language === 'gu' ? 'દસ્તાવેજીકરણ:' : 'Documentation:'}
                    </Text>
                    <Text style={[styles.calcValue, { color: themeColors.textPrimary }]}>100% Paperless DigiLocker</Text>
                  </View>
                </View>

                {/* Action Button: 1-Tap Mock Disbursal */}
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
                  onPress={handleDisburseLoan}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>
                    {language === 'hi'
                      ? `स्वीकार करें और ₹${loanAmount.toLocaleString('en-IN')} तुरंत खाते में पाएं`
                      : language === 'gu'
                      ? `સ્વીકારો અને ₹${loanAmount.toLocaleString('en-IN')} તરત ખાતામાં મેળવો`
                      : `Accept & Disburse ₹${loanAmount.toLocaleString('en-IN')} to Account`}
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" />
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
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: '#525866',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F4F5F7',
  },
  content: {
    padding: spacing.xl,
  },
  signalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  signalHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#002970',
    letterSpacing: 0.5,
  },
  signalBox: {
    backgroundColor: '#F7F8F9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: spacing.lg,
    gap: 10,
  },
  signalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  signalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111318',
  },
  signalDetail: {
    fontSize: 11,
    color: '#525866',
    marginTop: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111318',
    marginBottom: 8,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  amtChip: {
    backgroundColor: '#F4F5F7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  activeAmtChip: {
    backgroundColor: '#002970',
    borderColor: '#002970',
  },
  amtChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#525866',
  },
  activeAmtChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calcBox: {
    backgroundColor: '#F7F8F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: spacing.lg,
    gap: 8,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: 13,
    color: '#525866',
  },
  calcValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111318',
  },
  primaryBtn: {
    backgroundColor: '#002970',
    paddingVertical: 15,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disbursedBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  disbursedIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  disbursedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.4,
  },
  disbursedAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#002970',
    marginTop: 4,
  },
  disbursedSub: {
    fontSize: 13,
    color: '#525866',
    marginTop: 4,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#F7F8F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: spacing.xl,
    gap: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 12,
    color: '#525866',
  },
  receiptVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111318',
  },
  stressWarningBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  stressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  stressDesc: {
    fontSize: 13,
    color: '#525866',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  pledgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F4F5F7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: spacing.xl,
  },
  pledgeText: {
    fontSize: 12,
    color: '#111318',
    fontWeight: '600',
    flex: 1,
  },
  stressHelpBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stressHelpBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
