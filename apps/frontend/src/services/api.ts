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

import { MiniCPM5EdgeEngine } from './MiniCPM5EdgeEngine';

export class BankingApi {
  private static get baseUrl(): string {
    return getApiBaseUrl();
  }

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout for fast on-device fallback

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
      console.log(`[BankingApi] Edge on-device fallback mode active for ${endpoint}`);
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

  public static async sendAssistantMessage(
    query: string,
    language: LanguageCode = 'en',
    pendingClarification?: string | null
  ): Promise<any | null> {
    const remote = await this.request<any>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        query,
        language,
        pending_clarification: pendingClarification || null,
      }),
    });
    if (remote && remote.reply) return remote;

    // On-device MiniCPM-5 edge execution fallback (0ms latency, zero server required)
    const edge = MiniCPM5EdgeEngine.processQuery(query, language);
    return {
      success: true,
      reply: MiniCPM5EdgeEngine.toAssistantMessage(edge),
      isEdgeExecution: true,
      runtimeDevice: 'On-Device Mobile NPU / MiniCPM-5 Edge',
    };
  }
}
