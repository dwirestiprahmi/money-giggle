// utils/format.ts
import { format, parseISO, isToday, isYesterday } from 'date-fns';

export function formatCurrency(
  amount: number,
  currency = 'USD',
  compact = false
): string {
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  if (compact && Math.abs(amount) >= 1000) {
    opts.notation = 'compact';
    opts.maximumFractionDigits = 1;
  }
  try {
    return new Intl.NumberFormat('en-US', opts).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}

export function formatMonth(monthStr: string): string {
  try {
    return format(parseISO(`${monthStr}-01`), 'MMM yy');
  } catch {
    return monthStr;
  }
}

export function formatPercent(value: number): string {
  return `${Math.min(value, 999).toFixed(0)}%`;
}
