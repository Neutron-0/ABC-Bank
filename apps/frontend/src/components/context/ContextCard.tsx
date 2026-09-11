import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ContextCard as ContextCardType } from '../../types';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
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
    showToast,
  } = useCustomerStore();
  const t = getTranslation(language);

  const renderIcon = () => {
    const iconColor = card.accentColor || colors.primary;
    const size = 20;

    switch (card.iconName) {
      case 'shield-alert':
        return <ShieldAlert size={size} color={iconColor} />;
      case 'heart-handshake':
        return <HeartHandshake size={size} color={iconColor} />;
      case 'life-buoy':
        return <LifeBuoy size={size} color={iconColor} />;
      case 'trending-up':
        return <TrendingUp size={size} color={iconColor} />;
      case 'train':
        return <Train size={size} color={iconColor} />;
      case 'pie-chart':
        return <PieChart size={size} color={iconColor} />;
      case 'calendar':
        return <Calendar size={size} color={iconColor} />;
      case 'layers':
        return <Layers size={size} color={iconColor} />;
      case 'zap':
        return <Zap size={size} color={iconColor} />;
      case 'credit-card':
        return <CreditCard size={size} color={iconColor} />;
      case 'award':
        return <Award size={size} color={iconColor} />;
      default:
        return <Sparkles size={size} color={iconColor} />;
    }
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
      else if (targetScreen === 'Insights') setActiveTab('insights');
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
      dismissCard(card.id);
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

  const getLayerBadgeStyle = () => {
    switch (card.layer) {
      case 'DO':
        return { bg: '#DBEAFE', text: '#1D4ED8', label: 'DO' };
      case 'KNOW':
        return { bg: '#DCFCE7', text: '#15803D', label: 'KNOW' };
      case 'PLAN':
        return { bg: '#F3E8FF', text: '#7E22CE', label: 'PLAN' };
      case 'CONSIDER':
        return { bg: '#FFEDD5', text: '#C2410C', label: 'CONSIDER' };
    }
  };

  const layerBadge = getLayerBadgeStyle();
  const isAlert = card.type === 'warning';

  return (
    <View style={[styles.card, isAlert && styles.alertCard]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.layerPill, { backgroundColor: layerBadge.bg }]}>
            <Text style={[styles.layerPillText, { color: layerBadge.text }]}>{layerBadge.label}</Text>
          </View>
          {card.badgeText && (
            <View style={[styles.customBadge, { backgroundColor: card.accentColor ? `${card.accentColor}18` : '#F1F5F9' }]}>
              <Text style={[styles.customBadgeText, { color: card.accentColor || colors.textPrimary }]}>
                {card.badgeText}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionIcons}>
          {/* Explainability Button */}
          <TouchableOpacity
            onPress={() => setWhyCard(card)}
            style={styles.whyBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <HelpCircle size={15} color={colors.textSecondary} />
            <Text style={styles.whyText}>Why?</Text>
          </TouchableOpacity>

          {/* Dismiss button if enabled */}
          {card.dismissible && (
            <TouchableOpacity
              onPress={() => dismissCard(card.id)}
              style={styles.dismissBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${card.accentColor || colors.primary}14` }]}>
          {renderIcon()}
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.description}>{card.description}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: card.accentColor || colors.primary }]}
          onPress={handlePrimaryAction}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>{card.primaryAction.label}</Text>
          <ArrowRight size={15} color={colors.textWhite} />
        </TouchableOpacity>

        {card.secondaryAction && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleSecondaryAction}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>{card.secondaryAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  alertCard: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  layerPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  layerPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  customBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  customBadgeText: {
    ...typography.tiny,
    fontWeight: '700',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  whyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: colors.cardBgSecondary,
  },
  whyText: {
    ...typography.tiny,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dismissBtn: {
    padding: 2,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: 6,
  },
  primaryBtnText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
  secondaryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.cardBgSecondary,
  },
  secondaryBtnText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
});
