import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useCustomerStore } from '../../state/customerStore';
import { typography, radii, spacing, shadows } from '../../theme';
import {
  MessageSquare,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Clock,
} from 'lucide-react-native';

export const BankingSmsToast: React.FC = () => {
  const { bankingAlerts, dismissBankingSms } = useCustomerStore();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const currentAlert = bankingAlerts[0] || null;

  useEffect(() => {
    if (currentAlert) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 8 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);
    }
  }, [currentAlert?.id]);

  const handleDismiss = () => {
    if (!currentAlert) return;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissBankingSms(currentAlert.id);
    });
  };

  if (!currentAlert) return null;

  const getAlertIcon = () => {
    switch (currentAlert.type) {
      case 'debit':
        return <ArrowUpRight size={14} color="#E11D48" />;
      case 'credit':
        return <ArrowDownLeft size={14} color="#059669" />;
      case 'mandate':
        return <Clock size={14} color="#D97706" />;
      case 'security':
        return <ShieldAlert size={14} color="#7C3AED" />;
      default:
        return <MessageSquare size={14} color="#0284C7" />;
    }
  };

  const getBadgeStyle = () => {
    switch (currentAlert.type) {
      case 'debit':
        return { bg: '#FFE4E6', text: '#E11D48', label: 'DEBIT' };
      case 'credit':
        return { bg: '#D1FAE5', text: '#059669', label: 'CREDIT' };
      case 'mandate':
        return { bg: '#FEF3C7', text: '#D97706', label: 'MANDATE' };
      case 'security':
        return { bg: '#EDE9FE', text: '#7C3AED', label: 'SECURITY' };
      default:
        return { bg: '#E0F2FE', text: '#0284C7', label: 'INFO' };
    }
  };

  const badge = getBadgeStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.smsCard}>
        {/* Top Header: Sender ID & Timestamp */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.typeIconWrap, { backgroundColor: badge.bg }]}>
              {getAlertIcon()}
            </View>
            <Text style={styles.senderText}>{currentAlert.sender}</Text>
            <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.timeText}>Just now</Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
              <X size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SMS Body */}
        <Text style={styles.bodyText} numberOfLines={3}>
          {currentAlert.body}
        </Text>

        {/* Regulatory Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Official RBI Mandated SMS Dispatch • Ref: {currentAlert.referenceId || currentAlert.id}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 12 : 44,
    left: 12,
    right: 12,
    zIndex: 9999,
    alignItems: 'center',
  },
  smsCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0F172A',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#334155',
    padding: spacing.sm + 2,
    ...shadows.lg,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderText: {
    fontSize: 12,
    fontFamily: typography.fontFamilies.bold,
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  badgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: typography.fontFamilies.bold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: typography.fontFamilies.regular,
  },
  closeBtn: {
    padding: 2,
  },
  bodyText: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: '#E2E8F0',
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  footerText: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: typography.fontFamilies.regular,
  },
});
