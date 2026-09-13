import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useCustomerStore } from '../../state/customerStore';
import { colors, typography, spacing, radii, shadows, useAppTheme } from '../../theme';
import {
  AlertTriangle,
  Clock,
  Split,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';

export const EarlyEmiShortfallBanner: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const {
    getUpcomingEmiDeficit,
    requestEmiGrace,
    splitEmi,
    sweepDeficitForEmi,
    balance,
    language,
    showToast,
  } = useCustomerStore();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [resolvedMessage, setResolvedMessage] = useState<string | null>(null);

  const shortfall = getUpcomingEmiDeficit();

  // If there is no deficit or balance comfortably covers EMI, don't show or show positive status
  if (!shortfall.hasDeficit && !resolvedMessage) {
    return null;
  }

  const handleGrace = async () => {
    setLoadingAction('grace');
    const res = await requestEmiGrace('loan_home_01', 10);
    setLoadingAction(null);
    if (res.success) {
      setResolvedMessage(`10-Day Grace Activated! Due date postponed to ${res.newDueDate || '26-Sep'}. Zero bounce fee.`);
    }
  };

  const handleSplit = async () => {
    setLoadingAction('split');
    const res = await splitEmi('loan_home_01');
    setLoadingAction(null);
    if (res.success) {
      setResolvedMessage(`EMI Split Confirmed: 50% due on ${shortfall.dueDate} and 50% on 01-Oct post-salary.`);
    }
  };

  const handleSweep = async () => {
    setLoadingAction('sweep');
    const res = await sweepDeficitForEmi('loan_home_01', shortfall.deficit);
    setLoadingAction(null);
    if (res.success) {
      setResolvedMessage(`Deficit of ₹${shortfall.deficit.toLocaleString('en-IN')} swept from Emergency Buffer. EMI covered!`);
    }
  };

  if (resolvedMessage) {
    return (
      <View style={styles.resolvedContainer}>
        <View style={styles.resolvedHeader}>
          <CheckCircle2 size={18} color="#059669" />
          <Text style={styles.resolvedTitle}>Resolution Active (RBI Fair Lending)</Text>
        </View>
        <Text style={styles.resolvedText}>{resolvedMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Warning */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <AlertTriangle size={18} color="#D97706" />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Upcoming EMI Deficit Detected</Text>
          <Text style={styles.subtitle}>
            ₹{shortfall.upcomingEmi.toLocaleString('en-IN')} due on {shortfall.dueDate} • Shortfall: ₹{shortfall.deficit.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <Text style={styles.bodyText}>
        Your liquid balance (₹{shortfall.availableBalance.toLocaleString('en-IN')}) is below the upcoming EMI. To protect your CIBIL score from bounce penalties, select an empathetic resolution:
      </Text>

      {/* 3 Empathetic Action Rails */}
      <View style={styles.actionsList}>
        {/* Action 1: 10-Day Grace Buffer */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleGrace}
          disabled={!!loadingAction}
          activeOpacity={0.8}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.actionIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <Clock size={16} color="#B45309" />
            </View>
            <View>
              <Text style={styles.actionTitle}>10-Day Grace Buffer</Text>
              <Text style={styles.actionDesc}>Postpone payment with zero bounce fee under RBI guidelines</Text>
            </View>
          </View>
          {loadingAction === 'grace' ? (
            <ActivityIndicator size="small" color="#B45309" />
          ) : (
            <ChevronRight size={16} color="#94A3B8" />
          )}
        </TouchableOpacity>

        {/* Action 2: 50/50 Split EMI */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleSplit}
          disabled={!!loadingAction}
          activeOpacity={0.8}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.actionIconBadge, { backgroundColor: '#EDE9FE' }]}>
              <Split size={16} color="#6D28D9" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Split into 2 Payments</Text>
              <Text style={styles.actionDesc}>Pay ₹8,250 now and ₹8,250 after salary credit</Text>
            </View>
          </View>
          {loadingAction === 'split' ? (
            <ActivityIndicator size="small" color="#6D28D9" />
          ) : (
            <ChevronRight size={16} color="#94A3B8" />
          )}
        </TouchableOpacity>

        {/* Action 3: Partial Deficit Auto-Sweep */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleSweep}
          disabled={!!loadingAction}
          activeOpacity={0.8}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.actionIconBadge, { backgroundColor: '#ECFDF5' }]}>
              <ShieldCheck size={16} color="#059669" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Emergency Auto-Sweep</Text>
              <Text style={styles.actionDesc}>
                Sweep only ₹{shortfall.deficit.toLocaleString('en-IN')} from FD without full liquidation
              </Text>
            </View>
          </View>
          {loadingAction === 'sweep' ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <ChevronRight size={16} color="#94A3B8" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...Platform.select({
      ios: { shadowColor: '#D97706', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
  },
  subtitle: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
    fontWeight: '500',
  },
  bodyText: {
    fontSize: 12.5,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 12,
  },
  actionsList: {
    gap: 8,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  actionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    maxWidth: 240,
  },
  resolvedContainer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  resolvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  resolvedTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#065F46',
  },
  resolvedText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
  },
});
