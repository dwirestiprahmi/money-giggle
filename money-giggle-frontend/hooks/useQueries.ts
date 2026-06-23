// hooks/useQueries.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  transactionApi, categoryApi, budgetApi,
  recurringApi, reportApi, receiptApi, userApi,
} from '@/api/services';
import type { TransactionFilter, TransactionRequest, BudgetRequest, RecurringRuleRequest } from '@/api/types';

// ── Keys ──────────────────────────────────────────────
export const QK = {
  transactions: (f?: Partial<TransactionFilter>) => ['transactions', f],
  transaction: (id: string) => ['transaction', id],
  categories: () => ['categories'],
  budgets: () => ['budgets'],
  recurring: () => ['recurring'],
  reportSummary: (from: string, to: string) => ['report-summary', from, to],
  reportByCategory: (type: string, from: string, to: string) => ['report-category', type, from, to],
  reportTrend: (months: number) => ['report-trend', months],
  profile: () => ['profile'],
} as const;

// ── Transactions ──────────────────────────────────────
export function useTransactions(filter: Partial<TransactionFilter> = {}) {
  return useQuery({
    queryKey: QK.transactions(filter),
    queryFn: () => transactionApi.list(filter),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionRequest) => transactionApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useUpdateTransaction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionRequest) => transactionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: QK.transaction(id) });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

// ── Categories ───────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: QK.categories(),
    queryFn: categoryApi.list,
    staleTime: 1000 * 60 * 10, // 10 min — rarely changes
  });
}

// ── Budgets ──────────────────────────────────────────
export function useBudgets() {
  return useQuery({
    queryKey: QK.budgets(),
    queryFn: budgetApi.list,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetRequest) => budgetApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.budgets() }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.budgets() }),
  });
}

// ── Recurring ────────────────────────────────────────
export function useRecurring() {
  return useQuery({
    queryKey: QK.recurring(),
    queryFn: recurringApi.list,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RecurringRuleRequest) => recurringApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurring() }),
  });
}

// ── Reports ──────────────────────────────────────────
export function useReportSummary(from: string, to: string) {
  return useQuery({
    queryKey: QK.reportSummary(from, to),
    queryFn: () => reportApi.getSummary(from, to),
    enabled: !!from && !!to,
  });
}

export function useReportByCategory(type: 'INCOME' | 'EXPENSE', from: string, to: string) {
  return useQuery({
    queryKey: QK.reportByCategory(type, from, to),
    queryFn: () => reportApi.getCategoryBreakdown(type, from, to),
    enabled: !!from && !!to,
  });
}

export function useReportTrend(months = 12) {
  return useQuery({
    queryKey: QK.reportTrend(months),
    queryFn: () => reportApi.getMonthlyTrend(months),
  });
}

// ── Profile ──────────────────────────────────────────
export function useProfile() {
  return useQuery({
    queryKey: QK.profile(),
    queryFn: userApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });
}

// ── Receipt ──────────────────────────────────────────
export function useScanReceipt() {
  return useMutation({
    mutationFn: (uri: string) => receiptApi.scan(uri),
  });
}
