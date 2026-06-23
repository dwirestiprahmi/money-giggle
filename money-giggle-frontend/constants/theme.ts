// constants/theme.ts — Parchment theme

export const Colors = {
  bg: {
    primary: '#FFFDF7',
    secondary: '#FFF8EC',
    tertiary: '#F5EDD8',
    input: '#FFF8EC',
    modal: '#FFFDF7',
  },
  text: {
    primary: '#2C1A06',
    secondary: '#6B5A3E',
    tertiary: '#A0926A',
  },
  border: {
    subtle: '#EDE3CF',
    default: '#E8DCC8',
    strong: '#D4C5A9',
  },
  income: '#1A7A4A',
  incomeDim: '#EAF5EE',
  incomeText: '#1A7A4A',
  expense: '#C0392B',
  expenseDim: '#FDF0EE',
  expenseText: '#C0392B',
  accent: {
    primary: '#2C1A06',
    dim: '#F0E8D8',
  },
  warning: '#A0600A',
  warningDim: '#FFF8E8',
  tabBar: '#F5EDD8',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24,
  xl: 32, '2xl': 40, '3xl': 56,
} as const;

export const Radius = {
  sm: 6, md: 8, lg: 12, xl: 16, full: 9999,
} as const;

export const Font = {
  serif: 'Georgia',
  sans: 'System',
} as const;
