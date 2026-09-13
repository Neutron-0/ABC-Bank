import { create } from 'zustand';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import {
  CustomerStateType,
  LanguageCode,
  ContextCard,
  CustomerProfile,
  AccountBalance,
  Transaction,
  LifeStageSignals,
  FinancialHealth,
  RiskSignals,
  ConsentSettings,
  MainTabType,
  AsbaLien,
  DynamicCvvState,
  BankingSmsAlert,
  KfsDetails,
  FastagDetails,
  ForexOrderRecord,
} from '../types';
import { BankingApi } from '../services/api';

const baseProfile: CustomerProfile = {
  id: 'cust_bharat_001',
  name: 'Rahul Sharma',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
  phone: '+91 98765 43210',
  email: 'rahul.sharma@abcbank.in',
  kycStatus: 'verified',
  creditScore: 765,
  monthlyIncome: 75000,
  riskProfile: 'moderate',
  preferredLanguage: 'en',
  joinedDate: '2023-04-15',
};

const defaultConsent: ConsentSettings = {
  useTransactionData: true,
  personalizedProducts: true,
  financialInsights: true,
  assistantContextAccess: true,
  shareWithAffiliates: false,
};

// Complete offline fallback state database for 100% reliability on Expo Go
export const OFFLINE_STATE_BUNDLES: Record<CustomerStateType, {
  balance: AccountBalance;
  signals: LifeStageSignals;
  financialHealth: FinancialHealth;
  risk: RiskSignals;
  cards: ContextCard[];
  transactions: Transaction[];
}> = {
  normal: {
    balance: {
      available: 42680,
      savings: 185000,
      fixedDeposits: 250000,
      currency: 'INR',
      lastSalaryDate: '2026-09-01',
      lastSalaryAmount: 75000,
      avgMonthlyBurn: 48000,
      emergencyFundGoal: 200000,
      emergencyFundCurrent: 185000,
    },
    signals: {
      salaryRecentlyCredited: false,
      surplusAmount: 6200,
      medicalEventDetected: false,
      emiStressLevel: 'low',
      spendingSurgeRate: 4,
      travelCommuteFrequency: 22,
      subscriptionCount: 3,
    },
    financialHealth: {
      status: 'stable',
      cashFlowStabilityScore: 88,
      savingsRatePercent: 24,
      debtToIncomeRatio: 0.22,
      monthlyCommitments: 16500,
      emergencyFundMonths: 3.8,
      statements: {
        positive: [
          'Salary credit is steady on the 1st of every month',
          'Savings rate of 24% is above target',
          'Emergency fund covers ~4 months of expenses',
        ],
        caution: ['Upcoming Home EMI of ₹16,500 due in 4 days'],
        whatChanged: ['Commute spending via Metro is consistent at ₹40 twice daily'],
      },
    },
    risk: {
      anomalyDetected: false,
      anomalyScore: 4,
      suggestedAction: 'none',
    },
    transactions: [
      {
        id: 'tx_norm_001',
        amount: 40,
        type: 'debit',
        category: 'transport',
        merchant: 'Delhi Metro Smart Card',
        recipient: 'DMRC Auto Top-up',
        description: 'Morning weekday commute from Noida Sec 62 to Cyber City',
        timestamp: '2026-09-12T08:38:00+05:30',
        status: 'completed',
        isRecurring: true,
        recurringFrequency: 'daily',
        confidenceScore: 0.98,
        aiExplanation: 'Routine morning commute payment detected (typically occurs around 8:40 AM on weekdays).',
        icon: 'train',
      },
      {
        id: 'tx_norm_002',
        amount: 280,
        type: 'debit',
        category: 'food',
        merchant: 'Third Wave Coffee',
        description: 'Filter Cold Brew & Croissant',
        timestamp: '2026-09-11T16:15:00+05:30',
        status: 'completed',
        isRecurring: false,
        confidenceScore: 0.82,
        aiExplanation: 'Occasional afternoon cafe spend within your weekly discretionary budget.',
        icon: 'coffee',
      },
      {
        id: 'tx_norm_003',
        amount: 1450,
        type: 'debit',
        category: 'bills',
        merchant: 'Tata Power Electricity',
        description: 'Monthly residential power utility',
        timestamp: '2026-09-08T11:20:00+05:30',
        status: 'completed',
        isRecurring: true,
        recurringFrequency: 'monthly',
        confidenceScore: 0.95,
        aiExplanation: 'Regular monthly utility bill. Consistent amount for the last 4 months.',
        icon: 'zap',
      },
    ],
    cards: [
      {
        id: 'card_morning_metro',
        type: 'action',
        layer: 'DO',
        priority: 94,
        confidence: 0.97,
        title: 'Transit Mandate: Delhi Metro (DMRC)',
        description: 'You usually make this payment around 8:40 AM for your weekday commute.',
        reason: 'Based on your frequent weekday travel pattern (22 times this month).',
        whyDetails: [
          'Regular morning time window (8:30 AM - 8:50 AM)',
          'Frequent destination: Delhi Metro Smart Card',
          '1-tap fast checkout with UPI auto-confirm',
        ],
        primaryAction: {
          label: 'Pay ₹40 Again',
          actionType: 'INSTANT_PAY',
          payload: { merchant: 'Delhi Metro Smart Card', amount: 40, category: 'transport' },
        },
        secondaryAction: {
          label: 'Auto-Topup Settings',
          actionType: 'OPEN_SCREEN',
          targetScreen: 'Payments',
        },
        dismissible: true,
        category: 'transport',
        badgeText: 'Usual Routine',
        accentColor: '#2563EB',
        iconName: 'train',
      },
      {
        id: 'card_spending_insight',
        type: 'insight',
        layer: 'KNOW',
        priority: 76,
        confidence: 0.89,
        title: 'Monthly spending on track',
        description: 'You spent ₹24,320 so far this month (12% lower than last month at this point).',
        reason: 'Comparison against your last 90-day moving expense baseline.',
        whyDetails: [
          'Food delivery expenses dropped by 8%',
          'Utility bills remained stable at ₹1,450',
          'Current balance is ₹42,680',
        ],
        primaryAction: {
          label: 'Explore Spending Breakdown',
          actionType: 'OPEN_SCREEN',
          targetScreen: 'Insights',
        },
        dismissible: true,
        category: 'insights',
        accentColor: '#6366F1',
        iconName: 'pie-chart',
      },
      {
        id: 'card_upcoming_emi',
        type: 'event',
        layer: 'KNOW',
        priority: 72,
        confidence: 0.95,
        title: 'Home Loan EMI in 4 days',
        description: '₹16,500 will be auto-debited on Sep 16th. Your account has sufficient balance.',
        reason: 'Automated recurring mandate schedule check.',
        whyDetails: [
          'Lender: HDFC Bank Home Loan',
          'Available balance (₹42,680) comfortably covers this debit',
        ],
        primaryAction: {
          label: 'View Schedule',
          actionType: 'OPEN_SCREEN',
          targetScreen: 'Activity',
        },
        dismissible: true,
        category: 'emi',
        accentColor: '#8B5CF6',
        iconName: 'calendar',
      },
      {
        id: 'card_tax_saving_fd',
        type: 'product',
        layer: 'CONSIDER',
        priority: 50,
        confidence: 0.75,
        title: 'Smart Fixed Deposit @ 7.85% p.a.',
        description: 'Lock in high returns with instant liquidity backing your account.',
        reason: 'Why you’re seeing this: Based on your consistent monthly savings track record.',
        whyDetails: ['Consistent savings additions over 6 months', 'Low risk preference match'],
        primaryAction: {
          label: 'Calculate Returns',
          actionType: 'OPEN_SCREEN',
          targetScreen: 'Profile',
        },
        dismissible: true,
        category: 'savings',
        accentColor: '#6366F1',
        iconName: 'credit-card',
      },
    ],
  },
  surplus: {
    balance: {
      available: 84200,
      savings: 210000,
      fixedDeposits: 300000,
      currency: 'INR',
      lastSalaryDate: '2026-09-10',
      lastSalaryAmount: 100000,
      avgMonthlyBurn: 44000,
      emergencyFundGoal: 200000,
      emergencyFundCurrent: 210000,
    },
    signals: {
      salaryRecentlyCredited: true,
      salaryCreditDate: '2026-09-10',
      surplusAmount: 38400,
      medicalEventDetected: false,
      emiStressLevel: 'low',
      spendingSurgeRate: -12,
      travelCommuteFrequency: 20,
      subscriptionCount: 3,
    },
    financialHealth: {
      status: 'thriving',
      cashFlowStabilityScore: 96,
      savingsRatePercent: 42,
      debtToIncomeRatio: 0.20,
      monthlyCommitments: 16500,
      emergencyFundMonths: 4.7,
      statements: {
        positive: [
          'Salary and quarterly bonus credited recently',
          'Available balance is ₹38,400 above normal monthly buffer',
          'Emergency fund target is 105% completed',
        ],
        caution: [],
        whatChanged: ['Quarterly performance bonus added ₹25,000 on Sep 10th'],
      },
    },
    risk: {
      anomalyDetected: false,
      anomalyScore: 2,
      suggestedAction: 'none',
    },
    transactions: [
      {
        id: 'tx_surp_001',
        amount: 100000,
        type: 'credit',
        category: 'salary',
        merchant: 'Infosys Limited',
        description: 'Salary + Q2 Performance Incentive',
        timestamp: '2026-09-10T09:15:00+05:30',
        status: 'completed',
        isRecurring: true,
        confidenceScore: 0.99,
        aiExplanation: 'Major surplus credit detected: Regular salary (₹75k) + bonus (₹25k).',
        icon: 'sparkles',
      },
    ],
    cards: [
      {
        id: 'card_surplus_detected',
        type: 'opportunity',
        layer: 'DO',
        priority: 92,
        confidence: 0.95,
        title: 'Surplus detected: ₹38,400',
        description: 'Your balance is ₹84,200 with essential monthly bills covered. Put surplus funds to work!',
        reason: 'Salary and incentive credited; balance is well above 30-day baseline burn rate.',
        whyDetails: [
          'Salary + bonus credited on Sep 10th',
          'Monthly expenses budgeted',
          'Grow funds with high-yield smart deposit',
        ],
        primaryAction: {
          label: 'Move to Smart Savings',
          actionType: 'OPEN_JOURNEY',
          journeyId: 'savings_invest',
          payload: { recommendedAmount: 25000 },
        },
        secondaryAction: {
          label: 'Explore Auto-Sweep',
          actionType: 'OPEN_SCREEN',
          targetScreen: 'Insights',
        },
        dismissible: true,
        category: 'savings',
        badgeText: 'Growth Moment',
        accentColor: '#059669',
        iconName: 'trending-up',
      },
      {
        id: 'card_emergency_milestone',
        type: 'insight',
        layer: 'PLAN',
        priority: 78,
        confidence: 0.92,
        title: 'Emergency Fund Milestone: 105% of Goal',
        description: 'You have ₹2,10,000 in reserve (~4.7 months of living expenses). Strong financial buffer!',
        reason: 'Surplus deposits pushed emergency reserve above target.',
        whyDetails: ['Target: ₹2,00,000 | Current: ₹2,10,000', 'Zero debt stress'],
        primaryAction: {
          label: 'View Health Report',
          actionType: 'OPEN_SCREEN',
          targetScreen: 'Insights',
        },
        dismissible: true,
        category: 'milestone',
        accentColor: '#10B981',
        iconName: 'award',
      },
    ],
  },
  financial_stress: {
    balance: {
      available: 7850,
      savings: 32000,
      fixedDeposits: 50000,
      currency: 'INR',
      lastSalaryDate: '2026-09-01',
      lastSalaryAmount: 75000,
      avgMonthlyBurn: 71000,
      emergencyFundGoal: 200000,
      emergencyFundCurrent: 32000,
    },
    signals: {
      salaryRecentlyCredited: false,
      surplusAmount: -18500,
      medicalEventDetected: false,
      emiStressLevel: 'critical',
      spendingSurgeRate: 48,
      travelCommuteFrequency: 22,
      subscriptionCount: 7,
    },
    financialHealth: {
      status: 'stress',
      cashFlowStabilityScore: 42,
      savingsRatePercent: 4,
      debtToIncomeRatio: 0.58,
      monthlyCommitments: 43500,
      emergencyFundMonths: 0.5,
      statements: {
        positive: ['Income inflow is verified'],
        caution: [
          'Monthly cash flow looks tighter than usual',
          'Upcoming EMI commitments of ₹34,200 exceed liquid balance',
          'Emergency buffer reduced to ~15 days',
        ],
        whatChanged: ['Emergency appliance repair (₹22,000) accelerated cash outflow'],
      },
    },
    risk: {
      anomalyDetected: false,
      anomalyScore: 8,
      suggestedAction: 'none',
    },
    transactions: [
      {
        id: 'tx_stress_001',
        amount: 22000,
        type: 'debit',
        category: 'shopping',
        merchant: 'Urban Company & Appliance Care',
        description: 'Emergency HVAC Compressor Replacement',
        timestamp: '2026-09-09T14:30:00+05:30',
        status: 'completed',
        isRecurring: false,
        confidenceScore: 0.91,
        aiExplanation: 'Unusual large one-time essential maintenance expense.',
        icon: 'tool',
      },
    ],
    cards: [
      {
        id: 'card_stress_guidance',
        type: 'assistance',
        layer: 'DO',
        priority: 95,
        confidence: 0.95,
        title: 'Your monthly cash flow looks tighter than usual',
        description: 'Upcoming obligations are higher this cycle. Let’s review commitments together and pause unused subscriptions safely.',
        reason: 'Surge in repair debits narrowed liquid margin. LOANS AND PROMOTIONS ARE SUPPRESSED.',
        whyDetails: [
          'Upcoming commitments total ₹34,200',
          'Liquid balance: ₹7,850',
          'Strict ethical guardrail: Zero personal loan prompts',
        ],
        primaryAction: {
          label: 'Review Commitments',
          actionType: 'OPEN_JOURNEY',
          journeyId: 'stress_intervention',
        },
        secondaryAction: {
          label: 'Ask Mitra for Advice',
          actionType: 'OPEN_ASSISTANT',
        },
        dismissible: false,
        category: 'guidance',
        badgeText: 'Care & Guidance',
        accentColor: '#D97706',
        iconName: 'life-buoy',
      },
      {
        id: 'card_stress_subscriptions',
        type: 'action',
        layer: 'PLAN',
        priority: 82,
        confidence: 0.88,
        title: 'Find potential savings in subscriptions',
        description: 'We spotted 7 recurring subscriptions costing ₹4,800/month. Pausing unused ones frees up cash immediately.',
        reason: 'Identified non-essential recurring outflows that can be paused with 1 tap.',
        whyDetails: ['Streaming & fitness auto-debits detected', 'Potential savings: ~₹2,500/mo'],
        primaryAction: {
          label: 'Manage Subscriptions',
          actionType: 'OPEN_JOURNEY',
          journeyId: 'stress_intervention',
        },
        dismissible: true,
        category: 'subscriptions',
        accentColor: '#4F46E5',
        iconName: 'layers',
      },
    ],
  },
  medical_event: {
    balance: {
      available: 24800,
      savings: 142000,
      fixedDeposits: 200000,
      currency: 'INR',
      lastSalaryDate: '2026-09-01',
      lastSalaryAmount: 75000,
      avgMonthlyBurn: 62000,
      emergencyFundGoal: 200000,
      emergencyFundCurrent: 142000,
    },
    signals: {
      salaryRecentlyCredited: false,
      surplusAmount: -22000,
      medicalEventDetected: true,
      medicalAmount: 48200,
      hospitalName: 'Max Super Speciality Hospital',
      emiStressLevel: 'moderate',
      spendingSurgeRate: 65,
      travelCommuteFrequency: 22,
      subscriptionCount: 3,
    },
    financialHealth: {
      status: 'tighter_than_usual',
      cashFlowStabilityScore: 72,
      savingsRatePercent: 12,
      debtToIncomeRatio: 0.22,
      monthlyCommitments: 16500,
      emergencyFundMonths: 2.3,
      statements: {
        positive: ['Core emergency fund absorbed medical payment without debt defaults'],
        caution: ['Hospital expenditure of ₹48,200 represents significant baseline deviation'],
        whatChanged: ['₹48,200 paid to Max Super Speciality Hospital'],
      },
    },
    risk: {
      anomalyDetected: false,
      anomalyScore: 12,
      suggestedAction: 'none',
    },
    transactions: [
      {
        id: 'tx_med_001',
        amount: 48200,
        type: 'debit',
        category: 'healthcare',
        merchant: 'Max Super Speciality Hospital',
        description: 'Emergency Inpatient Billing & Diagnostics',
        timestamp: '2026-09-11T19:42:00+05:30',
        status: 'completed',
        isRecurring: false,
        confidenceScore: 0.99,
        aiExplanation: 'Significant healthcare expenditure detected. Assistance prioritized.',
        icon: 'heart-pulse',
      },
    ],
    cards: [
      {
        id: 'card_medical_assistance',
        type: 'assistance',
        layer: 'DO',
        priority: 96,
        confidence: 0.96,
        title: 'Large medical expense detected',
        description: 'You recently made a ₹48,200 payment at Max Super Speciality. Need help filing cashless insurance reimbursement?',
        reason: 'Identified major healthcare transaction. Empathy desk prioritized before financial options.',
        whyDetails: [
          '₹48,200 hospital inpatient bill',
          'Fast-track digital claim filing active',
          'Emergency buffer remains stable',
        ],
        primaryAction: {
          label: 'Get Claim Help',
          actionType: 'OPEN_JOURNEY',
          journeyId: 'medical_assistance',
          payload: { hospital: 'Max Super Speciality Hospital', amount: 48200 },
        },
        secondaryAction: {
          label: 'Talk to Mitra',
          actionType: 'OPEN_ASSISTANT',
        },
        dismissible: true,
        category: 'healthcare',
        badgeText: 'Assistance Ready',
        accentColor: '#0284C7',
        iconName: 'heart-handshake',
      },
    ],
  },
  fraud_alert: {
    balance: {
      available: 16880,
      savings: 185000,
      fixedDeposits: 250000,
      currency: 'INR',
      lastSalaryDate: '2026-09-01',
      lastSalaryAmount: 75000,
      avgMonthlyBurn: 48000,
      emergencyFundGoal: 200000,
      emergencyFundCurrent: 185000,
    },
    signals: {
      salaryRecentlyCredited: false,
      surplusAmount: 0,
      medicalEventDetected: false,
      emiStressLevel: 'low',
      spendingSurgeRate: 35,
      travelCommuteFrequency: 22,
      subscriptionCount: 3,
    },
    financialHealth: {
      status: 'stable',
      cashFlowStabilityScore: 84,
      savingsRatePercent: 20,
      debtToIncomeRatio: 0.22,
      monthlyCommitments: 16500,
      emergencyFundMonths: 3.8,
      statements: {
        positive: ['Baseline account metrics healthy'],
        caution: ['High anomaly transaction flagged at 02:14 AM'],
        whatChanged: ['₹31,800 charged by unknown overseas gaming merchant'],
      },
    },
    risk: {
      anomalyDetected: true,
      flaggedTransactionId: 'tx_fraud_001',
      anomalyScore: 94,
      anomalyReason: 'Transaction occurred at 02:14 AM with unfamiliar merchant.',
      suggestedAction: 'verify_transaction',
    },
    transactions: [
      {
        id: 'tx_fraud_001',
        amount: 31800,
        type: 'debit',
        category: 'shopping',
        merchant: 'GlobalTech Gaming Digital Ltd',
        description: 'International E-Commerce Purchase via Virtual POS',
        timestamp: '2026-09-12T02:14:18+05:30',
        status: 'flagged',
        isRecurring: false,
        confidenceScore: 0.94,
        aiExplanation: 'CRITICAL ANOMALY: Odd hours (02:14 AM) and unfamiliar merchant.',
        icon: 'shield-alert',
      },
    ],
    cards: [
      {
        id: 'card_fraud_alert',
        type: 'warning',
        layer: 'DO',
        priority: 100,
        confidence: 0.95,
        title: 'We noticed something unusual',
        description: '₹31,800 was spent at GlobalTech Gaming. This is significantly higher and unusual compared to your normal activity.',
        reason: 'Flagged by behavioral anomaly engine due to unfamiliar merchant and timing.',
        whyDetails: ['First-time transaction', 'Unusual hour (02:14 AM)', 'IP location mismatch'],
        primaryAction: {
          label: 'Review & Verify',
          actionType: 'OPEN_JOURNEY',
          journeyId: 'fraud_alert',
          payload: { transactionId: 'tx_fraud_001', amount: 31800 },
        },
        secondaryAction: {
          label: 'Freeze Card',
          actionType: 'OPEN_JOURNEY',
          journeyId: 'freeze_card',
        },
        dismissible: false,
        category: 'security',
        badgeText: 'Urgent Safety Alert',
        accentColor: '#DC2626',
        iconName: 'shield-alert',
      },
    ],
  },
};

