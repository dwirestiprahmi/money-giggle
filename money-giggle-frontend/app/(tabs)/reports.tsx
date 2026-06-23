import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Colors, Radius, Font } from '@/constants/theme';
import { useReportSummary, useReportByCategory, useReportTrend } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui';
import { formatCurrency, formatMonth } from '@/utils/format';

const { width: W } = Dimensions.get('window');
type PeriodKey = '1M'|'3M'|'6M'|'12M';
type TxType = 'EXPENSE'|'INCOME';
const PERIODS = [{ key:'1M' as PeriodKey, months:1 },{ key:'3M' as PeriodKey, months:3 },{ key:'6M' as PeriodKey, months:6 },{ key:'12M' as PeriodKey, months:12 }];

export default function ReportsScreen() {
  const user = useAuthStore(s => s.user);
  const [period, setPeriod] = useState<PeriodKey>('1M');
  const [catType, setCatType] = useState<TxType>('EXPENSE');
  const months = PERIODS.find(p => p.key === period)!.months;
  const to = format(endOfMonth(new Date()), 'yyyy-MM-dd');
  const from = format(startOfMonth(subMonths(new Date(), months - 1)), 'yyyy-MM-dd');
  const { data: summary, isLoading: loadingSum } = useReportSummary(from, to);
  const { data: breakdown, isLoading: loadingCat } = useReportByCategory(catType, from, to);
  const { data: trend, isLoading: loadingTrend } = useReportTrend(12);
  const currency = user?.defaultCurrency ?? 'USD';

  const trendMonths: string[] = [];
  const trendIncome: Record<string,number> = {};
  const trendExpense: Record<string,number> = {};
  (trend ?? []).forEach(t => {
    if (!trendMonths.includes(t.month)) trendMonths.push(t.month);
    if (t.type === 'INCOME') trendIncome[t.month] = t.total;
    else trendExpense[t.month] = t.total;
  });
  const last6 = trendMonths.slice(-6);
  const maxTrend = Math.max(...last6.map(m => Math.max(trendIncome[m]??0, trendExpense[m]??0)), 1);
  const maxBreakdown = breakdown?.length ? Math.max(...breakdown.map(b => b.total)) : 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
        </View>

        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity key={p.key} style={[styles.periodBtn, period === p.key && styles.periodBtnActive]} onPress={() => setPeriod(p.key)}>
              <Text style={[styles.periodTxt, period === p.key && styles.periodTxtActive]}>{p.key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryRow}>
          {loadingSum ? (
            <><Skeleton height={80} style={{ flex:1 }} radius={10} /><Skeleton height={80} style={{ flex:1 }} radius={10} /></>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLbl}>Income</Text>
                <Text style={[styles.summaryAmt, { color: Colors.income }]}>{formatCurrency(summary?.totalIncome??0, currency, true)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLbl}>Expenses</Text>
                <Text style={[styles.summaryAmt, { color: Colors.expense }]}>{formatCurrency(summary?.totalExpense??0, currency, true)}</Text>
              </View>
            </>
          )}
        </View>

        {!loadingSum && summary && (
          <View style={styles.netCard}>
            <Text style={styles.summaryLbl}>Net balance</Text>
            <Text style={[styles.netAmount, { color: (summary.netBalance??0) >= 0 ? Colors.income : Colors.expense }]}>
              {(summary.netBalance??0) >= 0 ? '+' : '−'}{formatCurrency(Math.abs(summary.netBalance??0), currency)}
            </Text>
            <Text style={styles.savingsRate}>Savings rate: {(summary.savingsRate??0).toFixed(1)}%</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6-month trend</Text>
          {loadingTrend ? <Skeleton height={110} radius={8} /> : (
            <>
              <View style={styles.barChart}>
                {last6.map(month => {
                  const inc = trendIncome[month]??0;
                  const exp = trendExpense[month]??0;
                  return (
                    <View key={month} style={styles.barGroup}>
                      <View style={styles.bars}>
                        <View style={[styles.bar, { height: Math.max((inc/maxTrend)*90,2), backgroundColor: Colors.incomeDim, borderWidth:1, borderColor: Colors.income }]} />
                        <View style={[styles.bar, { height: Math.max((exp/maxTrend)*90,2), backgroundColor: Colors.expenseDim, borderWidth:1, borderColor: Colors.expense }]} />
                      </View>
                      <Text style={styles.barLabel}>{formatMonth(month)}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.income }]} /><Text style={styles.legendTxt}>Income</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.expense }]} /><Text style={styles.legendTxt}>Expenses</Text></View>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.catHeader}>
            <Text style={styles.sectionTitle}>By category</Text>
            <View style={styles.typeToggle}>
              {(['EXPENSE','INCOME'] as TxType[]).map(t => (
                <TouchableOpacity key={t} style={[styles.typeBtn, catType === t && styles.typeBtnActive]} onPress={() => setCatType(t)}>
                  <Text style={[styles.typeTxt, catType === t && styles.typeTxtActive]}>{t === 'EXPENSE' ? 'Spent' : 'Earned'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {loadingCat ? <View style={{gap:10}}>{[1,2,3].map(i=><Skeleton key={i} height={40} radius={8}/>)}</View>
            : breakdown?.length === 0 ? <Text style={styles.noData}>No data for this period</Text>
            : <View style={styles.catList}>
                {(breakdown??[]).slice(0,8).map((item,i) => {
                  const barW = (item.total/maxBreakdown)*(W-80);
                  return (
                    <View key={i} style={styles.catRow}>
                      <View style={styles.catInfo}>
                        <View style={[styles.catDot, { backgroundColor: item.color??Colors.text.tertiary }]} />
                        <Text style={styles.catName} numberOfLines={1}>{item.categoryName??'Uncategorized'}</Text>
                        <Text style={styles.catAmt}>{formatCurrency(item.total, currency, true)}</Text>
                      </View>
                      <View style={styles.catTrack}>
                        <View style={[styles.catBar, { width: barW, backgroundColor: item.color??Colors.text.tertiary, opacity:0.5 }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: Colors.bg.primary },
  container: { paddingBottom:32 },
  header: { paddingHorizontal:20, paddingTop:16, paddingBottom:8 },
  title: { fontFamily: Font.serif, fontSize:28, color: Colors.text.primary },
  periodRow: { flexDirection:'row', paddingHorizontal:20, gap:8, marginBottom:16 },
  periodBtn: { flex:1, paddingVertical:8, borderRadius:Radius.full, backgroundColor:Colors.bg.secondary, borderWidth:1, borderColor:Colors.border.default, alignItems:'center' },
  periodBtnActive: { backgroundColor:Colors.text.primary, borderColor:Colors.text.primary },
  periodTxt: { fontFamily:Font.serif, fontSize:13, color:Colors.text.secondary },
  periodTxtActive: { color:Colors.bg.primary },
  summaryRow: { flexDirection:'row', paddingHorizontal:20, gap:12, marginBottom:10 },
  summaryCard: { flex:1, backgroundColor:Colors.bg.secondary, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border.default, padding:14, gap:4 },
  summaryLbl: { fontFamily:Font.serif, fontSize:11, color:Colors.text.tertiary, textTransform:'uppercase', letterSpacing:0.8 },
  summaryAmt: { fontFamily:'monospace', fontSize:20 },
  netCard: { marginHorizontal:20, marginBottom:20, backgroundColor:Colors.bg.secondary, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border.default, padding:16 },
  netAmount: { fontFamily:Font.serif, fontSize:28, marginVertical:4 },
  savingsRate: { fontFamily:Font.serif, fontSize:12, color:Colors.text.tertiary },
  section: { paddingHorizontal:20, marginBottom:24 },
  sectionTitle: { fontFamily:Font.serif, fontSize:17, color:Colors.text.primary, marginBottom:12 },
  barChart: { flexDirection:'row', alignItems:'flex-end', height:110, gap:6, marginBottom:8 },
  barGroup: { flex:1, alignItems:'center', gap:4 },
  bars: { flexDirection:'row', alignItems:'flex-end', gap:2 },
  bar: { width:10, borderRadius:2, minHeight:2 },
  barLabel: { fontFamily:Font.serif, fontSize:10, color:Colors.text.tertiary },
  legend: { flexDirection:'row', gap:16 },
  legendItem: { flexDirection:'row', alignItems:'center', gap:5 },
  legendDot: { width:8, height:8, borderRadius:4 },
  legendTxt: { fontFamily:Font.serif, fontSize:12, color:Colors.text.secondary },
  catHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  typeToggle: { flexDirection:'row', backgroundColor:Colors.bg.secondary, borderRadius:Radius.full, borderWidth:1, borderColor:Colors.border.default, overflow:'hidden' },
  typeBtn: { paddingHorizontal:12, paddingVertical:5 },
  typeBtnActive: { backgroundColor:Colors.text.primary },
  typeTxt: { fontFamily:Font.serif, fontSize:12, color:Colors.text.secondary },
  typeTxtActive: { color:Colors.bg.primary },
  noData: { fontFamily:Font.serif, fontSize:14, color:Colors.text.tertiary, textAlign:'center', paddingVertical:24 },
  catList: { gap:10 },
  catRow: { gap:5 },
  catInfo: { flexDirection:'row', alignItems:'center', gap:8 },
  catDot: { width:8, height:8, borderRadius:4, flexShrink:0 },
  catName: { flex:1, fontFamily:Font.serif, fontSize:13, color:Colors.text.primary },
  catAmt: { fontFamily:'monospace', fontSize:13, color:Colors.text.secondary },
  catTrack: { height:4, backgroundColor:Colors.bg.tertiary, borderRadius:2, overflow:'hidden' },
  catBar: { height:'100%', borderRadius:2 },
});
