import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Clock,
  CreditCard,
  Building,
  RefreshCw,
  Info,
} from 'lucide-react-native';

export const CreditScoreModal: React.FC = () => {
  const { activeJourney, closeJourney, language, showToast } = useCustomerStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [score, setScore] = useState(785);

  if (activeJourney !== 'credit_score') return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setScore(788);
      showToast(
        language === 'hi'
          ? 'क्रेडिट स्कोर सफलतापूर्वक रिफ्रेश हुआ: 788'
          : language === 'gu'
          ? 'ક્રેડિટ સ્કોર સફળતાપૂર્વક રિફ્રેશ થયો: 788'
          : 'Credit Score Refreshed: 788 (Excellent)'
      );
    }, 900);
  };

  const getRatingLabel = () => {
    if (score >= 750) {
      return {
        en: 'Excellent',
        hi: 'उत्कृष्ट (शानदार)',
        gu: 'ઉત્કૃષ્ટ (ખૂબ સારું)',
        color: '#16A34A',
        bgColor: '#DCFCE7',
      };
    }
    return {
      en: 'Good',
      hi: 'अच्छा',
      gu: 'સારું',
      color: '#2563EB',
      bgColor: '#DBEAFE',
    };
  };

  const rating = getRatingLabel();

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>
                  {language === 'hi' ? 'क्रेडिट स्कोर व सिबिल रिपोर्ट' : language === 'gu' ? 'ક્રેડિટ સ્કોર અને સિબિલ રિપોર્ટ' : 'Credit Health & CIBIL Score'}
                </Text>
                <Text style={styles.subtitle}>
                  {language === 'hi'
                    ? 'आरबीआई अधिकृत ब्यूरो द्वारा प्रमाणित'
                    : language === 'gu'
                    ? 'આરબીઆઈ માન્ય બ્યુરો દ્વારા પ્રમાણિત'
                    : 'Verified by RBI-Licensed Credit Bureaus'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeJourney}
              style={styles.closeBtn}
              delayPressIn={0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Score Showcase Gauge */}
            <View style={styles.scoreHeroCard}>
              <View style={styles.scoreHeaderRow}>
                <View style={[styles.ratingBadge, { backgroundColor: rating.bgColor }]}>
                  <CheckCircle2 size={13} color={rating.color} />
                  <Text style={[styles.ratingText, { color: rating.color }]}>
                    {language === 'hi' ? rating.hi : language === 'gu' ? rating.gu : rating.en}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshBtn}
                  onPress={handleRefresh}
                  disabled={isRefreshing}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={13} color={colors.textSecondary} />
                  <Text style={styles.refreshBtnText}>
                    {isRefreshing
                      ? (language === 'hi' ? 'रिफ्रेश हो रहा है...' : language === 'gu' ? 'રિફ્રેશ થાય છે...' : 'Refreshing...')
                      : (language === 'hi' ? 'नया स्कोर जाँचें' : language === 'gu' ? 'નવો સ્કોર તપાસો' : 'Refresh Score')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.scoreNumberWrap}>
                <Text style={styles.scoreNumber}>{score}</Text>
                <Text style={styles.scoreMax}>/ 900</Text>
              </View>

              <Text style={styles.scoreSubtext}>
                {language === 'hi'
                  ? 'अंतिम रिफ्रेश: 2 दिन पहले • अगला निःशुल्क रिफ्रेश 28 दिनों में'
                  : language === 'gu'
                  ? 'છેલ્લું રિફ્રેશ: 2 દિવસ પહેલા • આગામી મફત રિફ્રેશ 28 દિવસમાં'
                  : 'Last pulled: 2 days ago • Next free bureau pull in 28 days'}
              </Text>

              {/* Tier Progress Bar */}
              <View style={styles.gaugeTrack}>
                <View style={[styles.gaugeFill, { width: `${((score - 300) / 600) * 100}%` }]} />
              </View>
              <View style={styles.gaugeLabelsRow}>
                <Text style={styles.gaugeLabelText}>300 (Poor)</Text>
                <Text style={styles.gaugeLabelText}>650 (Fair)</Text>
                <Text style={styles.gaugeLabelText}>750+ (Excellent)</Text>
                <Text style={styles.gaugeLabelText}>900</Text>
              </View>
            </View>

            {/* 4 Pillars Grid */}
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'स्कोर के 4 मुख्य आधार' : language === 'gu' ? 'સ્કોરના 4 મુખ્ય આધાર' : 'Key Pillars Impacting Your Score'}
            </Text>

            <View style={styles.factorsList}>
              {/* Factor 1: On-time payments */}
              <View style={styles.factorCard}>
                <View style={styles.factorLeft}>
                  <View style={[styles.factorIconWrap, { backgroundColor: '#DCFCE7' }]}>
                    <CheckCircle2 size={16} color="#16A34A" />
                  </View>
                  <View>
                    <Text style={styles.factorTitle}>
                      {language === 'hi' ? 'समय पर पुनर्भुगतान' : language === 'gu' ? 'સમયસર ચુકવણી' : 'On-Time Payments'}
                    </Text>
                    <Text style={styles.factorDesc}>
                      {language === 'hi' ? 'पिछले 36 महीनों में 100% समय पर ईएमआई' : language === 'gu' ? 'છેલ્લા 36 મહિનામાં 100% સમયસર EMI' : '100% on-time record over 36 months'}
                    </Text>
                  </View>
                </View>
                <View style={styles.factorRight}>
                  <Text style={styles.factorScoreText}>100%</Text>
                  <Text style={styles.factorImpactHigh}>High Impact</Text>
                </View>
              </View>

              {/* Factor 2: Credit Utilization */}
              <View style={styles.factorCard}>
                <View style={styles.factorLeft}>
                  <View style={[styles.factorIconWrap, { backgroundColor: '#DBEAFE' }]}>
                    <CreditCard size={16} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={styles.factorTitle}>
                      {language === 'hi' ? 'क्रेडिट कार्ड उपयोग दर' : language === 'gu' ? 'ક્રેડિટ કાર્ડ વપરાશ દર' : 'Credit Utilization Ratio'}
                    </Text>
                    <Text style={styles.factorDesc}>
                      {language === 'hi' ? '₹1,50,000 लिमिट में से मात्र 12% उपयोग' : language === 'gu' ? '₹1,50,000 મર્યાદામાંથી માત્ર 12% વપરાશ' : '12% utilized of ₹1,50,000 total limit'}
                    </Text>
                  </View>
                </View>
                <View style={styles.factorRight}>
                  <Text style={styles.factorScoreText}>12%</Text>
                  <Text style={styles.factorImpactHigh}>High Impact</Text>
                </View>
              </View>

              {/* Factor 3: Credit Age */}
              <View style={styles.factorCard}>
                <View style={styles.factorLeft}>
                  <View style={[styles.factorIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Clock size={16} color="#D97706" />
                  </View>
                  <View>
                    <Text style={styles.factorTitle}>
                      {language === 'hi' ? 'ऋण इतिहास की अवधि' : language === 'gu' ? 'ક્રેડિટ ઇતિહાસની અવધિ' : 'Credit History Age'}
                    </Text>
                    <Text style={styles.factorDesc}>
                      {language === 'hi' ? 'औसत खाता आयु: 4.2 वर्ष' : language === 'gu' ? 'સરેરાશ ખાતાની ઉંમર: 4.2 વર્ષ' : 'Average account age: 4.2 years'}
                    </Text>
                  </View>
                </View>
                <View style={styles.factorRight}>
                  <Text style={styles.factorScoreText}>4.2 Yrs</Text>
                  <Text style={styles.factorImpactMed}>Medium Impact</Text>
                </View>
              </View>

              {/* Factor 4: Total Active Accounts */}
              <View style={styles.factorCard}>
                <View style={styles.factorLeft}>
                  <View style={[styles.factorIconWrap, { backgroundColor: '#F3E8FF' }]}>
                    <Building size={16} color="#9333EA" />
                  </View>
                  <View>
                    <Text style={styles.factorTitle}>
                      {language === 'hi' ? 'सक्रिय खाते व लोन' : language === 'gu' ? 'સક્રિય ખાતા અને લોન' : 'Active Credit Tradelines'}
                    </Text>
                    <Text style={styles.factorDesc}>
                      {language === 'hi' ? '1 होम लोन, 1 रुपे क्रेडिट कार्ड' : language === 'gu' ? '1 હોમ લોન, 1 રુપે ક્રેડિટ કાર્ડ' : '1 Home Loan, 1 RuPay Platinum Card'}
                    </Text>
                  </View>
                </View>
                <View style={styles.factorRight}>
                  <Text style={styles.factorScoreText}>2 Active</Text>
                  <Text style={styles.factorImpactLow}>Low Impact</Text>
                </View>
              </View>
            </View>

            {/* Smart Coaching Advice */}
            <View style={styles.adviceBox}>
              <View style={styles.adviceHeader}>
                <Info size={16} color={colors.primary} />
                <Text style={styles.adviceTitle}>
                  {language === 'hi' ? '800+ स्कोर बनाए रखने के सुझाव' : language === 'gu' ? '800+ સ્કોર જાળવવા માટેની ટિપ્સ' : 'Tips to Maintain an 800+ Score'}
                </Text>
              </View>
              <Text style={styles.adviceBody}>
                {language === 'hi'
                  ? '1. क्रेडिट कार्ड उपयोग को हमेशा 20% से नीचे रखें।\n2. एक साथ कई ऋण आवेदन न करें (हार्ड इन्क्वायरी से बचें)।\n3. होम लोन की ईएमआई के लिए ऑटो-डेबिट सक्रिय रखें।'
                  : language === 'gu'
                  ? '1. ક્રેડિટ કાર્ડ વપરાશ હંમેશા 20% ની નીચે રાખો.\n2. એકસાથે બહુવિધ લોન અરજીઓ ન કરો (હાર્ડ ઇન્ક્વાયરી ટાળો).\n3. હોમ લોન EMI માટે ઑટો-ડેબિટ સક્રિય રાખો.'
                  : '1. Keep credit card utilization below 20% of limit.\n2. Avoid applying for multiple loans simultaneously.\n3. Ensure auto-debit remains active for recurring EMIs.'}
              </Text>
            </View>

            {/* Done Action */}
            <TouchableOpacity style={styles.doneBtn} onPress={closeJourney} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>
                {language === 'hi' ? 'पूर्ण' : language === 'gu' ? 'સંપૂર્ણ' : 'Done'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
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
    maxHeight: '88%',
    paddingBottom: 24,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.full,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scoreHeroCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  scoreHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  scoreNumberWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  scoreNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  scoreSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: spacing.sm,
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  gaugeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  gaugeLabelText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  factorsList: {
    gap: 8,
    marginBottom: spacing.md,
  },
  factorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  factorIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  factorDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  factorRight: {
    alignItems: 'flex-end',
  },
  factorScoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  factorImpactHigh: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
  factorImpactMed: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  factorImpactLow: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  adviceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.lg,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  adviceBody: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
  },
  doneBtn: {
    backgroundColor: '#0F294A',
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
