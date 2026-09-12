import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';
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
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      delayPressIn={0}
      activeOpacity={0.75}
    >
      <View style={styles.leftRow}>
        <View style={styles.iconBox}>
          <Icon size={20} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.rightSide}>
        {amount ? (
          <Text style={styles.amount}>₹{amount}</Text>
        ) : (
          <Text style={styles.payCta}>Repeat</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  badgeText: {
    ...typography.tiny,
    color: '#92400E',
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  payCta: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
  },
});
