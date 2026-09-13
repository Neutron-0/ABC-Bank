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
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Building,
  Truck,
  CheckCircle2,
  X,
  Clock,
  Shield,
} from 'lucide-react-native';

interface RelationshipManagerModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'CONTACT' | 'APPOINTMENT' | 'DOORSTEP';
}

export const RelationshipManagerModal: React.FC<RelationshipManagerModalProps> = ({
  visible,
  onClose,
  initialTab = 'CONTACT',
}) => {
  const { profile, showToast } = useCustomerStore();
  const [activeTab, setActiveTab] = useState<'CONTACT' | 'APPOINTMENT' | 'DOORSTEP'>(initialTab);

  // Appointment states
  const [apptDate, setApptDate] = useState('Tomorrow, 11:30 AM');
  const [apptAgenda, setApptAgenda] = useState('Wealth Advisory & Tax Optimization');
  const [isApptBooked, setIsApptBooked] = useState(false);

  // Doorstep states
  const [doorstepService, setDoorstepService] = useState<'CHEQUE_PICKUP' | 'CASH_DELIVERY' | 'LIFE_CERTIFICATE'>('CHEQUE_PICKUP');
  const [doorstepAddress, setDoorstepAddress] = useState('Sector 62, Noida, UP - 201309');
  const [isDoorstepBooked, setIsDoorstepBooked] = useState(false);

  const handleBookAppointment = () => {
    setIsApptBooked(true);
    showToast('Priority appointment booked with your Relationship Manager!');
  };

  const handleBookDoorstep = () => {
    setIsDoorstepBooked(true);
    showToast('Doorstep Banking agent dispatched. Token generated under RBI guidelines.');
  };

  const handleReset = () => {
    setIsApptBooked(false);
    setIsDoorstepBooked(false);
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
                <UserCheck size={22} color="#831843" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Dedicated Relationship Desk</Text>
                <Text style={styles.headerSub}>Burgundy Private Wealth Management</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* RM Profile Hero */}
            <View style={styles.rmHero}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>VM</Text>
              </View>
              <View style={styles.rmDetails}>
                <Text style={styles.rmName}>Vikram Malhotra</Text>
                <Text style={styles.rmRole}>Senior Private Banker & Wealth Director</Text>
                <Text style={styles.rmBranch}>Cyber City Premier Hub • Gurugram</Text>
              </View>
            </View>

            {/* Segmented Tabs */}
            <View style={styles.tabSwitch}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'CONTACT' && styles.tabBtnActive]}
                onPress={() => setActiveTab('CONTACT')}
              >
                <Phone size={13} color={activeTab === 'CONTACT' ? '#831843' : '#64748B'} />
                <Text style={[styles.tabBtnText, activeTab === 'CONTACT' && styles.tabBtnTextActive]}>
                  Direct Contact
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'APPOINTMENT' && styles.tabBtnActive]}
                onPress={() => setActiveTab('APPOINTMENT')}
              >
                <Calendar size={13} color={activeTab === 'APPOINTMENT' ? '#831843' : '#64748B'} />
                <Text style={[styles.tabBtnText, activeTab === 'APPOINTMENT' && styles.tabBtnTextActive]}>
                  In-Branch Appt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'DOORSTEP' && styles.tabBtnActive]}
                onPress={() => setActiveTab('DOORSTEP')}
              >
                <Truck size={13} color={activeTab === 'DOORSTEP' ? '#831843' : '#64748B'} />
                <Text style={[styles.tabBtnText, activeTab === 'DOORSTEP' && styles.tabBtnTextActive]}>
                  Doorstep Banking
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab 1: Direct Contact */}
            {activeTab === 'CONTACT' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Direct Banker Access Channels</Text>
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => showToast('Connecting call to Vikram Malhotra...')}
                >
                  <View style={[styles.iconBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Phone size={16} color="#059669" />
                  </View>
                  <View style={styles.contactTextWrap}>
                    <Text style={styles.contactLabel}>Direct VIP Hotline</Text>
                    <Text style={styles.contactVal}>+91 98200 11223 (Ext 401)</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => showToast('Opening mail composer...')}
                >
                  <View style={[styles.iconBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Mail size={16} color="#2563EB" />
                  </View>
                  <View style={styles.contactTextWrap}>
                    <Text style={styles.contactLabel}>Encrypted Email</Text>
                    <Text style={styles.contactVal}>vikram.malhotra@abcbank.in</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.contactItem}>
                  <View style={[styles.iconBadge, { backgroundColor: '#FDF2F8' }]}>
                    <Clock size={16} color="#831843" />
                  </View>
                  <View style={styles.contactTextWrap}>
                    <Text style={styles.contactLabel}>Dedicated Operating Hours</Text>
                    <Text style={styles.contactVal}>Mon - Sat: 9:00 AM – 7:30 PM</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Tab 2: Book In-Branch Appointment */}
            {activeTab === 'APPOINTMENT' && (
              <View style={styles.card}>
                {isApptBooked ? (
                  <View style={styles.bookedCard}>
                    <CheckCircle2 size={32} color="#059669" />
                    <Text style={styles.bookedTitle}>Priority Appointment Confirmed</Text>
                    <Text style={styles.bookedSub}>
                      Reserved for {apptDate} at Cyber City Premier Branch. A dedicated private meeting room is booked.
                    </Text>
                    <TouchableOpacity style={styles.bookedDoneBtn} onPress={handleReset}>
                      <Text style={styles.bookedDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.cardTitle}>Schedule In-Branch Executive Meeting</Text>
                    <Text style={styles.fieldLabel}>Preferred Date & Time</Text>
                    <TextInput
                      style={styles.input}
                      value={apptDate}
                      onChangeText={setApptDate}
                    />

                    <Text style={styles.fieldLabel}>Discussion Agenda</Text>
                    <TextInput
                      style={styles.input}
                      value={apptAgenda}
                      onChangeText={setApptAgenda}
                    />

                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={handleBookAppointment}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.primaryBtnText}>Confirm Priority Appointment</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Tab 3: Doorstep Banking (RBI Mandate) */}
            {activeTab === 'DOORSTEP' && (
              <View style={styles.card}>
                {isDoorstepBooked ? (
                  <View style={styles.bookedCard}>
                    <CheckCircle2 size={32} color="#059669" />
                    <Text style={styles.bookedTitle}>Doorstep Agent Dispatched</Text>
                    <Text style={styles.bookedSub}>
                      Your verification code: ABC-7741. An authorized bank agent will arrive at {doorstepAddress} within 3 hours.
                    </Text>
                    <TouchableOpacity style={styles.bookedDoneBtn} onPress={handleReset}>
                      <Text style={styles.bookedDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.cardTitle}>Doorstep Banking Service (RBI Compliant)</Text>
                    <Text style={styles.fieldLabel}>Select Service</Text>
                    <View style={styles.serviceChips}>
                      {[
                        { id: 'CHEQUE_PICKUP', label: 'Cheque Pickup' },
                        { id: 'CASH_DELIVERY', label: 'Cash Delivery' },
                        { id: 'LIFE_CERTIFICATE', label: 'Life Certificate' },
                      ].map((s) => (
                        <TouchableOpacity
                          key={s.id}
                          style={[
                            styles.servChip,
                            doorstepService === s.id && styles.servChipActive,
                          ]}
                          onPress={() => setDoorstepService(s.id as any)}
                        >
                          <Text
                            style={[
                              styles.servText,
                              doorstepService === s.id && styles.servTextActive,
                            ]}
                          >
                            {s.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.fieldLabel}>Pickup / Delivery Address</Text>
                    <TextInput
                      style={styles.input}
                      value={doorstepAddress}
                      onChangeText={setDoorstepAddress}
                    />

                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={handleBookDoorstep}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.primaryBtnText}>Request Doorstep Agent</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Security Badge */}
            <View style={styles.secRow}>
              <Shield size={14} color="#64748B" />
              <Text style={styles.secText}>
                All interactions backed by dual-factor OTP authentication and digital audit logs.
              </Text>
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
    backgroundColor: '#FCE7F3',
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
  rmHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#831843',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rmDetails: {
    flex: 1,
  },
  rmName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  rmRole: {
    fontSize: 12,
    color: '#831843',
    fontWeight: '600',
    marginTop: 2,
  },
  rmBranch: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
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
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#831843',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextWrap: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  contactVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#831843',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  serviceChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  servChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  servChipActive: {
    borderColor: '#831843',
    backgroundColor: '#FDF2F8',
  },
  servText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  servTextActive: {
    color: '#831843',
    fontWeight: '700',
  },
  bookedCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  bookedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 10,
    marginBottom: 4,
  },
  bookedSub: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  bookedDoneBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookedDoneText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  secText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
});