interface CustomerStateStore {
  currentState: CustomerStateType;
  language: LanguageCode;
  profile: CustomerProfile;
  balance: AccountBalance;
  transactions: Transaction[];
  signals: LifeStageSignals;
  financialHealth: FinancialHealth;
  risk: RiskSignals;
  cards: ContextCard[];
  consent: ConsentSettings;
  activeTab: MainTabType;
  activeJourney: string | null;
  journeyPayload: Record<string, any> | null;
  selectedWhyCard: ContextCard | null;
  selectedTransaction: Transaction | null;
  isBalanceHidden: boolean;
  toastMessage: string | null;
  isLoading: boolean;
  themeMode: 'system' | 'light' | 'dark';
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;

  userPin: string;
  biometricsEnabled: boolean;
  phoneNumber: string;
  authModal: {
    isOpen: boolean;
    paymentData?: { amount: number; merchant: string; category?: any; description?: string };
    onAuthSuccess?: () => void;
  } | null;

  requestPaymentAuth: (
    paymentData: { amount: number; merchant: string; category?: any; description?: string },
    onAuthSuccess?: () => void
  ) => void;
  closePaymentAuth: () => void;
  validatePin: (pin: string) => Promise<{ valid: boolean; message?: string; locked?: boolean }>;
  setSecurityCredentials: (pin: string, biometrics: boolean, phone?: string) => void;
  triggerBiometricAuth: () => Promise<boolean>;

