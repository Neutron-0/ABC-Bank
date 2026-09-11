import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { Bell, Globe, Sparkles } from 'lucide-react-native';

export const AdaptiveHeader: React.FC = () => {
  const { profile, language, setLanguage, openJourney, currentState } = useCustomerStore();
  const t = getTranslation(language);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.home.greetingMorning;
    if (hour < 17) return t.home.greetingAfternoon;
    return t.home.greetingEvening;
  };

  const toggleLanguage = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('gu');
    else setLanguage('en');
  };

  const getLangLabel = () => {
    if (language === 'en') return 'EN';
    if (language === 'hi') return 'हि';
    return 'ગુ';
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: profile.avatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.nameText}>{profile.name}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Prototype Switcher Quick Shortcut */}
        <TouchableOpacity
          style={styles.protoButton}
          onPress={() => openJourney('prototype_lab')}
          activeOpacity={0.7}
        >
          <Sparkles size={14} color={colors.accentWarm} />
          <Text style={styles.protoButtonText}>Lab</Text>
        </TouchableOpacity>

        {/* Vernacular Language Selector */}
        <TouchableOpacity
          style={styles.langButton}
          onPress={toggleLanguage}
          activeOpacity={0.7}
        >
          <Globe size={14} color={colors.primary} />
          <Text style={styles.langText}>{getLangLabel()}</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => openJourney('prototype_lab')}
          activeOpacity={0.7}
        >
          <Bell size={18} color={colors.textSecondary} />
          {currentState !== 'normal' && <View style={styles.unreadBadge} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  textWrap: {
    justifyContent: 'center',
  },
  greetingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  nameText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  protoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  protoButtonText: {
    ...typography.tiny,
    color: '#92400E',
    fontWeight: '700',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langText: {
    ...typography.tiny,
    color: colors.primary,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
});
