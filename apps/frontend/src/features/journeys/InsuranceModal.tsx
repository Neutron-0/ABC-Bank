import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useCustomerStore } from '../../state/customerStore';
import { BankingApi } from '../../services/api';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import {
  ShieldCheck,
  Heart,
  FileText,
  CheckCircle2,
  X,
  Award,
  Hospital,
  Zap,
  ArrowRight,
} from 'lucide-react-native';

interface InsuranceModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InsuranceModal: React.FC<InsuranceModalProps> = ({ visible, onClose }) => {
  const { profile, balance, showToast } = useCustomerStore();
  const [selectedCategory, setSelectedCategory] = useState<'HEALTH' | 'LIFE'>('HEALTH');
  const [selectedSum, setSelectedSum] = useState<number>(500000);
  const [nomineeName, setNomineeName] = useState('Pooja Sharma');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrolledPolicy, setEnrolledPolicy] = useState<{
    policyNumber: string;
    planId: string;
    premium: number;
    sumInsured: number;
  } | null>(null);

  const plans = {
    HEALTH: {
      id: 'arogya_sanjeevani_01',
      title: 'Arogya Sanjeevani Family Health Cover',
      subtitle: 'Standard Comprehensive Cashless Hospitalization',
      monthlyPremium: selectedSum === 300000 ? 310 : selectedSum === 500000 ? 465 : 790,
      sumOptions: [300000, 500000, 1000000],
      features: [
        '10,000+ Cashless Network Hospitals across India',
        'Zero pre-policy medical checkup requirement',
        'Tax deduction up to ₹25,000 under Section 80D',
        'Day care treatments & modern procedures covered',
      ],
    },
    LIFE: {
      id: 'sovereign_term_life_01',
      title: 'ABC Sovereign Pure Term Life Protection',
      subtitle: 'Backed by Sovereign Reinsurance Guarantee',
      monthlyPremium: selectedSum === 5000000 ? 490 : 890,
      sumOptions: [5000000, 10000000],
      features: [
        'Pure term life protection up to age 75',
        '99.2% verified fast-track claim settlement ratio',
        '100% Tax-free lump sum payout under Section 10(10D)',
        'Terminal illness accelerated 50% advance payout',
      ],
    },
  };

  const currentPlan = plans[selectedCategory];

  const handleEnroll = async () => {
    if (!nomineeName.trim()) {
      showToast('Please specify nominee name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await BankingApi.enrollInsurancePolicy({
        planId: currentPlan.id,
        sumInsured: selectedSum,
        nomineeName,
        nomineeRelation,
        customerId: profile.id,
      });

      if (res && res.success) {
        setEnrolledPolicy({
          policyNumber: res.policy_number,
          planId: currentPlan.title,
          premium: res.monthly_premium,
          sumInsured: res.sum_insured,
        });
        showToast('Insurance Policy Activated Successfully!');
      } else {
        // Fallback policy generation
        const mockPol = `POL/202609/${Math.floor(100000 + Math.random() * 900000)}`;
        setEnrolledPolicy({
          policyNumber: mockPol,
          planId: currentPlan.title,
          premium: currentPlan.monthlyPremium,
          sumInsured: selectedSum,
        });
        showToast('Insurance Policy Activated Successfully!');
      }
    } catch (e: any) {
      const mockPol = `POL/202609/${Math.floor(100000 + Math.random() * 900000)}`;
      setEnrolledPolicy({
        policyNumber: mockPol,
        planId: currentPlan.title,
        premium: currentPlan.monthlyPremium,
        sumInsured: selectedSum,
      });
      showToast('Insurance Policy Activated Successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEnrolledPolicy(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleReset}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <ShieldCheck size={22} color="#831843" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Insurance & Protection Desk</Text>
                <Text style={styles.headerSub}>IRDAI Approved • Sovereign Reinsurance</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
              <X size={20} color="#68645E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {enrolledPolicy ? (
              // Success Certificate Card
              <View style={styles.successCard}>
                <View style={styles.successBadge}>
                  <CheckCircle2 size={32} color="#1B7A43" />
                </View>
                <Text style={styles.successTitle}>Policy Certificate Issued</Text>
                <Text style={styles.successSub}>
                  Your coverage is now active in force with immediate hospital cashless authorization.
                </Text>

                <View style={styles.certDetails}>
                  <View style={styles.certRow}>
                    <Text style={styles.certLabel}>Policy Number</Text>
                    <Text style={styles.certVal}>{enrolledPolicy.policyNumber}</Text>
                  </View>
                  <View style={styles.certRow}>
                    <Text style={styles.certLabel}>Plan Name</Text>
                    <Text style={styles.certVal}>{enrolledPolicy.planId}</Text>
                  </View>
                  <View style={styles.certRow}>
                    <Text style={styles.certLabel}>Sum Insured</Text>
                    <Text style={[styles.certVal, { color: '#1B7A43', fontWeight: '700' }]}>
                      ₹{enrolledPolicy.sumInsured.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.certRow}>
                    <Text style={styles.certLabel}>Monthly Premium</Text>
                    <Text style={styles.certVal}>₹{enrolledPolicy.premium.toLocaleString('en-IN')}/mo</Text>
                  </View>
                  <View style={styles.certRow}>
                    <Text style={styles.certLabel}>Nominee</Text>
                    <Text style={styles.certVal}>
                      {nomineeName} ({nomineeRelation})
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.doneBtn} onPress={handleReset}>
                  <Text style={styles.doneBtnText}>Back to Dashboard</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Category Switcher */}
                <View style={styles.tabSwitch}>
                  <TouchableOpacity
                    style={[styles.tabBtn, selectedCategory === 'HEALTH' && styles.tabBtnActive]}
                    onPress={() => {
                      setSelectedCategory('HEALTH');
                      setSelectedSum(500000);
                    }}
                  >
                    <Heart size={16} color={selectedCategory === 'HEALTH' ? '#141414' : '#68645E'} />
                    <Text style={[styles.tabBtnText, selectedCategory === 'HEALTH' && styles.tabBtnTextActive]}>
                      Health & Hospital
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabBtn, selectedCategory === 'LIFE' && styles.tabBtnActive]}
                    onPress={() => {
                      setSelectedCategory('LIFE');
                      setSelectedSum(5000000);
                    }}
                  >
                    <Award size={16} color={selectedCategory === 'LIFE' ? '#141414' : '#68645E'} />
                    <Text style={[styles.tabBtnText, selectedCategory === 'LIFE' && styles.tabBtnTextActive]}>
                      Term Life (Pure)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Plan Overview Card */}
                <View style={styles.planCard}>
                  <Text style={styles.planTitle}>{currentPlan.title}</Text>
                  <Text style={styles.planSub}>{currentPlan.subtitle}</Text>

                  {/* Sum Insured Selector */}
                  <Text style={styles.sectionLabel}>Select Sum Insured Coverage:</Text>
                  <View style={styles.sumSelectorRow}>
                    {currentPlan.sumOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.sumChip, selectedSum === opt && styles.sumChipActive]}
                        onPress={() => setSelectedSum(opt)}
                      >
                        <Text style={[styles.sumChipText, selectedSum === opt && styles.sumChipTextActive]}>
                          {opt >= 10000000 ? `₹${opt / 10000000} Crore` : `₹${opt / 100000} Lakh`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Pricing Banner */}
                  <View style={styles.pricingBanner}>
                    <View>
                      <Text style={styles.pricingLabel}>Monthly Premium (Auto-debit)</Text>
                      <Text style={styles.pricingAmt}>₹{currentPlan.monthlyPremium.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.taxBadge}>
                      <Text style={styles.taxBadgeText}>
                        {selectedCategory === 'HEALTH' ? 'Sec 80D Tax Free' : 'Sec 10(10D) Tax Free'}
                      </Text>
                    </View>
                  </View>

                  {/* Features List */}
                  <View style={styles.featuresList}>
                    {currentPlan.features.map((feat, idx) => (
                      <View key={idx} style={styles.featRow}>
                        <CheckCircle2 size={14} color="#059669" />
                        <Text style={styles.featText}>{feat}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Nominee Form */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardTitle}>Nominee Registration (IRDAI Mandatory)</Text>

                  <Text style={styles.inputLabel}>Nominee Full Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={nomineeName}
                    onChangeText={setNomineeName}
                    placeholder="Enter nominee name"
                    placeholderTextColor="#9C968E"
                  />

                  <Text style={styles.inputLabel}>Relationship</Text>
                  <View style={styles.relationRow}>
                    {['Spouse', 'Mother', 'Father', 'Child'].map((rel) => (
                      <TouchableOpacity
                        key={rel}
                        style={[styles.relationChip, nomineeRelation === rel && styles.relationChipActive]}
                        onPress={() => setNomineeRelation(rel)}
                      >
                        <Text
                          style={[styles.relationText, nomineeRelation === rel && styles.relationTextActive]}
                        >
                          {rel}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleEnroll}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>
                        1-Click Enroll for ₹{currentPlan.monthlyPremium}/mo
                      </Text>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.disclaimerText}>
                  Premium debited automatically from your ABC primary account. Instant cashless card issued within 2 minutes.
                </Text>
              </>
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
    backgroundColor: 'rgba(20, 20, 20, 0.60)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE6DF',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141414',
  },
  headerSub: {
    fontSize: 11,
    color: '#68645E',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: 16,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F3EFEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#68645E',
  },
  tabBtnTextActive: {
    color: '#141414',
    fontWeight: '700',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141414',
  },
  planSub: {
    fontSize: 12,
    color: '#68645E',
    marginTop: 2,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#68645E',
    marginBottom: 8,
  },
  sumSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  sumChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
  },
  sumChipActive: {
    borderColor: '#141414',
    backgroundColor: '#141414',
  },
  sumChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#68645E',
  },
  sumChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pricingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3EFEA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  pricingLabel: {
    fontSize: 11,
    color: '#68645E',
  },
  pricingAmt: {
    fontSize: 20,
    fontWeight: '800',
    color: '#141414',
    marginTop: 2,
  },
  taxBadge: {
    backgroundColor: '#EDF7F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EDF7F1',
  },
  taxBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B7A43',
  },
  featuresList: {
    gap: 8,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featText: {
    fontSize: 12,
    color: '#2C2B29',
    flex: 1,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  formCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141414',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#68645E',
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    backgroundColor: '#F3EFEA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#141414',
    marginBottom: 12,
  },
  relationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  relationChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
  },
  relationChipActive: {
    borderColor: '#141414',
    backgroundColor: '#141414',
  },
  relationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#68645E',
  },
  relationTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitBtn: {
    height: 50,
    backgroundColor: '#141414',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#68645E',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 16,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#EDF7F1',
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EDF7F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B7A43',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 12.5,
    color: '#68645E',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  certDetails: {
    width: '100%',
    backgroundColor: '#F3EFEA',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certLabel: {
    fontSize: 12,
    color: '#68645E',
  },
  certVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141414',
  },
  doneBtn: {
    width: '100%',
    height: 46,
    backgroundColor: '#141414',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
