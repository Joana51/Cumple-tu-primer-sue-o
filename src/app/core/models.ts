export type Page =
  'inicio' | 'suenos' | 'protegido' | 'aprende' | 'familia' | 'perfil' | 'acuerdos';
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
export const FAMILY_STORAGE_KEY = 'primer-sueno-familia-v6';
export type Role = 'child' | 'parent';
export type ParentPage = 'home' | 'children' | 'detail' | 'agreements' | 'activity';
export interface ChildAccount extends DemoState {
  id: string;
  weeklySavingsBudget: number;
}
export type AgreementStatus =
  'requested' | 'offered' | 'active' | 'completed' | 'declined' | 'cancelled';
export interface AgreementTask {
  id: string;
  title: string;
  status: 'pending' | 'submitted' | 'validated';
  submittedAt?: string;
  validatedAt?: string;
  feedback?: string;
  units?: number;
  dueDate?: string;
  reports?: UnitReport[];
  originalDueDate?: string;
}
export interface UnitReport {
  id: string;
  units: number;
  submittedAt: string;
  status: 'submitted' | 'validated' | 'rejected';
  validatedAt?: string;
  feedback?: string;
  performedAt?: string;
  note?: string;
  reviews?: { at: string; accepted: boolean; feedback: string }[];
  dispute?: {
    reason: string;
    openedAt: string;
    status: 'open' | 'resolved';
    resolution?: 'confirmed' | 'unverifiable';
    resolvedAt?: string;
    response?: string;
  };
}
export interface LatePolicy {
  enabled: boolean;
  unitsPerDay: number;
  capUnits: number;
  graceDays: number;
  paymentWindowDays: number;
  effectiveFrom?: string;
  carryUnits?: number;
}
export interface LoanTerms {
  amount: number;
  unitLabel: string;
  totalUnits: number;
  unitsPerInstallment: number;
  intervalDays: number;
  firstDueDays: number;
  terms: string;
  latePolicy: LatePolicy;
}
export interface AgreementEvent {
  id: string;
  at: string;
  actor: Role | 'system';
  text: string;
}
export interface Agreement {
  id: string;
  childId: string;
  parentId: string;
  goalId?: number;
  title: string;
  amount: number;
  reason: string;
  terms: string;
  status: AgreementStatus;
  days: number;
  tasks: AgreementTask[];
  createdAt: string;
  acceptedAt?: string;
  dueDate?: string;
  originalDueDate?: string;
  completedAt?: string;
  validatedAt?: string;
  proposedDueDate?: string;
  renegotiations: number;
  events: AgreementEvent[];
  unitLabel?: string;
  totalUnits?: number;
  unitsPerInstallment?: number;
  intervalDays?: number;
  firstDueDays?: number;
  latePolicy?: LatePolicy;
  proposedLatePolicy?: LatePolicy;
  penaltyReports?: UnitReport[];
  baseCompletedAt?: string;
  hadOverdue?: boolean;
  maxOverdueDays?: number;
}
export interface FamilyState {
  version: 6;
  parent: { id: string; name: string; balance: number };
  children: ChildAccount[];
  agreements: Agreement[];
  today: string;
}
export interface AgreementMetrics {
  completed: number;
  onTime: number;
  late: number;
  early: number;
  onTimeRate: number | null;
  averageLateDays: number;
  averageEarlyDays: number;
  overdue: number;
  awaitingReview: number;
  active: number;
  openAmount: number;
  renegotiations: number;
  everOverdue: number;
}
export const roundMoney = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const money = (n: number) =>
  'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const isGoalCompleted = (g: Goal) => !!g.completedAt || g.saved >= g.target;
export const progress = (g: Goal) =>
  isGoalCompleted(g) ? 100 : Math.min(100, Math.round((g.saved / g.target) * 100));
