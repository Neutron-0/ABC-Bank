export interface ThemeColors {
  // Primary Brand & Deep Charcoal Neutrals
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySubtle: string;
  primaryRoyal: string;
  jioBlue: string;

  // Canvas & Surfaces
  bg: string;
  cardBg: string;
  cardBgSecondary: string;
  surfaceElevated: string;

  // Hairline & Structural Dividers
  border: string;
  borderLight: string;
  divider: string;

  // Typography Scale
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textWhite: string;

  // Restrained Semantic Accents
  accent: string;
  accentIndigo: string;
  accentPurple: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  accentWarm: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;

  // Pastel Container Backgrounds for 4-Grid / Services
  pastelBlue: string;
  pastelEmerald: string;
  pastelAmber: string;
  pastelPurple: string;
  pastelCyan: string;

  // Attention Hierarchy Layers
  layerDo: string;
  layerKnow: string;
  layerPlan: string;
  layerConsider: string;
}

export const lightColors: ThemeColors = {
  // Primary Brand & Deep Charcoal Neutrals
  primary: '#111318',
  primaryDark: '#0A0C0F',
  primaryLight: '#2D3748',
  primarySubtle: '#F4F5F7',
  primaryRoyal: '#002970', // JioFinance Deep Trust Royal Blue
  jioBlue: '#0A2540',

  // Canvas & Surfaces (Airy, Calm Light-Slate)
  bg: '#F6F8FA', // JioFinance Soft Slate Canvas
  cardBg: '#FFFFFF', // Pure Crisp White
  cardBgSecondary: '#F8FAFC', // Subtle Secondary Tint
  surfaceElevated: '#FFFFFF',

  // Hairline & Structural Dividers
  border: '#ECEEF2', // Soft Hairline Border
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',

  // Typography Scale (High-Legibility Charcoal)
  textPrimary: '#0F172A', // Deep Slate / Near-Black
  textSecondary: '#475569', // Calm Muted Slate
  textMuted: '#94A3B8', // Secondary Metadata
  textWhite: '#FFFFFF',

  // Restrained Semantic Accents
  accent: '#0052CC', // JioFinance Electric Blue
  accentIndigo: '#4F46E5',
  accentPurple: '#7C3AED',
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  accentWarm: '#D97706',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  info: '#2563EB',
  infoLight: '#EFF6FF',

  // Pastel Container Backgrounds for 4-Grid / Services
  pastelBlue: '#EFF6FF',
  pastelEmerald: '#ECFDF5',
  pastelAmber: '#FEF3C7',
  pastelPurple: '#F5F3FF',
  pastelCyan: '#ECFEFF',

  // Attention Hierarchy Layers
  layerDo: '#F0F5FF',
  layerKnow: '#F0FDF4',
  layerPlan: '#FAF5FF',
  layerConsider: '#FFFBEB',
};

export const darkColors: ThemeColors = {
  // Primary Brand & Inverted High-Contrast Slate
  primary: '#F8FAFC',
  primaryDark: '#E2E8F0',
  primaryLight: '#94A3B8',
  primarySubtle: '#1E293B',
  primaryRoyal: '#2563EB', // Vibrant royal in dark mode
  jioBlue: '#1E3A8A',

  // Canvas & Surfaces (Luxury Midnight Obsidian)
  bg: '#0B0F19', // Deepest Obsidian
  cardBg: '#131B2E', // High-Contrast Elevated Card Slate
  cardBgSecondary: '#1C2740', // Secondary Elevated Tile
  surfaceElevated: '#202E4C',

  // Hairline & Structural Dividers
  border: '#23324D', // Crisp border for dark surfaces
  borderLight: '#2C3E60',
  divider: '#1F2C45',

  // Typography Scale (Luminous Crisp Slate)
  textPrimary: '#F8FAFC', // Crisp Pure White
  textSecondary: '#94A3B8', // Cool Muted Slate
  textMuted: '#64748B', // Secondary Metadata
  textWhite: '#FFFFFF',

  // Restrained Semantic Accents (Luminous contrast)
  accent: '#38BDF8', // Luminous Sky Blue
  accentIndigo: '#818CF8',
  accentPurple: '#A78BFA',
  success: '#10B981',
  successLight: '#064E3B',
  warning: '#F59E0B',
  warningLight: '#451A03',
  accentWarm: '#F59E0B',
  danger: '#EF4444',
  dangerLight: '#450A0A',
  info: '#38BDF8',
  infoLight: '#082F49',

  // Pastel / Subtle Container Backgrounds
  pastelBlue: '#172554',
  pastelEmerald: '#064E3B',
  pastelAmber: '#451A03',
  pastelPurple: '#2E1065',
  pastelCyan: '#083344',

  // Attention Hierarchy Layers
  layerDo: '#1E293B',
  layerKnow: '#064E3B',
  layerPlan: '#2E1065',
  layerConsider: '#451A03',
};

// Default static fallback for legacy non-reactive imports
export const colors: ThemeColors = lightColors;
