import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { LucideIcon } from 'lucide-react-native';

interface SmartActionProps {
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  color?: string;
  onPress: () => void;
}

export const SmartAction: React.FC<SmartActionProps> = ({
  label,
  sublabel,
  icon: Icon,
  color = colors.primary,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      delayPressIn={0}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
        <Icon size={22} color={color} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      {sublabel ? <Text style={styles.sublabel} numberOfLines={1}>{sublabel}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '23%',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sublabel: {
    ...typography.tiny,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
