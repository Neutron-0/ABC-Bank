import { TextStyle, Platform } from 'react-native';

export const serifFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, serif',
});

export const fontFamilies = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'sans-serif' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'sans-serif' }),
  serif: serifFont,
};

export const typography = {
  fontFamilies,
  serifHero: {
    fontFamily: serifFont,
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  serifPrompt: {
    fontFamily: serifFont,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  serifStatement: {
    fontFamily: serifFont,
    fontSize: 19,
    fontWeight: '700' as const,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  promptHeader: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  displayBalance: {
    fontFamily: serifFont,
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -1.0,
  },
  balanceLarge: {
    fontFamily: serifFont,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  balanceMedium: {
    fontFamily: serifFont,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 14,
    letterSpacing: 1.0,
    textTransform: 'uppercase' as const,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
};
