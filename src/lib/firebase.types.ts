import { Timestamp } from 'firebase/firestore';

// User Profile Interface
export interface UserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  currency: string;
  initialBalance: number;
  hideBalance: boolean;
  createdAt: Timestamp;
}

// Trade Interface
export interface FirebaseTrade {
  id: string;
  userId: string;
  date: string | Timestamp;
  payout: number;
  entry_value: number;
  entryValue?: number; // Compatibility
  result: 'win' | 'loss';
  profitLoss: number;
  tradeType: 'fixed_hand' | 'soros';
  level?: number;
  createdAt: Timestamp;
}

// Deposit Interface
export interface Deposit {
  id: string;
  userId: string;
  date: string;
  amount: number;
  currency: string;
  createdAt: Timestamp;
}

// Daily Note Interface
export interface DailyNote {
  id: string;
  userId: string;
  date: string;
  content: string;
  createdAt: Timestamp;
}

// Balance Transaction Interface (for deposits and withdrawals)
export interface BalanceTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  createdAt: Timestamp;
}

// Collection names
export const COLLECTIONS = {
  PROFILES: 'profiles',
  TRADES: 'trades',
  DEPOSITS: 'deposits',
  DAILY_NOTES: 'dailyNotes',
  BALANCE_TRANSACTIONS: 'balanceTransactions'
} as const;

// Firebase Auth User type
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}