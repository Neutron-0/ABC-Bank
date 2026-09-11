import mockExperience from '../mock/experience.json';

const BACKEND_URL = 'http://localhost:8000/api/v1';

export interface ExperienceConfig {
  customer_id?: string;
  primary_actions: string[];
  secondary_actions?: string[];
  priority_modules: string[];
  deprioritized_modules?: string[];
  hero_card?: {
    id: string;
    title: string;
    subtitle: string;
    action_label: string;
    action_type: string;
    badge?: string;
    accent?: string;
    why?: string;
  };
  context_cards?: any[];
  language?: string;
  interaction_mode?: string;
}

export class ExperienceApi {
  public static async fetchExperience(customerId = 'cust_bharat_001', lang = 'en'): Promise<ExperienceConfig> {
    try {
      const response = await fetch(`${BACKEND_URL}/experience/${customerId}?lang=${lang}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.log('[ExperienceApi] Using decoupled mock contract experience.json');
      return mockExperience as ExperienceConfig;
    }
  }

  public static async switchScenario(scenario: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/scenario/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      return await response.json();
    } catch (err) {
      console.log('[ExperienceApi] Offline scenario switch simulation');
      return { success: true, scenario };
    }
  }

  public static async sendVoiceQuery(query: string, language = 'en'): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/voice/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language }),
      });
      return await response.json();
    } catch (err) {
      return {
        intent: 'GENERAL_QUERY',
        language,
        response_text: `Processed "${query}" using local contract fallback.`,
      };
    }
  }
}
