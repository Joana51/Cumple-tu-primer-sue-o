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
  if (r.dispute?.status === 'open') return 'Resultado cuestionado';
  if (r.dispute?.resolution === 'unverifiable') return 'Sin conclusión verificable';
  if (r.status === 'validated')
    return r.validatedAt && dayDifference(r.validatedAt, r.submittedAt) >= REVIEW_WINDOW_DAYS
      ? 'Confirmación familiar tardía'
      : 'Confirmación familiar';
  if (r.status === 'rejected') return 'Con observación familiar';
  return reviewExpired(r, today)
    ? 'Revisión vencida · resultado no verificable'
    : 'Pendiente de revisión';
}
export function reviewReminder(r: UnitReport, today: string): string {
  if (r.status !== 'submitted' || r.dispute) return '';
  const age = dayDifference(today, r.submittedAt);
  if (age >= REVIEW_WINDOW_DAYS)
    return 'Han pasado 14 días sin revisión. No se atribuye incumplimiento al hijo ni se confirma el resultado automáticamente.';
  if (age >= 7) return 'Recordatorio de 7 días: queda una entrega familiar por revisar.';
  if (age >= 2) return 'Recordatorio de 48 horas: revisen esta entrega cuando puedan.';
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
