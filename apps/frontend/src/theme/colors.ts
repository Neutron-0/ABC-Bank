/**
 * STRICT TWO-COLOR BANKING DESIGN SYSTEM
 *
 * Color A: Primary Brand (~15% visual weight) - Deep Trust Royal Navy (#002970 / #2563EB)
 * Color B: Secondary Accent (~5% visual weight) - Heritage Warm Amber (#B45309 / #F59E0B)
 * Neutrals: Everything else (~80% visual weight) - Charcoal, Slate, Hairline borders, and Tonal Canvas
 */

export interface ThemeColors {
  // --- COLOR A: PRIMARY BRAND (Dominant Identity ~15%) ---
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySubtle: string;
  primaryRoyal: string;
  jioBlue: string; // Compatibility alias to Color A

  // --- COLOR B: SECONDARY BRAND (Selective Milestone Accent ~5%) ---
  brandSecondary: string;
  brandSecondaryLight: string;
  brandSecondarySubtle: string;
  accentWarm: string; // Alias to Color B
  warning: string; // Restrained semantic alignment to Color B
  warningLight: string;

  // --- NEUTRAL FOUNDATION (~80% Visual Weight) ---
  bg: string; // Canvas with subtle tonal depth (not stark clinical white)
  cardBg: string; // Primary Crisp Surface
  cardBgSecondary: string; // Secondary Neutral Surface for wells/chips
  surfaceElevated: string; // Elevated neutral sheet

  // Hairline & Structural Dividers
  border: string;
  borderLight: string;
  divider: string;

  // Monochromatic Iconography Tokens
  iconNeutral: string;
  iconNeutralSubtle: string;

  // Typography Scale (High-Legibility Charcoal/Slate)
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textWhite: string;

  // --- RESTRAINED SEMANTIC INDICATORS ---
  accent: string; // Maps strictly to Color A
  accentIndigo: string; // Strict fallback to Color A
  accentPurple: string; // Strict fallback to Color A
  success: string;
  successLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;

  // Monochromatic Neutral Replacements for Legacy Pastel Containers
  pastelBlue: string;
  pastelEmerald: string;
  pastelAmber: string;
  pastelPurple: string;
  pastelCyan: string;

  // Attention Hierarchy Layers (Mapped to Neutral & Color A subtle wells)
  layerDo: string;
  layerKnow: string;
  layerPlan: string;
  layerConsider: string;
}

export const lightColors: ThemeColors = {
  // Color A: Primary Brand
  primary: '#002970', // Deep Trust Royal Navy
  primaryDark: '#001A4D',
  primaryLight: '#1E3A8A',
  primarySubtle: '#F0F4FA',
  primaryRoyal: '#002970',
  jioBlue: '#002970',

  // Color B: Secondary Brand (Heritage Warm Amber)
  brandSecondary: '#B45309', // Amber-700
  brandSecondaryLight: '#D97706',
  brandSecondarySubtle: '#FEF3C7',
  accentWarm: '#B45309',
  warning: '#B45309',
  warningLight: '#FEF3C7',

  // Neutral Foundation (~80% Visual Field)
  bg: '#F4F5F7', // Neutral slate canvas (warm, calm, anti-glare)
  cardBg: '#FFFFFF', // Crisp White surface
  cardBgSecondary: '#EDEFF2', // Neutral well/input surface
  surfaceElevated: '#FFFFFF',

  border: '#E2E8F0', // Hairline neutral divider
  borderLight: '#EDEFF2',
  divider: '#E2E8F0',

  iconNeutral: '#475569', // Slate-600 default icon
  iconNeutralSubtle: '#94A3B8',

  textPrimary: '#0F172A', // Slate-900
  textSecondary: '#475569', // Slate-600
  textMuted: '#94A3B8', // Slate-400
  textWhite: '#FFFFFF',

  // Subordinate Semantics
  accent: '#002970', // Bound to Color A
  accentIndigo: '#002970',
  accentPurple: '#002970',
  success: '#059669', // Restrained emerald for confirmation dots
  successLight: '#ECFDF5',
  danger: '#DC2626', // Restrained crimson for critical alert tags
  dangerLight: '#FEF2F2',
  info: '#002970', // Bound to Color A
  infoLight: '#F0F4FA',

  // Unified Monochromatic Tiles (Banished Pastel Rainbows)
  pastelBlue: '#F0F4FA', // Color A subtle
  pastelEmerald: '#EDEFF2', // Neutral slate well
  pastelAmber: '#FEF3C7', // Color B subtle
  pastelPurple: '#EDEFF2', // Neutral slate well
  pastelCyan: '#EDEFF2', // Neutral slate well

  layerDo: '#F0F4FA',
  layerKnow: '#EDEFF2',
  layerPlan: '#EDEFF2',
  layerConsider: '#FEF3C7',
};

export const darkColors: ThemeColors = {
  // Color A: Primary Brand (Vibrant Electric Sapphire Accent in Dark Mode ~15%)
  primary: '#2563EB', // Vibrant Brand Blue for CTAs, active tabs, graph curves & indicators
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  primarySubtle: '#172554', // Midnight Sapphire well
  primaryRoyal: '#2563EB',
  jioBlue: '#2563EB',

  // Color B: Secondary Brand (Luminous Warm Amber Milestone ~5%)
  brandSecondary: '#F59E0B',
  brandSecondaryLight: '#FBBF24',
  brandSecondarySubtle: '#261C05',
  accentWarm: '#F59E0B',
  warning: '#F59E0B',
  warningLight: '#261C05',

  // Neutral Foundation (~80% Visual Field) - Pure Deep True Black
  bg: '#000000', // Pure True Black canvas
  cardBg: '#121212', // Material True Dark surface
  cardBgSecondary: '#1C1C1E', // Neutral dark grey well
  surfaceElevated: '#242426',

  border: '#2C2C2E', // Neutral hairline border
  borderLight: '#3A3A3C',
  divider: '#242426',

  iconNeutral: '#A1A1AA', // Neutral silver-grey icon
  iconNeutralSubtle: '#71717A',

  textPrimary: '#FFFFFF', // High-Contrast Pure White (guarantees NO blue text on dark backgrounds)
  textSecondary: '#A1A1AA', // Neutral silver-grey
  textMuted: '#71717A',
  textWhite: '#FFFFFF',

  // Subordinate Semantics
  accent: '#2563EB',
  accentIndigo: '#2563EB',
  accentPurple: '#2563EB',
  success: '#10B981',
  successLight: '#0C2417',
  danger: '#EF4444',
  dangerLight: '#2A0E0E',
  info: '#3B82F6',
  infoLight: '#172554',

  pastelBlue: '#172554',
  pastelEmerald: '#1C1C1E',
  pastelAmber: '#261C05',
  pastelPurple: '#1C1C1E',
  pastelCyan: '#1C1C1E',

  layerDo: '#172554',
  layerKnow: '#1C1C1E',
  layerPlan: '#1C1C1E',
  layerConsider: '#261C05',
};

// Static default fallback
export const colors: ThemeColors = lightColors;