  // Persistent Card Controls
  cardControls: {
    card_id: string;
    customer_id: string;
    is_locked: boolean;
    atmLimit: number;
    contactlessEnabled: boolean;
    onlineEnabled: boolean;
    intlEnabled: boolean;
    card_last_four: string;
    card_network: string;
  };
  fetchCardControls: () => Promise<void>;
  updateCardControls: (controls: Partial<{
    is_locked: boolean;
    atmLimit: number;
    contactlessEnabled: boolean;
    onlineEnabled: boolean;
    intlEnabled: boolean;
  }>) => Promise<boolean>;

  // Authentic Banking Operations
  disburseLoan: (payload: { amount: number; tenureMonths?: number; annualRate?: number }) => Promise<{ success: boolean; contract_id?: string; error?: string }>;
  submitKyc: (payload: { pan: string; aadhaar: string; latitude?: number; longitude?: number; selfieVerified?: boolean }) => Promise<{ success: boolean; error?: string }>;

  // Bharat Accessibility Mode Flag
  isBharatMode: boolean;
  toggleBharatMode: () => void;

  // Pre-debit Shortfall Detection
  getUpcomingEmiDeficit: () => {
    hasDeficit: boolean;
    deficit: number;
    upcomingEmi: number;
    availableBalance: number;
    dueDate: string;
  };

