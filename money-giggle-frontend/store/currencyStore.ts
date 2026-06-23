// store/currencyStore.ts
import { create } from 'zustand';
import client from '@/api/client';

interface CurrencyState {
  rates: Record<string, number>;
  baseCurrency: string;
  lastFetched: number | null;
  fetchRates: (base?: string) => Promise<void>;
  convert: (amount: number, from: string, to: string) => number;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  rates: {},
  baseCurrency: 'USD',
  lastFetched: null,

  fetchRates: async (base = 'USD') => {
    const now = Date.now();
    const { lastFetched, baseCurrency } = get();
    // Skip if same base and fetched < 1 hour ago
    if (baseCurrency === base && lastFetched && now - lastFetched < 3600_000) return;
    try {
      const { data } = await client.get<{ data: Record<string, number> }>(`/currencies/rates`, {
        params: { base },
      });
      set({ rates: data.data, baseCurrency: base, lastFetched: now });
    } catch {
      // silently fail; use existing rates
    }
  },

  convert: (amount, from, to) => {
    const { rates, baseCurrency } = get();
    if (from === to) return amount;
    if (from === baseCurrency) return amount * (rates[to] ?? 1);
    if (to === baseCurrency) return amount / (rates[from] ?? 1);
    const inBase = amount / (rates[from] ?? 1);
    return inBase * (rates[to] ?? 1);
  },
}));
