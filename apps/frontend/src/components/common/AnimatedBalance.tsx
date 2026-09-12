import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, Animated, TextStyle } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { typography, serifFont } from '../../theme/typography';

interface Props {
  value: number;
  isPrivacyHidden?: boolean;
  style?: TextStyle;
  currencyPrefix?: string;
  fractionSuffix?: string;
}

export const AnimatedBalance: React.FC<Props> = ({
  value,
  isPrivacyHidden = false,
  style,
  currencyPrefix = '₹',
  fractionSuffix = '.00',
}) => {
  const { colors: themeColors } = useAppTheme();
  const [displayValue, setDisplayValue] = useState(value);
  const animValue = useRef(new Animated.Value(value)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (isPrivacyHidden) return;

    if (prevValue.current !== value) {
      // Pulse animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Number interpolation animation
      const start = prevValue.current;
      const end = value;
      const duration = 400; // ms
      const startTime = Date.now();

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuad
        const ease = 1 - (1 - progress) * (1 - progress);
        const current = Math.round(start + (end - start) * ease);
        setDisplayValue(current);

        if (progress >= 1) {
          clearInterval(timer);
          setDisplayValue(end);
          prevValue.current = end;
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value, isPrivacyHidden]);

  if (isPrivacyHidden) {
    return <Text style={[styles.text, { color: themeColors.textPrimary }, style]}>••••••</Text>;
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flexDirection: 'row', alignItems: 'baseline' }}>
      {currencyPrefix ? <Text style={[styles.currency, { color: themeColors.textPrimary }, style]}>{currencyPrefix}</Text> : null}
      <Text style={[styles.text, { color: themeColors.textPrimary }, style]}>{displayValue.toLocaleString('en-IN')}</Text>
      {fractionSuffix ? <Text style={[styles.fraction, { color: themeColors.textSecondary }, style]}>{fractionSuffix}</Text> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  currency: {
    fontFamily: serifFont,
    fontSize: 26,
    fontWeight: '700',
    marginRight: 4,
  },
  text: {
    fontFamily: serifFont,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  fraction: {
    fontFamily: serifFont,
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 1,
  },
});
