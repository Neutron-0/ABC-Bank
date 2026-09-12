import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAppTheme, typography, spacing, radii, shadows } from '../../theme';
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

const MODAL_WIDTH = Math.min(360, Dimensions.get('window').width - 40);
const GAUGE_CX = MODAL_WIDTH / 2;
const GAUGE_CY = 115;
const GAUGE_R = 85;

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

export const CreditScoreModal: React.FC = () => {
  const { colors } = useAppTheme();
  const { activeJourney, closeJourney, language, showToast } = useCustomerStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [score, setScore] = useState(785);

  const isVisible = activeJourney === 'credit_score' || activeJourney === 'credit';

  if (!isVisible) return null;

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
        color: colors.brandSecondary,
        bgColor: colors.brandSecondarySubtle,
      };
    }
    return {
      en: 'Good',
      hi: 'अच्छा',
      gu: 'સારું',
      color: colors.primary,
      bgColor: colors.cardBgSecondary,
    };
  };

  const rating = getRatingLabel();

  // Gauge angle calculation (sweep 200 degrees: -10 deg to 190 deg)
  const normalizedScore = Math.min(1, Math.max(0, (score - 300) / (900 - 300)));
  const indicatorAngle = -10 + normalizedScore * 200;
  const indicatorPos = polarToCartesian(GAUGE_CX, GAUGE_CY, GAUGE_R, indicatorAngle);

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.cardBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.cardBgSecondary }]}>
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  {language === 'hi'
                    ? 'क्रेडिट स्कोर व सिबिल रिपोर्ट'
                    : language === 'gu'
                    ? 'ક્રેડિટ સ્કોર અને સિબિલ રિપોર્ટ'
                    : 'Credit Health & CIBIL Score'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
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
              style={[styles.closeBtn, { backgroundColor: colors.cardBgSecondary }]}
              delayPressIn={0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Score Showcase Gauge */}
            <View style={[styles.scoreHeroCard, { backgroundColor: colors.cardBgSecondary, borderColor: colors.border }]}>
              <View style={styles.scoreHeaderRow}>
                <View style={[styles.ratingBadge, { backgroundColor: rating.bgColor }]}>
                  <CheckCircle2 size={13} color={rating.color} />
                  <Text style={[styles.ratingText, { color: rating.color }]}>
                    {language === 'hi' ? rating.hi : language === 'gu' ? rating.gu : rating.en}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.refreshBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                  onPress={handleRefresh}
                  disabled={isRefreshing}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={13} color={colors.textSecondary} />
                  <Text style={[styles.refreshBtnText, { color: colors.textSecondary }]}>
                    {isRefreshing
                      ? (language === 'hi' ? 'रिफ्रेश...' : language === 'gu' ? 'રિફ્રેશ...' : 'Refreshing...')
                      : (language === 'hi' ? 'नया स्कोर' : language === 'gu' ? 'નવો સ્कोर' : 'Refresh Score')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bespoke Radial Arc Gauge */}
              <View style={styles.gaugeContainer}>
                <Svg width={MODAL_WIDTH} height={145}>
                  {/* Background Track */}
                  <Path
                    d={describeArc(GAUGE_CX, GAUGE_CY, GAUGE_R, -10, 190)}
                    fill="none"
                    stroke={colors.border}
                    strokeWidth={9}
                    strokeLinecap="round"
                  />
                  {/* Filled Arc */}
                  <Path
                    d={describeArc(GAUGE_CX, GAUGE_CY, GAUGE_R, -10, indicatorAngle)}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth={9}
                    strokeLinecap="round"
                  />

                  {/* Dynamic Score Indicator Needle / Pointer Circle */}
                  <Circle
                    cx={indicatorPos.x}
                    cy={indicatorPos.y}
                    r={9}
                    fill={colors.brandSecondary}
                    opacity={0.25}
                  />
                  <Circle
                    cx={indicatorPos.x}
                    cy={indicatorPos.y}
                    r={6}
                    fill={colors.brandSecondary}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />

                  {/* Benchmark Degree Labels */}
                  <SvgText x={GAUGE_CX - GAUGE_R - 4} y={GAUGE_CY + 18} fontSize="9" fontWeight="600" fill={colors.textMuted} textAnchor="middle">
                    300
                  </SvgText>
                  <SvgText x={GAUGE_CX} y={GAUGE_CY - GAUGE_R - 12} fontSize="9" fontWeight="600" fill={colors.textMuted} textAnchor="middle">
                    650
                  </SvgText>
                  <SvgText x={GAUGE_CX + GAUGE_R + 4} y={GAUGE_CY + 18} fontSize="9" fontWeight="600" fill={colors.textMuted} textAnchor="middle">
                    900
                  </SvgText>

                  {/* Centered Large Numeric Score */}
                  <SvgText
                    x={GAUGE_CX}
                    y={GAUGE_CY + 4}
                    fontSize="38"
                    fontWeight="800"
                    fill={colors.textPrimary}
                    textAnchor="middle"
                    letterSpacing="-1.5"
                  >
                    {score}
                  </SvgText>
                  <SvgText
                    x={GAUGE_CX}
                    y={GAUGE_CY + 22}
                    fontSize="11"
                    fontWeight="600"
                    fill={colors.textSecondary}
                    textAnchor="middle"
                    letterSpacing="0.6"
                  >
                    TRANSUNION CIBIL
                  </SvgText>
                </Svg>
              </View>
            </View>

            {/* 4 Pillars Impact Section */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {language === 'hi'
                ? 'स्कोर को प्रभावित करने वाले 4 घटक'
                : language === 'gu'
                ? 'સ્કોરના 4 મુખ્ય આધાર'
                : 'Key Pillars Impacting Your Score'}
            </Text>

            <View style={styles.factorsList}>
              {/* Factor 1: On-time payments */}
              <View style={[styles.factorCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.factorLeft}>
                  <View style={[styles.factorIconWrap, { backgroundColor: colors.cardBgSecondary }]}>
                    <CheckCircle2 size={16} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.factorTitle, { color: colors.textPrimary }]}>
                      {language === 'hi' ? 'समय पर पुनर्भुगतान' : language === 'gu' ? 'સમયસર ચુકવણી' : 'On-Time Payments'}
                    </Text>
                    <Text style={[styles.factorDesc, { color: colors.textSecondary }]}>
                      {language === 'hi' ? 'पिछले 36 महीनों में 100% समय पर ईएमआई' : language === 'gu' ? 'છેલ્લા 36 મહિનામાં 100% સમયસર EMI' : '100% on-time record over 36 months'}
                    </Text>
                  </View>
                </View>
                <View style={styles.factorRight}>
                  <Text style={[styles.factorScoreText, { color: colors.textPrimary }]}>100%</Text>
                  <Text style={styles.factorImpactHigh}>High Impact</Text>
                </View>
              </View>

              {/* Factor 2: Credit Utilization */}
              <View style={[styles.factorCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.factorLeft}>
                  <View style={[styles.factorIconWrap, { backgroundColor: colors.cardBgSecondary }]}>
                    <CreditCard size={16} color={colors.iconNeutral} />
                  </View>
                  <View>
                    <Text style={[styles.factorTitle, { color: colors.textPrimary }]}>
                      {language === 'hi' ? 'क्रेडिट कार्ड उपयोग दर' : language === 'gu' ? 'ક્રેડિટ કાર્ડ વપરાશ દર' : 'Credit Utilization Ratio'}
                    </Text>
                    <Text style={[styles.factorDesc, { color: colors.textSecondary }]}>
                      {language === 'hi' ? '₹1,50,000 लिमिट में से मात्र 12% उपयोग' : language === 'gu' ? '₹1,50,000 મર્યાદામાંથી માત્ર 12% વપરાશ' : '12% utilized of ₹1,50,000 total limit'}
                    </Text>
                  </View>
                </View>
                <View style={styles.factorRight}>
                  <Text style={[styles.factorScoreText, { color: colors.textPrimary }]}>12%</Text>
                  <Text style={styles.factorImpactHigh}>High Impact</Text>
                </View>
              </View>

              {/* Factor 3: Credit Age */}
              <View style={[styles.factorCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.factorLeft}>
                  <View style={[styles.factorIconWrap, { backgroundColor: colors.cardBgSecondary }]}>
                    <Clock size={16} color={colors.iconNeutral} />
                  </View>
                  <View>
                    <Text style={[styles.factorTitle, { color: colors.textPrimary }]}>
                      {language === 'hi' ? 'क्रेडिट इतिहास की अवधि' : language === 'gu' ? 'ક્રેડિટ ઇતિહાસનો સમયગાળો' : 'Credit History Length'}
                    </Text>
                    <Text style={[styles.factorDesc, { color: colors.textSecondary }]}>
                      {language === 'hi' ? '4 वर्ष 2 माह का सुदृढ़ क्रेडिट रिकॉर्ड' : language === 'gu' ? '4 વર્ષ 2 મહિનાનો સારો ક્રેડિટ રેકોર્ડ' : '4 yrs 2 mos seasoned account track'}
                    </Text>
                  </View>
                </View>
                <View style={styles.factorRight}>
                  <Text style={[styles.factorScoreText, { color: colors.textPrimary }]}>4.2 Yrs</Text>
                  <Text style={styles.factorImpactMed}>Medium Impact</Text>
                </View>
              </View>

              {/* Factor 4: Inquiries */}
              <View style={[styles.factorCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.factorLeft}>
                  <View style={[styles.factorIconWrap, { backgroundColor: colors.cardBgSecondary }]}>
                    <Building size={16} color={colors.iconNeutral} />
                  </View>
                  <View>
                    <Text style={[styles.factorTitle, { color: colors.textPrimary }]}>
                      {language === 'hi' ? 'हार्ड इंक्वायरी संख्या' : language === 'gu' ? 'હાર્ડ પૂછપરછ સંખ્યા' : 'Recent Credit Inquiries'}
                    </Text>
                    <Text style={[styles.factorDesc, { color: colors.textSecondary }]}>
                      {language === 'hi' ? 'पिछले 90 दिनों में शून्य इंक्वायरी' : language === 'gu' ? 'છેલ્લા 90 દિવસમાં શૂન્ય પૂછપરછ' : '0 inquiries in last 90 days'}
                    </Text>
                  </View>
                </View>
                <View style={styles.factorRight}>
                  <Text style={[styles.factorScoreText, { color: colors.textPrimary }]}>0</Text>
                  <Text style={styles.factorImpactLow}>Low Impact</Text>
                </View>
              </View>
            </View>

            {/* Strategic Advisory */}
            <View style={[styles.adviceBox, { backgroundColor: colors.cardBgSecondary, borderColor: colors.border }]}>
              <View style={styles.adviceHeader}>
                <Info size={16} color={colors.primary} />
                <Text style={[styles.adviceTitle, { color: colors.textPrimary }]}>Institutional Bureau Insights</Text>
              </View>
              <Text style={[styles.adviceBody, { color: colors.textSecondary }]}>
                Your low 12% utilization and perfect 36-month on-time repayment history place your account in the top tier. Your pre-approved personal loan at 10.5% p.a. and credit card limit upgrade are active with zero documentation required.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
              onPress={closeJourney}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Close Credit Report</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bodyBold,
    fontSize: 16,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scoreHeroCard: {
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  scoreHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
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
    ...typography.tiny,
    fontWeight: '700',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 6,
  },
  gaugeInnerContent: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumberWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  scoreMax: {
    fontSize: 15,
    fontWeight: '600',
  },
  bureauBadgeText: {
    ...typography.tiny,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  scoreSubtext: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodyBold,
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
    borderRadius: radii.md,
    borderWidth: 1,
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
    ...typography.captionMedium,
    fontWeight: '700',
  },
  factorDesc: {
    ...typography.tiny,
    marginTop: 1,
  },
  factorRight: {
    alignItems: 'flex-end',
  },
  factorScoreText: {
    ...typography.captionMedium,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  factorImpactHigh: {
    ...typography.tiny,
    fontWeight: '700',
    color: '#16A34A',
  },
  factorImpactMed: {
    ...typography.tiny,
    fontWeight: '700',
    color: '#D97706',
  },
  factorImpactLow: {
    ...typography.tiny,
    fontWeight: '700',
    color: '#64748B',
  },
  adviceBox: {
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  adviceTitle: {
    ...typography.captionMedium,
    fontWeight: '700',
  },
  adviceBody: {
    ...typography.caption,
    lineHeight: 18,
  },
  doneBtn: {
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  doneBtnText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});
