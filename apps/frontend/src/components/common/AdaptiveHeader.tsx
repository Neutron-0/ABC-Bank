import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { motion } from '../../motion';
import { Bell, Globe, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react-native';

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile.name ? profile.name.split(' ')[0] : 'Rahul';

    if (language === 'hi') {
      if (hour < 12) return `शुभ प्रभात, ${name}`;
      if (hour < 17) return `नमस्ते, ${name}`;
      return `शुभ संध्या, ${name}`;
    }
    if (language === 'gu') {
      if (hour < 12) return `શુભ સવાર, ${name}`;
      if (hour < 17) return `નમસ્તે, ${name}`;
      return `શુભ સાંજ, ${name}`;
    }
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => openJourney('kyc')}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' }}
            style={styles.avatar}
          />
          <View style={styles.verifiedDot}>
            <ShieldCheck size={8} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.textWrap}>
          <Text style={styles.greetingText} numberOfLines={1}>
            {getGreeting()}
          </Text>
          <View style={styles.subRow}>
            <View style={styles.verifiedPill}>
              <Text style={styles.tierText}>Verified Account</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Quick QR Scanner Shortcut (JioFinance Pattern) */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <QrCode size={18} color="#0F172A" />
        </TouchableOpacity>

        {/* Vernacular Language Selector */}
        <TouchableOpacity
          style={styles.langButton}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <Globe size={13} color="#0F172A" />
          <Text style={styles.langText}>{getLangLabel()}</Text>
        </TouchableOpacity>

        {/* Notifications / Regulatory Desk */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => openJourney('prototype_lab')}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
    backgroundColor: colors.bg,
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
    marginTop: 2,
  },
  verifiedPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radii.pill,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '700',
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
