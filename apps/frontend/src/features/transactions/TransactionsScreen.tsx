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
import { serifFont } from '../../theme/typography';
import { useAppTheme } from '../../theme/ThemeContext';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { motion } from '../../motion';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { TransactionDetailModal } from './TransactionDetailModal';
import { Search, Filter } from 'lucide-react-native';
import { TransactionCategory } from '../../types';

export const TransactionsScreen: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
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

  const groupTransactionsByDate = (list: typeof transactions) => {
    const groups: { title: string; items: typeof transactions }[] = [];
    const map: Record<string, typeof transactions> = {};

    list.forEach((tx) => {
      const txDate = new Date(tx.timestamp);
      const today = new Date();
      const isToday = txDate.toDateString() === today.toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = txDate.toDateString() === yesterday.toDateString();

      let key = '';
      if (isToday) key = language === 'hi' ? 'आज' : language === 'gu' ? 'આજે' : 'Today';
      else if (isYesterday) key = language === 'hi' ? 'कल' : language === 'gu' ? 'ગઈકાલે' : 'Yesterday';
      else {
        key = txDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }

      if (!map[key]) {
        map[key] = [];
        groups.push({ title: key, items: map[key] });
      }
      map[key].push(tx);
    });

    return groups;
  };

  const grouped = groupTransactionsByDate(filteredTransactions);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Editorial Header */}
      <View style={[styles.header, { backgroundColor: themeColors.bg }]}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t.activity.title}</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{t.activity.subtitle}</Text>

        {/* Minimal Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight }]}>
          <Search size={16} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder="Search merchant, category, bills..."
            placeholderTextColor={themeColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Editorial Filter Chips */}
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
                style={[
                  styles.pill,
                  { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.borderLight },
                  active && [styles.activePill, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]
                ]}
                onPress={() => handleFilterChange(cat.id)}
                delayPressIn={0}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, { color: themeColors.textSecondary }, active && [styles.activePillText, { color: '#FFFFFF' }]]}>
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
        <View style={[styles.timelineHeader, { backgroundColor: themeColors.bg, borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.timelineTitle, { color: themeColors.textMuted }]}>
            PASSBOOK LEDGER · {filteredTransactions.length} ENTRIES
          </Text>
        </View>

        {grouped.map((grp) => (
          <View key={grp.title} style={styles.dateGroup}>
            <View style={[styles.dateGroupHeader, { borderBottomColor: themeColors.borderLight }]}>
              <Text style={[styles.dateGroupTitle, { color: themeColors.textPrimary }]}>{grp.title.toUpperCase()}</Text>
              <Text style={[styles.dateGroupCount, { color: themeColors.textMuted }]}>{grp.items.length} {grp.items.length === 1 ? 'entry' : 'entries'}</Text>
            </View>
            {grp.items.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </View>
        ))}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>No transactions found</Text>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No transactions match "{searchQuery || selectedFilter}".
            </Text>
            <TouchableOpacity
              style={[styles.clearBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.clearBtnText}>Show All Entries</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Transaction Detail Modal */}
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
    fontFamily: serifFont,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
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
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  activePill: {},
  pillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activePillText: {
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  timelineHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  timelineTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptyWrap: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  clearBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
  },
  clearBtnText: {
    ...typography.captionMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dateGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: spacing.md,
    marginVertical: 6,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dateGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E6',
  },
  dateGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: -0.1,
  },
  dateGroupCount: {
    fontSize: 11,
    fontWeight: '500',
    color: '#737373',
  },
});

