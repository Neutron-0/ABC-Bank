import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { ContextCard as ContextCardType } from '../../types';
import { colors, typography, spacing, radii } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { motion } from '../../motion';
import {
  HelpCircle,
  X,
  ArrowRight,
  ShieldAlert,
  HeartHandshake,
  TrendingUp,
  Train,
  PieChart,
  Calendar,
  Layers,
  LifeBuoy,
  Zap,
  CreditCard,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';

interface Props {
  card: ContextCardType;
}

export const ContextCard: React.FC<Props> = ({ card }) => {
  const {
    dismissCard,
    openJourney,
    setActiveTab,
    performPayment,
    setWhyCard,
    language,
  } = useCustomerStore();
  const t = getTranslation(language);

  // Tactile press scale animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Entrance & Dismiss Motion Values
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(14)).current;
  const cardTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.985,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateX, {
        toValue: 90,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      motion.reorderLayout();
      dismissCard(card.id);
    });
  };

  const cardAnimatedStyle = {
    opacity: cardOpacity,
    transform: [
      { scale: scaleAnim },
      { translateY: cardTranslateY },
      { translateX: cardTranslateX },
    ],
  };

  const handlePrimaryAction = async () => {
    const { actionType, journeyId, targetScreen, payload } = card.primaryAction;

    if (actionType === 'INSTANT_PAY' && payload) {
      await performPayment({
        amount: payload.amount,
        merchant: payload.merchant,
        category: payload.category,
        description: `Instant repeated payment for ${payload.merchant}`,
      });
      return;
    }

    if (actionType === 'OPEN_JOURNEY' && journeyId) {
      openJourney(journeyId, payload);
      return;
    }

    if (actionType === 'OPEN_SCREEN' && targetScreen) {
      if (targetScreen === 'Payments') setActiveTab('payments');
      else if (targetScreen === 'Activity') setActiveTab('activity');
      else if (targetScreen === 'Insights' || targetScreen === 'Money') setActiveTab('insights');
      else if (targetScreen === 'Products') setActiveTab('profile');
      return;
    }

    if (actionType === 'OPEN_ASSISTANT') {
      setActiveTab('assistant');
      return;
    }
  };

  const handleSecondaryAction = () => {
    if (!card.secondaryAction) return;
    const { actionType, journeyId, targetScreen, payload } = card.secondaryAction;

    if (actionType === 'DISMISS_CARD') {
      handleDismiss();
      return;
    }

    if (actionType === 'OPEN_JOURNEY' && journeyId) {
      openJourney(journeyId, payload);
      return;
    }

    if (actionType === 'OPEN_ASSISTANT') {
      setActiveTab('assistant');
      return;
    }

    if (actionType === 'OPEN_SCREEN' && targetScreen) {
      if (targetScreen === 'Payments') setActiveTab('payments');
      else if (targetScreen === 'Activity') setActiveTab('activity');
      else if (targetScreen === 'Insights') setActiveTab('insights');
      return;
    }
  };

  // Icon mapping
  const renderIcon = (color = '#111318', size = 20) => {
    switch (card.iconName) {
      case 'train':
        return <Train size={size} color={color} />;
      case 'shield-alert':
        return <ShieldAlert size={size} color={color} />;
      case 'heart-handshake':
        return <HeartHandshake size={size} color={color} />;
      case 'life-buoy':
        return <LifeBuoy size={size} color={color} />;
      case 'trending-up':
        return <TrendingUp size={size} color={color} />;
      case 'calendar':
        return <Calendar size={size} color={color} />;
      case 'pie-chart':
        return <PieChart size={size} color={color} />;
      case 'credit-card':
        return <CreditCard size={size} color={color} />;
      default:
        return <Sparkles size={size} color={color} />;
    }
  };

  // =========================================================================
  // PATTERN 1: EVENT ROW (Section 22: e.g. "Salary received Yesterday")
  // =========================================================================
  if (card.type === 'event') {
    return (
      <Animated.View style={[styles.eventRowWrap, cardAnimatedStyle]}>
        <View style={styles.eventRow}>
          <TouchableOpacity
            style={styles.eventMainArea}
            onPress={handlePrimaryAction}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            delayPressIn={0}
            activeOpacity={0.7}
          >
            <View style={styles.eventIconCircle}>
              <CheckCircle2 size={16} color="#059669" />
            </View>
            <View style={styles.eventTextWrap}>
              <Text style={styles.eventTitle}>{card.title}</Text>
              <Text style={styles.eventSubtitle}>{card.description}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWhyCard(card)}
            style={styles.whyChip}
            delayPressIn={0}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={styles.whyChipText}>Why?</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // =========================================================================
  // PATTERN 2: INLINE EDITORIAL INSIGHT (Section 21: e.g. "YOUR SAVINGS")
  // =========================================================================
  if (card.type === 'insight') {
    return (
      <Animated.View style={[styles.insightBlockWrap, cardAnimatedStyle]}>
        <View style={styles.insightBlock}>
          <View style={styles.insightHeaderRow}>
            <Text style={styles.insightEyebrow}>FINANCIAL INSIGHT</Text>
            <TouchableOpacity
              onPress={() => setWhyCard(card)}
              style={styles.whyChip}
              delayPressIn={0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Text style={styles.whyChipText}>Why?</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.insightTitle}>{card.title}</Text>
          <Text style={styles.insightDescription}>{card.description}</Text>

          <TouchableOpacity
            style={styles.insightLink}
            onPress={handlePrimaryAction}
            delayPressIn={0}
            activeOpacity={0.7}
          >
            <Text style={styles.insightLinkText}>{card.primaryAction.label}</Text>
            <ArrowRight size={14} color="#111318" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // =========================================================================
  // PATTERN 3: EMPATHETIC ASSISTANCE BANNER (Section 16: e.g. Medical Care)
  // =========================================================================
  if (card.type === 'assistance') {
    return (
      <Animated.View style={[styles.assistanceWrap, cardAnimatedStyle]}>
        <View style={styles.assistanceBanner}>
          <View style={styles.assistanceTopRow}>
            <View style={styles.assistanceIconBox}>
              <HeartHandshake size={18} color="#0D9488" />
            </View>
            <View style={styles.assistanceTextWrap}>
              <Text style={styles.assistanceTag}>ASSISTANCE</Text>
              <Text style={styles.assistanceTitle}>{card.title}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setWhyCard(card)}
              style={styles.whyChip}
              delayPressIn={0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Text style={styles.whyChipText}>Why?</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.assistanceDescription}>{card.description}</Text>

          <View style={styles.assistanceButtonRow}>
            <TouchableOpacity
              style={styles.assistancePrimaryBtn}
              onPress={handlePrimaryAction}
              delayPressIn={0}
              activeOpacity={0.8}
            >
              <Text style={styles.assistancePrimaryBtnText}>{card.primaryAction.label}</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.assistanceSecondaryBtn}
              onPress={() => setActiveTab('assistant')}
              delayPressIn={0}
              activeOpacity={0.8}
            >
              <Text style={styles.assistanceSecondaryBtnText}>Talk to Mitra</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  // =========================================================================
  // PATTERN 4: SECURITY ALERT STRIP (Section 18: e.g. Fraud Warning)
  // =========================================================================
  if (card.type === 'warning') {
    return (
      <Animated.View style={[styles.securityWrap, cardAnimatedStyle]}>
        <View style={styles.securityStrip}>
          <View style={styles.securityTopRow}>
            <View style={styles.securityIconBox}>
              <ShieldAlert size={18} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTag}>SECURITY REVIEW</Text>
              <Text style={styles.securityTitle}>{card.title}</Text>
            </View>
          </View>

          <Text style={styles.securityDescription}>{card.description}</Text>

          <View style={styles.securityActionRow}>
            <TouchableOpacity
              style={styles.securityPrimaryBtn}
              onPress={handlePrimaryAction}
              delayPressIn={0}
              activeOpacity={0.8}
            >
              <Text style={styles.securityPrimaryBtnText}>{card.primaryAction.label}</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setWhyCard(card)}
              style={styles.whyChip}
              delayPressIn={0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Text style={styles.whyChipText}>Why?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  // =========================================================================
  // PATTERN 5: PRIMARY ACTION HERO (Section 20: Large, Minimal, Expressive)
  // =========================================================================
  if (card.type === 'action') {
    return (
      <Animated.View style={[styles.actionSurfaceWrap, cardAnimatedStyle]}>
        <View style={styles.actionSurface}>
          <View style={styles.actionTopRow}>
            <View style={styles.actionIconBox}>
              {renderIcon('#111318', 22)}
            </View>
            <View style={styles.actionHeaderRight}>
              <TouchableOpacity
                onPress={() => setWhyCard(card)}
                style={styles.whyChip}
                delayPressIn={0}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Text style={styles.whyChipText}>Why?</Text>
              </TouchableOpacity>
              {card.dismissible && (
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={styles.dismissCircle}
                  delayPressIn={0}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <X size={14} color="#8C95A6" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handlePrimaryAction}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            delayPressIn={0}
            activeOpacity={0.85}
          >
            <Text style={styles.actionSurfaceTitle}>{card.title}</Text>
            <Text style={styles.actionSurfaceDesc}>{card.description}</Text>
          </TouchableOpacity>

          <View style={styles.actionCtaRow}>
            <TouchableOpacity
              style={styles.actionCtaPill}
              onPress={handlePrimaryAction}
              delayPressIn={0}
              activeOpacity={0.8}
            >
              <Text style={styles.actionCtaPillText}>{card.primaryAction.label}</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  // =========================================================================
  // PATTERN 6: JUSTIFIED PROTECTION / PRODUCT / DEFAULT (Section 24)
  // =========================================================================
  return (
    <Animated.View style={[styles.defaultCardWrap, cardAnimatedStyle]}>
      <View style={styles.defaultCard}>
        <View style={styles.defaultTopRow}>
          <View style={styles.defaultIconBox}>
            {renderIcon('#111318', 18)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.defaultEyebrow}>RECOMMENDED FOR YOUR CONTEXT</Text>
            <Text style={styles.defaultTitle}>{card.title}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setWhyCard(card)}
            style={styles.whyChip}
            delayPressIn={0}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={styles.whyChipText}>Why?</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.defaultDesc}>{card.description}</Text>

        <View style={styles.defaultFooterRow}>
          <TouchableOpacity
            style={styles.defaultActionBtn}
            onPress={handlePrimaryAction}
            delayPressIn={0}
            activeOpacity={0.8}
          >
            <Text style={styles.defaultActionBtnText}>{card.primaryAction.label}</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </TouchableOpacity>

          {card.secondaryAction && (
            <TouchableOpacity
              style={styles.defaultSecondaryBtn}
              onPress={handleSecondaryAction}
              delayPressIn={0}
              activeOpacity={0.8}
            >
              <Text style={styles.defaultSecondaryBtnText}>{card.secondaryAction.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Pattern 1: Event Row
  eventRowWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm + 2,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: 12,
  },
  eventMainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTextWrap: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111318',
    letterSpacing: -0.2,
  },
  eventSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#525866',
    marginTop: 2,
  },

  // Pattern 2: Inline Editorial Insight
  insightBlockWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  insightBlock: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F7F8F9',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  insightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C95A6',
    letterSpacing: 1.0,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#525866',
    lineHeight: 19,
  },
  insightLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  insightLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111318',
  },

  // Pattern 3: Empathetic Assistance Banner
  assistanceWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  assistanceBanner: {
    backgroundColor: '#F0FDFA',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  assistanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  assistanceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistanceTextWrap: {
    flex: 1,
  },
  assistanceTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D9488',
    letterSpacing: 0.8,
  },
  assistanceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#134E4A',
    letterSpacing: -0.3,
  },
  assistanceDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#115E59',
    lineHeight: 18,
    marginBottom: 14,
  },
  assistanceButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  assistancePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 99,
    backgroundColor: '#0D9488',
    gap: 6,
  },
  assistancePrimaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  assistanceSecondaryBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  assistanceSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
  },

  // Pattern 4: Security Alert Strip
  securityWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  securityStrip: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  securityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  securityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.8,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    letterSpacing: -0.3,
  },
  securityDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 14,
  },
  securityActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 99,
    backgroundColor: '#DC2626',
    gap: 6,
  },
  securityPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Pattern 5: Primary Action Hero Surface
  actionSurfaceWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  actionSurface: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#111318',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  actionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionSurfaceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.4,
  },
  actionSurfaceDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: '#525866',
    marginTop: 4,
    lineHeight: 19,
  },
  actionCtaRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionCtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 99,
    backgroundColor: '#111318',
    gap: 6,
  },
  actionCtaPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Pattern 6: Default Card
  defaultCardWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  defaultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  defaultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  defaultIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8C95A6',
    letterSpacing: 0.8,
  },
  defaultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.3,
  },
  defaultDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: '#525866',
    lineHeight: 18,
    marginBottom: 14,
  },
  defaultFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 99,
    backgroundColor: '#111318',
    gap: 6,
  },
  defaultActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  defaultSecondaryBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: '#F4F5F7',
  },
  defaultSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#525866',
  },

  // Shared Micro-Chips
  whyChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  whyChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#525866',
  },
  dismissCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
