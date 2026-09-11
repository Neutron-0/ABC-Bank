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

export class BankingApi {
  private static get baseUrl(): string {
    return getApiBaseUrl();
  }

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for snappy UI

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.log(`[BankingApi] Offline/fallback mode active for ${endpoint}`);
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
    return this.request('/voice/intent', {
      method: 'POST',
      body: JSON.stringify({ query, language }),
    });
  }

  public static async getAssistantInit(lang: LanguageCode = 'en'): Promise<any | null> {
    return this.request(`/assistant/init?lang=${lang}`);
  }

  public static async sendAssistantMessage(query: string, language: LanguageCode = 'en'): Promise<any | null> {
    return this.request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ query, language }),
    });
  }
}