  // Empathetic Loan Relief Operations
  requestEmiGrace: (loanId?: string, days?: number) => Promise<{ success: boolean; newDueDate?: string; message?: string }>;
  splitEmi: (loanId?: string) => Promise<{ success: boolean; part1?: number; part2?: number; message?: string }>;
  sweepDeficitForEmi: (loanId?: string, amount?: number) => Promise<{ success: boolean; sweptAmount?: number; message?: string }>;
  cancelLoanCoolingOff: (contractId: string) => Promise<{ success: boolean; refundedAmount?: number; message?: string }>;

  // Key Fact Statement (KFS) Calculator
  calculateKfs: (amount: number, tenureMonths: number, annualRate?: number) => KfsDetails;

  // Account Aggregator (AA) Consent
  aaConsentGiven: boolean;
  setAaConsent: (consented: boolean) => void;

  // Credit Score "What-If" Simulator
  getSimulatedCreditScore: (action: 'pay_off_loan' | 'miss_emi' | 'lower_utilization' | 'new_credit_inquiry') => {
    currentScore: number;
    projectedScore: number;
    delta: number;
    explanation: string;
  };

  // Digital Rupee (e₹) CBDC Wallet
  digitalRupeeBalance: number;
  loadDigitalRupee: (amount: number) => boolean;
  redeemDigitalRupee: (amount: number) => boolean;
  sendDigitalRupee: (amount: number, recipient: string) => boolean;

  // SEBI ASBA IPO Bidding
  asbaLiens: AsbaLien[];
  placeAsbaBid: (payload: { ipoName: string; shares: number; amount: number; upiId: string }) => Promise<{ success: boolean; lienId?: string; message?: string }>;

  // Card Security: Dynamic Virtual CVV
  dynamicCvv: DynamicCvvState | null;
  generateDynamicCvv: (cardId?: string) => Promise<{ success: boolean; cvv?: string; expiresAt?: string; message?: string }>;

  // Regulatory SMS Alert Queue
  bankingAlerts: BankingSmsAlert[];
  pushBankingSms: (alert: Omit<BankingSmsAlert, 'id' | 'timestamp'>) => void;
  dismissBankingSms: (id: string) => void;

  // FASTag Toll Services
  fastag: FastagDetails;
  rechargeFastag: (amount: number) => { success: boolean; refId: string; newBalance: number };

  // Forex Multi-Currency Travel Card
  forexOrders: ForexOrderRecord[];
  bookForexOrder: (currency: string, foreignAmount: number, rate: number, inrAmount: number) => { success: boolean; orderId: string };

  setLanguage: (lang: LanguageCode) => void;
  setActiveTab: (tab: MainTabType) => void;
  switchCustomerState: (state: CustomerStateType) => Promise<void>;
  fetchStateAndContext: () => Promise<void>;
  dismissCard: (cardId: string) => Promise<void>;
  performPayment: (data: { amount: number; merchant: string; category?: any; description?: string }) => Promise<boolean>;
  openJourney: (journeyId: string, payload?: Record<string, any>) => void;
  closeJourney: () => void;
  setWhyCard: (card: ContextCard | null) => void;
  setSelectedTransaction: (tx: Transaction | null) => void;
  toggleBalanceHide: () => void;
  updateConsent: (consent: Partial<ConsentSettings>) => void;
  showToast: (msg: string) => void;
}

