import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { motion } from '../../motion';
import { Bell, Globe, SlidersHorizontal, ShieldCheck, User, Bot } from 'lucide-react-native';

export const AdaptiveHeader: React.FC = () => {
  const { profile, language, setLanguage, openJourney, currentState, setActiveTab } = useCustomerStore();
  const t = getTranslation(language);

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
          <View style={styles.brandRow}>
            <Text style={styles.bankName}>ABC BANK</Text>
            <View style={styles.tierPill}>
              <Text style={styles.tierPillText}>PREMIER</Text>
            </View>
          </View>
          <Text style={styles.accountText}>A/C 5010 •••• 4092 • {profile.name}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Chat Bot Button (MiniCPM-5 Pipeline) */}
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => setActiveTab('assistant')}
          activeOpacity={0.8}
        >
          <Bot size={13} color="#FFFFFF" />
          <Text style={styles.chatButtonText}>Mitra AI</Text>
        </TouchableOpacity>

        {/* Sandbox Simulation Drawer Shortcut */}
        <TouchableOpacity
          style={styles.sandboxButton}
          onPress={() => openJourney('prototype_lab')}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={12} color="#334155" />
          <Text style={styles.sandboxButtonText}>Sandbox</Text>
        </TouchableOpacity>

        {/* Vernacular Language Selector */}
        <TouchableOpacity
          style={styles.langButton}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <Globe size={12} color="#0F172A" />
          <Text style={styles.langText}>{getLangLabel()}</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => openJourney('prototype_lab')}
          activeOpacity={0.8}
        >
          <Bell size={17} color="#0F172A" />
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F294A',
    letterSpacing: 0.8,
  },
  tierPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tierPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  accountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4338CA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  chatButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  sandboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sandboxButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
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
