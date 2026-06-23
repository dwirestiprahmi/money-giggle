import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Font } from '@/constants/theme';
import { Budget } from '@/api/types';
import { formatCurrency, formatPercent } from '@/utils/format';

interface Props { budget: Budget; onDelete?: () => void; }

export default function BudgetProgressCard({ budget, onDelete }: Props) {
  const pct = Math.min(budget.percentageUsed, 100);
  const isOver = pct >= 100;
  const isWarning = pct >= 80 && !isOver;
  const barColor = isOver ? Colors.expense : isWarning ? Colors.warning : Colors.income;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: budget.category?.color ? `${budget.category.color}22` : Colors.bg.tertiary }]}>
          <Ionicons
            name={(budget.category?.icon as React.ComponentProps<typeof Ionicons>['name']) ?? 'wallet-outline'}
            size={15}
            color={budget.category?.color ?? Colors.text.tertiary}
          />
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.title}>{budget.category?.name ?? 'Overall budget'}</Text>
          <Text style={styles.period}>{budget.period.charAt(0) + budget.period.slice(1).toLowerCase()}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.pct, { color: barColor }]}>{formatPercent(budget.percentageUsed)}</Text>
          {onDelete ? (
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle-outline" size={16} color={Colors.text.tertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.bar, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>

      <View style={styles.amounts}>
        <Text style={styles.spent}>
          <Text style={{ color: barColor }}>{formatCurrency(budget.spentAmount, budget.currency)}</Text>
          {' '}spent
        </Text>
        <Text style={styles.limit}>of {formatCurrency(budget.limitAmount, budget.currency)}</Text>
      </View>

      {isOver && (
        <View style={styles.overBanner}>
          <Ionicons name="warning-outline" size={12} color={Colors.expense} />
          <Text style={styles.overText}>
            Over by {formatCurrency(budget.spentAmount - budget.limitAmount, budget.currency)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.bg.secondary, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border.default, padding: 14, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  titleCol: { flex: 1 },
  title: { fontFamily: Font.serif, fontSize: 14, color: Colors.text.primary },
  period: { fontFamily: Font.serif, fontSize: 11, color: Colors.text.tertiary, marginTop: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pct: { fontFamily: 'monospace', fontSize: 13 },
  track: { height: 5, backgroundColor: Colors.bg.tertiary, borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 3 },
  amounts: { flexDirection: 'row', justifyContent: 'space-between' },
  spent: { fontFamily: Font.serif, fontSize: 12, color: Colors.text.secondary },
  limit: { fontFamily: Font.serif, fontSize: 12, color: Colors.text.tertiary },
  overBanner: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.expenseDim, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  overText: { fontFamily: Font.serif, fontSize: 11, color: Colors.expense },
});
