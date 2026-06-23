# Money Manager — Frontend (React Native / Expo)

## Tech Stack
- Expo SDK 51 + Expo Router (file-based navigation)
- React Query v5 (server state)
- Zustand (auth + currency store)
- TypeScript
- Expo SecureStore (JWT storage)

## Design System
Dark "obsidian ledger" aesthetic — near-black backgrounds, electric emerald accents, SpaceMono for numbers, DMSans for text.

## Setup

```bash
npm install
cp .env.example .env.local
# Set EXPO_PUBLIC_API_URL to your backend URL
npx expo start
```

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/(auth)/login` | JWT auth |
| Register | `/(auth)/register` | Create account + currency |
| Dashboard | `/(tabs)` | Balance, summary, quick actions |
| Transactions | `/(tabs)/transactions` | Paginated list + search + filter |
| Budgets | `/(tabs)/budgets` | Budget cards with live spend |
| Reports | `/(tabs)/reports` | Charts: summary, category, trend |
| Scan | `/(tabs)/scan` | Receipt OCR → pre-fill transaction |
| New Transaction | `/transactions/new` | Create income/expense |

## Key Files

```
api/
  client.ts      — Axios + JWT interceptor + auto-refresh
  services.ts    — All API calls
  types.ts       — Full TypeScript types
store/
  authStore.ts   — Zustand: user session + token
  currencyStore  — Exchange rate cache + converter
hooks/
  useQueries.ts  — React Query hooks for all entities
components/
  TransactionCard.tsx
  BudgetProgressCard.tsx
  ui/            — Button, Input, Card, Badge, Skeleton, etc.
utils/
  format.ts      — Currency, date, percent formatters
constants/
  theme.ts       — Colors, Typography, Spacing, Radius
```
