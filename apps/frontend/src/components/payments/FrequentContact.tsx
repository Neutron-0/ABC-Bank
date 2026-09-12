import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii, useAppTheme } from '../../theme';
import { LucideIcon } from 'lucide-react-native';

interface FrequentContactProps {
  title: string;
  subtitle: string;
  amount?: number;
  icon: LucideIcon;
  badge?: string;
  onPress: () => void;
}

export const FrequentContact: React.FC<FrequentContactProps> = ({
  title,
  subtitle,
  amount,
  icon: Icon,
  badge,
  onPress,
}) => {
  const { colors: themeColors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: themeColors.borderLight }]}
      onPress={onPress}
      delayPressIn={0}
      activeOpacity={0.65}
    >
      <View style={styles.left}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {badge && (
            <View style={[styles.badge, { borderColor: themeColors.borderLight }]}>
              <Text style={[styles.badgeText, { color: themeColors.brandSecondary }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.right}>
        {amount ? (
          <Text style={[styles.amount, { color: themeColors.textPrimary }]}>₹{amount.toLocaleString('en-IN')}</Text>
        ) : (
          <Text style={[styles.payCta, { color: themeColors.primary }]}>Pay →</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flex: 1,
    paddingRight: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  payCta: {
    fontSize: 12,
    fontWeight: '600',
  },
});
