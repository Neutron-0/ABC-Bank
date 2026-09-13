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
  ShieldCheck,
  Clock,
} from 'lucide-react-native';

export const BankingSmsToast: React.FC = () => {
  const { bankingAlerts, dismissBankingSms, isAuthenticated } = useCustomerStore();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const currentAlert = bankingAlerts[0] || null;

  // Prevent any pre-login notifications except requested OTP security tokens
  const shouldShow = currentAlert && (isAuthenticated || currentAlert.type === 'security');

  useEffect(() => {
    if (shouldShow && currentAlert) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 90,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 7 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 7000);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);
    }
  }, [currentAlert?.id, shouldShow]);

  const handleDismiss = () => {
    if (!currentAlert) return;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissBankingSms(currentAlert.id);
    });
  };

  if (!shouldShow || !currentAlert) return null;

  const getAlertIcon = () => {
    switch (currentAlert.type) {
      case 'debit':
        return <ArrowUpRight size={13} color="#C92A2A" strokeWidth={2.4} />;
      case 'credit':
        return <ArrowDownLeft size={13} color="#1B7A43" strokeWidth={2.4} />;
      case 'mandate':
        return <Clock size={13} color="#B45309" strokeWidth={2.4} />;
      case 'security':
        return <ShieldCheck size={13} color="#141414" strokeWidth={2.4} />;
      default:
        return <MessageSquare size={13} color="#141414" strokeWidth={2.4} />;
    }
  };

  const getBadgeStyle = () => {
    switch (currentAlert.type) {
      case 'debit':
        return { bg: '#FDF2F2', text: '#C92A2A', label: 'DEBIT' };
      case 'credit':
        return { bg: '#EDF7F1', text: '#1B7A43', label: 'CREDIT' };
      case 'mandate':
        return { bg: '#FDF6ED', text: '#B45309', label: 'MANDATE' };
      case 'security':
        return { bg: '#F3EFEA', text: '#141414', label: 'SECURITY' };
      default:
        return { bg: '#F3EFEA', text: '#141414', label: 'NOTICE' };
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
            <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={14} color="#68645E" />
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
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    padding: spacing.sm + 4,
    ...shadows.sm,
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
    fontWeight: '800',
    color: '#141414',
    letterSpacing: 0.5,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 10,
    color: '#9C968E',
  },
  closeBtn: {
    padding: 3,
  },
  bodyText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#141414',
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: '#F3EFEA',
  },
  footerText: {
    fontSize: 9,
    color: '#9C968E',
  },
});
