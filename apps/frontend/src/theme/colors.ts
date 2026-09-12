/**
 * HINGE-STYLE EDITORIAL MINIMALIST BANKING DESIGN SYSTEM
 *
 * Canvas: Tactile Warm Paper / Porcelain (#FAF8F5)
 * Surfaces: Crisp White (#FFFFFF) with delicate hairline rules (#EAE6DF)
 * Wells: Soft Warm Stone / Oatmeal (#F3EFEA)
 * Primary Accent: Obsidian Ink (#141414) for confident editorial typography & tactile pill buttons
 * Milestone Accent: Warm Terracotta / Amber (#B45309) for yield and score milestones
 */

export interface ThemeColors {
  // --- PRIMARY INK & BRAND ---
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySubtle: string;
  primaryRoyal: string;
  jioBlue: string;

  // --- SECONDARY MILESTONE ACCENT ---
  brandSecondary: string;
  brandSecondaryLight: string;
  brandSecondarySubtle: string;
  accentWarm: string;
  warning: string;
  warningLight: string;

  // --- WARM EDITORIAL NEUTRALS ---
  bg: string; // Tactile warm paper canvas
  cardBg: string; // Crisp clean surface
  cardBgSecondary: string; // Soft warm stone well / pill
  surfaceElevated: string;

  // Hairline Dividers
  border: string;
  borderLight: string;
  divider: string;

  // Monochromatic Iconography
  iconNeutral: string;
  iconNeutralSubtle: string;

  // Editorial Typography Scale
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textWhite: string;

  // Semantic Indicators
  accent: string;
  accentIndigo: string;
  accentPurple: string;
  success: string;
  successLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;

  // Unified Monochromatic Tiles
  pastelBlue: string;
  pastelEmerald: string;
  pastelAmber: string;
  pastelPurple: string;
  pastelCyan: string;

  layerDo: string;
  layerKnow: string;
  layerPlan: string;
  layerConsider: string;
}

export const lightColors: ThemeColors = {
  // Primary Ink: Deep Obsidian Black
  primary: '#141414',
  primaryDark: '#000000',
  primaryLight: '#2C2B29',
  primarySubtle: '#F3EFEA',
  primaryRoyal: '#141414',
  jioBlue: '#141414',

  // Secondary Milestone Accent: Warm Terracotta / Heritage Amber
  brandSecondary: '#B45309',
  brandSecondaryLight: '#D97706',
  brandSecondarySubtle: '#FDF6ED',
  accentWarm: '#B45309',
  warning: '#B45309',
  warningLight: '#FDF6ED',

  // Warm Paper Foundation
  bg: '#EDEDEC', // Hinge soft stone backdrop
  cardBg: '#FFFFFF', // Crisp White Sheet
  cardBgSecondary: '#F3EFEA', // Soft Warm Stone Neutral Well
  surfaceElevated: '#FFFFFF',

  border: '#E8E8E6', // Hairline paper divider
  borderLight: '#F2F2F0',
  divider: '#E8E8E6',

  iconNeutral: '#68645E', // Warm Muted Charcoal
  iconNeutralSubtle: '#9C968E', // Soft Stone

  textPrimary: '#141414', // Deep Obsidian Ink
  textSecondary: '#68645E', // Editorial Charcoal
  textMuted: '#9C968E', // Muted Stone
  textWhite: '#FFFFFF',

  // Restrained Semantics
  accent: '#141414',
  accentIndigo: '#141414',
  accentPurple: '#141414',
  success: '#1B7A43', // Forest green
  successLight: '#EDF7F1',
  danger: '#C92A2A', // Restrained crimson
  dangerLight: '#FDF2F2',
  info: '#141414',
  infoLight: '#F3EFEA',

  pastelBlue: '#F3EFEA',
  pastelEmerald: '#F3EFEA',
  pastelAmber: '#FDF6ED',
  pastelPurple: '#F3EFEA',
  pastelCyan: '#F3EFEA',

  layerDo: '#F3EFEA',
  layerKnow: '#F3EFEA',
  layerPlan: '#F3EFEA',
  layerConsider: '#FDF6ED',
};

// Unified Light-Only System (Dark fallback maps to same warm paper palette)
export const darkColors: ThemeColors = lightColors;

// Static default fallback
export const colors: ThemeColors = lightColors;
