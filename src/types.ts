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


