import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ContextCard as ContextCardType } from '../../types';
import { ContextCard } from './ContextCard';
import { colors, typography, spacing } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { Layers, Sparkles } from 'lucide-react-native';

interface Props {
  cards: ContextCardType[];
}

export const ContextCardStack: React.FC<Props> = ({ cards }) => {
  const { language, isLoading } = useCustomerStore();
  const t = getTranslation(language);

  if (isLoading && cards.length === 0) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>{t.common.loading}</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Sparkles size={28} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>All Caught Up!</Text>
        <Text style={styles.emptyDesc}>Your banking priorities are fully organized for today.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Layers size={16} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t.home.attentionStackTitle}</Text>
        </View>
        <Text style={styles.cardCount}>{cards.length} Priority Actions</Text>
      </View>

      <Text style={styles.sectionSubtitle}>{t.home.attentionStackSubtitle}</Text>

      <View style={styles.stackList}>
        {cards.map((card) => (
          <ContextCard key={card.id} card={card} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: 2,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  cardCount: {
    ...typography.tiny,
    color: colors.primary,
    fontWeight: '700',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  stackList: {
    paddingBottom: spacing.sm,
  },
  loadingBox: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyBox: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  emptyDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
