import { Agreement, AgreementMetrics } from './models';

export const localToday = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export function validDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === date;
}
export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export const dayDifference = (a: string, b: string) =>
  Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86400000);
export const dateLabel = (date?: string) =>
  date
    ? new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
        new Date(date + 'T00:00:00Z')
      )
    : 'Por acordar';
export const agreementOpen = (a: Agreement) =>
  ['requested', 'offered', 'active'].includes(a.status);
export const waitingReview = (a: Agreement) =>
  a.status === 'active' && a.tasks.some((t) => t.status === 'submitted');
export const taskReports = (t: import('./models').AgreementTask): import('./models').UnitReport[] =>
  t.reports ??
  (t.status === 'pending'
    ? []
    : [
        {
          id: t.id,
          units: t.units ?? 1,
          submittedAt: t.submittedAt!,
          status: t.status === 'validated' ? 'validated' : 'submitted',
          validatedAt: t.validatedAt,
        },
      ]);
export const taskValidated = (t: import('./models').AgreementTask) =>
  taskReports(t)
    .filter((r) => r.status === 'validated')
    .reduce((n, r) => n + r.units, 0);
export const reportAccounted = (r: import('./models').UnitReport) =>
  r.status !== 'rejected' ||
  r.dispute?.status === 'open' ||
  r.dispute?.resolution === 'unverifiable';
export const taskReported = (t: import('./models').AgreementTask) =>
  taskReports(t)
    .filter(reportAccounted)
    .reduce((n, r) => n + r.units, 0);
export const overdueDays = (a: Agreement, today: string) =>
  a.status === 'active'
    ? Math.max(
        0,
        ...a.tasks
          .filter((t) => taskReported(t) < (t.units ?? 1))
          .map((t) => dayDifference(today, t.dueDate ?? a.dueDate ?? today))
      )
    : 0;
export const agreementProgress = (a: Agreement) =>
  a.tasks.length
    ? Math.round(
        (a.tasks.reduce((n, t) => n + taskValidated(t), 0) /
          a.tasks.reduce((n, t) => n + (t.units ?? 1), 0)) *
          100
      )
    : 0;
export function penaltyUnits(a: Agreement, today: string): number {
  const p = a.latePolicy;
  if (!p?.enabled || !a.acceptedAt || !a.tasks.length) return 0;
  const first = a.tasks.map((t) => t.dueDate ?? a.dueDate!).sort()[0];
  const start = [addDays(first, p.graceDays + 1), p.effectiveFrom ?? a.acceptedAt].sort().at(-1)!;
  const end = a.status === 'completed' ? a.completedAt! : today;
  let days = 0;
  for (let d = start; d <= end; d = addDays(d, 1)) {
    if (
      a.tasks.some(
        (t) =>
          addDays(t.dueDate ?? a.dueDate!, p.graceDays) < d &&
          taskReports(t)
            .filter((r) => reportAccounted(r) && r.submittedAt < d)
            .reduce((n, r) => n + r.units, 0) < (t.units ?? 1)
      )
    )
      days++;
    if ((p.carryUnits ?? 0) + days * p.unitsPerDay >= p.capUnits) return p.capUnits;
  }
  return Math.min(p.capUnits, (p.carryUnits ?? 0) + days * p.unitsPerDay);
}
export const penaltyValidated = (a: Agreement) =>
  (a.penaltyReports ?? []).filter((r) => r.status === 'validated').reduce((n, r) => n + r.units, 0);
export const penaltyReported = (a: Agreement) =>
  (a.penaltyReports ?? []).filter(reportAccounted).reduce((n, r) => n + r.units, 0);
export const penaltyDeadline = (a: Agreement) =>
  a.latePolicy && a.dueDate
    ? addDays(
        [a.dueDate, a.latePolicy.effectiveFrom ?? a.dueDate].sort().at(-1)!,
        a.latePolicy.paymentWindowDays
      )
    : undefined;
