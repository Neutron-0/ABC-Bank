import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ContextCard as ContextCardType } from '../../types';
import { ContextCard } from './ContextCard';
import { colors, typography, spacing } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { motion } from '../../motion';
import { Check } from 'lucide-react-native';

interface Props {
  cards: ContextCardType[];
}

export const ContextCardStack: React.FC<Props> = ({ cards }) => {
  const { language, isLoading, currentState } = useCustomerStore();
  const t = getTranslation(language);

  // Trigger smooth layout reordering animation when cards array or persona changes
  useEffect(() => {
    motion.reorderLayout();
  }, [cards.length, currentState]);

  if (isLoading && cards.length === 0) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color="#111318" />
        <Text style={styles.loadingText}>{t.common.loading}</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.eyebrow}>ORGANIZED FOR TODAY</Text>
      </View>

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
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm + 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '600',
    color: '#737373',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  stackList: {
    paddingBottom: spacing.sm,
  },
  loadingBox: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: '#8C95A6',
  },
  emptyBox: {
    paddingVertical: 36,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  emptyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.2,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#525866',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
