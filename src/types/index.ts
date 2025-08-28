export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  currency: 'BRL' | 'USD' | 'EUR';
  initialBalance: number;
  hideBalance: boolean;
  createdAt: string;
}

export interface Trade {
  id: string;
  userId: string;
  date: string;
  payout: number;
  entry_value: number;
  result: 'win' | 'loss';
  profitLoss: number;
  tradeType: 'fixed_hand' | 'soros';
  level?: number; // Para estratégia Soros (nível da operação)
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  date: string;
  amount: number;
  currency: 'BRL' | 'USD' | 'EUR';
  createdAt: string;
}

export interface DailyNote {
  id: string;
  userId: string;
  date: string;
  content: string;
  createdAt: string;
}

export interface DayStats {
  date: string;
  trades: Trade[];
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netResult: number;
  note?: string;
}

export interface PeriodStats {
  startDate: string;
  endDate: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netResult: number;
  averageRisk: number;
  bestDay: DayStats | null;
  worstDay: DayStats | null;
}

export type PeriodFilter = 'weekly' | 'biweekly' | 'monthly';

export type TradeType = 'fixed_hand' | 'soros';

export interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export interface TradeState {
  trades: Trade[];
  loading: boolean;
  addTrade: (trade: Omit<Trade, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  getTradesByDate: (date: string) => Trade[];
  getTradesByPeriod: (startDate: string, endDate: string) => Trade[];
}

export interface DepositState {
  deposits: Deposit[];
  loading: boolean;
  addDeposit: (deposit: Omit<Deposit, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateDeposit: (id: string, updates: Partial<Deposit>) => Promise<void>;
  deleteDeposit: (id: string) => Promise<void>;
  getTotalDeposits: () => number;
}

export interface NoteState {
  notes: DailyNote[];
  loading: boolean;
  addNote: (note: Omit<DailyNote, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateNote: (date: string, content: string) => Promise<void>;
  deleteNote: (date: string) => Promise<void>;
  getNoteByDate: (date: string) => DailyNote | null;
}

export interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  stats: DayStats | null;
  hasNote: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TooltipData {
  date: string;
  stats: DayStats;
  position: { x: number; y: number };
}