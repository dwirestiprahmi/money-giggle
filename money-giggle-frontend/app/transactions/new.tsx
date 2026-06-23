import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors, Radius, Font } from '@/constants/theme';
import { useCreateTransaction, useCategories } from '@/hooks/useQueries';
import { TransactionType } from '@/api/types';
import { Button, Input } from '@/components/ui';

export default function NewTransactionScreen() {
  const params = useLocalSearchParams<{ amount?:string; currency?:string; date?:string; description?:string; }>();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState(params.amount ?? '');
  const [currency, setCurrency] = useState(params.currency ?? 'USD');
  const [date, setDate] = useState(params.date ?? format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState(params.description ?? '');
  const [categoryId, setCategoryId] = useState<string|undefined>();
  const [errors, setErrors] = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount';
    if (!date) e.date = 'Date is required';
    if (!currency || currency.length !== 3) e.currency = '3-letter code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await createMutation.mutateAsync({ type, amount: parseFloat(amount), currency: currency.toUpperCase(), date, description: description.trim()||undefined, categoryId });
      router.back();
    } catch { setErrors({ submit: 'Failed to save transaction' }); }
  };

  const filteredCats = categories?.filter(c => c.type === type || c.type === 'BOTH') ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New transaction</Text>
          <View style={{ width:32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <View style={styles.typeToggle}>
            {(['EXPENSE','INCOME'] as TransactionType[]).map(t => (
              <TouchableOpacity key={t} style={[styles.typeBtn, type === t && (t==='EXPENSE' ? styles.expenseActive : styles.incomeActive)]} onPress={() => setType(t)}>
                <Ionicons name={t==='EXPENSE' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'} size={15} color={type===t ? (t==='EXPENSE' ? Colors.expense : Colors.income) : Colors.text.tertiary} />
                <Text style={[styles.typeTxt, type===t && { color: t==='EXPENSE' ? Colors.expense : Colors.income }]}>
                  {t === 'EXPENSE' ? 'Expense' : 'Income'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.amountRow}>
            <View style={{ flex:1 }}><Input label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" error={errors.amount} /></View>
            <View style={{ width:88 }}><Input label="Currency" value={currency} onChangeText={v => setCurrency(v.toUpperCase())} placeholder="USD" autoCapitalize="characters" maxLength={3} error={errors.currency} /></View>
          </View>

          <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" error={errors.date} />
          <Input label="Description (optional)" value={description} onChangeText={setDescription} placeholder="What was this for?" />

          <Text style={styles.catLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={[styles.catChip, !categoryId && styles.catChipActive]} onPress={() => setCategoryId(undefined)}>
              <Text style={[styles.catTxt, !categoryId && styles.catTxtActive]}>None</Text>
            </TouchableOpacity>
            {filteredCats.map(c => (
              <TouchableOpacity key={c.id} style={[styles.catChip, categoryId===c.id && styles.catChipActive]} onPress={() => setCategoryId(c.id)}>
                <Text style={[styles.catTxt, categoryId===c.id && styles.catTxtActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {errors.submit ? <Text style={styles.submitError}>{errors.submit}</Text> : null}
          <Button title="Save transaction" onPress={handleSave} loading={createMutation.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg.primary },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderBottomColor:Colors.border.subtle },
  backBtn: { padding:4 },
  headerTitle: { fontFamily:Font.serif, fontSize:17, color:Colors.text.primary },
  form: { padding:20, gap:16, paddingBottom:40 },
  typeToggle: { flexDirection:'row', gap:8, backgroundColor:Colors.bg.secondary, borderRadius:Radius.md, padding:4, borderWidth:1, borderColor:Colors.border.default },
  typeBtn: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, paddingVertical:10, borderRadius:Radius.sm },
  expenseActive: { backgroundColor:Colors.expenseDim },
  incomeActive: { backgroundColor:Colors.incomeDim },
  typeTxt: { fontFamily:Font.serif, fontSize:14, color:Colors.text.tertiary },
  amountRow: { flexDirection:'row', gap:12 },
  catLabel: { fontFamily:Font.serif, fontSize:12, color:Colors.text.tertiary, textTransform:'uppercase', letterSpacing:0.8 },
  catChip: { paddingHorizontal:14, paddingVertical:8, borderRadius:Radius.full, backgroundColor:Colors.bg.secondary, borderWidth:1, borderColor:Colors.border.default, marginRight:8 },
  catChipActive: { backgroundColor:Colors.text.primary, borderColor:Colors.text.primary },
  catTxt: { fontFamily:Font.serif, fontSize:13, color:Colors.text.secondary },
  catTxtActive: { color:Colors.bg.primary },
  submitError: { fontFamily:Font.serif, fontSize:13, color:Colors.expense, textAlign:'center' },
});
