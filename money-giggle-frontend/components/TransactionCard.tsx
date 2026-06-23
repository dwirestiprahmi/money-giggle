import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Font } from '@/constants/theme';
import { Transaction } from '@/api/types';
import { formatDate, formatCurrency } from '@/utils/format';

interface Props { transaction: Transaction; onPress?: () => void; onDelete?: () => void; }

export default function TransactionCard({ transaction: tx, onPress, onDelete }: Props) {
  const isIncome = tx.type === 'INCOME';
  const amountColor = isIncome ? Colors.income : Colors.expense;
  const sign = isIncome ? '+' : '−';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconWrap, { backgroundColor: tx.category?.color ? `${tx.category.color}22` : Colors.bg.tertiary }]}>
        <Ionicons
          name={(tx.category?.icon as React.ComponentProps<typeof Ionicons>['name']) ?? 'ellipse-outline'}
          size={16}
          color={tx.category?.color ?? Colors.text.tertiary}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={1}>
          {tx.description ?? tx.category?.name ?? 'Transaction'}
        </Text>
        <Text style={styles.date}>{formatDate(tx.date)}</Text>
      </View>
      <View style={styles.amountCol}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {sign}{formatCurrency(tx.amount, tx.currency)}
        </Text>
        {tx.category ? <Text style={styles.catName}>{tx.category.name}</Text> : null}
      </View>
      {onDelete ? (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={14} color={Colors.text.tertiary} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.secondary, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border.subtle, padding: 12, gap: 10,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  content: { flex: 1, gap: 2 },
  description: { fontFamily: Font.serif, fontSize: 14, color: Colors.text.primary },
  date: { fontFamily: Font.serif, fontSize: 11, color: Colors.text.tertiary },
  amountCol: { alignItems: 'flex-end', gap: 2 },
  amount: { fontFamily: 'monospace', fontSize: 14 },
  catName: { fontFamily: Font.serif, fontSize: 10, color: Colors.text.tertiary },
  deleteBtn: { padding: 4 },
});
