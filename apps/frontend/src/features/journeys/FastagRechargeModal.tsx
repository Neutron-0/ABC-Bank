import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useCustomerStore } from '../../state/customerStore';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import {
  Car,
  X,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react-native';

interface FastagRechargeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FastagRechargeModal: React.FC<FastagRechargeModalProps> = ({
  visible,
  onClose,
}) => {
  const { fastag, balance, rechargeFastag, pushBankingSms } = useCustomerStore();
  const { colors: themeColors } = useAppTheme();

  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    refId: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  const amountToCharge = isCustom ? Number(customAmount) || 0 : selectedAmount;
  const isInsufficient = amountToCharge > balance.available;

  const handleRecharge = () => {
    if (amountToCharge <= 0 || isInsufficient) return;
    setIsLoading(true);

    setTimeout(() => {
      const res = rechargeFastag(amountToCharge);
      setSuccessData({
        refId: res.refId,
        amount: amountToCharge,
        newBalance: res.newBalance,
      });
      setIsLoading(false);

      // Push an authentic regulatory SMS alert
      pushBankingSms({
        sender: 'VK-ABCBNK',
        body: `Acct XX8492 debited for INR ${amountToCharge.toFixed(2)} on ${new Date().toLocaleDateString('en-GB')} for NETC FASTag Recharge (${fastag.vehicleNumber}). Ref: ${res.refId}.`,
        type: 'debit',
        amount: amountToCharge,
        referenceId: res.refId,
      });
    }, 800);
  };

  const handleClose = () => {
    setSuccessData(null);
    setIsLoading(false);
    setIsCustom(false);
    setSelectedAmount(500);
    setCustomAmount('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: themeColors.cardBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#FCE7EC' }]}>
                <Car size={20} color="#800020" />
              </View>
              <View>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                  NETC FASTag Recharge
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  National Electronic Toll Collection • NPCI
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!successData ? (
            <View style={styles.body}>
              {/* Vehicle & Tag Info Card */}
              <View style={[styles.tagInfoBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <View style={styles.tagInfoRow}>
                  <Text style={[styles.tagInfoLabel, { color: themeColors.textSecondary }]}>
                    Vehicle Reg Number
                  </Text>
                  <Text style={[styles.tagInfoValue, { color: themeColors.textPrimary }]}>
                    {fastag.vehicleNumber}
                  </Text>
                </View>
                <View style={styles.tagInfoRow}>
                  <Text style={[styles.tagInfoLabel, { color: themeColors.textSecondary }]}>
                    Tag ID
                  </Text>
                  <Text style={[styles.tagInfoMono, { color: themeColors.textSecondary }]}>
                    {fastag.tagId}
                  </Text>
                </View>
                <View style={[styles.tagInfoRow, styles.tagDivider, { borderTopColor: themeColors.border }]}>
                  <Text style={[styles.tagInfoLabel, { color: themeColors.textSecondary }]}>
                    Current Tag Balance
                  </Text>
                  <View style={styles.balanceBadgeRow}>
                    <Text style={[styles.tagBalanceValue, { color: '#E11D48' }]}>
                      ₹{fastag.balance.toLocaleString('en-IN')}
                    </Text>
                    {fastag.balance <= fastag.minBalance && (
                      <View style={styles.lowBadge}>
                        <Text style={styles.lowBadgeText}>Low Balance</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Amount Presets */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: themeColors.textPrimary }]}>
                  Select Recharge Amount
                </Text>
                <View style={styles.presetsGrid}>
                  {[200, 500, 1000, 2000].map((amt) => {
                    const isSelected = !isCustom && selectedAmount === amt;
                    return (
                      <TouchableOpacity
                        key={amt}
                        onPress={() => {
                          setIsCustom(false);
                          setSelectedAmount(amt);
                        }}
                        style={[
                          styles.presetBtn,
                          {
                            backgroundColor: isSelected ? '#800020' : themeColors.cardBgSecondary,
                            borderColor: isSelected ? '#800020' : themeColors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetBtnText,
                            { color: isSelected ? '#FFFFFF' : themeColors.textPrimary },
                          ]}
                        >
                          ₹{amt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Amount Toggle/Input */}
                <View style={styles.customRow}>
                  <TextInput
                    placeholder="Enter custom amount (₹)"
                    placeholderTextColor="#9C968E"
                    keyboardType="numeric"
                    value={customAmount}
                    onChangeText={(val) => {
                      setCustomAmount(val);
                      if (val.trim()) {
                        setIsCustom(true);
                      }
                    }}
                    style={[
                      styles.customInput,
                      {
                        backgroundColor: themeColors.cardBgSecondary,
                        borderColor: isCustom ? '#141414' : themeColors.border,
                        color: themeColors.textPrimary,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Debit Source Warning / Info */}
              <View style={[styles.debitSourceBox, { backgroundColor: '#F3EFEA', borderColor: '#EAE6DF' }]}>
                <ShieldCheck size={16} color="#1B7A43" />
                <Text style={styles.debitSourceText}>
                  Debit From: <Text style={{ fontWeight: '700' }}>DigiSavings A/c ••8492</Text> (Avail: ₹{balance.available.toLocaleString('en-IN')})
                </Text>
              </View>

              {isInsufficient && (
                <View style={styles.errorBox}>
                  <AlertCircle size={14} color="#C92A2A" />
                  <Text style={styles.errorText}>Insufficient balance in savings account.</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleRecharge}
                disabled={amountToCharge <= 0 || isInsufficient || isLoading}
                style={[
                  styles.submitBtn,
                  (amountToCharge <= 0 || isInsufficient || isLoading) && styles.disabledBtn,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      Recharge ₹{amountToCharge.toLocaleString('en-IN')}
                    </Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Success View */
            <View style={styles.successBody}>
              <View style={styles.successIconWrap}>
                <CheckCircle2 size={42} color="#059669" />
              </View>

              <Text style={[styles.successTitle, { color: themeColors.textPrimary }]}>
                FASTag Recharged Successfully!
              </Text>
              <Text style={[styles.successSub, { color: themeColors.textSecondary }]}>
                ₹{successData.amount.toLocaleString('en-IN')} instantly added to vehicle {fastag.vehicleNumber}.
              </Text>

              <View style={[styles.receiptBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>New Tag Balance</Text>
                  <Text style={[styles.receiptValStrong, { color: '#059669' }]}>
                    ₹{successData.newBalance.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>NETC Ref ID</Text>
                  <Text style={[styles.receiptMono, { color: themeColors.textPrimary }]}>
                    {successData.refId}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: themeColors.textSecondary }]}>NPCI Toll Gateway</Text>
                  <Text style={[styles.receiptStatus, { color: '#059669' }]}>Active & Verified</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                style={[styles.doneBtn, { backgroundColor: '#800020' }]}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontFamily: typography.fontFamilies.bold,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.regular,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  tagInfoBox: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  tagInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagDivider: {
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    marginTop: 2,
  },
  tagInfoLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.medium,
  },
  tagInfoValue: {
    fontSize: 13,
    fontFamily: typography.fontFamilies.bold,
    letterSpacing: 0.5,
  },
  tagInfoMono: {
    fontSize: 12,
    fontFamily: 'Courier',
  },
  balanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagBalanceValue: {
    fontSize: 14,
    fontFamily: typography.fontFamilies.bold,
  },
  lowBadge: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowBadgeText: {
    fontSize: 9,
    fontFamily: typography.fontFamilies.bold,
    color: '#E11D48',
    textTransform: 'uppercase',
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.bold,
  },
  presetsGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetBtnText: {
    fontSize: 13,
    fontFamily: typography.fontFamilies.bold,
  },
  customRow: {
    marginTop: spacing.xs,
  },
  customInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: 13,
    fontFamily: typography.fontFamilies.medium,
  },
  debitSourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  debitSourceText: {
    fontSize: 11,
    color: '#2C2B29',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorText: {
    fontSize: 11,
    color: '#C92A2A',
    fontFamily: typography.fontFamilies.medium,
  },
  submitBtn: {
    backgroundColor: '#141414',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radii.lg,
    gap: spacing.xs,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: typography.fontFamilies.bold,
  },
  successBody: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 17,
    fontFamily: typography.fontFamilies.bold,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.regular,
    textAlign: 'center',
    marginTop: -4,
  },
  receiptBox: {
    width: '100%',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.regular,
  },
  receiptValStrong: {
    fontSize: 14,
    fontFamily: typography.fontFamilies.bold,
  },
  receiptMono: {
    fontSize: 11,
    fontFamily: 'Courier',
    fontWeight: '600',
  },
  receiptStatus: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.bold,
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: typography.fontFamilies.bold,
  },
});
