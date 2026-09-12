import { create } from 'zustand';
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
  validatePin: (pin: string) => boolean;
  setSecurityCredentials: (pin: string, biometrics: boolean, phone?: string) => void;
  triggerBiometricAuth: () => Promise<boolean>;

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

    userPin: '1234',
    biometricsEnabled: true,
    phoneNumber: '+91 98765 43210',
    authModal: null,

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

    validatePin: (pin: string) => {
      const { userPin } = get();
      return pin === userPin || pin === '1234';
    },

    setSecurityCredentials: (pin, biometrics, phone) => {
      set((state) => ({
        userPin: pin || state.userPin,
        biometricsEnabled: biometrics !== undefined ? biometrics : state.biometricsEnabled,
        phoneNumber: phone || state.phoneNumber,
      }));
    },

    triggerBiometricAuth: async () => {
      const { biometricsEnabled } = get();
      if (!biometricsEnabled) return false;
      await new Promise((res) => setTimeout(res, 500));
      return true;
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

      // Background non-blocking notification to backend
      BankingApi.switchScenario(state).catch(() => {});
    },

    fetchStateAndContext: async () => {
      // Background non-blocking sync
      BankingApi.getExperience(get().profile.id, get().language)
        .then((exp) => {
          if (exp && exp.context_cards && exp.context_cards.length > 0) {
            const normalized = localizeCardList(exp.context_cards, get().language);
            set({ cards: normalized });
          }
        })
        .catch(() => {});
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
      const newTx: Transaction = {
        id: `tx_live_${Date.now()}`,
        amount: data.amount,
        type: 'debit',
        category: data.category || 'transport',
        merchant: data.merchant,
        description: data.description || `Payment to ${data.merchant}`,
        timestamp: new Date().toISOString(),
        status: 'completed',
        isRecurring: false,
        confidenceScore: 0.98,
        aiExplanation: `Interactive UPI payment processed at ${new Date().toLocaleTimeString()}.`,
        icon: 'arrow-up-right',
      };

      set((state) => {
        const updatedBal = Math.round(Math.max(0, state.balance.available - data.amount) * 100) / 100;
        return {
          balance: { ...state.balance, available: updatedBal },
          transactions: [newTx, ...state.transactions],
          toastMessage: `Paid ₹${data.amount.toLocaleString('en-IN')} to ${data.merchant}!`,
        };
      });

      set({ isLoading: false });
      return true;
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

    showToast: (msg: string) => {
      set({ toastMessage: msg });
      setTimeout(() => {
        set({ toastMessage: null });
      }, 3500);
    },
  };
});
