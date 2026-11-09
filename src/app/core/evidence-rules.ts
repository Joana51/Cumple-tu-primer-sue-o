import { Agreement, UnitReport } from './models';
import { dayDifference, taskReports } from './agreement-rules';

// Pilot policy, not a legal deadline. Keep review time separate from performance.
export const REVIEW_WINDOW_DAYS = 14;
export const allReports = (a: Agreement) => [
  ...a.tasks.flatMap(taskReports),
  ...(a.penaltyReports ?? []),
];
export function reviewExpired(r: UnitReport, today: string): boolean {
  return r.status === 'submitted' && dayDifference(today, r.submittedAt) >= REVIEW_WINDOW_DAYS;
}
export const neutralReport = (r: UnitReport) =>
  r.dispute?.status === 'open' || r.dispute?.resolution === 'unverifiable';
export function reportEvidence(r: UnitReport, today: string): string {
  if (r.dispute?.status === 'open') return 'Revisión solicitada';
  if (r.dispute?.resolution === 'unverifiable') return 'Sin información suficiente';
  if (r.status === 'validated')
    return r.validatedAt && dayDifference(r.validatedAt, r.submittedAt) >= REVIEW_WINDOW_DAYS
      ? 'Confirmado después de 14 días'
      : 'Confirmado en familia';
  if (r.status === 'rejected') return 'Falta aclarar la actividad';
  return reviewExpired(r, today)
    ? 'Sin respuesta de la familia tras 14 días'
    : 'Esperando confirmación de la familia';
}
export function reviewReminder(r: UnitReport, today: string): string {
  if (r.status !== 'submitted' || r.dispute) return '';
  const age = dayDifference(today, r.submittedAt);
  if (age >= REVIEW_WINDOW_DAYS)
    return 'Han pasado 14 días sin respuesta. Falta información: la actividad no se da por hecha ni por incumplida. La familia todavía puede revisarla.';
  if (age >= 7) return 'Este aviso lleva 7 días esperando respuesta de la familia.';
  if (age >= 2) return 'Este aviso lleva 2 días esperando respuesta de la familia.';
  return '';
}
export function evidenceSummary(a: Agreement, today: string) {
  const reports = allReports(a);
  return {
    confirmed: reports.filter((r) => r.status === 'validated').length,
    pending: reports.filter(
      (r) => r.status === 'submitted' && !reviewExpired(r, today) && !neutralReport(r)
    ).length,
    neutral: reports.filter((r) => reviewExpired(r, today) || neutralReport(r)).length,
    disputed: reports.filter((r) => r.dispute?.status === 'open').length,
    late: reports.filter(
      (r) =>
        r.status === 'validated' &&
        r.validatedAt &&
        dayDifference(r.validatedAt, r.submittedAt) >= REVIEW_WINDOW_DAYS
    ).length,
  };
}