export const CARD_TRANSLATIONS: Record<string, Record<LanguageCode, { title: string; description: string; actionLabel?: string }>> = {
  card_morning_metro: {
    en: { title: 'Transit Mandate: Delhi Metro (DMRC)', description: 'Scheduled weekday commute around 8:40 AM. 1-Tap fast checkout with UPI auto-confirm.', actionLabel: 'Pay ₹40 Again' },
    hi: { title: 'पारगमन अधिदेश: दिल्ली मेट्रो (DMRC)', description: 'सुबह 8:40 बजे का नियमित कार्यदिवस आवागमन। यूपीआई ऑटो-पुष्टि के साथ 1-टैप चेकआउट।', actionLabel: 'पुनः ₹40 भुगतान करें' },
    gu: { title: 'ટ્રાન્ઝિટ આદેશ: દિલ્હી મેટ્રો (DMRC)', description: 'સવારે 8:40 વાગ્યે નિયમિત મુસાફરી. UPI ઓટો-પુષ્ટિ સાથે 1-ટેપ ચુકવણી.', actionLabel: 'ફરીથી ₹40 ચૂકવો' },
  },
  card_metro_commute: {
    en: { title: 'Routine Commute Alert', description: 'Your usual Delhi Metro morning commute at 8:40 AM. 1-Tap recharge active.', actionLabel: 'Instant ₹40 UPI' },
    hi: { title: 'दैनिक यात्रा अलर्ट', description: 'आपकी सामान्य दिल्ली मेट्रो सुबह 8:40 की यात्रा। 1-टैप रिचार्ज उपलब्ध है।', actionLabel: 'त्वरित ₹40 यूपीआई' },
    gu: { title: 'દૈનિક મુસાફરી ચેતવણી', description: 'તમારી સામાન્ય દિલ્હી મેટ્રો સવારે 8:40 ની મુસાફરી. 1-ટેપ રિચાર્જ સક્રિય છે.', actionLabel: 'તરત ₹40 UPI' },
  },
  card_salary_credited: {
    en: { title: 'Salary Credited Yesterday', description: '₹75,000 from Acme Corp received. Net liquidity is comfortably positive.', actionLabel: 'View Allocation' },
    hi: { title: 'कल वेतन प्राप्त हुआ', description: 'एक्मे कॉर्प से ₹75,000 प्राप्त हुए। नेट लिक्विडिटी सुरक्षित और सकारात्मक है।', actionLabel: 'बचत आवंटन देखें' },
    gu: { title: 'ગઈકાલે પગાર જમા થયો', description: 'એકમે કોર્પ તરફથી ₹75,000 મળ્યા. ઉપલબ્ધ લિક્વિડિટી સંતોષકારક છે.', actionLabel: 'ફાળવણી જુઓ' },
  },
  card_auto_sweep: {
    en: { title: 'Auto-Sweep Surplus Savings', description: 'You have ₹24,000 idle cash above your emergency buffer. Earn 7.2% with zero lock-in.', actionLabel: 'Activate Auto-Sweep' },
    hi: { title: 'अतिरिक्त बचत को ऑटो-स्वीप करें', description: 'आपके पास इमरजेंसी बफर से ऊपर ₹24,000 अतिरिक्त नकदी है। बिना किसी लॉक-इन के 7.2% ब्याज कमाएं।', actionLabel: 'ऑटो-स्वीप सक्रिय करें' },
    gu: { title: 'વધારાની બચત ઑટો-સ્વીપ કરો', description: 'તમારી પાસે ઇમરજન્સી બફર કરતાં ₹24,000 વધારાના છે. ઝીરો લૉક-ઇન સાથે 7.2% કમાઓ.', actionLabel: 'ઑટો-સ્વીપ શરૂ કરો' },
  },
  card_flexi_sip: {
    en: { title: 'Start a Small Flexi SIP', description: 'Consistent cash flow detected. Consider setting aside ₹2,000/mo into low-volatility index funds.', actionLabel: 'Explore Safe SIP' },
    hi: { title: 'छोटी फ्लेक्सी सिप शुरू करें', description: 'निरंतर कैश फ्लो दर्ज किया गया। कम-जोखिम वाले इंडेक्स फंड में ₹2,000/माह सुरक्षित निवेश का विचार करें।', actionLabel: 'सुरक्षित सिप देखें' },
    gu: { title: 'નાની ફ્લેક્સી SIP શરૂ કરો', description: 'સ્થિર રોકડ પ્રવાહ જણાયો. ઓછા જોખમવાળા ઇન્ડેક્સ ફંડમાં ₹2,000/મહિને રોકાણનો વિચાર કરો.', actionLabel: 'સલામત SIP જુઓ' },
  },
  card_emi_stress_mitra: {
    en: { title: 'Mitra Budget Shield Active', description: 'You have ₹32,450 in commitments due within 10 days. We recommend freezing discretionary spend.', actionLabel: 'Get Safe Budget Plan' },
    hi: { title: 'मित्रा बजट शील्ड सक्रिय', description: 'अगले 10 दिनों में ₹32,450 की देनदारियां देय हैं। हम विवेकाधीन खर्चों को रोकने की सलाह देते हैं।', actionLabel: 'सुरक्षित बजट योजना पाएं' },
    gu: { title: 'મિત્ર બજેટ શિલ્ડ સક્રિય', description: 'આગામી 10 દિવસમાં ₹32,450 ની જવાબદારીઓ બાકી છે. બિનજરૂરી ખર્ચ અટકાવવાની સલાહ છે.', actionLabel: 'સુરક્ષિત બજેટ પ્લાન મેળવો' },
  },
  card_bill_moratorium: {
    en: { title: 'Temporary EMI Relief Advisory', description: 'Review options to restructure upcoming utility commitments without late fee penalties.', actionLabel: 'Explore Relief Options' },
    hi: { title: 'अस्थायी ईएमआई राहत सलाह', description: 'बिना किसी पेनल्टी के आगामी उपयोगिता बिलों को पुनर्गठित करने के विकल्प देखें।', actionLabel: 'राहत विकल्प देखें' },
    gu: { title: 'કામચલાઉ EMI રાહત સલાહ', description: 'કોઈપણ લેટ ફી વગર આગામી બિલોને પુનર્ગઠિત કરવાના વિકલ્પો તપાસો.', actionLabel: 'રાહત વિકલ્પો જુઓ' },
  },
  card_medical_assistance: {
    en: { title: 'Large medical expense detected', description: 'You recently made a ₹48,200 payment at Max Super Speciality. Need help filing cashless insurance reimbursement?', actionLabel: 'Get Claim Help' },
    hi: { title: 'बड़ा चिकित्सा खर्च देखा गया', description: 'आपने हाल ही में मैक्स सुपर स्पेशियलिटी में ₹48,200 का भुगतान किया। क्या आप कैशलेस बीमा क्लेम में सहायता चाहते हैं?', actionLabel: 'क्लेम सहायता पाएं' },
    gu: { title: 'મોટો તબીબી ખર્ચ જણાયો', description: 'તમે તાજેતરમાં મેક્સ સુપર સ્પેશિયાલિટીમાં ₹48,200 ચૂકવ્યા. કેશલેસ ક્લેમ ફાઇલ કરવામાં મદદ જોઈએ છે?', actionLabel: 'ક્લેમ સહાય મેળવો' },
  },
  card_unrecognized_debit: {
    en: { title: 'Urgent: Verify Unusual Transaction', description: 'International online merchant debit for ₹31,800 detected from an unrecognized IP location.', actionLabel: 'Review & Dispute' },
    hi: { title: 'अति आवश्यक: असामान्य लेनदेन की पुष्टि करें', description: 'अपरिचित आईपी लोकेशन से ₹31,800 का अंतरराष्ट्रीय ऑनलाइन डेबिट पाया गया है।', actionLabel: 'समीक्षा व विवाद दर्ज करें' },
    gu: { title: 'તાત્કાલિક: અસામાન્ય વ્યવહાર ચકાસો', description: 'અજાણ્યા IP સ્થાન પરથી ₹31,800 નો આંતરરાષ્ટ્રીય ઑનલાઇન વ્યવહાર જણાયો છે.', actionLabel: 'સમીક્ષા અને વાંધો નોંધાવો' },
  },
  card_emergency_fund_nudge: {
    en: { title: 'Strengthen Emergency Buffer', description: 'Your liquid buffer is 3.8 months of expenses. Target 6 months for complete family resilience.', actionLabel: 'Plan Reserve' },
    hi: { title: 'इमरजेंसी बफर को मजबूत करें', description: 'आपका लिक्विड बफर 3.8 महीने के खर्च का है। परिवार की सुरक्षा के लिए 6 महीने का लक्ष्य रखें।', actionLabel: 'रिजर्व योजना बनाएं' },
    gu: { title: 'ઇમરજન્સી બફર મજબૂત કરો', description: 'તમારું લિક્વિડ બફર 3.8 મહિનાના ખર્ચ જેટલું છે. સંપૂર્ણ સુરક્ષા માટે 6 મહિનાનું લક્ષ્ય રાખો.', actionLabel: 'રિઝર્વ આયોજન કરો' },
  },
};

export const normalizeContextCard = (rawCard: any): ContextCard => {
  const pAction = rawCard?.primaryAction || rawCard?.primary_action || {
    label: 'View Details',
    actionType: 'NAVIGATE',
  };
  const sAction = rawCard?.secondaryAction || rawCard?.secondary_action;

  return {
    id: rawCard?.id || `card_${Date.now()}`,
    type: rawCard?.type || 'generic',
    layer: rawCard?.layer || 'DO',
    priority: rawCard?.priority || 50,
    confidence: rawCard?.confidence ?? 0.95,
    title: rawCard?.title || '',
    description: rawCard?.description || '',
    reason: rawCard?.reason || '',
    badgeText: rawCard?.badgeText || rawCard?.badge,
    accentColor: rawCard?.accentColor || rawCard?.accent,
    dismissible: rawCard?.dismissible ?? true,
    category: rawCard?.category || 'banking',
    metadata: rawCard?.metadata,
    iconName: rawCard?.iconName || rawCard?.icon_name,
    primaryAction: {
      label: pAction?.label || 'View Details',
      actionType: pAction?.actionType || pAction?.action_type || 'NAVIGATE',
      journeyId: pAction?.journeyId || pAction?.journey_id,
      targetScreen: pAction?.targetScreen || pAction?.target_screen,
      payload: pAction?.payload,
    },
    secondaryAction: sAction ? {
      label: sAction?.label || 'Dismiss',
      actionType: sAction?.actionType || sAction?.action_type || 'NAVIGATE',
      journeyId: sAction?.journeyId || sAction?.journey_id,
      targetScreen: sAction?.targetScreen || sAction?.target_screen,
      payload: sAction?.payload,
    } : undefined,
    whyDetails: rawCard?.whyDetails || rawCard?.why_details || [],
  };
};

const localizeCardList = (cards: any[], lang: LanguageCode): ContextCard[] => {
  return (cards || []).map((rawCard) => {
    const card = normalizeContextCard(rawCard);
    const tr = CARD_TRANSLATIONS[card.id]?.[lang];
    if (!tr) return card;
    return {
      ...card,
      title: tr.title,
      description: tr.description,
      primaryAction: {
        ...card.primaryAction,
        label: tr.actionLabel || card.primaryAction?.label || 'View Details',
      },
    };
  });
};

