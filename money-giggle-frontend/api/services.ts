// api/services.ts
import client from './client';
import type {
  LoginRequest, RegisterRequest, TokenResponse,
  Transaction, TransactionRequest, TransactionFilter, PageResponse,
  Category, CategoryRequest,
  Budget, BudgetRequest,
  RecurringRule, RecurringRuleRequest,
  ReportSummary, CategoryBreakdown, MonthlyTrend,
  UserProfile, UpdateProfileRequest,
  ReceiptScanResult,
} from './types';

// ---- Auth ----
export const authApi = {
  register: (data: RegisterRequest) =>
    client.post<{ data: TokenResponse }>('/auth/register', data).then(r => r.data.data),

  login: (data: LoginRequest) =>
    client.post<{ data: TokenResponse }>('/auth/login', data).then(r => r.data.data),

  refresh: (refreshToken: string) =>
    client.post<{ data: TokenResponse }>('/auth/refresh', { refreshToken }).then(r => r.data.data),
};

// ---- User ----
export const userApi = {
  getProfile: () =>
    client.get<{ data: UserProfile }>('/users/me').then(r => r.data.data),

  updateProfile: (data: UpdateProfileRequest) =>
    client.put<{ data: UserProfile }>('/users/me', data).then(r => r.data.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    client.put('/users/me/password', { currentPassword, newPassword }),
};

// ---- Transactions ----
export const transactionApi = {
  list: (filter: Partial<TransactionFilter> = {}) =>
    client.get<{ data: PageResponse<Transaction> }>('/transactions', { params: filter })
      .then(r => r.data.data),

  getById: (id: string) =>
    client.get<{ data: Transaction }>(`/transactions/${id}`).then(r => r.data.data),

  create: (data: TransactionRequest) =>
    client.post<{ data: Transaction }>('/transactions', data).then(r => r.data.data),

  update: (id: string, data: TransactionRequest) =>
    client.put<{ data: Transaction }>(`/transactions/${id}`, data).then(r => r.data.data),

  delete: (id: string) =>
    client.delete(`/transactions/${id}`),
};

// ---- Categories ----
export const categoryApi = {
  list: () =>
    client.get<{ data: Category[] }>('/categories').then(r => r.data.data),

  create: (data: CategoryRequest) =>
    client.post<{ data: Category }>('/categories', data).then(r => r.data.data),

  update: (id: string, data: CategoryRequest) =>
    client.put<{ data: Category }>(`/categories/${id}`, data).then(r => r.data.data),

  delete: (id: string) =>
    client.delete(`/categories/${id}`),
};

// ---- Budgets ----
export const budgetApi = {
  list: () =>
    client.get<{ data: Budget[] }>('/budgets').then(r => r.data.data),

  create: (data: BudgetRequest) =>
    client.post<{ data: Budget }>('/budgets', data).then(r => r.data.data),

  delete: (id: string) =>
    client.delete(`/budgets/${id}`),
};

// ---- Recurring ----
// export const recurringApi = {
//   list: () =>
//     client.get<{ data: RecurringRule[] }>('/recurring').then(r => r.data.data),

//   create: (data: RecurringRuleRequest) =>
//     client.post<{ data: RecurringRule }>('/recurring', data).then(r => r.data.data),

//   delete: (id: string) =>
//     client.delete(`/recurring/${id}`),
// };

// // ---- Reports ----
// export const reportApi = {
//   summary: (from?: string, to?: string) =>
//     client.get<{ data: ReportSummary }>('/reports/summary', { params: { from, to } })
//       .then(r => r.data.data),

//   byCategory: (type: 'INCOME' | 'EXPENSE' = 'EXPENSE', from?: string, to?: string) =>
//     client.get<{ data: CategoryBreakdown[] }>('/reports/by-category', { params: { type, from, to } })
//       .then(r => r.data.data),

//   trend: (months = 12) =>
//     client.get<{ data: MonthlyTrend[] }>('/reports/trend', { params: { months } })
//       .then(r => r.data.data),
// };

// ---- Currency ----
export const currencyApi = {
  getRates: (base = 'USD') =>
    client.get<{ data: Record<string, number> }>('/currencies/rates', { params: { base } })
      .then(r => r.data.data),
};

// ---- Receipt ----
export const receiptApi = {
  scan: async (imageUri: string): Promise<ReceiptScanResult> => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    } as unknown as Blob);

    const response = await client.post<{ data: ReceiptScanResult }>(
      '/receipts/scan',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },
};

// ---- Recurring (full) ----
export const recurringApi = {
  list: () =>
    client.get<{ data: RecurringRule[] }>('/recurring').then(r => r.data.data),
  create: (data: RecurringRuleRequest) =>
    client.post<{ data: RecurringRule }>('/recurring', data).then(r => r.data.data),
  deactivate: (id: string) =>
    client.delete(`/recurring/${id}`),
};

// ---- Reports (full) ----
export const reportApi = {
  getSummary: (from?: string, to?: string) =>
    client.get<{ data: ReportSummary }>('/reports/summary', { params: { from, to } }).then(r => r.data.data),
  getCategoryBreakdown: (type: 'INCOME' | 'EXPENSE', from?: string, to?: string) =>
    client.get<{ data: CategoryBreakdown[] }>('/reports/by-category', { params: { type, from, to } }).then(r => r.data.data),
  getMonthlyTrend: (months = 12) =>
    client.get<{ data: MonthlyTrend[] }>('/reports/trend', { params: { months } }).then(r => r.data.data),
};

// ---- Receipt ----
// export const receiptApi = {
//   scan: async (imageUri: string): Promise<ReceiptScanResult> => {
//     const formData = new FormData();
//     formData.append('file', { uri: imageUri, type: 'image/jpeg', name: 'receipt.jpg' } as unknown as Blob);
//     const res = await client.post<{ data: ReceiptScanResult }>('/receipts/scan', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return res.data.data;
//   },
// };
