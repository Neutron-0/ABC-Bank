export type CustomerStateType = 'normal' | 'surplus' | 'financial_stress' | 'medical_event' | 'fraud_alert';

export type LanguageCode = 'en' | 'hi' | 'gu';

export type ContextCardType =
  | 'action'
  | 'insight'
  | 'event'
  | 'protection'
  | 'assistance'
  | 'opportunity'
  | 'product'
  | 'warning';

export type AttentionLayer = 'DO' | 'KNOW' | 'PLAN' | 'CONSIDER';

export interface CardAction {
  label: string;
  actionType: string;
  targetScreen?: string;
  journeyId?: string;
  payload?: Record<string, any>;
}

export interface ContextCard {
  id: string;
  type: ContextCardType;
  layer: AttentionLayer;
  priority: number;
  confidence: number;
  title: string;
  description: string;
  reason: string;
  whyDetails?: string[];
  primaryAction: CardAction;
  secondaryAction?: CardAction;
  dismissible: boolean;
  category: string;
  metadata?: Record<string, any>;
  iconName?: string;
  accentColor?: string;
  badgeText?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  email: string;
  kycStatus: 'verified' | 'pending' | 'in_review';
  creditScore: number;
  monthlyIncome: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  preferredLanguage: LanguageCode;
  joinedDate: string;
}

export interface AccountBalance {
  available: number;
  savings: number;
  fixedDeposits: number;
  currency: string;
  lastSalaryDate: string;
  lastSalaryAmount: number;
  avgMonthlyBurn: number;
  emergencyFundGoal: number;
  emergencyFundCurrent: number;
}

export type TransactionCategory =
  | 'transport'
  | 'food'
  | 'bills'
  | 'healthcare'
  | 'entertainment'
  | 'transfers'
  | 'salary'
  | 'emi'
  | 'shopping'
  | 'investments'
  | 'other';

export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  category: TransactionCategory;
  merchant: string;
  recipient?: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'flagged';
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  confidenceScore: number;
  aiExplanation?: string;
  icon?: string;
}

export interface LifeStageSignals {
  salaryRecentlyCredited: boolean;
  salaryCreditDate?: string;
  surplusAmount: number;
  medicalEventDetected: boolean;
  medicalAmount?: number;
  hospitalName?: string;
  emiStressLevel: 'low' | 'moderate' | 'critical';
  spendingSurgeRate: number;
  travelCommuteFrequency: number;
  subscriptionCount: number;
}

export interface FinancialHealth {
  status: 'thriving' | 'stable' | 'tighter_than_usual' | 'stress';
  cashFlowStabilityScore: number;
  savingsRatePercent: number;
  debtToIncomeRatio: number;
  monthlyCommitments: number;
  emergencyFundMonths: number;
  statements: {
    positive: string[];
    caution: string[];
    whatChanged: string[];
  };
}

export interface RiskSignals {
  anomalyDetected: boolean;
  flaggedTransactionId?: string;
  anomalyScore: number;
  anomalyReason?: string;
  suggestedAction: 'freeze_card' | 'verify_transaction' | 'none';
}

export interface InteractionMemory {
  dismissedCardIds: string[];
  acceptedCardIds: string[];
  openedCardsCount: Record<string, number>;
  frequentActionCounts: Record<string, number>;
}

export interface ConsentSettings {
  useTransactionData: boolean;
  personalizedProducts: boolean;
  financialInsights: boolean;
  assistantContextAccess: boolean;
  shareWithAffiliates: boolean;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  actionChips?: { label: string; action: string; payload?: any }[];
  contextCard?: ContextCard;
  pendingClarification?: string | null;
  navigation?: {
    type: string;
    target: string;
    auto_navigate: boolean;
    action_label?: string;
  } | null;
}

export type MainTabType = 'home' | 'payments' | 'activity' | 'insights' | 'assistant' | 'profile';
