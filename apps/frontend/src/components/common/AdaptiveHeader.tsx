import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { motion } from '../../motion';
import { Bell, Globe, QrCode, ShieldCheck, Search } from 'lucide-react-native';

export const AdaptiveHeader: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile.name ? profile.name.split(' ')[0] : 'Rahul';

    if (language === 'hi') {
      if (hour < 12) return `नमस्ते, ${name}`;
      if (hour < 17) return `शुभ दोपहर, ${name}`;
      return `शुभ संध्या, ${name}`;
    }
    if (language === 'gu') {
      if (hour < 12) return `નમસ્તે, ${name}`;
      if (hour < 17) return `શુભ બપોર, ${name}`;
      return `શુભ સાંજ, ${name}`;
    }
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <View style={styles.leftRow}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => openJourney('kyc')}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' }}
            style={[styles.avatar, { borderColor: themeColors.cardBg }]}
          />
          <View style={styles.verifiedDot}>
            <ShieldCheck size={8} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.textWrap}>
          <Text style={[styles.greetingText, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {getGreeting()}
          </Text>
          <View style={styles.subRow}>
            <View style={styles.verifiedDotMini} />
            <Text style={styles.subHeaderText}>
              {language === 'hi' ? 'सत्यापित बचत खाता' : language === 'gu' ? 'ચકાસાયેલ બચત ખાતું' : 'Verified Savings A/C'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Universal Search Shortcut */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => setActiveTab('assistant')}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Search size={18} color={themeColors.iconNeutral} />
        </TouchableOpacity>

        {/* Quick QR Scanner Shortcut */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <QrCode size={18} color={themeColors.iconNeutral} />
        </TouchableOpacity>

        {/* Vernacular Language Selector */}
        <TouchableOpacity
          style={[styles.langButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <Globe size={13} color={themeColors.iconNeutral} />
          <Text style={[styles.langText, { color: themeColors.textPrimary }]}>{getLangLabel()}</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
          onPress={() => openJourney('prototype_lab')}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Bell size={18} color={themeColors.iconNeutral} />
          {currentState !== 'normal' && <View style={[styles.unreadBadge, { backgroundColor: themeColors.brandSecondary }]} />}
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
    paddingBottom: spacing.sm + 2,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#F1F5F9',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#059669',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    justifyContent: 'center',
    flex: 1,
  },
  greetingText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  verifiedDotMini: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  subHeaderText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    letterSpacing: 0.2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...shadows.sm,
  },
  unreadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...shadows.sm,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
