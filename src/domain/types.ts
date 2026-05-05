export type EntryType = 'expense' | 'income' | 'investment';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface AuthSession {
  user: PublicUser;
  token: string;
}

export interface Entry {
  id: string;
  type: EntryType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  account?: string;
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
