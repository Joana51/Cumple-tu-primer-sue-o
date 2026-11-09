import {
  Agreement,
  AgreementTask,
  FamilyState,
  LoanTerms,
  LatePolicy,
  Role,
  UnitReport,
  roundMoney,
  isGoalCompleted,
} from './models';
import {
  addDays,
  agreementOpen,
  overdueDays,
  penaltyUnits,
  penaltyReported,
  penaltyValidated,
  taskReports,
  taskReported,
  taskValidated,
  validDate,
  dayDifference,
  dateLabel,
  reportAccounted,
} from './agreement-rules';
import { times, days } from './ui-copy';

export type LoanCommand =
  | { type: 'request'; amount: number; reason: string; goalId?: number }
  | { type: 'offer'; id?: string; title: string; goalId?: number; terms: LoanTerms }
  | { type: 'decline'; id: string; reason: string }
  | { type: 'accept'; id: string; accept: boolean }
  | {
      type: 'report';
      id: string;
      taskId: string;
      units: number;
      performedAt?: string;
      note?: string;
    }
  | { type: 'dispute'; id: string; taskId: string; reportId: string; reason: string }
  | {
      type: 'resolve-dispute';
      id: string;
      taskId: string;
      reportId: string;
      resolution: 'confirmed' | 'unverifiable';
      response: string;
    }
  | {
      type: 'review';
      id: string;
      taskId: string;
      reportId: string;
      accept: boolean;
      feedback: string;
    }
  | { type: 'extend'; id: string; date: string }
  | { type: 'accept-extension'; id: string; accept: boolean }
  | { type: 'late-policy'; id: string; policy: LatePolicy }
  | { type: 'accept-policy'; id: string; accept: boolean };

const integer = (n: number, min: number, max: number) =>
  Number.isInteger(n) && n >= min && n <= max;
const amountValid = (n: number) => Number.isFinite(n) && n > 0 && n <= 10000 && roundMoney(n) === n;
export function policyError(p: LatePolicy): string {
  if (!p.enabled) return '';
  if (!integer(p.unitsPerDay, 1, 100))
    return 'Indica entre 1 y 100 veces extra por día, sin decimales.';
  if (!integer(p.capUnits, 1, 1000) || p.capUnits < p.unitsPerDay)
    return 'El límite total debe ser mayor o igual a las veces extra por día y no superar 1000.';
  if (!integer(p.graceDays, 0, 30))
    return 'La espera antes de sumar extras debe ser de 0 a 30 días, sin decimales.';
  if (!integer(p.paymentWindowDays, 1, 90))
    return 'El plazo para completar las actividades extra debe ser de 1 a 90 días.';
  return '';
}
export function termsError(t: LoanTerms): string {
  if (!amountValid(t.amount))
    return 'Escribe un monto de S/ 0.01 a S/ 10 000, con hasta 2 decimales.';
  if (!t.unitLabel.trim() || t.unitLabel.length > 120)
    return 'Describe la actividad en un máximo de 120 caracteres. Por ejemplo: leer durante 15 minutos.';
  if (!integer(t.totalUnits, 1, 500)) return 'Indica entre 1 y 500 veces en total, sin decimales.';
  if (!integer(t.unitsPerInstallment, 1, t.totalUnits))
    return 'Las veces por fecha deben estar entre 1 y el total acordado, sin decimales.';
  if (!integer(t.intervalDays, 1, 90)) return 'Indica de 1 a 90 días entre fechas, sin decimales.';
  if (!integer(t.firstDueDays, 1, 90))
    return 'La primera fecha debe ser de 1 a 90 días después de aceptar.';
  const count = Math.ceil(t.totalUnits / t.unitsPerInstallment);
  if (count > 60 || t.firstDueDays + (count - 1) * t.intervalDays > 365)
    return 'El calendario admite hasta 60 fechas y debe terminar en un año. Reduce las veces o los días entre fechas.';
  return policyError(t.latePolicy);
}
export function makeSchedule(t: LoanTerms, acceptedAt?: string): AgreementTask[] {
  let left = t.totalUnits;
  const tasks: AgreementTask[] = [];
  for (let i = 0; left > 0; i++) {
    const units = Math.min(left, t.unitsPerInstallment);
    tasks.push({
      id: crypto.randomUUID(),
      title: t.unitLabel.trim(),
      units,
      status: 'pending',
      reports: [],
      dueDate: acceptedAt ? addDays(acceptedAt, t.firstDueDays + i * t.intervalDays) : undefined,
    });
    left -= units;
  }
  return tasks;
}
function event(a: Agreement, f: FamilyState, actor: Role, text: string) {
  a.events.unshift({ id: crypto.randomUUID(), at: f.today, actor, text });
}
function syncTask(t: AgreementTask) {
  const reports = taskReports(t);
  t.status =
    taskValidated(t) >= (t.units ?? 1)
      ? 'validated'
      : taskReported(t) >= (t.units ?? 1)
        ? 'submitted'
        : 'pending';
  t.submittedAt = reports
    .filter(reportAccounted)
    .map((r) => r.submittedAt)
    .sort()
    .at(-1);
}
function finishIfPaid(f: FamilyState, a: Agreement) {
  if (a.status !== 'active' || !a.tasks.every((t) => taskValidated(t) >= (t.units ?? 1))) return;
  a.baseCompletedAt = a.tasks
    .flatMap((t) =>
      taskReports(t)
        .filter((r) => r.status === 'validated')
        .map((r) => r.submittedAt)
    )
    .sort()
    .at(-1)!;
  if (penaltyValidated(a) < penaltyUnits(a, f.today)) return;
  a.status = 'completed';
  a.completedAt = [
    a.baseCompletedAt,
    ...(a.penaltyReports ?? []).filter((r) => r.status === 'validated').map((r) => r.submittedAt),
  ]
    .sort()
    .at(-1)!;
  a.validatedAt = f.today;
  delete a.proposedDueDate;
  delete a.proposedLatePolicy;
  event(
    a,
    f,
    'parent',
    'Préstamo completado: la familia confirmó todas las actividades acordadas.'
  );
  const c = f.children.find((c) => c.id === a.childId)!;
  c.history.unshift({
    id: Date.now(),
    text: 'Cumpliste tu préstamo familiar: ' + a.title,
    amount: 0,
    kind: 'achievement',
    date: dateLabel(f.today),
  });
}

