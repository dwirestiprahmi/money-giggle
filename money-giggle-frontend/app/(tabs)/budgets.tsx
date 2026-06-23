import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Font } from '@/constants/theme';
import { useBudgets, useCreateBudget, useDeleteBudget, useCategories } from '@/hooks/useQueries';
import { BudgetPeriod, BudgetRequest } from '@/api/types';
import BudgetProgressCard from '@/components/BudgetProgressCard';
import { EmptyState, Skeleton, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const PERIODS: BudgetPeriod[] = ['WEEKLY', 'MONTHLY', 'YEARLY'];

export default function BudgetsScreen() {
  const user = useAuthStore(s => s.user);
  const { data: budgets, isLoading } = useBudgets();
  const { data: categories } = useCategories();
  const createMutation = useCreateBudget();
  const deleteMutation = useDeleteBudget();
  const [showModal, setShowModal] = useState(false);
  const [period, setPeriod] = useState<BudgetPeriod>('MONTHLY');
  const [limitAmount, setLimitAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [formError, setFormError] = useState('');

  const handleCreate = async () => {
    const amount = parseFloat(limitAmount);
    if (!limitAmount || isNaN(amount) || amount <= 0) { setFormError('Enter a valid limit amount'); return; }
    setFormError('');
    try {
      await createMutation.mutateAsync({ period, limitAmount: amount, currency: user?.defaultCurrency ?? 'USD', categoryId: selectedCategoryId });
      setShowModal(false); setLimitAmount(''); setSelectedCategoryId(undefined); setPeriod('MONTHLY');
    } catch { setFormError('Failed to create budget'); }
  };

  const handleDelete = (id: string) => Alert.alert('Delete budget?', 'This budget will be deactivated.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
  ]);

  const expenseCats = categories?.filter(c => c.type === 'EXPENSE' || c.type === 'BOTH') ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color={Colors.bg.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isLoading
          ? [1,2,3].map(i => <Skeleton key={i} height={120} radius={12} style={{ marginBottom: 12 }} />)
          : budgets?.length === 0
            ? <EmptyState icon="wallet-outline" title="No budgets yet" subtitle="Set spending limits to stay on track" action={<Button title="Create budget" onPress={() => setShowModal(true)} size="sm" />} />
            : budgets?.map(b => <BudgetProgressCard key={b.id} budget={b} onDelete={() => handleDelete(b.id)} />)
        }
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New budget</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.fieldLabel}>Period</Text>
            <View style={styles.pillRow}>
              {PERIODS.map(p => (
                <TouchableOpacity key={p} style={[styles.pill, period === p && styles.pillActive]} onPress={() => setPeriod(p)}>
                  <Text style={[styles.pillTxt, period === p && styles.pillTxtActive]}>{p.charAt(0) + p.slice(1).toLowerCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Spending limit" value={limitAmount} onChangeText={setLimitAmount} placeholder="0.00" keyboardType="decimal-pad" error={formError} />
            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Category (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={[styles.catChip, !selectedCategoryId && styles.catChipActive]} onPress={() => setSelectedCategoryId(undefined)}>
                <Text style={[styles.catTxt, !selectedCategoryId && styles.catTxtActive]}>Overall</Text>
              </TouchableOpacity>
              {expenseCats.map(c => (
                <TouchableOpacity key={c.id} style={[styles.catChip, selectedCategoryId === c.id && styles.catChipActive]} onPress={() => setSelectedCategoryId(c.id)}>
                  <Text style={[styles.catTxt, selectedCategoryId === c.id && styles.catTxtActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Create budget" onPress={handleCreate} loading={createMutation.isPending} style={{ marginTop: 20 }} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontFamily: Font.serif, fontSize: 28, color: Colors.text.primary },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.text.primary, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  modal: { flex: 1, backgroundColor: Colors.bg.primary },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border.strong, alignSelf: 'center', marginTop: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  modalTitle: { fontFamily: Font.serif, fontSize: 20, color: Colors.text.primary },
  modalBody: { padding: 20, gap: 12 },
  fieldLabel: { fontFamily: Font.serif, fontSize: 12, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.default, alignItems: 'center' },
  pillActive: { backgroundColor: Colors.text.primary, borderColor: Colors.text.primary },
  pillTxt: { fontFamily: Font.serif, fontSize: 13, color: Colors.text.secondary },
  pillTxtActive: { color: Colors.bg.primary },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.default, marginRight: 8 },
  catChipActive: { backgroundColor: Colors.text.primary, borderColor: Colors.text.primary },
  catTxt: { fontFamily: Font.serif, fontSize: 13, color: Colors.text.secondary },
  catTxtActive: { color: Colors.bg.primary },
});
