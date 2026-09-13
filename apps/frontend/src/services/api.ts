import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  CustomerStateType,
  ContextCard,
  CustomerProfile,
  AccountBalance,
  Transaction,
  LifeStageSignals,
  FinancialHealth,
  RiskSignals,
  AssistantMessage,
  LanguageCode,
  ConsentSettings,
} from '../types';
import { OnDeviceIntentService, VoiceIntentContract } from './onDeviceIntentService';

declare const process: any;

export const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:8000/api/v1`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }

  return 'http://localhost:8000/api/v1';
};

import { MiniCPM5EdgeEngine } from './MiniCPM5EdgeEngine';

export class BankingApi {
  private static get baseUrl(): string {
    return getApiBaseUrl();
  }

  private static _authToken: string | null = null;

  public static setAuthToken(token: string | null) {
    this._authToken = token;
  }

  public static getAuthToken(): string | null {
    return this._authToken;
  }

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout for fast on-device fallback

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(this._authToken ? { Authorization: `Bearer ${this._authToken}` } : {}),
        ...((options?.headers as Record<string, string>) || {}),
      };

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        let errMessage = `HTTP ${res.status}`;
        try {
          const errData = await res.json();
          if (errData?.detail) {
            errMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
          if (errData && typeof errData === 'object' && ('valid' in errData || 'locked' in errData)) {
            return errData as T;
          }
        } catch (_) {}
        const error: any = new Error(errMessage);
        error.status = res.status;
        throw error;
      }
      return await res.json();
    } catch (err: any) {
      console.log(`[BankingApi] Notice for ${endpoint}:`, err?.message || err);
      if (options?.method === 'POST' && err?.status && err.status >= 400) {
        throw err;
      }
      return null;
    }
  }

  public static async getExperience(customerId = 'cust_bharat_001', lang = 'en'): Promise<any | null> {
    return this.request(`/experience/${customerId}?lang=${lang}`);
  }

  public static async getCustomer(customerId = 'cust_bharat_001'): Promise<any | null> {
    return this.request(`/customer/${customerId}`);
  }

  public static async switchScenario(scenario: string): Promise<any | null> {
    return this.request('/scenario/switch', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
  }

  public static async sendVoiceQuery(query: string, language: LanguageCode = 'en'): Promise<any | null> {
    const remote = await this.request('/voice/intent', {
      method: 'POST',
      body: JSON.stringify({ query, language }),
    });
    if (remote) return remote;

    // On-device MiniCPM-5 edge execution fallback
    const edge = MiniCPM5EdgeEngine.processQuery(query, language);
    return {
      intent: edge.intent,
      confidence: edge.confidence,
      language: edge.language,
      entities: edge.entities,
      response_text: edge.responseText,
      suggested_actions: ['CONFIRM', 'DETAILS'],
      runtime_device: 'On-Device Mobile NPU / MiniCPM-5 Edge',
      latency_ms: edge.latencyMs,
    };
  }

  public static async getAssistantInit(lang: LanguageCode = 'en'): Promise<any | null> {
    return this.request(`/assistant/init?lang=${lang}`);
  }

  public static classifyOnDevice(query: string, language?: LanguageCode): VoiceIntentContract {
    return OnDeviceIntentService.classifyIntent(query, language);
  }

  public static async sendAssistantMessage(
    query: string,
    language: LanguageCode = 'en',
    pendingClarification?: string | null
  ): Promise<any | null> {
    // 1. Run genuine on-device intent classifier
    const localIntent = this.classifyOnDevice(query, language);

    // 2. Transmit structured intent & entities to authoritative backend
    const remote = await this.request<any>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        query,
        language,
        intent: localIntent.intent,
        entities: localIntent.entities,
        pending_clarification: pendingClarification || null,
        on_device_latency_ms: localIntent.latency_ms,
      }),
    });
    if (remote && remote.reply) return remote;

    // 3. Transparent on-device rule pattern fallback (offline resilient)
    const edge = MiniCPM5EdgeEngine.processQuery(query, language);
    return {
      success: true,
      reply: MiniCPM5EdgeEngine.toAssistantMessage(edge),
      isEdgeExecution: true,
      runtimeDevice: 'On-Device Pattern Rules (Offline Fallback)',
    };
  }

  // -------------------------------------------------------------------------
  // 4. Authentic Cryptographic Authentication APIs
  // -------------------------------------------------------------------------
  public static async setupPin(pin: string, customerId = 'cust_bharat_001'): Promise<{ success: boolean; message: string } | null> {
    return this.request('/auth/pin/setup', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, pin }),
    });
  }

  public static async verifyPin(
    pin: string,
    customerId = 'cust_bharat_001'
  ): Promise<{ valid: boolean; locked?: boolean; failed_attempts?: number; remaining_tries?: number; message?: string } | null> {
    return this.request('/auth/pin/verify', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, pin }),
    });
  }

  // -------------------------------------------------------------------------
  // 5. Authentic Debit Card Switch APIs
  // -------------------------------------------------------------------------
  public static async getCardControls(customerId = 'cust_bharat_001'): Promise<any | null> {
    return this.request(`/cards/${customerId}`);
  }

  public static async updateCardControls(
    controls: {
      is_locked?: boolean;
      atmLimit?: number;
      contactlessEnabled?: boolean;
      onlineEnabled?: boolean;
      intlEnabled?: boolean;
    },
    customerId = 'cust_bharat_001'
  ): Promise<any | null> {
    return this.request('/cards/controls', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, ...controls }),
    });
  }

  // -------------------------------------------------------------------------
  // 6. Authentic Payments & Ledger APIs
  // -------------------------------------------------------------------------
  public static async getTransactions(customerId = 'cust_bharat_001'): Promise<any | null> {
    return this.request(`/transactions/${customerId}`);
  }

  public static async transferMoney(payload: {
    amount: number;
    merchant: string;
    category?: string;
    description?: string;
    customerId?: string;
  }): Promise<{
    success: boolean;
    transaction: Transaction;
    reference_id: string;
    balance: { available: number; savings: number; currency: string };
    timestamp: string;
  } | null> {
    return this.request('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        amount: payload.amount,
        merchant: payload.merchant,
        category: payload.category || 'transport',
        description: payload.description,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 7. Authentic Loan Origination & Disbursal APIs
  // -------------------------------------------------------------------------
  public static async disburseLoan(payload: {
    amount: number;
    tenureMonths?: number;
    annualRate?: number;
    customerId?: string;
  }): Promise<{
    success: boolean;
    contract_id: string;
    disbursed_amount: number;
    monthly_emi: number;
    tenure_months: number;
    annual_rate: number;
    transaction: Transaction;
    balance: { available: number; savings: number; currency: string };
  } | null> {
    return this.request('/loans/disburse', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        amount: payload.amount,
        tenure_months: payload.tenureMonths || 12,
        annual_rate: payload.annualRate || 10.5,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 8. Authentic Digital KYC Submission APIs
  // -------------------------------------------------------------------------
  public static async submitKyc(payload: {
    pan: string;
    aadhaar: string;
    latitude?: number;
    longitude?: number;
    selfieVerified?: boolean;
    customerId?: string;
  }): Promise<{
    success: boolean;
    kyc_tier: number;
    status: string;
    pan_masked: string;
    aadhaar_masked: string;
    verified_at: string;
  } | null> {
    return this.request('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        pan: payload.pan,
        aadhaar: payload.aadhaar,
        latitude: payload.latitude,
        longitude: payload.longitude,
        selfie_verified: payload.selfieVerified,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 9. Authentic Health Insurance Claim Filing APIs
  // -------------------------------------------------------------------------
  public static async submitMedicalClaim(payload: {
    hospital: string;
    amount: number;
    notes?: string;
    customerId?: string;
  }): Promise<{
    success: boolean;
    claim_id: string;
    status: string;
    hospital: string;
    amount: number;
    timestamp: string;
    message: string;
  } | null> {
    return this.request('/claims/submit', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        hospital: payload.hospital,
        amount: payload.amount,
        notes: payload.notes,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 10. Authentic Subscription Mandate Management APIs
  // -------------------------------------------------------------------------
  public static async pauseMandate(payload: {
    mandateName: string;
    isPaused?: boolean;
    customerId?: string;
  }): Promise<{
    success: boolean;
    mandate_name: string;
    is_paused: boolean;
    active_paused_count: number;
    timestamp: string;
  } | null> {
    return this.request('/mandates/pause', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        mandate_name: payload.mandateName,
        is_paused: payload.isPaused !== undefined ? payload.isPaused : true,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 11. Empathetic Loan Relief: 10-Day Grace Buffer
  // -------------------------------------------------------------------------
  public static async requestEmiGrace(payload: {
    loanId?: string;
    days?: number;
    customerId?: string;
  }): Promise<{
    success: boolean;
    loan_id: string;
    previous_due_date: string;
    new_due_date: string;
    grace_days: number;
    penalty_waived: boolean;
    message: string;
    timestamp: string;
  } | null> {
    return this.request('/loans/grace', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        loan_id: payload.loanId,
        days: payload.days || 10,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 12. Empathetic Loan Relief: Split EMI (Dual-installment)
  // -------------------------------------------------------------------------
  public static async splitEmi(payload: {
    loanId?: string;
    customerId?: string;
  }): Promise<{
    success: boolean;
    loan_id: string;
    original_amount: number;
    part_1_amount: number;
    part_1_due_date: string;
    part_2_amount: number;
    part_2_due_date: string;
    message: string;
    timestamp: string;
  } | null> {
    return this.request('/loans/split', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        loan_id: payload.loanId,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 13. Empathetic Loan Relief: Emergency Deficit Auto-Sweep
  // -------------------------------------------------------------------------
  public static async sweepDeficitForEmi(payload: {
    loanId?: string;
    amount?: number;
    customerId?: string;
  }): Promise<{
    success: boolean;
    swept_amount: number;
    remaining_deficit: number;
    new_available_balance: number;
    new_emergency_balance: number;
    message: string;
    timestamp: string;
  } | null> {
    return this.request('/loans/sweep-deficit', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        loan_id: payload.loanId,
        amount: payload.amount,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 14. RBI Digital Lending: Statutory 3-Day Cooling-Off Cancellation
  // -------------------------------------------------------------------------
  public static async cancelLoanCoolingOff(payload: {
    contractId: string;
    customerId?: string;
  }): Promise<{
    success: boolean;
    loan_id: string;
    status: string;
    refunded_amount: number;
    penalty_applied: number;
    message: string;
    timestamp: string;
  } | null> {
    return this.request('/loans/cooling-off-cancel', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        contract_id: payload.contractId,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 15. SEBI ASBA IPO Lien Blocking
  // -------------------------------------------------------------------------
  public static async placeAsbaBid(payload: {
    ipoName: string;
    shares: number;
    amount: number;
    upiId: string;
    customerId?: string;
  }): Promise<{
    success: boolean;
    lien_id: string;
    symbol: string;
    amount_blocked: number;
    available_balance_after_lien: number;
    status: string;
    sebi_mandate_id: string;
    message: string;
    timestamp: string;
  } | null> {
    return this.request('/investments/asba/bid', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        ipo_name: payload.ipoName,
        shares: payload.shares,
        amount: payload.amount,
        upi_id: payload.upiId,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 16. Dynamic Single-Use 5-Minute Virtual CVV Generator
  // -------------------------------------------------------------------------
  public static async generateDynamicCvv(payload: {
    cardId?: string;
    customerId?: string;
  }): Promise<{
    success: boolean;
    card_id: string;
    dynamic_cvv: string;
    expires_at: string;
    valid_seconds: number;
    message: string;
  } | null> {
    return this.request('/cards/dynamic-cvv', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        card_id: payload.cardId || 'card_01',
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 17. Statutory IRDAI Insurance & Protection Enrollment APIs
  // -------------------------------------------------------------------------
  public static async getInsurancePlans(customerId = 'cust_bharat_001'): Promise<any | null> {
    return this.request(`/insurance/plans/${customerId}`);
  }

  public static async enrollInsurancePolicy(payload: {
    planId: string;
    sumInsured: number;
    nomineeName: string;
    nomineeRelation: string;
    customerId?: string;
  }): Promise<{
    success: boolean;
    policy_number: string;
    plan_id: string;
    sum_insured: number;
    monthly_premium: number;
    nominee_name: string;
    nominee_relation: string;
    status: string;
    available_balance: number;
    message: string;
  } | null> {
    return this.request('/insurance/enroll', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: payload.customerId || 'cust_bharat_001',
        plan_id: payload.planId,
        sum_insured: payload.sumInsured,
        nominee_name: payload.nomineeName,
        nominee_relation: payload.nomineeRelation,
      }),
    });
  }

  // -------------------------------------------------------------------------
  // 18. Authentication Endpoints (Login, Registration, JWT)
  // -------------------------------------------------------------------------
  public static async register(payload: {
    name: string;
    phone: string;
    email: string;
    password: string;
    monthly_income?: number;
    language?: string;
    city?: string;
    state?: string;
  }): Promise<{
    success: boolean;
    access_token: string;
    token_type: string;
    customer_id: string;
    customer_name: string;
    email: string;
    phone: string;
    balance: {
      available: number;
      savings: number;
      currency: string;
    };
    message: string;
  } | null> {
    const res = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res?.access_token) {
      this.setAuthToken(res.access_token);
    }
    return res;
  }

  public static async login(credentials: {
    identifier: string;
    password: string;
  }): Promise<{
    success: boolean;
    access_token: string;
    token_type: string;
    customer_id: string;
    customer_name: string;
    email: string;
    phone: string;
    balance: {
      available: number;
      savings: number;
      currency: string;
    };
    message: string;
  } | null> {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res?.access_token) {
      this.setAuthToken(res.access_token);
    }
    return res;
  }

  public static async getMe(): Promise<{
    authenticated: boolean;
    claims: Record<string, any>;
    customer_id: string;
    name: string;
    financial_health: string;
    balance: any;
    signals: any;
  } | null> {
    return this.request('/auth/me');
  }
}



