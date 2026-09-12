import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { motion } from '../../motion';
import { Bell, Globe, Sparkles, SlidersHorizontal, Bot } from 'lucide-react-native';

export const AdaptiveHeader: React.FC = () => {
  const { profile, language, setLanguage, openJourney, currentState, setActiveTab } = useCustomerStore();
  const t = getTranslation(language);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.home.greetingMorning;
    if (hour < 17) return t.home.greetingAfternoon;
    return t.home.greetingEvening;
  };

  const toggleLanguage = () => {
    motion.gentleLayout();
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
            source={{ uri: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' }}
            style={styles.avatar}
          />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.nameText}>{profile.name}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Prototype Persona Switcher Shortcut */}
        <TouchableOpacity
          style={styles.protoButton}
          onPress={() => openJourney('prototype_lab')}
          activeOpacity={0.8}
        >
          <Sparkles size={13} color="#D97706" />
          <Text style={styles.protoButtonText}>Lab</Text>
        </TouchableOpacity>

        {/* Ambient Mitra Assistant Trigger */}
        <TouchableOpacity
          style={styles.mitraButton}
          onPress={() => setActiveTab('assistant')}
          activeOpacity={0.8}
        >
          <Bot size={13} color="#4F46E5" />
          <Text style={styles.mitraButtonText}>Mitra</Text>
        </TouchableOpacity>

        {/* Vernacular Language Selector */}
        <TouchableOpacity
          style={styles.langButton}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <Text style={styles.langText}>{getLangLabel()}</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => openJourney('prototype_lab')}
          activeOpacity={0.8}
        >
          <Bell size={18} color="#0F172A" />
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  textWrap: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  nameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  protoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  protoButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  mitraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  mitraButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  langButton: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
});
