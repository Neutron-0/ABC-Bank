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
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import {
  Megaphone,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react-native';

interface IpoBiddingModalProps {
  visible: boolean;
  onClose: () => void;
}

interface IpoItem {
  symbol: string;
  name: string;
  priceRange: string;
  lotSize: number;
  cutOffPrice: number;
  dates: string;
  subscription: string;
}

const ACTIVE_IPOS: IpoItem[] = [
  {
    symbol: 'TATA_TECH',
    name: 'Tata Tech Infra Solutions Ltd',
    priceRange: '₹475 - ₹500',
    lotSize: 30,
    cutOffPrice: 500,
    dates: '12 Sep - 16 Sep 2026',
    subscription: '4.8x Subscribed',
  },
  {
    symbol: 'BHARTI_HEXA',
    name: 'Bharti Hexacom Telecom Ltd',
    priceRange: '₹540 - ₹570',
    lotSize: 25,
    cutOffPrice: 570,
    dates: '14 Sep - 18 Sep 2026',
    subscription: '2.1x Subscribed',
  },
];

export const IpoBiddingModal: React.FC<IpoBiddingModalProps> = ({ visible, onClose }) => {
  const { placeAsbaBid, asbaLiens, balance, showToast } = useCustomerStore();

  const [selectedIpo, setSelectedIpo] = useState<IpoItem>(ACTIVE_IPOS[0]);
  const [lotCount, setLotCount] = useState<number>(1);
  const [useCutOff, setUseCutOff] = useState<boolean>(true);
  const [upiId, setUpiId] = useState<string>('rahul@okaxis');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const totalShares = lotCount * selectedIpo.lotSize;
  const totalAmount = totalShares * selectedIpo.cutOffPrice;

  const handleSubmitBid = async () => {
    if (balance.available < totalAmount) {
      showToast(`Insufficient balance. Required ₹${totalAmount.toLocaleString('en-IN')}.`);
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      showToast('Please specify a valid UPI ID (e.g. name@bank).');
      return;
    }

    setIsSubmitting(true);
    const res = await placeAsbaBid({
      ipoName: selectedIpo.symbol,
      shares: totalShares,
      amount: totalAmount,
      upiId,
    });
    setIsSubmitting(false);

    if (res.success) {
      showToast(`ASBA Bid Placed! ₹${totalAmount.toLocaleString('en-IN')} lien blocked.`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Megaphone size={22} color="#141414" />
              </View>
              <View>
                <Text style={styles.headerTitle}>SEBI UPI ASBA IPO Bidding</Text>
                <Text style={styles.headerSub}>Application Supported by Blocked Amount</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#68645E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Active IPO Selector */}
            <Text style={styles.sectionLabel}>Select Active Public Issue:</Text>
            <View style={styles.ipoList}>
              {ACTIVE_IPOS.map((ipo) => (
                <TouchableOpacity
                  key={ipo.symbol}
                  style={[styles.ipoCard, selectedIpo.symbol === ipo.symbol && styles.ipoCardActive]}
                  onPress={() => setSelectedIpo(ipo)}
                >
                  <View style={styles.ipoCardTop}>
                    <Text style={styles.ipoName}>{ipo.name}</Text>
                    <View style={styles.subBadge}>
                      <Text style={styles.subBadgeText}>{ipo.subscription}</Text>
                    </View>
                  </View>
                  <View style={styles.ipoCardMeta}>
                    <Text style={styles.ipoMetaText}>Price: {ipo.priceRange}</Text>
                    <Text style={styles.ipoMetaText}>Lot: {ipo.lotSize} shares</Text>
                    <Text style={styles.ipoMetaText}>Dates: {ipo.dates}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bidding Configuration */}
            <View style={styles.bidForm}>
              <Text style={styles.formTitle}>Configure Retail Bid (UPI Mandate)</Text>

              <View style={styles.rowBetween}>
                <Text style={styles.fieldLabel}>Number of Lots (30 shares/lot)</Text>
                <View style={styles.lotStepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setLotCount(Math.max(1, lotCount - 1))}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepCount}>{lotCount}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setLotCount(Math.min(13, lotCount + 1))}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.fieldLabel}>Cut-Off Price</Text>
                  <Text style={styles.fieldSub}>Bid at highest band for max allotment</Text>
                </View>
                <TouchableOpacity
                  style={[styles.checkbox, useCutOff && styles.checkboxActive]}
                  onPress={() => setUseCutOff(!useCutOff)}
                >
                  {useCutOff && <CheckCircle2 size={16} color="#141414" />}
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalBanner}>
                <View>
                  <Text style={styles.totalLabel}>Total Blocked Amount</Text>
                  <Text style={styles.totalShares}>{totalShares} shares @ ₹{selectedIpo.cutOffPrice}</Text>
                </View>
                <Text style={styles.totalAmt}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>

              {/* UPI ID Input */}
              <Text style={styles.fieldLabel}>SEBI Mandate UPI ID</Text>
              <TextInput
                style={styles.upiInput}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="yourname@bankupi"
                placeholderTextColor="#9C968E"
              />

              {/* Submit Bid Button */}
              <TouchableOpacity
                style={styles.bidBtn}
                onPress={handleSubmitBid}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Lock size={16} color="#FFFFFF" />
                    <Text style={styles.bidBtnText}>Block ₹{totalAmount.toLocaleString('en-IN')} via ASBA</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* SEBI Interest Notice */}
            <View style={styles.asbaNotice}>
              <ShieldCheck size={16} color="#1B7A43" />
              <Text style={styles.noticeText}>
                Funds remain in your primary account earning regular savings interest. No debit occurs until final allotment.
              </Text>
            </View>

            {/* Active ASBA Liens */}
            {asbaLiens.length > 0 && (
              <View style={styles.liensWrap}>
                <Text style={styles.sectionLabel}>Active ASBA IPO Liens:</Text>
                {asbaLiens.map((lien) => (
                  <View key={lien.lienId} style={styles.lienCard}>
                    <View style={styles.lienTop}>
                      <Text style={styles.lienSymbol}>{lien.symbol}</Text>
                      <View style={styles.lienStatusBadge}>
                        <Text style={styles.lienStatusText}>{lien.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.lienAmt}>
                      ₹{lien.amountBlocked.toLocaleString('en-IN')} blocked ({lien.sharesCount} shares)
                    </Text>
                    <Text style={styles.lienMandate}>Mandate: {lien.sebiMandateId}</Text>
                  </View>
                ))}
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141414',
    marginBottom: 8,
  },
  ipoList: {
    gap: 10,
    marginBottom: 16,
  },
  ipoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EAE6DF',
  },
  ipoCardActive: {
    borderColor: '#141414',
    backgroundColor: '#F3EFEA',
  },
  ipoCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ipoName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141414',
    flex: 1,
  },
  subBadge: {
    backgroundColor: '#EDF7F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B7A43',
  },
  ipoCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ipoMetaText: {
    fontSize: 11.5,
    color: '#68645E',
  },
  bidForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141414',
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141414',
  },
  fieldSub: {
    fontSize: 11,
    color: '#68645E',
    marginTop: 2,
  },
  lotStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F3EFEA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#141414',
  },
  stepCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141414',
    minWidth: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAE6DF',
    marginVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#EAE6DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: '#141414',
    backgroundColor: '#F3EFEA',
  },
  totalBanner: {
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
  totalLabel: {
    fontSize: 11,
    color: '#68645E',
  },
  totalShares: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#68645E',
    marginTop: 2,
  },
  totalAmt: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141414',
  },
  upiInput: {
    height: 44,
    backgroundColor: '#F3EFEA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#141414',
    marginTop: 6,
    marginBottom: 14,
  },
  bidBtn: {
    height: 48,
    backgroundColor: '#141414',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bidBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  asbaNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EDF7F1',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDF7F1',
  },
  noticeText: {
    fontSize: 11.5,
    color: '#1B7A43',
    flex: 1,
    lineHeight: 16,
  },
  liensWrap: {
    gap: 8,
    marginBottom: 24,
  },
  lienCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  lienTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lienSymbol: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141414',
  },
  lienStatusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lienStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  lienAmt: {
    fontSize: 12,
    color: '#68645E',
    fontWeight: '600',
  },
  lienMandate: {
    fontSize: 10.5,
    color: '#9C968E',
    marginTop: 2,
  },
});
