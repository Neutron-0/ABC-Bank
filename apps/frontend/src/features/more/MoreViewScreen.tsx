import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useCustomerStore } from '../../state/customerStore';
import { useAppTheme, typography, spacing, radii, shadows } from '../../theme';
import {
  Landmark,
  CreditCard,
  PiggyBank,
  Percent,
  TrendingUp,
  ShieldCheck,
  Globe,
  Car,
  Box,
  Gift,
  Clock,
  Megaphone,
  ArrowLeftRight,
  QrCode,
  Send,
  Receipt,
  RefreshCcw,
  Coins,
  UserCheck,
  FileEdit,
  Watch,
  Users,
  ShieldAlert,
  Headphones,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';

interface MoreViewScreenProps {
  onNavigate?: (route: string) => void;
  onOpenModal?: (modalId: string) => void;
}

type TabId = 'products' | 'payments' | 'services';

interface GridEntry {
  id: string;
  icon: any;
  label: string;
  subLabel?: string;
  badge?: string;
  action: 'navigate' | 'modal';
  target: string;
}

export const MoreViewScreen: React.FC<MoreViewScreenProps> = ({
  onNavigate,
  onOpenModal,
}) => {
  const { colors: themeColors } = useAppTheme();
  const { setActiveTab, openJourney, showToast } = useCustomerStore();
  const [activeTab, setActiveTabState] = useState<TabId>('products');

  const handleAction = (entry: GridEntry) => {
    if (entry.action === 'navigate') {
      if (onNavigate) {
        onNavigate(entry.target);
      } else {
        setActiveTab(entry.target as any);
      }
    } else {
      if (onOpenModal) {
        onOpenModal(entry.target);
      } else {
        openJourney(entry.target);
      }
    }
  };

  const PRODUCTS: GridEntry[] = [
    { id: 'p_accounts', icon: Landmark, label: 'Accounts', subLabel: 'Savings & Current', action: 'navigate', target: 'home' },
    { id: 'p_cards', icon: CreditCard, label: 'Cards', subLabel: 'Debit & Virtual CVV', action: 'modal', target: 'debit_card_modal' },
    { id: 'p_fdrd', icon: PiggyBank, label: 'FD & RD', subLabel: 'Fixed & Recurring', action: 'modal', target: 'deposit_modal' },
    { id: 'p_loans', icon: Percent, label: 'Loans', subLabel: 'KFS & Cooling-off', action: 'modal', target: 'responsible_loan_modal' },
    { id: 'p_invest', icon: TrendingUp, label: 'Investments', subLabel: 'Mutual Funds', action: 'navigate', target: 'insights' },
    { id: 'p_insure', icon: ShieldCheck, label: 'Insurance', subLabel: 'Health & Life', badge: '80D Tax', action: 'modal', target: 'insurance_modal' },
    { id: 'p_forex', icon: Globe, label: 'Forex Card', subLabel: 'Multi-Currency', badge: 'Zero Markup', action: 'modal', target: 'forex_modal' },
    { id: 'p_fastag', icon: Car, label: 'NETC FASTag', subLabel: 'Toll Recharge', action: 'modal', target: 'fastag_modal' },
    { id: 'p_ipo', icon: Megaphone, label: 'ASBA IPO', subLabel: 'SEBI UPI Lien', badge: 'Earning Int', action: 'modal', target: 'ipo_modal' },
    { id: 'p_paylater', icon: Clock, label: 'PayLater', subLabel: 'Instant Credit', action: 'modal', target: 'responsible_loan_modal' },
    { id: 'p_digitalrupee', icon: Coins, label: 'Digital Rupee', subLabel: 'RBI e₹ Wallet', badge: 'New', action: 'modal', target: 'digital_rupee_modal' },
    { id: 'p_offers', icon: Gift, label: 'Offers', subLabel: 'Deals & Cashback', action: 'navigate', target: 'insights' },
  ];

  const PAYMENTS: GridEntry[] = [
    { id: 'pay_send', icon: ArrowLeftRight, label: 'Send Money', subLabel: 'IMPS/NEFT/RTGS', action: 'navigate', target: 'payments' },
    { id: 'pay_qr', icon: QrCode, label: 'Scan & Pay', subLabel: 'Any QR Code', action: 'modal', target: 'scan_qr_modal' },
    { id: 'pay_bhim', icon: Send, label: 'BHIM UPI', subLabel: 'Instant 24x7', action: 'navigate', target: 'payments' },
    { id: 'pay_bill', icon: Receipt, label: 'Bill Pay', subLabel: 'Electricity & Gas', action: 'navigate', target: 'payments' },
    { id: 'pay_fastag', icon: Car, label: 'FASTag', subLabel: 'Toll Recharge', action: 'modal', target: 'fastag_modal' },
    { id: 'pay_rupee', icon: Coins, label: 'e₹ CBDC', subLabel: 'Digital Cash', badge: 'RBI', action: 'modal', target: 'digital_rupee_modal' },
    { id: 'pay_forex', icon: Globe, label: 'Send Abroad', subLabel: 'International FX', action: 'modal', target: 'forex_modal' },
    { id: 'pay_dues', icon: RefreshCcw, label: 'Pay Dues', subLabel: 'Cards & Utilities', action: 'modal', target: 'responsible_loan_modal' },
  ];

  const SERVICES: GridEntry[] = [
    { id: 's_profile', icon: UserCheck, label: 'My Profile & KYC', subLabel: 'Aadhaar / CKYC', action: 'modal', target: 'kyc_modal' },
    { id: 's_cheque', icon: FileEdit, label: 'Cheque Services', subLabel: 'Positive Pay & Stop', badge: 'RBI >50k', action: 'modal', target: 'cheque_modal' },
    { id: 's_rm', icon: Headphones, label: 'Contact RM', subLabel: 'Burgundy Dedicated', badge: 'Priority', action: 'modal', target: 'rm_modal' },
    { id: 's_security', icon: ShieldAlert, label: 'Card Security', subLabel: 'Dynamic Virtual CVV', action: 'modal', target: 'debit_card_modal' },
    { id: 's_tax', icon: Percent, label: 'Tax Statements', subLabel: 'Sec 80C & TDS', action: 'modal', target: 'insurance_modal' },
    { id: 's_doorstep', icon: Landmark, label: 'Doorstep Banking', subLabel: 'Cash / KYC Pickup', action: 'modal', target: 'rm_modal' },
    { id: 's_wearables', icon: Watch, label: 'Wearable Pay', subLabel: 'Smartwatch Token', action: 'modal', target: 'debit_card_modal' },
    { id: 's_refer', icon: Users, label: 'Refer & Earn', subLabel: 'Invite Contacts', action: 'navigate', target: 'insights' },
  ];

  const currentItems = activeTab === 'products' ? PRODUCTS : activeTab === 'payments' ? PAYMENTS : SERVICES;

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: themeColors.bg }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: themeColors.cardBg, borderBottomColor: themeColors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            All Banking Services
          </Text>
          <Text style={[styles.headerSub, { color: themeColors.textSecondary }]}>
            Explore Products, Transfers & Institutional Services
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onOpenModal ? onOpenModal('rm_modal') : openJourney('rm_modal')}
          style={styles.rmButton}
        >
          <Headphones size={13} color="#FFFFFF" />
          <Text style={styles.rmButtonText}>CONTACT RM</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented 3-Tab Selector Bar */}
      <View style={[styles.tabBar, { backgroundColor: themeColors.cardBg, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTabState('products')}
          style={[styles.tabItem, activeTab === 'products' && styles.tabItemActive]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'products' ? '#800020' : themeColors.textSecondary },
              activeTab === 'products' && styles.tabTextActive,
            ]}
          >
            Products ({PRODUCTS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTabState('payments')}
          style={[styles.tabItem, activeTab === 'payments' && styles.tabItemActive]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'payments' ? '#800020' : themeColors.textSecondary },
              activeTab === 'payments' && styles.tabTextActive,
            ]}
          >
            Payments & Transfers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTabState('services')}
          style={[styles.tabItem, activeTab === 'services' && styles.tabItemActive]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'services' ? '#800020' : themeColors.textSecondary },
              activeTab === 'services' && styles.tabTextActive,
            ]}
          >
            Services & Support
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Institutional Grid */}
        <View style={[styles.gridContainer, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={styles.grid}>
            {currentItems.map((entry) => {
              const IconComp = entry.icon;
              return (
                <TouchableOpacity
                  key={entry.id}
                  onPress={() => handleAction(entry)}
                  style={[styles.gridItem, { borderColor: themeColors.border }]}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FCE7EC' }]}>
                      <IconComp size={20} color="#800020" strokeWidth={1.8} />
                    </View>
                    {entry.badge && (
                      <View style={styles.badgeWrap}>
                        <Text style={styles.badgeText}>{entry.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[styles.gridLabel, { color: themeColors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {entry.label}
                  </Text>
                  {entry.subLabel && (
                    <Text
                      style={[styles.gridSubLabel, { color: themeColors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {entry.subLabel}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Highlighted Institutional Promotional Cards (From RBC Bank MoreView) */}
        <View style={styles.promoSection}>
          {/* Guaranteed Pension Plan */}
          <View style={[styles.promoCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.promoContent}>
              <View style={styles.promoTagRow}>
                <View style={styles.newTag}>
                  <Text style={styles.newTagText}>NEW</Text>
                </View>
                <Text style={styles.promoIssuer}>ABC Life & Pension • IRDAI Reg 104</Text>
              </View>
              <Text style={[styles.promoTitle, { color: themeColors.textPrimary }]}>
                Build a lifelong pension of ₹1 lakh/month* with ABC Guaranteed Pension Plan.
              </Text>
              <Text style={styles.promoDisclaimer}>
                *T&C apply. Guaranteed life annuity with 100% return of purchase price.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onOpenModal ? onOpenModal('insurance_modal') : openJourney('insurance_modal')}
              style={styles.promoActionBtn}
            >
              <Text style={styles.promoActionBtnText}>Explore</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Lock FD Security Layer */}
          <View style={[styles.promoCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <View style={styles.promoContent}>
              <View style={styles.promoTagRow}>
                <View style={[styles.newTag, { backgroundColor: '#800020' }]}>
                  <Text style={styles.newTagText}>SECURITY</Text>
                </View>
                <Text style={styles.promoIssuer}>Anti-Fraud Digital Defense</Text>
              </View>
              <Text style={[styles.promoTitle, { color: themeColors.textPrimary }]}>
                Add an extra layer of protection to your Fixed Deposits. Prevent premature digital liquidation.
              </Text>
              <Text style={styles.promoDisclaimer}>
                Requires dual biometric verification & branch PIN override to liquidate.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onOpenModal ? onOpenModal('deposit_modal') : openJourney('deposit_modal')}
              style={[styles.promoActionBtn, { backgroundColor: '#141414' }]}
            >
              <Text style={styles.promoActionBtnText}>Lock FD</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Help & Concierge Bar */}
        <View style={[styles.conciergeBar, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
          <TouchableOpacity
            onPress={() => onNavigate ? onNavigate('home') : setActiveTab('home')}
            style={styles.conciergeItem}
          >
            <Coins size={16} color="#800020" />
            <Text style={[styles.conciergeText, { color: themeColors.textPrimary }]}>My Money</Text>
          </TouchableOpacity>
          <View style={[styles.conciergeDivider, { backgroundColor: themeColors.border }]} />
          <TouchableOpacity
            onPress={() => onOpenModal ? onOpenModal('rm_modal') : openJourney('rm_modal')}
            style={styles.conciergeItem}
          >
            <Headphones size={16} color="#059669" />
            <Text style={[styles.conciergeText, { color: '#059669' }]}>Priority RM Desk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: typography.fontFamilies.bold,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.regular,
    marginTop: 2,
  },
  rmButton: {
    backgroundColor: '#800020',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  rmButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: typography.fontFamilies.bold,
    letterSpacing: 0.5,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#800020',
  },
  tabText: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.medium,
  },
  tabTextActive: {
    fontFamily: typography.fontFamilies.bold,
  },
  scrollBody: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 110,
  },
  gridContainer: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.sm,
    ...shadows.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#059669',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: typography.fontFamilies.bold,
  },
  gridLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.bold,
    textAlign: 'center',
  },
  gridSubLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamilies.regular,
    textAlign: 'center',
    marginTop: 2,
  },
  promoSection: {
    gap: spacing.sm,
  },
  promoCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    ...shadows.sm,
  },
  promoContent: {
    flex: 1,
    gap: 3,
  },
  promoTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newTag: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: typography.fontFamilies.bold,
  },
  promoIssuer: {
    fontSize: 10,
    color: '#68645E',
    fontFamily: typography.fontFamilies.medium,
  },
  promoTitle: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.bold,
    lineHeight: 16,
  },
  promoDisclaimer: {
    fontSize: 9,
    color: '#9C968E',
  },
  promoActionBtn: {
    backgroundColor: '#141414',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radii.md,
  },
  promoActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: typography.fontFamilies.bold,
  },
  conciergeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.xs,
  },
  conciergeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  conciergeText: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.bold,
  },
  conciergeDivider: {
    width: 1,
    height: 20,
  },
});
