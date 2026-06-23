import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Colors, Font, Radius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useTransactions, useReportSummary, useBudgets } from '@/hooks/useQueries';
import TransactionCard from '@/components/TransactionCard';
import BudgetProgressCard from '@/components/BudgetProgressCard';
import { Skeleton, EmptyState } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import { useQueryClient } from '@tanstack/react-query';

export default function DashboardScreen() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const now = new Date();
  const from = format(startOfMonth(now), 'yyyy-MM-dd');
  const to = format(endOfMonth(now), 'yyyy-MM-dd');
  const { data: summary, isLoading: loadingSum } = useReportSummary(from, to);
  const { data: txPage, isLoading: loadingTx } = useTransactions({ size: 5 });
  const { data: budgets } = useBudgets();
  const recentTx = txPage?.content ?? [];
  const topBudgets = (budgets ?? []).slice(0, 2);
  const onRefresh = async () => { setRefreshing(true); await qc.invalidateQueries(); setRefreshing(false); };
  const net = summary?.netBalance ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.text.tertiary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{format(now, 'EEEE, MMMM d')}</Text>
            <Text style={styles.name}>Hello, {user?.name?.split(' ')[0] ?? 'there'}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <Text style={styles.profileInitial}>{(user?.name ?? 'U')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{format(now, 'MMMM yyyy')} · net balance</Text>
          {loadingSum
            ? <Skeleton height={44} width={200} style={{ marginVertical: 8 }} />
            : <Text style={[styles.balanceAmount, { color: net >= 0 ? Colors.income : Colors.expense }]}>
                {net >= 0 ? '+' : '−'}{formatCurrency(Math.abs(net), user?.defaultCurrency ?? 'USD')}
              </Text>
          }
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLbl}>Income</Text>
              {loadingSum ? <Skeleton height={16} width={70} /> : <Text style={[styles.summaryVal, { color: Colors.income }]}>{formatCurrency(summary?.totalIncome ?? 0, user?.defaultCurrency ?? 'USD', true)}</Text>}
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLbl}>Expenses</Text>
              {loadingSum ? <Skeleton height={16} width={70} /> : <Text style={[styles.summaryVal, { color: Colors.expense }]}>{formatCurrency(summary?.totalExpense ?? 0, user?.defaultCurrency ?? 'USD', true)}</Text>}
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLbl}>Savings rate</Text>
              {loadingSum ? <Skeleton height={16} width={40} /> : <Text style={styles.summaryVal}>{(summary?.savingsRate ?? 0).toFixed(1)}%</Text>}
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          {[
            { label: 'Add', icon: 'add-circle-outline', onPress: () => router.push('/transactions/new') },
            { label: 'Scan', icon: 'scan-outline', onPress: () => router.push('/(tabs)/scan') },
            { label: 'Budgets', icon: 'wallet-outline', onPress: () => router.push('/(tabs)/budgets') },
            { label: 'Reports', icon: 'bar-chart-outline', onPress: () => router.push('/(tabs)/reports') },
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={a.onPress}>
              <View style={styles.actionIcon}>
                <Ionicons name={a.icon as React.ComponentProps<typeof Ionicons>['name']} size={20} color={Colors.text.secondary} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Budgets */}
        {topBudgets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budgets</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/budgets')}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
            </View>
            <View style={{ gap: 10 }}>{topBudgets.map(b => <BudgetProgressCard key={b.id} budget={b} />)}</View>
          </View>
        )}

        {/* Recent */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
          </View>
          {loadingTx
            ? [1,2,3].map(i => <Skeleton key={i} height={66} radius={8} style={{ marginBottom: 8 }} />)
            : recentTx.length === 0
              ? <EmptyState icon="receipt-outline" title="No transactions yet" subtitle="Tap + to add your first one" />
              : <View style={{ gap: 8 }}>{recentTx.map(tx => <TransactionCard key={tx.id} transaction={tx} onPress={() => router.push(`/transactions/${tx.id}`)} />)}</View>
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  container: { paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  greeting: { fontFamily: Font.serif, fontSize: 12, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  name: { fontFamily: Font.serif, fontSize: 26, color: Colors.text.primary, marginTop: 2 },
  profileBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.bg.tertiary, borderWidth: 1, borderColor: Colors.border.default, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontFamily: Font.serif, fontSize: 15, color: Colors.text.secondary },
  balanceCard: { marginHorizontal: 20, marginBottom: 20, backgroundColor: Colors.bg.secondary, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border.default, padding: 20 },
  balanceLabel: { fontFamily: Font.serif, fontSize: 11, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  balanceAmount: { fontFamily: Font.serif, fontSize: 38, marginVertical: 6 },
  divider: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { gap: 3 },
  summaryLbl: { fontFamily: Font.serif, fontSize: 11, color: Colors.text.tertiary },
  summaryVal: { fontFamily: 'monospace', fontSize: 14, color: Colors.text.primary },
  actions: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 28 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: { width: 50, height: 50, borderRadius: Radius.md, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.default, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: Font.serif, fontSize: 11, color: Colors.text.tertiary },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: Font.serif, fontSize: 17, color: Colors.text.primary },
  seeAll: { fontFamily: Font.serif, fontSize: 12, color: Colors.text.tertiary, textDecorationLine: 'underline' },
});
