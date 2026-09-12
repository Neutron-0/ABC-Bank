import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';
import { useCustomerStore } from '../../state/customerStore';
import {
  CreditCard,
  X,
  Lock,
  Unlock,
  Wifi,
  Globe,
  ShoppingCart,
  Sliders,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react-native';

export const DebitCardModal: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const {
    activeJourney,
    closeJourney,
    language,
    showToast,
    cardControls,
    updateCardControls,
    fetchCardControls,
  } = useCustomerStore();

  useEffect(() => {
    fetchCardControls();
  }, []);

  const isLocked = cardControls?.is_locked ?? false;
  const contactlessEnabled = cardControls?.contactlessEnabled ?? true;
  const onlineEnabled = cardControls?.onlineEnabled ?? true;
  const intlEnabled = cardControls?.intlEnabled ?? false;
  const atmLimit = cardControls?.atmLimit ?? 50000;
  const [showCvv, setShowCvv] = useState(false);

  const isVisible =
    activeJourney === 'debit_card' ||
    activeJourney === 'card' ||
    activeJourney === 'cards';

  if (!isVisible) return null;

  const handleToggleLock = (val: boolean) => {
    updateCardControls({ is_locked: val });
    showToast(
      val
        ? (language === 'hi' ? 'डेबिट कार्ड तुरंत फ्रीज / लॉक कर दिया गया!' : language === 'gu' ? 'ડેબિટ કાર્ડ તરત જ લોક કરી દેવાયું!' : 'Debit Card Frozen for Security!')
        : (language === 'hi' ? 'डेबिट कार्ड अनब्लॉक / सक्रिय किया गया!' : language === 'gu' ? 'ડેબિટ કાર્ડ અનબ્લોક કરવામાં આવ્યું!' : 'Debit Card Unlocked & Active!')
    );
  };

  const handleSetContactless = (val: boolean) => {
    updateCardControls({ contactlessEnabled: val });
  };

  const handleSetOnline = (val: boolean) => {
    updateCardControls({ onlineEnabled: val });
  };

  const handleSetIntl = (val: boolean) => {
    updateCardControls({ intlEnabled: val });
  };

  const handleSetAtmLimit = (val: number) => {
    updateCardControls({ atmLimit: val });
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: themeColors.cardBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: `${themeColors.primary}15` }]}>
                <CreditCard size={20} color={themeColors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'डेबिट कार्ड प्रबंधन व सुरक्षा' : language === 'gu' ? 'ડેબિટ કાર્ડ નિયંત્રણ અને સુરક્ષા' : 'Debit Card Controls & Security'}
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  {language === 'hi'
                    ? 'रुपे प्लेटिनम • खाता संख्या •••• 8492'
                    : language === 'gu'
                    ? 'રુપે પ્લેટિનમ • ખાતા નંબર •••• 8492'
                    : 'RuPay Platinum Contactless • Account •••• 8492'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeJourney}
              style={[styles.closeBtn, { backgroundColor: themeColors.cardBgSecondary }]}
              delayPressIn={0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Visual Card Component */}
            <View style={[styles.visualCard, isLocked && styles.visualCardLocked]}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardBankName}>ABC BANK</Text>
                <View style={[styles.cardStatusBadge, isLocked ? styles.cardBadgeLocked : styles.cardBadgeActive]}>
                  {isLocked ? <Lock size={11} color={themeColors.danger} /> : <CheckCircle2 size={11} color={themeColors.primary} />}
                  <Text style={[styles.cardStatusText, { color: isLocked ? themeColors.danger : themeColors.primary }]}>
                    {isLocked
                      ? (language === 'hi' ? 'कार्ड लॉक' : language === 'gu' ? 'કાર્ડ લૉક' : 'LOCKED')
                      : (language === 'hi' ? 'सक्रिय' : language === 'gu' ? 'સક્રિય' : 'ACTIVE')}
                  </Text>
                </View>
              </View>

              <View style={styles.cardChipRow}>
                <View style={styles.emvChip} />
                <Wifi size={18} color={themeColors.textMuted} style={{ transform: [{ rotate: '90deg' }] }} />
              </View>

              <Text style={styles.cardNumber}>4532  ••••  ••••  4102</Text>

              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.cardLabel}>CARDHOLDER</Text>
                  <Text style={styles.cardHolderName}>RAHUL SHARMA</Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.cardValue}>09/29</Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>CVV</Text>
                  <TouchableOpacity onPress={() => setShowCvv(!showCvv)} style={styles.cvvWrap}>
                    <Text style={styles.cardValue}>{showCvv ? '824' : '•••'}</Text>
                    {showCvv ? <EyeOff size={12} color={themeColors.textMuted} /> : <Eye size={12} color={themeColors.textMuted} />}
                  </TouchableOpacity>
                </View>
                <Text style={styles.rupayLogo}>RuPay</Text>
              </View>
            </View>

            {/* Instant Emergency Freeze Switch */}
            <View style={[styles.freezeCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }, isLocked && styles.freezeCardActive]}>
              <View style={styles.freezeLeft}>
                <View style={[styles.freezeIconWrap, { backgroundColor: themeColors.cardBg }]}>
                  {isLocked ? <Lock size={18} color={themeColors.danger} /> : <Unlock size={18} color={themeColors.iconNeutral} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.freezeTitle, { color: themeColors.textPrimary }]}>
                    {language === 'hi' ? 'तात्कालिक कार्ड लॉक / फ्रीज' : language === 'gu' ? 'તાત્કાલિક કાર્ડ લૉક / ફ્રીઝ' : 'Instant Freeze & Lock Card'}
                  </Text>
                  <Text style={[styles.freezeDesc, { color: themeColors.textSecondary }]}>
                    {language === 'hi'
                      ? 'कार्ड खो जाने या संदिग्ध गतिविधि होने पर तुरंत लेन-देन बंद करें'
                      : language === 'gu'
                      ? 'કાર્ડ ખોવાઈ જતાં અથવા શંકાસ્પદ વ્યવહાર પર તાત્કાલિક લૉક કરો'
                      : 'Blocks all ATM, POS, and online charges immediately'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isLocked}
                onValueChange={handleToggleLock}
                trackColor={{ false: themeColors.border, true: themeColors.danger }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Usage Channels Settings */}
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              {language === 'hi' ? 'लेन-देन अनुमतियां व चैनल' : language === 'gu' ? 'વ્યવહાર પરવાનગીઓ અને ચેનલો' : 'Usage Channel Controls'}
            </Text>

            <View style={styles.togglesList}>
              {/* Contactless NFC */}
              <View style={[styles.toggleRow, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <View style={styles.toggleLeft}>
                  <View style={[styles.toggleIconWrap, { backgroundColor: themeColors.cardBg }]}>
                    <Wifi size={16} color={themeColors.iconNeutral} />
                  </View>
                  <View>
                    <Text style={[styles.toggleTitle, { color: themeColors.textPrimary }]}>
                      {language === 'hi' ? 'कॉन्टैक्टलेस (टैप एंड पे)' : language === 'gu' ? 'કોન્ટેક્ટલેસ (ટેપ એન્ડ પે)' : 'Contactless (Tap & Pay)'}
                    </Text>
                    <Text style={[styles.toggleDesc, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'बिना पिन डाले ₹5,000 तक का भुगतान' : language === 'gu' ? 'પિન વગર ₹5,000 સુધી ચુકવણી' : 'Allows tap payments up to ₹5,000 without PIN'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={contactlessEnabled && !isLocked}
                  disabled={isLocked}
                  onValueChange={handleSetContactless}
                  trackColor={{ false: themeColors.border, true: themeColors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Online E-commerce */}
              <View style={[styles.toggleRow, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <View style={styles.toggleLeft}>
                  <View style={[styles.toggleIconWrap, { backgroundColor: themeColors.cardBg }]}>
                    <ShoppingCart size={16} color={themeColors.iconNeutral} />
                  </View>
                  <View>
                    <Text style={[styles.toggleTitle, { color: themeColors.textPrimary }]}>
                      {language === 'hi' ? 'ऑनलाइन ई-कॉमर्स लेन-देन' : language === 'gu' ? 'ઑનલાઇન ઇ-કોમર્સ વ્યવહારો' : 'Online E-Commerce Usage'}
                    </Text>
                    <Text style={[styles.toggleDesc, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'अमेज़न, फ्लिपकार्ट और बिल पेमेंट्स' : language === 'gu' ? 'એમેઝોન, ફ્લિપકાર્ટ અને બિલ ચુકવણી' : 'Amazon, Flipkart, and utility payment gateways'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={onlineEnabled && !isLocked}
                  disabled={isLocked}
                  onValueChange={handleSetOnline}
                  trackColor={{ false: themeColors.border, true: themeColors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* International Usage */}
              <View style={[styles.toggleRow, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <View style={styles.toggleLeft}>
                  <View style={[styles.toggleIconWrap, { backgroundColor: themeColors.cardBg }]}>
                    <Globe size={16} color={themeColors.iconNeutral} />
                  </View>
                  <View>
                    <Text style={[styles.toggleTitle, { color: themeColors.textPrimary }]}>
                      {language === 'hi' ? 'अंतर्राष्ट्रीय लेन-देन' : language === 'gu' ? 'આંતરરાષ્ટ્રીય વ્યવહારો' : 'International Transactions'}
                    </Text>
                    <Text style={[styles.toggleDesc, { color: themeColors.textSecondary }]}>
                      {language === 'hi' ? 'भारत से बाहर विदेश में कार्ड का उपयोग' : language === 'gu' ? 'ભારત બહાર વિદેશમાં કાર્ડનો ઉપયોગ' : 'Foreign currency & global website transactions'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={intlEnabled && !isLocked}
                  disabled={isLocked}
                  onValueChange={handleSetIntl}
                  trackColor={{ false: themeColors.border, true: themeColors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Daily ATM Withdrawal Limit */}
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              {language === 'hi' ? 'दैनिक एटीएम निकासी सीमा' : language === 'gu' ? 'દૈનિક એટીએમ ઉપાડ મર્યાદા' : 'Daily ATM Cash Withdrawal Limit'}
            </Text>

            <View style={styles.limitSelector}>
              {[25000, 50000, 100000].map((amt) => {
                const isSelected = atmLimit === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.limitChip,
                      { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border },
                      isSelected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                    ]}
                    onPress={() => {
                      handleSetAtmLimit(amt);
                      showToast(
                        language === 'hi'
                          ? `दैनिक एटीएम सीमा ₹${amt.toLocaleString('en-IN')} सेट की गई`
                          : language === 'gu'
                          ? `દૈનિક એટીએમ મર્યાદા ₹${amt.toLocaleString('en-IN')} સેટ કરી`
                          : `Daily ATM limit set to ₹${amt.toLocaleString('en-IN')}`
                      );
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.limitChipText, { color: themeColors.textSecondary }, isSelected && { color: '#FFFFFF', fontWeight: '700' }]}>
                      ₹{amt.toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionCardBtn, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
                onPress={() => showToast(language === 'hi' ? 'ओटीपी सत्यापन के लिए भेजा गया' : language === 'gu' ? 'ઓટીપી ચકાસણી મોકલી' : 'PIN Reset OTP Sent to Registered Mobile')}
                activeOpacity={0.8}
              >
                <KeyRound size={16} color={themeColors.iconNeutral} />
                <Text style={[styles.actionCardBtnText, { color: themeColors.textPrimary }]}>
                  {language === 'hi' ? 'पिन बदलें' : language === 'gu' ? 'પિન બદલો' : 'Change PIN'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCardBtn, { backgroundColor: themeColors.cardBgSecondary, borderColor: '#FCA5A5' }]}
                onPress={() => {
                  handleToggleLock(true);
                  showToast(language === 'hi' ? 'कार्ड ब्लॉक रिपोर्ट दर्ज की गई' : language === 'gu' ? 'કાર્ડ બ્લોક રિપોર્ટ નોંધાઈ' : 'Card Blocked & Re-issue Ticket Generated');
                }}
                activeOpacity={0.8}
              >
                <AlertTriangle size={16} color="#DC2626" />
                <Text style={[styles.actionCardBtnText, { color: '#DC2626' }]}>
                  {language === 'hi' ? 'खो जाने की रिपोर्ट' : language === 'gu' ? 'ખોવાઈ ગયાની રિપોર્ટ' : 'Report Lost'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Done Action */}
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: themeColors.primary }]}
              onPress={closeJourney}
              activeOpacity={0.85}
            >
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
    maxHeight: '90%',
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
  visualCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  visualCardLocked: {
    backgroundColor: '#334155',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBankName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  cardStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  cardBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  cardBadgeLocked: {
    backgroundColor: '#FEE2E2',
  },
  cardStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  emvChip: {
    width: 36,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#D97706',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 18,
    fontFamily: 'monospace',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  cardHolderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  cardValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  cvvWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rupayLogo: {
    fontSize: 16,
    fontWeight: '900',
    color: '#38BDF8',
    fontStyle: 'italic',
  },
  freezeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  freezeCardActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  freezeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  freezeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freezeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  freezeDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  togglesList: {
    gap: 8,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  toggleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  toggleDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  limitSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  limitChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  limitChipSelected: {
    backgroundColor: '#002970',
    borderColor: '#002970',
  },
  limitChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  limitChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  actionCardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actionCardBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  doneBtn: {
    backgroundColor: '#002970',
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
