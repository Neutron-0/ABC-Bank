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
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  CheckCircle2,
  X,
  ShieldCheck,
  QrCode,
} from 'lucide-react-native';

interface DigitalRupeeModalProps {
  visible: boolean;
  onClose: () => void;
}

const DENOMINATIONS = [10, 20, 50, 100, 200, 500];

export const DigitalRupeeModal: React.FC<DigitalRupeeModalProps> = ({ visible, onClose }) => {
  const {
    digitalRupeeBalance,
    loadDigitalRupee,
    redeemDigitalRupee,
    sendDigitalRupee,
    balance,
    showToast,
  } = useCustomerStore();

  const [activeTab, setActiveTab] = useState<'LOAD' | 'REDEEM' | 'SEND'>('LOAD');
  const [amount, setAmount] = useState<string>('200');
  const [recipient, setRecipient] = useState<string>('rahul.merchant@rbi.cbdc');

  const parsedAmt = parseFloat(amount) || 0;

  const handleAction = () => {
    if (parsedAmt <= 0) {
      showToast('Please specify a valid amount.');
      return;
    }

    if (activeTab === 'LOAD') {
      if (balance.available < parsedAmt) {
        showToast('Insufficient bank balance.');
        return;
      }
      loadDigitalRupee(parsedAmt);
    } else if (activeTab === 'REDEEM') {
      if (digitalRupeeBalance < parsedAmt) {
        showToast('Insufficient Digital Rupee balance.');
        return;
      }
      redeemDigitalRupee(parsedAmt);
    } else if (activeTab === 'SEND') {
      if (digitalRupeeBalance < parsedAmt) {
        showToast('Insufficient e₹ balance.');
        return;
      }
      if (!recipient.trim()) {
        showToast('Please enter recipient CBDC address.');
        return;
      }
      sendDigitalRupee(parsedAmt, recipient);
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
                <Coins size={22} color="#059669" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Digital Rupee (e₹) Wallet</Text>
                <Text style={styles.headerSub}>RBI Sovereign Central Bank Digital Currency (CBDC)</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Wallet Balance Hero */}
            <View style={styles.walletHero}>
              <Text style={styles.walletHeroLabel}>Total Sovereign e₹ Balance</Text>
              <Text style={styles.walletHeroAmt}>e₹ {digitalRupeeBalance.toLocaleString('en-IN')}</Text>
              <View style={styles.walletHeroSubRow}>
                <ShieldCheck size={14} color="#A7F3D0" />
                <Text style={styles.walletHeroSub}>Direct Legal Tender • Sovereign RBI Liability</Text>
              </View>
            </View>

            {/* Segmented Action Tabs */}
            <View style={styles.tabSwitch}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'LOAD' && styles.tabBtnActive]}
                onPress={() => setActiveTab('LOAD')}
              >
                <ArrowDownLeft size={14} color={activeTab === 'LOAD' ? '#059669' : '#64748B'} />
                <Text style={[styles.tabBtnText, activeTab === 'LOAD' && styles.tabBtnTextActive]}>
                  Load from Bank
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'REDEEM' && styles.tabBtnActive]}
                onPress={() => setActiveTab('REDEEM')}
              >
                <ArrowUpRight size={14} color={activeTab === 'REDEEM' ? '#059669' : '#64748B'} />
                <Text style={[styles.tabBtnText, activeTab === 'REDEEM' && styles.tabBtnTextActive]}>
                  Redeem to Bank
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'SEND' && styles.tabBtnActive]}
                onPress={() => setActiveTab('SEND')}
              >
                <Send size={14} color={activeTab === 'SEND' ? '#059669' : '#64748B'} />
                <Text style={[styles.tabBtnText, activeTab === 'SEND' && styles.tabBtnTextActive]}>
                  Send e₹ Token
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Card */}
            <View style={styles.actionCard}>
              <Text style={styles.inputLabel}>
                {activeTab === 'LOAD'
                  ? `Amount to Load (Avail: ₹${balance.available.toLocaleString('en-IN')})`
                  : activeTab === 'REDEEM'
                  ? `Amount to Redeem (e₹ ${digitalRupeeBalance.toLocaleString('en-IN')})`
                  : 'Transfer Amount'}
              </Text>

              <TextInput
                style={styles.amtInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />

              {/* Denomination quick chips */}
              <View style={styles.denomRow}>
                {DENOMINATIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.denomChip, parsedAmt === d && styles.denomChipActive]}
                    onPress={() => setAmount(d.toString())}
                  >
                    <Text style={[styles.denomText, parsedAmt === d && styles.denomTextActive]}>
                      e₹{d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {activeTab === 'SEND' && (
                <View style={styles.recipientWrap}>
                  <Text style={styles.inputLabel}>Recipient CBDC Wallet VPA / Mobile</Text>
                  <TextInput
                    style={styles.textInput}
                    value={recipient}
                    onChangeText={setRecipient}
                    placeholder="e.g. mobile@rbi.cbdc"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}

              {/* Action Button */}
              <TouchableOpacity style={styles.actionBtn} onPress={handleAction} activeOpacity={0.8}>
                <Text style={styles.actionBtnText}>
                  {activeTab === 'LOAD'
                    ? `Load e₹ ${parsedAmt} into Wallet`
                    : activeTab === 'REDEEM'
                    ? `Redeem e₹ ${parsedAmt} to Account`
                    : `Transfer e₹ ${parsedAmt} Privately`}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresNote}>
              <View style={styles.noteRow}>
                <CheckCircle2 size={13} color="#059669" />
                <Text style={styles.noteText}>Instant finality with zero intermediary risk</Text>
              </View>
              <View style={styles.noteRow}>
                <CheckCircle2 size={13} color="#059669" />
                <Text style={styles.noteText}>Programmable digital vouchers for offline retail</Text>
              </View>
            </View>
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
    backgroundColor: '#FAF8F8',
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
    borderBottomColor: '#F1F5F9',
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
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: 16,
  },
  walletHero: {
    backgroundColor: '#064E3B',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  walletHeroLabel: {
    fontSize: 12,
    color: '#A7F3D0',
    fontWeight: '500',
  },
  walletHeroAmt: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 6,
  },
  walletHeroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletHeroSub: {
    fontSize: 11,
    color: '#A7F3D0',
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  amtInput: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  denomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  denomChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  denomChipActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  denomText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  denomTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  recipientWrap: {
    marginBottom: 16,
  },
  textInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  actionBtn: {
    height: 48,
    backgroundColor: '#059669',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuresNote: {
    gap: 6,
    paddingHorizontal: 6,
    marginBottom: 24,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteText: {
    fontSize: 11.5,
    color: '#64748B',
  },
});
