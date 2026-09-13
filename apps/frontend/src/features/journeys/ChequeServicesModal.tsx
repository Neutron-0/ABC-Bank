import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useCustomerStore } from '../../state/customerStore';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import {
  FileEdit,
  CheckCircle2,
  X,
  ShieldCheck,
  Ban,
  Package,
} from 'lucide-react-native';

interface ChequeServicesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChequeServicesModal: React.FC<ChequeServicesModalProps> = ({ visible, onClose }) => {
  const { profile, showToast } = useCustomerStore();
  const [activeTab, setActiveTab] = useState<'ORDER' | 'POSITIVE_PAY' | 'STOP'>('ORDER');

  const [leafCount, setLeafCount] = useState<number>(25);
  const [dispatchAddress, setDispatchAddress] = useState('Sector 62, Noida, Uttar Pradesh - 201309');
  const [isOrdered, setIsOrdered] = useState(false);

  // Positive pay
  const [chequeNo, setChequeNo] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [chequeAmt, setChequeAmt] = useState('');

  const handleOrder = () => {
    setIsOrdered(true);
    showToast(`New ${leafCount}-leaf personalized chequebook dispatched!`);
  };

  const handlePositivePay = () => {
    if (!chequeNo || !payeeName || !chequeAmt) {
      showToast('Please fill all mandatory cheque details.');
      return;
    }
    showToast(`Positive Pay registered for Cheque #${chequeNo} (₹${chequeAmt})!`);
    onClose();
  };

  const handleStop = () => {
    if (!chequeNo) {
      showToast('Please specify cheque number to stop.');
      return;
    }
    showToast(`Stop payment registered for Cheque #${chequeNo}.`);
    onClose();
  };

  const handleReset = () => {
    setIsOrdered(false);
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
                <FileEdit size={22} color="#0F766E" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Cheque Services Desk</Text>
                <Text style={styles.headerSub}>Order, Positive Pay & Stop Cheque</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
              <X size={20} color="#68645E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Tabs */}
            <View style={styles.tabSwitch}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'ORDER' && styles.tabBtnActive]}
                onPress={() => setActiveTab('ORDER')}
              >
                <Package size={13} color={activeTab === 'ORDER' ? '#141414' : '#68645E'} />
                <Text style={[styles.tabBtnText, activeTab === 'ORDER' && styles.tabBtnTextActive]}>
                  Order Book
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'POSITIVE_PAY' && styles.tabBtnActive]}
                onPress={() => setActiveTab('POSITIVE_PAY')}
              >
                <ShieldCheck size={13} color={activeTab === 'POSITIVE_PAY' ? '#141414' : '#68645E'} />
                <Text style={[styles.tabBtnText, activeTab === 'POSITIVE_PAY' && styles.tabBtnTextActive]}>
                  Positive Pay
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'STOP' && styles.tabBtnActive]}
                onPress={() => setActiveTab('STOP')}
              >
                <Ban size={13} color={activeTab === 'STOP' ? '#141414' : '#68645E'} />
                <Text style={[styles.tabBtnText, activeTab === 'STOP' && styles.tabBtnTextActive]}>
                  Stop Cheque
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab 1: Order Chequebook */}
            {activeTab === 'ORDER' && (
              <View style={styles.card}>
                {isOrdered ? (
                  <View style={styles.successBox}>
                    <CheckCircle2 size={32} color="#1B7A43" />
                    <Text style={styles.successTitle}>Chequebook Request Dispatched</Text>
                    <Text style={styles.successSub}>
                      Your personalized {leafCount}-leaf chequebook will be delivered to your registered address via SpeedPost within 3 business days.
                    </Text>
                    <TouchableOpacity style={styles.doneBtn} onPress={handleReset}>
                      <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.cardTitle}>Order Personalized Chequebook</Text>
                    <Text style={styles.fieldLabel}>Number of Cheque Leaves</Text>
                    <View style={styles.chipRow}>
                      {[25, 50, 100].map((count) => (
                        <TouchableOpacity
                          key={count}
                          style={[styles.chip, leafCount === count && styles.chipActive]}
                          onPress={() => setLeafCount(count)}
                        >
                          <Text style={[styles.chipText, leafCount === count && styles.chipTextActive]}>
                            {count} Leaves {count === 25 ? '(Free)' : '(₹75)'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.fieldLabel}>Delivery Address (SpeedPost)</Text>
                    <TextInput
                      style={styles.input}
                      value={dispatchAddress}
                      onChangeText={setDispatchAddress}
                    />

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleOrder} activeOpacity={0.8}>
                      <Text style={styles.primaryBtnText}>Confirm Chequebook Order</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Tab 2: Positive Pay */}
            {activeTab === 'POSITIVE_PAY' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>RBI Positive Pay Confirmation</Text>
                <Text style={styles.cardSub}>
                  Mandatory fraud protection confirmation for cheques exceeding ₹50,000.
                </Text>

                <Text style={styles.fieldLabel}>Cheque Number (6 digits)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 004128"
                  placeholderTextColor="#9C968E"
                  keyboardType="numeric"
                  value={chequeNo}
                  onChangeText={setChequeNo}
                />

                <Text style={styles.fieldLabel}>Payee Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name of recipient"
                  placeholderTextColor="#9C968E"
                  value={payeeName}
                  onChangeText={setPayeeName}
                />

                <Text style={styles.fieldLabel}>Cheque Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="₹ 50,000"
                  placeholderTextColor="#9C968E"
                  keyboardType="numeric"
                  value={chequeAmt}
                  onChangeText={setChequeAmt}
                />

                <TouchableOpacity style={styles.primaryBtn} onPress={handlePositivePay} activeOpacity={0.8}>
                  <Text style={styles.primaryBtnText}>Register Positive Pay</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tab 3: Stop Payment */}
            {activeTab === 'STOP' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Stop Cheque Payment</Text>
                <Text style={styles.cardSub}>
                  Instantly block clearing of a lost or cancelled cheque before settlement.
                </Text>

                <Text style={styles.fieldLabel}>Cheque Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="6 digit cheque number"
                  placeholderTextColor="#9C968E"
                  keyboardType="numeric"
                  value={chequeNo}
                  onChangeText={setChequeNo}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: '#C92A2A' }]}
                  onPress={handleStop}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>Stop Payment Immediately</Text>
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
    backgroundColor: 'rgba(20, 20, 20, 0.60)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
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
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    gap: 4,
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
    fontSize: 11.5,
    fontWeight: '600',
    color: '#68645E',
  },
  tabBtnTextActive: {
    color: '#141414',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141414',
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 12,
    color: '#68645E',
    lineHeight: 17,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141414',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
  },
  chipActive: {
    borderColor: '#141414',
    backgroundColor: '#141414',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#68645E',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    height: 44,
    backgroundColor: '#F3EFEA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#141414',
    marginBottom: 14,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#141414',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B7A43',
    marginTop: 10,
    marginBottom: 4,
  },
  successSub: {
    fontSize: 12,
    color: '#68645E',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  doneBtn: {
    backgroundColor: '#141414',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 10,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