export const useCustomerStore = create<CustomerStateStore>((set, get) => {
  const initialBundle = OFFLINE_STATE_BUNDLES.normal;

  return {
    currentState: 'normal',
    language: 'en',
    profile: { ...baseProfile },
    balance: { ...initialBundle.balance },
    signals: { ...initialBundle.signals },
    financialHealth: { ...initialBundle.financialHealth },
    risk: { ...initialBundle.risk },
    transactions: [...initialBundle.transactions],
    cards: [...initialBundle.cards],
    consent: { ...defaultConsent },
    activeTab: 'home',
    activeJourney: null,
    journeyPayload: null,
    selectedWhyCard: null,
    selectedTransaction: null,
    isBalanceHidden: false,
    toastMessage: null,
    isLoading: false,
    themeMode: 'light',
    setThemeMode: () => {},

    userPin: '8492',
    biometricsEnabled: true,
    phoneNumber: '+91 98765 43210',
    authModal: null,

    // Authentic Banking Additions
    isBharatMode: false,
    aaConsentGiven: false,
    digitalRupeeBalance: 500.0,
    asbaLiens: [],
    dynamicCvv: null,
    bankingAlerts: [
      {
        id: 'sms_reg_01',
        sender: 'VK-ABCBNK',
        body: 'Acct XX8492 debited for INR 40.00 on 12-Sep-2026 08:38:00 via UPI (DMRC Transit). Avail Bal: INR 42,680.00.',
        timestamp: '2026-09-12T08:38:00+05:30',
        type: 'debit',
        amount: 40,
        referenceId: 'UPI/625519849201',
      },
      {
        id: 'sms_reg_02',
        sender: 'VK-ABCBNK',
        body: 'Alert: Auto-debit scheduled for Home Loan EMI INR 16,500 on 16-Sep-2026. Keep sufficient balance to avoid bounce fee.',
        timestamp: '2026-09-11T10:00:00+05:30',
        type: 'mandate',
        amount: 16500,
        referenceId: 'NACH/HDFC/99214',
      },
    ],

    // FASTag Toll Services
    fastag: {
      vehicleNumber: 'DL 01 AB 8492',
      tagId: 'NETC-TAG-84920194',
      balance: 340,
      minBalance: 200,
    },

    // Forex Multi-Currency Travel Card
    forexOrders: [],

    // Persistent Card Controls initial state
    cardControls: {
      card_id: 'card_rupay_platinum_8492',
      customer_id: 'cust_bharat_001',
      is_locked: false,
      atmLimit: 50000,
      contactlessEnabled: true,
      onlineEnabled: true,
      intlEnabled: false,
      card_last_four: '8492',
      card_network: 'RuPay Platinum Contactless',
    },

    fetchCardControls: async () => {
      try {
        const res = await BankingApi.getCardControls(get().profile.id);
        if (res && res.card_id) {
          set({ cardControls: res });
        }
      } catch (err) {
        console.warn('[CardControls] Failed to fetch live card controls:', err);
      }
    },

    updateCardControls: async (controls) => {
      set((state) => ({ cardControls: { ...state.cardControls, ...controls } }));
      try {
        const res = await BankingApi.updateCardControls(controls, get().profile.id);
        if (res && res.controls) {
          set({ cardControls: res.controls });
          return true;
        }
      } catch (err) {
        console.warn('[CardControls] Failed to sync card controls with backend:', err);
      }
      return false;
    },

    disburseLoan: async (payload) => {
      set({ isLoading: true });
      try {
        const res = await BankingApi.disburseLoan({
          amount: payload.amount,
          tenureMonths: payload.tenureMonths,
          annualRate: payload.annualRate,
          customerId: get().profile.id,
        });
        if (res && res.success) {
          set((state) => ({
            balance: {
              ...state.balance,
              available: res.balance.available,
              savings: res.balance.savings,
            },
            transactions: [res.transaction, ...state.transactions],
            isLoading: false,
            toastMessage: `₹${payload.amount.toLocaleString('en-IN')} disbursed into your account!`,
          }));
          return { success: true, contract_id: res.contract_id };
        }
      } catch (err: any) {
        console.error('[Loan] Backend loan origination error:', err);
      }
      set({ isLoading: false });
      return { success: false, error: 'Loan origination failed.' };
    },

    submitKyc: async (payload) => {
      set({ isLoading: true });
      try {
        const res = await BankingApi.submitKyc({
          ...payload,
          customerId: get().profile.id,
        });
        if (res && res.success) {
          set((state) => ({
            profile: {
              ...state.profile,
              kycTier: res.kyc_tier,
            },
            signals: {
              ...state.signals,
              kyc_tier: res.kyc_tier,
              kyc_verified: true,
            },
            isLoading: false,
            toastMessage: 'Digital KYC Completed Successfully!',
          }));
          return { success: true };
        }
      } catch (err: any) {
        console.error('[KYC] Backend submit error:', err);
      }
      set({ isLoading: false });
      return { success: false, error: 'KYC submission failed.' };
    },

    requestPaymentAuth: (paymentData, onAuthSuccess) => {
      set({
        authModal: {
          isOpen: true,
          paymentData,
          onAuthSuccess,
        },
      });
    },

    closePaymentAuth: () => {
      set({ authModal: null });
    },

    validatePin: async (pin: string) => {
      // 1. Authoritative backend cryptographic verification
      try {
        const remote = await BankingApi.verifyPin(pin, get().profile.id);
        if (remote) {
          if (remote.locked) {
            return { valid: false, locked: true, message: remote.message || 'Account locked due to consecutive failed attempts.' };
          }
          if (remote.valid) {
            return { valid: true };
          }
          return { valid: false, message: remote.message || 'Incorrect PIN.' };
        }
      } catch (e) {
        console.warn('[PIN] Backend verification unreachable, checking secure local vault.');
      }

      // 2. Local fallback strictly to configured userPin (no universal '1234' bypass)
      const { userPin } = get();
      if (userPin && pin === userPin) {
        return { valid: true };
      }
      return { valid: false, message: 'Incorrect PIN.' };
    },

    setSecurityCredentials: (pin, biometrics, phone) => {
      set((state) => ({
        userPin: pin || state.userPin,
        biometricsEnabled: biometrics !== undefined ? biometrics : state.biometricsEnabled,
        phoneNumber: phone || state.phoneNumber,
      }));

      // Async backend setup & hardware secure store registration
      if (pin) {
        BankingApi.setupPin(pin, get().profile.id).catch(() => {});
        if (Platform.OS !== 'web') {
          SecureStore.setItemAsync('user_banking_pin', pin).catch(() => {});
        }
      }
    },

    triggerBiometricAuth: async () => {
      const { biometricsEnabled } = get();
      if (!biometricsEnabled) return false;

      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
          console.log('[Biometrics] Device hardware does not support local authentication');
          return false;
        }

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
          console.log('[Biometrics] No biometrics enrolled on this device');
          return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authorize payment with biometrics',
          cancelLabel: 'Cancel',
          fallbackLabel: 'Use PIN',
          disableDeviceFallback: false,
        });

        return result.success;
      } catch (err) {
        console.warn('[Biometrics] Local authentication error:', err);
        return false;
      }
    },

    setLanguage: (lang: LanguageCode) => {
      const currentCards = get().cards;
      const localized = localizeCardList(currentCards, lang);
      set({ language: lang, cards: localized });
    },

    setActiveTab: (tab: MainTabType) => {
      set({ activeTab: tab });
    },

    switchCustomerState: async (state: CustomerStateType) => {
      // Apply offline bundle instantly with 0ms latency
      const bundle = OFFLINE_STATE_BUNDLES[state] || OFFLINE_STATE_BUNDLES.normal;
      const currentLang = get().language;
      const localized = localizeCardList(bundle.cards, currentLang);
      set({
        currentState: state,
        balance: { ...bundle.balance },
        signals: { ...bundle.signals },
        financialHealth: { ...bundle.financialHealth },
        risk: { ...bundle.risk },
        cards: localized,
        transactions: [...bundle.transactions],
        isLoading: false,
      });

      // Background notification to backend
      BankingApi.switchScenario(state).catch(() => {});
    },

    fetchStateAndContext: async () => {
      // Background sync with authoritative backend
      BankingApi.getExperience(get().profile.id, get().language)
        .then((exp) => {
          if (exp && exp.context_cards && exp.context_cards.length > 0) {
            const normalized = localizeCardList(exp.context_cards, get().language);
            set({ cards: normalized });
          }
        })
        .catch(() => {});

      // Fetch persistent card switch status
      get().fetchCardControls();
    },

    dismissCard: async (cardId: string) => {
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== cardId),
      }));
    },

    performPayment: async (data) => {
      if (
        !data ||
        typeof data.amount !== 'number' ||
        isNaN(data.amount) ||
        !isFinite(data.amount) ||
        data.amount <= 0
      ) {
        set({ toastMessage: 'Invalid payment amount.' });
        return false;
      }

      const currentState = get();
      if (currentState.balance.available < data.amount) {
        set({
          toastMessage: `Insufficient available balance (₹${currentState.balance.available.toLocaleString('en-IN')}).`,
        });
        return false;
      }

      set({ isLoading: true });

      try {
        const res = await BankingApi.transferMoney({
          amount: data.amount,
          merchant: data.merchant,
          category: data.category || 'transport',
          description: data.description,
          customerId: currentState.profile.id,
        });

        if (res && res.success && res.transaction) {
          set((state) => ({
            balance: {
              ...state.balance,
              available: res.balance.available,
              savings: res.balance.savings || state.balance.savings,
            },
            transactions: [res.transaction, ...state.transactions],
            toastMessage: `Paid ₹${data.amount.toLocaleString('en-IN')} to ${data.merchant}!`,
            isLoading: false,
          }));
          return true;
        }
      } catch (err: any) {
        console.error('[Payment] Backend transfer failed:', err);
        set({
          isLoading: false,
          toastMessage: err?.message || 'Payment failed: Unable to connect to bank payment switch.',
        });
        return false;
      }
      set({
        isLoading: false,
        toastMessage: 'Payment failed: Unable to connect to bank payment switch.',
      });
      return false;
    },

    openJourney: (journeyId: string, payload?: Record<string, any>) => {
      set({ activeJourney: journeyId, journeyPayload: payload || null });
    },

    closeJourney: () => {
      set({ activeJourney: null, journeyPayload: null });
    },

    setWhyCard: (card: ContextCard | null) => {
      set({ selectedWhyCard: card });
    },

    setSelectedTransaction: (tx: Transaction | null) => {
      set({ selectedTransaction: tx });
    },

    toggleBalanceHide: () => {
      set((state) => ({ isBalanceHidden: !state.isBalanceHidden }));
    },

    updateConsent: (consentUpdate: Partial<ConsentSettings>) => {
      set((state) => ({
        consent: { ...state.consent, ...consentUpdate },
      }));
    },

    // -----------------------------------------------------------------------
    // Authentic Banking Implementations
    // -----------------------------------------------------------------------
    toggleBharatMode: () => {
      set((state) => ({ isBharatMode: !state.isBharatMode }));
    },

    getUpcomingEmiDeficit: () => {
      const state = get();
      const upcomingEmi = (state.signals as any)?.upcoming_emi_amount || 16500;
      const dueDate = (state.signals as any)?.upcoming_emi_date || '2026-09-16';
      const available = state.balance.available;
      const deficit = Math.max(0, upcomingEmi - available);
      return {
        hasDeficit: deficit > 0,
        deficit,
        upcomingEmi,
        availableBalance: available,
        dueDate,
      };
    },

    requestEmiGrace: async (loanId = 'loan_home_01', days = 10) => {
      set({ isLoading: true });
      try {
        const res = await BankingApi.requestEmiGrace({ loanId, days, customerId: get().profile.id });
        if (res && res.success) {
          set({
            isLoading: false,
            toastMessage: `10-Day Grace Granted! Due date extended to ${res.new_due_date} under RBI guidelines.`,
          });
          return { success: true, newDueDate: res.new_due_date, message: res.message };
        }
      } catch (err: any) {
        console.warn('[LoanGrace] Live API call failed, applying offline relief:', err);
      }
      const newDueDate = '2026-09-26';
      set({
        isLoading: false,
        toastMessage: `10-Day Grace Granted! Due date extended to ${newDueDate}. Zero bounce penalty.`,
      });
      return {
        success: true,
        newDueDate,
        message: '10-day penalty-free grace buffer granted under RBI Resolution framework.',
      };
    },

    splitEmi: async (loanId = 'loan_home_01') => {
      set({ isLoading: true });
      try {
        const res = await BankingApi.splitEmi({ loanId, customerId: get().profile.id });
        if (res && res.success) {
          set({
            isLoading: false,
            toastMessage: `EMI split into 2: ₹${res.part_1_amount.toLocaleString('en-IN')} on ${res.part_1_due_date} & ₹${res.part_2_amount.toLocaleString('en-IN')} on ${res.part_2_due_date}.`,
          });
          return { success: true, part1: res.part_1_amount, part2: res.part_2_amount, message: res.message };
        }
      } catch (err: any) {
        console.warn('[SplitEmi] Live API call failed, applying offline split:', err);
      }
      const part1 = 8250;
      const part2 = 8250;
      set({
        isLoading: false,
        toastMessage: 'EMI split: ₹8,250 due on 16-Sep and ₹8,250 on 01-Oct post-salary.',
      });
      return {
        success: true,
        part1,
        part2,
        message: 'EMI split into two 50% installments successfully.',
      };
    },

    sweepDeficitForEmi: async (loanId = 'loan_home_01', amount?: number) => {
      set({ isLoading: true });
      const currentAvail = get().balance.available;
      const deficit = amount !== undefined ? amount : Math.max(0, 16500 - currentAvail);
      try {
        const res = await BankingApi.sweepDeficitForEmi({ loanId, amount: deficit, customerId: get().profile.id });
        if (res && res.success) {
          set((state) => ({
            balance: {
              ...state.balance,
              available: res.new_available_balance,
              fixedDeposits: Math.max(0, state.balance.fixedDeposits - res.swept_amount),
            },
            isLoading: false,
            toastMessage: `Auto-sweep complete: ₹${res.swept_amount.toLocaleString('en-IN')} transferred to cover EMI without breaking full FD!`,
          }));
          return { success: true, sweptAmount: res.swept_amount, message: res.message };
        }
      } catch (err: any) {
        console.warn('[DeficitSweep] Live API call failed, applying offline sweep:', err);
      }
      set((state) => ({
        balance: {
          ...state.balance,
          available: state.balance.available + deficit,
          fixedDeposits: Math.max(0, state.balance.fixedDeposits - deficit),
        },
        isLoading: false,
        toastMessage: `Auto-sweep complete: ₹${deficit.toLocaleString('en-IN')} covered from emergency buffer.`,
      }));
      return {
        success: true,
        sweptAmount: deficit,
        message: 'Deficit auto-sweep successful.',
      };
    },

    cancelLoanCoolingOff: async (contractId: string) => {
      set({ isLoading: true });
      try {
        const res = await BankingApi.cancelLoanCoolingOff({ contractId, customerId: get().profile.id });
        if (res && res.success) {
          set((state) => ({
            balance: {
              ...state.balance,
              available: Math.max(0, state.balance.available - res.refunded_amount),
            },
            isLoading: false,
            toastMessage: `Loan cancelled within 3-day statutory cooling-off window! Zero penalty. ₹${res.refunded_amount.toLocaleString('en-IN')} reversed.`,
          }));
          return { success: true, refundedAmount: res.refunded_amount, message: res.message };
        }
      } catch (err: any) {
        console.warn('[CoolingOff] Live API call failed, applying offline cancellation:', err);
      }
      const refund = 50000;
      set((state) => ({
        balance: {
          ...state.balance,
          available: Math.max(0, state.balance.available - refund),
        },
        isLoading: false,
        toastMessage: `Loan cancelled within statutory 3-day cooling-off window with 0% penalty.`,
      }));
      return {
        success: true,
        refundedAmount: refund,
        message: 'Loan cancelled under statutory cooling-off period.',
      };
    },

    calculateKfs: (amount: number, tenureMonths: number, annualRate = 10.5): KfsDetails => {
      const monthlyRate = annualRate / 12 / 100;
      const emi = Math.round(
        (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      );
      const processingFee = Math.round(amount * 0.01);
      const totalRepayment = emi * tenureMonths;
      const totalInterest = totalRepayment - amount;
      const apr = Math.round(((totalInterest + processingFee) / amount / (tenureMonths / 12)) * 10000) / 100;
      return {
        loanAmount: amount,
        tenureMonths,
        annualPercentageRate: apr,
        nominalRate: annualRate,
        processingFee,
        totalInterest,
        totalRepayment,
        monthlyEmi: emi,
        coolingOffPeriodDays: 3,
      };
    },

    setAaConsent: (consented: boolean) => {
      set({ aaConsentGiven: consented });
    },

    getSimulatedCreditScore: (action) => {
      const currentScore = get().profile.creditScore || 765;
      let delta = 0;
      let explanation = '';

      switch (action) {
        case 'pay_off_loan':
          delta = 25;
          explanation = 'Full early loan closure improves debt-to-income ratio and reflects exemplary credit discipline.';
          break;
        case 'miss_emi':
          delta = -45;
          explanation = 'A 30-day delinquency is reported to CIBIL/Experian and significantly depresses score for 24+ months.';
          break;
        case 'lower_utilization':
          delta = 18;
          explanation = 'Reducing revolving credit card utilization below 30% indicates responsible liquidity management.';
          break;
        case 'new_credit_inquiry':
          delta = -8;
          explanation = 'Multiple hard credit bureau inquiries indicate credit hunger and temporarily deduct minor points.';
          break;
      }

      const projectedScore = Math.max(300, Math.min(900, currentScore + delta));
      return {
        currentScore,
        projectedScore,
        delta,
        explanation,
      };
    },

    loadDigitalRupee: (amount: number) => {
      if (amount <= 0 || get().balance.available < amount) {
        set({ toastMessage: 'Insufficient bank balance to load Digital Rupee.' });
        return false;
      }
      set((state) => ({
        balance: {
          ...state.balance,
          available: state.balance.available - amount,
        },
        digitalRupeeBalance: state.digitalRupeeBalance + amount,
        toastMessage: `Loaded ₹${amount.toLocaleString('en-IN')} into e₹ CBDC Wallet from bank account!`,
      }));
      return true;
    },

    redeemDigitalRupee: (amount: number) => {
      if (amount <= 0 || get().digitalRupeeBalance < amount) {
        set({ toastMessage: 'Insufficient Digital Rupee balance to redeem.' });
        return false;
      }
      set((state) => ({
        balance: {
          ...state.balance,
          available: state.balance.available + amount,
        },
        digitalRupeeBalance: state.digitalRupeeBalance - amount,
        toastMessage: `Redeemed ₹${amount.toLocaleString('en-IN')} e₹ into your primary savings account!`,
      }));
      return true;
    },

    sendDigitalRupee: (amount: number, recipient: string) => {
      if (amount <= 0 || get().digitalRupeeBalance < amount) {
        set({ toastMessage: 'Insufficient e₹ balance to complete transfer.' });
        return false;
      }
      set((state) => ({
        digitalRupeeBalance: state.digitalRupeeBalance - amount,
        toastMessage: `Transferred ₹${amount.toLocaleString('en-IN')} e₹ token directly to ${recipient}!`,
      }));
      return true;
    },

    placeAsbaBid: async (payload) => {
      set({ isLoading: true });
      try {
        const res = await BankingApi.placeAsbaBid({ ...payload, customerId: get().profile.id });
        if (res && res.success) {
          const newLien: AsbaLien = {
            lienId: res.lien_id,
            symbol: res.symbol,
            applicationNo: payload.ipoName + '_APP_' + Math.floor(100000 + Math.random() * 900000),
            sharesCount: payload.shares,
            amountBlocked: res.amount_blocked,
            status: 'BLOCKED',
            sebiMandateId: res.sebi_mandate_id,
            timestamp: res.timestamp || new Date().toISOString(),
          };
          set((state) => ({
            balance: {
              ...state.balance,
              available: res.available_balance_after_lien,
            },
            asbaLiens: [newLien, ...state.asbaLiens],
            isLoading: false,
            toastMessage: `ASBA IPO Bid placed! ₹${payload.amount.toLocaleString('en-IN')} lien-blocked earning interest until allotment.`,
          }));
          return { success: true, lienId: res.lien_id, message: res.message };
        }
      } catch (err: any) {
        console.warn('[ASBA] Live API call failed, applying offline lien:', err);
      }
      const offlineLien: AsbaLien = {
        lienId: `asba_${Date.now()}`,
        symbol: payload.ipoName,
        applicationNo: `APP_${Math.floor(100000 + Math.random() * 900000)}`,
        sharesCount: payload.shares,
        amountBlocked: payload.amount,
        status: 'BLOCKED',
        sebiMandateId: `SEBI_MAND_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        balance: {
          ...state.balance,
          available: Math.max(0, state.balance.available - payload.amount),
        },
        asbaLiens: [offlineLien, ...state.asbaLiens],
        isLoading: false,
        toastMessage: `ASBA IPO Bid placed! ₹${payload.amount.toLocaleString('en-IN')} lien-blocked.`,
      }));
      return { success: true, lienId: offlineLien.lienId, message: 'ASBA lien placed.' };
    },

    generateDynamicCvv: async (cardId = 'card_01') => {
      try {
        const res = await BankingApi.generateDynamicCvv({ cardId, customerId: get().profile.id });
        if (res && res.success) {
          const cvvState: DynamicCvvState = {
            cardId: res.card_id,
            cvv: res.dynamic_cvv,
            expiresAt: res.expires_at,
            validSeconds: res.valid_seconds,
          };
          set({ dynamicCvv: cvvState, toastMessage: 'New single-use 5-minute virtual CVV generated!' });
          return { success: true, cvv: res.dynamic_cvv, expiresAt: res.expires_at, message: res.message };
        }
      } catch (err: any) {
        console.warn('[DynamicCvv] Live API call failed, generating offline dynamic CVV:', err);
      }
      const randomCvv = Math.floor(100 + Math.random() * 900).toString();
      const expires = new Date(Date.now() + 300000).toISOString();
      const cvvState: DynamicCvvState = {
        cardId,
        cvv: randomCvv,
        expiresAt: expires,
        validSeconds: 300,
      };
      set({ dynamicCvv: cvvState, toastMessage: 'New single-use 5-minute virtual CVV generated!' });
      return { success: true, cvv: randomCvv, expiresAt: expires, message: 'Dynamic CVV generated.' };
    },

    pushBankingSms: (alert) => {
      const newAlert: BankingSmsAlert = {
        ...alert,
        id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
      };
      set((state) => ({ bankingAlerts: [newAlert, ...state.bankingAlerts] }));
    },

    dismissBankingSms: (id: string) => {
      set((state) => ({
        bankingAlerts: state.bankingAlerts.filter((a) => a.id !== id),
      }));
    },

    rechargeFastag: (amount: number) => {
      const refId = 'NETC' + Math.floor(1000000000 + Math.random() * 9000000000);
      set((state) => ({
        fastag: {
          ...state.fastag,
          balance: state.fastag.balance + amount,
        },
        balance: {
          ...state.balance,
          available: Math.max(0, state.balance.available - amount),
        },
        toastMessage: `FASTag recharged with ₹${amount.toLocaleString('en-IN')}! Tag Bal: ₹${(state.fastag.balance + amount).toLocaleString('en-IN')}`,
      }));
      return { success: true, refId, newBalance: get().fastag.balance };
    },

    bookForexOrder: (currency: string, foreignAmount: number, rate: number, inrAmount: number) => {
      const orderId = 'FX-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder: ForexOrderRecord = {
        id: orderId,
        currency,
        foreignAmount,
        rate,
        inrAmount,
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        forexOrders: [newOrder, ...state.forexOrders],
        balance: {
          ...state.balance,
          available: Math.max(0, state.balance.available - inrAmount),
        },
        toastMessage: `Forex Card reloaded with ${currency} ${foreignAmount} (₹${inrAmount.toLocaleString('en-IN')})!`,
      }));
      return { success: true, orderId };
    },

    showToast: (msg: string) => {
      set({ toastMessage: msg });
      setTimeout(() => {
        set({ toastMessage: null });
      }, 3500);
    },
  };
});
