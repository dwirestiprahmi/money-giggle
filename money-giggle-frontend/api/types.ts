// api/types.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  defaultCurrency?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  defaultCurrency: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  defaultCurrency?: string;
}

// ---- Transactions ----

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  amountBase: number;
  date: string;
  description?: string;
  receiptUrl?: string;
  category?: CategorySummary;
  createdAt: string;
}

export interface TransactionRequest {
  type: TransactionType;
  amount: number;
  currency: string;
  date: string;
  categoryId?: string;
  description?: string;
  receiptUrl?: string;
}

export interface TransactionFilter {
  type?: TransactionType;
  categoryId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

// ---- Categories ----

export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  type: CategoryType;
}

// ---- Budgets ----

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Budget {
  id: string;
  period: BudgetPeriod;
  limitAmount: number;
  currency: string;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  startDate: string;
  periodStart: string;
  periodEnd: string;
  category?: CategorySummary;
}

export interface BudgetRequest {
  period: BudgetPeriod;
  limitAmount: number;
  currency: string;
  categoryId?: string;
  startDate?: string;
}

// ---- Recurring ----

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringRule {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  frequency: Frequency;
  nextRunAt: string;
  active: boolean;
  category?: CategorySummary;
}

export interface RecurringRuleRequest {
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId?: string;
  description?: string;
  frequency: Frequency;
  startDate: string;
}

// ---- Reports ----

export interface ReportSummary {
  from: string;
  to: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
}

export interface CategoryBreakdown {
  categoryName: string;
  color: string;
  icon: string;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  type: TransactionType;
  total: number;
}

// ---- Receipt ----

export interface ReceiptScanResult {
  amount?: number;
  date?: string;
  merchant?: string;
  currency?: string;
  rawText?: string;
}
