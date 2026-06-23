import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { formatCurrency } from '@/utils/format';

interface Props { amount: number; currency?: string; type?: 'INCOME' | 'EXPENSE' | 'neutral'; size?: 'sm' | 'md' | 'lg' | 'xl'; showSign?: boolean; }

export default function AmountDisplay({ amount, currency = 'USD', type = 'neutral', size = 'md', showSign }: Props) {
  const color = type === 'INCOME' ? Colors.income : type === 'EXPENSE' ? Colors.expense : Colors.text.primary;
  const sign = showSign ? (type === 'INCOME' ? '+' : type === 'EXPENSE' ? '−' : '') : '';
  return <Text style={[styles.base, styles[size], { color }]}>{sign}{formatCurrency(Math.abs(amount), currency)}</Text>;
}

const styles = StyleSheet.create({
  base: { fontFamily: 'monospace' },
  sm: { fontSize: 13 }, md: { fontSize: 16 }, lg: { fontSize: 22 }, xl: { fontSize: 32 },
});
