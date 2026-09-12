import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography, spacing, radii } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';
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
  color,
  onPress,
}) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      delayPressIn={0}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.cardBgSecondary, borderWidth: 1, borderColor: colors.borderLight }]}>
        <Icon size={20} color={colors.iconNeutral} />
      </View>
      <Text style={[styles.label, { color: colors.textPrimary }]} numberOfLines={1}>{label}</Text>
      {sublabel ? <Text style={[styles.sublabel, { color: colors.textMuted }]} numberOfLines={1}>{sublabel}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '23%',
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.captionMedium,
    fontSize: 11,
    textAlign: 'center',
  },
  sublabel: {
    ...typography.tiny,
    textAlign: 'center',
  },
});

