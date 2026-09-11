import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  QrCode,
  Send,
  Train,
  LifeBuoy,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react-native';

export const BalanceHeader: React.FC = () => {
  const {
    balance,
    isBalanceHidden,
    toggleBalanceHide,
    language,
    financialHealth,
    currentState,
    setActiveTab,
    openJourney,
    performPayment,
  } = useCustomerStore();
  const t = getTranslation(language);

  const getStatusBadge = () => {
    if (currentState === 'fraud_alert') {
      return {
        text: 'Dispute Lock Active',
        color: '#F87171',
        bg: 'rgba(239, 68, 68, 0.16)',
        dotColor: '#EF4444',
      };
    }
    if (financialHealth.status === 'stress') {
      return {
        text: 'Buffer Optimization Active',
        color: '#FBBF24',
        bg: 'rgba(245, 158, 11, 0.16)',
        dotColor: '#F59E0B',
      };
    }
    if (financialHealth.status === 'thriving') {
      return {
        text: 'Surplus Cashflow',
        color: '#34D399',
        bg: 'rgba(16, 185, 129, 0.16)',
        dotColor: '#10B981',
      };
    }
    return {
      text: 'Cashflow Resilient',
      color: '#60A5FA',
      bg: 'rgba(37, 99, 235, 0.16)',
      dotColor: '#3B82F6',
    };
  };

  const badge = getStatusBadge();

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {/* Ambient Top Subtle Flare */}
        <View style={styles.cardGlowOverlay} />

        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t.home.availableBalance}</Text>
            <TouchableOpacity onPress={toggleBalanceHide} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {isBalanceHidden ? (
                <EyeOff size={15} color="rgba(255, 255, 255, 0.55)" />
              ) : (
                <Eye size={15} color="rgba(255, 255, 255, 0.55)" />
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: badge.dotColor }]} />
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>

        {/* Large Sleek Balance Readout */}
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Text style={styles.amountText}>
            {isBalanceHidden ? '••••••' : balance.available.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.fractionText}>{isBalanceHidden ? '' : '.00'}</Text>

          {!isBalanceHidden && (
            <View style={styles.trendBadge}>
              <TrendingUp size={11} color="#34D399" />
              <Text style={styles.trendBadgeText}>+₹14.2k</Text>
            </View>
          )}
        </View>

        {/* Sleek Integrated Quick Action Strip */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setActiveTab('payments')}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <QrCode size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.actionBtnLabel}>Scan UPI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setActiveTab('payments')}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <Send size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.actionBtnLabel}>Pay Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              performPayment({
                amount: 40,
                merchant: 'Delhi Metro Smart Card',
                category: 'transport',
                description: 'Routine morning commute recharge',
              })
            }
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#1D4ED8' }]}>
              <Train size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.actionBtnLabel}>Metro ₹40</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => openJourney('medical_assistance')}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <LifeBuoy size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.actionBtnLabel}>Assistance</Text>
          </TouchableOpacity>
        </View>

        {/* Hairline Divider */}
        <View style={styles.divider} />

        {/* Sub-Metrics Footer */}
        <View style={styles.bottomRow}>
          <View style={styles.subMetric}>
            <Text style={styles.subMetricLabel}>{t.home.savingsBalance}</Text>
            <Text style={styles.subMetricValue}>
              {isBalanceHidden ? '••••••' : `₹${balance.savings.toLocaleString('en-IN')}`}
            </Text>
          </View>

          <View style={styles.metricSeparator} />

          <View style={styles.subMetric}>
            <Text style={styles.subMetricLabel}>Emergency Buffer</Text>
            <Text style={styles.subMetricValue}>
              {financialHealth.emergencyFundMonths} Months Runway
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: '#0B0F19',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  cardGlowOverlay: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.55)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  eyeBtn: {
    padding: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: '#93C5FD',
    marginRight: 4,
  },
  amountText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  fractionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
    marginLeft: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    marginLeft: 10,
  },
  trendBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: spacing.md,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 5,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subMetric: {
    flex: 1,
  },
  subMetricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  subMetricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  metricSeparator: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: spacing.md,
  },
});