export function agreementStatus(a: Agreement, today: string): string {
  if (a.status === 'requested') return 'Solicitud enviada';
  if (a.status === 'offered') return 'Esperando aceptación';
  if (a.status === 'completed') return 'Acuerdo cumplido';
  if (a.status === 'declined') return 'No acordado';
  if (a.status === 'cancelled') return 'Solicitud cancelada';
  if (
    overdueDays(a, today) ||
    (a.latePolicy?.enabled &&
      penaltyDeadline(a)! < today &&
      penaltyReported(a) < penaltyUnits(a, today))
  )
    return 'En mora';
  if (
    a.tasks.every((t) => taskReported(t) >= (t.units ?? 1)) &&
    a.tasks.some((t) => taskValidated(t) < (t.units ?? 1))
  )
    return 'En revisión familiar';
  if (
    a.tasks.every((t) => taskValidated(t) >= (t.units ?? 1)) &&
    penaltyValidated(a) < penaltyUnits(a, today)
  )
    return 'Unidades adicionales pendientes';
  return 'Vigente';
}
export function agreementMetrics(agreements: Agreement[], today: string): AgreementMetrics {
  const done = agreements.filter((a) => a.status === 'completed' && a.completedAt && a.dueDate);
  const delays = done.map((a) =>
    Math.max(
      ...a.tasks.map((t) =>
        dayDifference(
          taskReports(t)
            .filter((r) => r.status === 'validated')
            .map((r) => r.submittedAt)
            .sort()
            .at(-1) ??
            a.baseCompletedAt ??
            a.completedAt!,
          t.dueDate ?? a.dueDate!
        )
      )
    )
  );
  const late = delays.filter((d) => d > 0),
    early = delays.filter((d) => d < 0);
  const active = agreements.filter((a) => a.status === 'active');
  return {
    completed: done.length,
    onTime: delays.filter((d) => d <= 0).length,
    late: late.length,
    early: early.length,
    onTimeRate: done.length
      ? Math.round((delays.filter((d) => d <= 0).length / done.length) * 100)
      : null,
    averageLateDays: late.length
      ? Math.round((late.reduce((n, d) => n + d, 0) / late.length) * 10) / 10
      : 0,
    averageEarlyDays: early.length
      ? Math.round((-early.reduce((n, d) => n + d, 0) / early.length) * 10) / 10
      : 0,
    overdue: active.filter((a) => agreementStatus(a, today) === 'En mora').length,
    awaitingReview: active.reduce(
      (n, a) =>
        n +
        a.tasks.reduce(
          (k, t) => k + taskReports(t).filter((r) => r.status === 'submitted').length,
          0
        ) +
        (a.penaltyReports ?? []).filter((r) => r.status === 'submitted').length,
      0
    ),
    active: active.length,
    openAmount: active.reduce((n, a) => n + a.amount, 0),
    renegotiations: agreements.reduce((n, a) => n + a.renegotiations, 0),
    everOverdue: agreements.filter(
      (a) =>
        a.hadOverdue ||
        overdueDays(a, today) > 0 ||
        (a.status === 'completed' &&
          a.tasks.some((t) =>
            taskReports(t).some(
              (r) => r.status === 'validated' && r.submittedAt > (t.dueDate ?? a.dueDate!)
            )
          ))
    ).length,
  };
}

export function observeDelays(f: import('./models').FamilyState): void {
  for (const a of f.agreements) {
    if (a.status !== 'active') continue;
    const delay = Math.max(
      overdueDays(a, f.today),
      a.latePolicy?.enabled && penaltyReported(a) < penaltyUnits(a, f.today)
        ? Math.max(0, dayDifference(f.today, penaltyDeadline(a)!))
        : 0
    );
    if (delay > 0) {
      if (!a.hadOverdue)
        a.events.unshift({
          id: crypto.randomUUID(),
          at: f.today,
          actor: 'system',
          text: 'Se registró una entrega vencida. La demora permanece en el historial.',
        });
      a.hadOverdue = true;
      a.maxOverdueDays = Math.max(a.maxOverdueDays ?? 0, delay);
    }
  }
}
