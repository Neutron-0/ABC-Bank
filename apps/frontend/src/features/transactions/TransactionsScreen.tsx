import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { motion } from '../../motion';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { TransactionDetailModal } from './TransactionDetailModal';
import { Search, Filter, Sparkles } from 'lucide-react-native';
import { TransactionCategory } from '../../types';

export const TransactionsScreen: React.FC = () => {
  const { transactions, language } = useCustomerStore();
  const t = getTranslation(language);

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (id: string) => {
    motion.reorderLayout();
    setSelectedFilter(id);
  };

  const filterCategories: { id: string; label: string }[] = [
    { id: 'all', label: t.activity.filterAll },
    { id: 'transport', label: t.activity.filterTransport },
    { id: 'food', label: t.activity.filterFood },
    { id: 'bills', label: t.activity.filterBills },
    { id: 'healthcare', label: t.activity.filterHealth },
    { id: 'salary', label: t.activity.filterSalary },
    { id: 'emi', label: t.activity.filterEmi },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = selectedFilter === 'all' || tx.category === selectedFilter;
    const matchesSearch =
      tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.activity.title}</Text>
        <Text style={styles.subtitle}>{t.activity.subtitle}</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search merchant, category, bills..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPills}
        >
          {filterCategories.map((cat) => {
            const active = selectedFilter === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.pill, active && styles.activePill]}
                onPress={() => handleFilterChange(cat.id)}
                delayPressIn={0}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, active && styles.activePillText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Transaction Timeline */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Transaction Feed ({filteredTransactions.length})</Text>
        </View>

        {filteredTransactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No matching transactions found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Transaction Detail Modal with AI Understanding */}
      <TransactionDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 6,
  },
  filterPills: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.cardBgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activePill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  activePillText: {
    color: colors.textWhite,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  timelineHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
  },
  timelineTitle: {
    ...typography.captionMedium,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  emptyWrap: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
