export type EntryType = 'expense' | 'income' | 'investment';
export type InvestmentAction = 'deposit' | 'withdrawal';
export type SplitStatus = 'pending' | 'paid';
export type DebtDirection = 'i_owe' | 'owed_to_me';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  approved: boolean;
  role: 'user' | 'admin';
  createdAt: number;
}

export interface AuthSession {
  user: PublicUser;
  token: string;
}

export interface Entry {
  id: string;
  type: EntryType;
  investmentAction?: InvestmentAction;
  amount: number;
  category: string;
  description?: string;
  date: string;
  account?: string;
  splitWith?: string;
  splitAmount?: number;
  splitStatus?: SplitStatus;
  createdAt: number;
}

export interface Debt {
  id: string;
  direction: DebtDirection;
  person: string;
  amount: number;
  paidAmount: number;
  description?: string;
  dueDate?: string;
  createdAt: number;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDay: number;
  account?: string;
  notes?: string;
  active: boolean;
  splitWith?: string;
  splitAmount?: number;
  paidMonths: string[];
  createdAt: number;
}

export type CategoriesByType = Record<EntryType, string[]>;

export type SubscriptionStatus = 'none' | 'pending' | 'active';

export interface Subscription {
  userId: string;
  status: SubscriptionStatus;
  amount: number;
  pixKey: string;
  declaredPaidAt?: number;
  activatedAt?: number;
  nextBillingAt?: number;
}

export interface AuthenticatedRequest {
  user: PublicUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
}
