export type Page = 'inicio' | 'suenos' | 'protegido' | 'aprende' | 'familia' | 'perfil';
export type Art = 'tablet' | 'bike' | 'headphones' | 'trip' | 'star';
export interface Goal {
  id: number;
  name: string;
  target: number;
  saved: number;
  weeks: number;
  protected: boolean;
  art: Art;
  emoji?: string;
  completedAt?: string;
}
export interface Activity {
  id: number;
  text: string;
  amount: number;
  kind: 'deposit' | 'withdraw' | 'family' | 'achievement';
  date: string;
}
export interface Withdrawal {
  id: number;
  goalId: number;
  goalName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}
export interface DemoState {
  profile: { name: string; age: number; avatar: string; notifications: boolean; interest: string };
  balance: number;
  goals: Goal[];
  history: Activity[];
  requests: Withdrawal[];
  lessons: string[];
  reward: number;
  praise: string;
  earnedBadges: string[];
}
export const STORAGE_KEY = 'primer-sueno-angular-v5';
export const roundMoney = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const money = (n: number) =>
  'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const isGoalCompleted = (g: Goal) => !!g.completedAt || g.saved >= g.target;
export const progress = (g: Goal) =>
  isGoalCompleted(g) ? 100 : Math.min(100, Math.round((g.saved / g.target) * 100));
