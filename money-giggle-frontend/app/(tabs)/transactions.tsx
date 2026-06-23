import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Font } from '@/constants/theme';
import { useTransactions, useDeleteTransaction } from '@/hooks/useQueries';
import { TransactionType } from '@/api/types';
import TransactionCard from '@/components/TransactionCard';
import { EmptyState, Skeleton } from '@/components/ui';

type FilterType = 'ALL' | TransactionType;
const FILTERS: { key: FilterType; label: string }[] = [{ key: 'ALL', label: 'All' }, { key: 'EXPENSE', label: 'Expenses' }, { key: 'INCOME', label: 'Income' }];

export default function TransactionsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, refetch } = useTransactions({ type: filter === 'ALL' ? undefined : filter, size: 50 });
  const deleteMutation = useDeleteTransaction();
  const transactions = (data?.content ?? []).filter(tx => {
    if (!search) return true;
    const q = search.toLowerCase();
    return tx.description?.toLowerCase().includes(q) || tx.category?.name.toLowerCase().includes(q);
  });
  const onRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/transactions/new')}>
          <Ionicons name="add" size={22} color={Colors.bg.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={15} color={Colors.text.tertiary} style={{ marginRight: 8 }} />
        <TextInput style={styles.searchInput} placeholder="Search transactions…" placeholderTextColor={Colors.text.tertiary} value={search} onChangeText={setSearch} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={15} color={Colors.text.tertiary} /></TouchableOpacity> : null}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[styles.chip, filter === f.key && styles.chipActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.chipTxt, filter === f.key && styles.chipTxtActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading
        ? <View style={{ paddingHorizontal: 20 }}>{[1,2,3,4].map(i => <Skeleton key={i} height={66} radius={8} style={{ marginBottom: 8 }} />)}</View>
        : <FlatList
            data={transactions}
            keyExtractor={t => t.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.text.tertiary} />}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListEmptyComponent={<EmptyState icon="receipt-outline" title={search ? 'No matching transactions' : 'No transactions yet'} subtitle={search ? 'Try a different search' : 'Tap + to add your first transaction'} />}
            renderItem={({ item }) => <TransactionCard transaction={item} onPress={() => router.push(`/transactions/${item.id}`)} onDelete={() => deleteMutation.mutate(item.id)} />}
          />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontFamily: Font.serif, fontSize: 28, color: Colors.text.primary },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.text.primary, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontFamily: Font.serif, fontSize: 14, color: Colors.text.primary },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.default },
  chipActive: { backgroundColor: Colors.text.primary, borderColor: Colors.text.primary },
  chipTxt: { fontFamily: Font.serif, fontSize: 13, color: Colors.text.secondary },
  chipTxtActive: { color: Colors.bg.primary },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
});