export function executeLoanCommand(
  f: FamilyState,
  role: Role,
  actorChildId: string,
  childId: string,
  c: LoanCommand
): string {
  const child = f.children.find((child) => child.id === childId);
  if (!child || (role === 'child' && actorChildId !== childId))
    return 'Selecciona el hijo o hija correspondiente en los controles de la demo.';
  const parentActions = ['offer', 'decline', 'review', 'extend', 'late-policy', 'resolve-dispute'];
  if ((parentActions.includes(c.type) ? 'parent' : 'child') !== role)
    return 'Cambia de vista para realizar esta acción: cada familiar tiene sus propias opciones.';
  const open = f.agreements.filter((a) => a.childId === childId && agreementOpen(a));
  if (c.type === 'request') {
    if (open.length)
      return 'Ya hay un préstamo o una solicitud pendiente. Revisa ese acuerdo antes de pedir otro.';
    if (!amountValid(c.amount) || !c.reason.trim() || c.reason.length > 180)
      return 'Indica un monto válido y para qué lo necesitas.';
    if (
      c.goalId !== undefined &&
      !child.goals.some((g) => g.id === c.goalId && !isGoalCompleted(g))
    )
      return 'Selecciona una meta sin completar de este hijo o hija.';
    const a: Agreement = {
      id: crypto.randomUUID(),
      childId,
      parentId: f.parent.id,
      goalId: c.goalId,
      title: child.goals.find((g) => g.id === c.goalId)?.name ?? 'Mi préstamo familiar',
      amount: c.amount,
      reason: c.reason.trim(),
      terms: '',
      status: 'requested',
      days: 7,
      tasks: [],
      createdAt: f.today,
      renegotiations: 0,
      events: [],
      penaltyReports: [],
    };
    event(a, f, role, 'Solicitud enviada. Todavía no se ha entregado dinero.');
    f.agreements.unshift(a);
    return '';
  }
  if (c.type === 'offer') {
    const error = termsError(c.terms);
    if (error) return error;
    const original = c.id
      ? f.agreements.find(
          (a) => a.id === c.id && a.childId === childId && a.parentId === f.parent.id
        )
      : undefined;
    if (c.id && (!original || original.status !== 'requested'))
      return 'Esta solicitud ya fue atendida.';
    if (open.some((a) => a.id !== original?.id))
      return 'Este perfil ya tiene un préstamo o una solicitud abierta.';
    if (c.terms.amount > f.parent.balance)
      return 'No hay suficiente dinero familiar para este préstamo. Reduce el monto o ajusta el saldo de la demo.';
    const goalId = original?.goalId ?? c.goalId;
    if (goalId !== undefined && !child.goals.some((g) => g.id === goalId && !isGoalCompleted(g)))
      return 'La meta elegida no pertenece a este perfil o ya fue cumplida.';
    const a: Agreement = original ?? {
      id: crypto.randomUUID(),
      childId,
      parentId: f.parent.id,
      goalId,
      title: c.title.trim().slice(0, 60) || 'Dinero adelantado',
      amount: c.terms.amount,
      reason: 'Propuesta de mi familia',
      terms: '',
      status: 'offered',
      days: 7,
      tasks: [],
      createdAt: f.today,
      renegotiations: 0,
      events: [],
    };
    a.amount = c.terms.amount;
    a.terms = c.terms.terms.trim().slice(0, 400);
    a.unitLabel = c.terms.unitLabel.trim();
    a.totalUnits = c.terms.totalUnits;
    a.unitsPerInstallment = c.terms.unitsPerInstallment;
    a.intervalDays = c.terms.intervalDays;
    a.firstDueDays = c.terms.firstDueDays;
    a.days =
      c.terms.firstDueDays +
      (Math.ceil(c.terms.totalUnits / c.terms.unitsPerInstallment) - 1) * c.terms.intervalDays;
    a.latePolicy = { ...c.terms.latePolicy, carryUnits: 0 };
    a.penaltyReports = [];
    a.tasks = makeSchedule(c.terms);
    a.status = 'offered';
    event(
      a,
      f,
      role,
      'Propuesta enviada. El hijo o hija debe aceptarla antes de recibir el dinero.'
    );
    if (!original) f.agreements.unshift(a);
    return '';
  }
  const a = f.agreements.find(
    (a) => a.id === c.id && a.childId === childId && a.parentId === f.parent.id
  );
  if (!a) return 'Este préstamo es de otro hijo o hija. Selecciona su nombre para abrirlo.';
  if (c.type === 'decline') {
    if (a.status !== 'requested') return 'Esta solicitud ya fue atendida.';
    a.status = 'declined';
    event(a, f, role, c.reason.trim() || 'Conversemos otro plan antes de continuar.');
    return '';
  }
  if (c.type === 'accept') {
    if (a.status !== 'offered') return 'La propuesta ya fue atendida.';
    if (!c.accept) {
      a.status = 'declined';
      event(a, f, role, 'Propuesta no aceptada. No se entregó dinero.');
      return '';
    }
    if (a.amount > f.parent.balance)
      return 'El fondo familiar cambió. Tu familia debe ajustar la propuesta; todavía no se entregó dinero.';
    if (
      a.goalId !== undefined &&
      !child.goals.some((g) => g.id === a.goalId && !isGoalCompleted(g))
    )
      return 'La meta vinculada cambió. Pide a tu familia una propuesta nueva.';
    f.parent.balance = roundMoney(f.parent.balance - a.amount);
    child.balance = roundMoney(child.balance + a.amount);
    a.status = 'active';
    a.acceptedAt = f.today;
    a.tasks.forEach(
      (t, i) =>
        (t.originalDueDate = t.dueDate =
          addDays(f.today, (a.firstDueDays ?? a.days) + i * (a.intervalDays ?? 1)))
    );
    a.dueDate = a.tasks.at(-1)!.dueDate;
    a.originalDueDate = a.dueDate;
    if (a.latePolicy) a.latePolicy.effectiveFrom = f.today;
    event(a, f, role, 'Condiciones aceptadas. Dinero añadido al saldo, una sola vez.');
    child.history.unshift({
      id: Date.now(),
      text: 'Dinero adelantado recibido: ' + a.title,
      amount: a.amount,
      kind: 'family',
      date: dateLabel(f.today),
    });
    return '';
  }
  if (a.status !== 'active') return 'Este préstamo no está abierto. Su historial se conserva.';
  if (c.type === 'report') {
    if (!integer(c.units, 1, 1000))
      return 'Escribe cuántas veces hiciste la actividad, sin decimales.';
    if (
      c.performedAt &&
      (!validDate(c.performedAt) || c.performedAt > f.today || c.performedAt < a.acceptedAt!)
    )
      return 'Elige un día entre la aceptación del préstamo y hoy. La fecha de tu aviso seguirá siendo hoy.';
    if ((c.note?.length ?? 0) > 180)
      return 'Usa una nota de hasta 180 caracteres, sin datos personales.';
    if (c.taskId === 'penalty') {
      if (c.units > penaltyUnits(a, f.today) - penaltyReported(a))
        return 'El número es mayor que las actividades extra pendientes. Indica una cantidad menor.';
      (a.penaltyReports ??= []).push({
        id: crypto.randomUUID(),
        units: c.units,
        submittedAt: f.today,
        status: 'submitted',
        performedAt: c.performedAt ?? f.today,
        note: c.note?.trim(),
      });
    } else {
      const task = a.tasks.find((t) => t.id === c.taskId);
      if (!task)
        return 'No encontramos esta actividad en el préstamo. Vuelve a la lista de actividades.';
      if (c.units > (task.units ?? 1) - taskReported(task))
        return 'El número es mayor que las veces pendientes para esta fecha. Indica una cantidad menor.';
      task.reports = taskReports(task);
      task.reports.push({
        id: crypto.randomUUID(),
        units: c.units,
        submittedAt: f.today,
        status: 'submitted',
        performedAt: c.performedAt ?? f.today,
        note: c.note?.trim(),
      });
      syncTask(task);
    }
    event(
      a,
      f,
      role,
      `Avisó que hizo la actividad ${times(c.units)}. Falta la confirmación de su familia.`
    );
    return '';
  }
  if (c.type === 'dispute' || c.type === 'resolve-dispute') {
    const task = a.tasks.find((t) => t.id === c.taskId);
    if (task && !task.reports) task.reports = taskReports(task);
    const reports = c.taskId === 'penalty' ? a.penaltyReports : task?.reports;
    const r = reports?.find((r) => r.id === c.reportId);
    if (!r)
      return 'No encontramos esta actividad en el préstamo. Vuelve a la lista de actividades.';
    if (c.type === 'dispute') {
      if (r.status !== 'rejected' || r.dispute)
        return 'Puedes pedir que revisen un aviso si tu familia señaló que faltaba algo y aún no lo han conversado.';
      if (!c.reason.trim() || c.reason.length > 180)
        return 'Explica qué quieres revisar en hasta 180 caracteres.';
      const accounted = reports!.filter(reportAccounted).reduce((n, x) => n + x.units, 0);
      const limit = task ? (task.units ?? 1) : penaltyUnits(a, f.today);
      if (accounted + r.units > limit)
        return 'Ya enviaste otro aviso para la misma actividad. Revisen ese aviso para no contarla dos veces.';
      r.dispute = { reason: c.reason.trim(), openedAt: f.today, status: 'open' };
      r.reviews ??= r.validatedAt
        ? [{ at: r.validatedAt, accepted: false, feedback: r.feedback ?? 'Observación familiar' }]
        : [];
      event(
        a,
        f,
        role,
        'Pidió conversar sobre la actividad. Hasta aclararlo, no se da por hecha ni por incumplida.'
      );
    } else {
      if (
        !r.dispute ||
        (r.dispute.status !== 'open' &&
          !(r.dispute.resolution === 'unverifiable' && c.resolution === 'confirmed'))
      )
        return 'Este aviso no tiene una conversación pendiente. Revisa su estado actual.';
      if (
        !['confirmed', 'unverifiable'].includes(c.resolution) ||
        !c.response.trim() ||
        c.response.length > 180
      )
        return 'Explica el resultado de la conversación en hasta 180 caracteres.';
      Object.assign(r.dispute, {
        status: 'resolved',
        resolution: c.resolution,
        resolvedAt: f.today,
        response: c.response.trim(),
      });
      if (c.resolution === 'confirmed') {
        r.status = 'validated';
        r.validatedAt = f.today;
        (r.reviews ??= []).push({ at: f.today, accepted: true, feedback: c.response.trim() });
      }
      event(
        a,
        f,
        role,
        c.resolution === 'confirmed'
          ? 'Confirmó la actividad después de conversar. Se conservan el primer aviso y las respuestas anteriores.'
          : 'Tras conversar, todavía falta información. La actividad no se da por hecha ni por incumplida.'
      );
    }
    if (task) syncTask(task);
    finishIfPaid(f, a);
    return '';
  }
  if (c.type === 'review') {
    const task = c.taskId === 'penalty' ? undefined : a.tasks.find((t) => t.id === c.taskId);
    const report = (
      c.taskId === 'penalty' ? a.penaltyReports : (task?.reports ?? (task ? taskReports(task) : []))
    )?.find((r) => r.id === c.reportId);
    if (!report || report.status !== 'submitted')
      return 'Este aviso ya recibió respuesta o pertenece a otro préstamo. Revisa la lista de actividades.';
    if (report.dispute?.status === 'open')
      return 'Resuelve primero la revisión solicitada, sin borrar la observación.';
    if (task && !task.reports) task.reports = taskReports(task);
    const target = (c.taskId === 'penalty' ? a.penaltyReports : task?.reports)!.find(
      (r) => r.id === c.reportId
    )!;
    target.status = c.accept ? 'validated' : 'rejected';
    target.validatedAt = f.today;
    target.feedback = c.accept
      ? 'Actividad confirmada por tu familia.'
      : c.feedback.trim().slice(0, 180) || 'Conversemos sobre lo que falta completar.';
    (target.reviews ??= []).push({ at: f.today, accepted: c.accept, feedback: target.feedback });
    if (task) syncTask(task);
    event(
      a,
      f,
      role,
      c.accept
        ? `Confirmó la actividad ${times(target.units)}. El aviso se envió el ${target.submittedAt}.`
        : target.feedback
    );
    finishIfPaid(f, a);
    return '';
  }
  if (c.type === 'extend') {
    if (!validDate(c.date) || c.date <= a.dueDate! || c.date < f.today)
      return 'Elige una fecha posterior a la acordada y que no esté en el pasado.';
    const shift = dayDifference(c.date, a.dueDate!);
    if (
      a.tasks.some(
        (t) =>
          taskValidated(t) < (t.units ?? 1) && addDays(t.dueDate ?? a.dueDate!, shift) < f.today
      )
    )
      return 'Elige una fecha más lejana para que todas las actividades pendientes tengan tiempo para completarse.';
    a.proposedDueDate = c.date;
    event(
      a,
      f,
      role,
      `Propuso cambiar el vencimiento de ${a.dueDate} a ${c.date}. Falta aceptación del adolescente.`
    );
    return '';
  }
  if (c.type === 'accept-extension') {
    if (!a.proposedDueDate) return 'No hay una ampliación pendiente.';
    if (c.accept) {
      if (a.proposedDueDate < f.today)
        return 'La fecha propuesta ya pasó. Pide a tu familia otra fecha.';
      const shift = dayDifference(a.proposedDueDate, a.dueDate!);
      const accrued = penaltyUnits(a, f.today);
      a.tasks.forEach((t) => {
        t.originalDueDate ??= t.dueDate ?? a.dueDate;
        if (taskValidated(t) < (t.units ?? 1)) t.dueDate = addDays(t.dueDate ?? a.dueDate!, shift);
      });
      a.dueDate = a.proposedDueDate;
      a.renegotiations++;
      if (a.latePolicy) {
        a.latePolicy.carryUnits = accrued;
        a.latePolicy.effectiveFrom = addDays(f.today, 1);
      }
      event(
        a,
        f,
        role,
        `Aceptó ampliar el vencimiento a ${a.dueDate}. Las demoras anteriores permanecen registradas.`
      );
    } else event(a, f, role, 'Prefirió conservar los plazos vigentes.');
    delete a.proposedDueDate;
    return '';
  }
  if (c.type === 'late-policy') {
    const error = policyError(c.policy);
    if (error) return error;
    if (!c.policy.enabled) {
      a.latePolicy = { ...c.policy, enabled: false };
      delete a.proposedLatePolicy;
      event(
        a,
        f,
        role,
        'Quitó las actividades extra pendientes. Se conserva el retraso en el historial.'
      );
      finishIfPaid(f, a);
      return '';
    }
    if (!overdueDays(a, f.today))
      return 'Puedes proponer actividades extra cuando haya una actividad pendiente fuera de plazo.';
    a.proposedLatePolicy = { ...c.policy, effectiveFrom: f.today, carryUnits: 0 };
    event(
      a,
      f,
      role,
      `Propuso repetir la actividad ${times(c.policy.unitsPerDay)} extra por día de retraso, hasta ${times(c.policy.capUnits)} extra en total. Espera: ${days(c.policy.graceDays)}. Plazo extra: ${days(c.policy.paymentWindowDays)}. El hijo o hija debe aceptar; no se aplica a días anteriores.`
    );
    return '';
  }
  if (c.type === 'accept-policy') {
    if (!a.proposedLatePolicy) return 'No hay una propuesta de actividades extra para aceptar.';
    if (c.accept) {
      a.latePolicy = {
        ...a.proposedLatePolicy,
        effectiveFrom: addDays(f.today, 1),
        carryUnits: penaltyUnits(a, f.today),
      };
      event(
        a,
        f,
        role,
        `Aceptó las condiciones adicionales desde ${addDays(f.today, 1)}, sin cobro retroactivo.`
      );
    } else
      event(a, f, role, 'No aceptó las actividades extra. Se mantiene lo que ya habían acordado.');
    delete a.proposedLatePolicy;
    return '';
  }
  return 'No pudimos completar esta acción. Vuelve al préstamo e inténtalo de nuevo.';
}
