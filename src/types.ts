export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  /** ISO 8601 si l’e-mail est confirmé (colonne user_profiles.email_confirmed_at) */
  emailConfirmedAt: string | null;
  phone: string;
  address: string;
  birthDate: string;
  occupation: string;
  monthlyIncome: string;
  memberSince: string;
  /** Data URL (base64) ou chaîne vide */
  avatarUrl: string;
}

export type UserProfileRegistrationFields = Pick<UserProfileData, 'firstName' | 'lastName'>;

export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'completed' | 'pending';

export interface Transaction {
  id: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  amount: number;
  status: TransactionStatus;
  receiptUrl?: string | null;
}

export interface CategoryBudget {
  id: number;
  category: string;
  amount: number;
  month: number;
  year: number;
}

export interface SavingsGoal {
  id: number;
  name: string;
  type: string;
  current: number;
  target: number;
  deadline: string;
  percentage: number;
  color: string;
  description?: string;
}

export interface MemberPayment {
  date: string; // ex: '2024-05'
  paid: boolean;
}

export interface TontineMember {
  id: string;
  name: string;
  amount: number;
  payments: MemberPayment[];
  createdAt: string;
}

export interface TontineTour {
  member: string;
  date: Date;
}

export type TontineStatus = 'active' | 'completed' | 'pending';

export interface TontineGroup {
  id: string;
  name: string;
  description: string;
  members: TontineMember[];
  cycle: number;
  tours: TontineTour[];
  montantCotisation: number;
  currentMonth: string; // ex: '2024-05'
  status: TontineStatus;
  startDate: string;
  totalRounds: number;
}

/** Défi (aligné sur la table `challenges`) */
export interface AppChallenge {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: string;
  deadline: string;
  type: 'savings' | 'budget' | 'transactions' | 'custom';
  status: 'active' | 'completed' | 'failed';
  target?: number;
  current?: number;
}

/** Badge (aligné sur la table `badges`) */
export interface AppBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: string;
}
