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
} from './agreement-rules';

export type LoanCommand =
  | { type: 'request'; amount: number; reason: string; goalId?: number }
  | { type: 'offer'; id?: string; title: string; goalId?: number; terms: LoanTerms }
  | { type: 'decline'; id: string; reason: string }
  | { type: 'accept'; id: string; accept: boolean }
  | { type: 'report'; id: string; taskId: string; units: number }
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
  return integer(p.unitsPerDay, 1, 100) &&
    integer(p.capUnits, 1, 1000) &&
    p.capUnits >= p.unitsPerDay &&
    integer(p.graceDays, 0, 30) &&
    integer(p.paymentWindowDays, 1, 90)
    ? ''
    : 'Revisa las unidades por día, el tope, la gracia y el plazo adicional.';
}
export function termsError(t: LoanTerms): string {
  if (
    !amountValid(t.amount) ||
    !t.unitLabel.trim() ||
    t.unitLabel.length > 120 ||
    !integer(t.totalUnits, 1, 500) ||
    !integer(t.unitsPerInstallment, 1, t.totalUnits) ||
    !integer(t.intervalDays, 1, 90) ||
    !integer(t.firstDueDays, 1, 90)
  )
    return 'Revisa monto, unidad de pago, cantidad y frecuencia.';
  const count = Math.ceil(t.totalUnits / t.unitsPerInstallment);
  if (count > 60 || t.firstDueDays + (count - 1) * t.intervalDays > 365)
    return 'El plan debe tener como máximo 60 entregas y terminar dentro de un año.';
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
    .filter((r) => r.status !== 'rejected')
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
  event(a, f, 'parent', 'Préstamo completado: todas las unidades fueron confirmadas.');
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
    return 'Ese perfil no está disponible en esta vista.';
  const parentActions = ['offer', 'decline', 'review', 'extend', 'late-policy'];
  if ((parentActions.includes(c.type) ? 'parent' : 'child') !== role)
    return 'Esta acción corresponde a la otra vista de la familia.';
  const open = f.agreements.filter((a) => a.childId === childId && agreementOpen(a));
  if (c.type === 'request') {
    if (open.length)
      return 'Ya tienes un préstamo o una solicitud abierta. Termina ese recorrido primero.';
    if (!amountValid(c.amount) || !c.reason.trim() || c.reason.length > 180)
      return 'Indica un monto válido y para qué lo necesitas.';
    if (
      c.goalId !== undefined &&
      !child.goals.some((g) => g.id === c.goalId && !isGoalCompleted(g))
    )
      return 'Elige una meta activa de este perfil.';
    const a: Agreement = {
      id: crypto.randomUUID(),
      childId,
      parentId: f.parent.id,
      goalId: c.goalId,
      title: child.goals.find((g) => g.id === c.goalId)?.name ?? 'Mi anticipo familiar',
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
      return 'El fondo familiar disponible no alcanza para este anticipo.';
    const goalId = original?.goalId ?? c.goalId;
    if (goalId !== undefined && !child.goals.some((g) => g.id === goalId && !isGoalCompleted(g)))
      return 'La meta elegida no pertenece a este perfil o ya fue cumplida.';
    const a: Agreement = original ?? {
      id: crypto.randomUUID(),
      childId,
      parentId: f.parent.id,
      goalId,
      title: c.title.trim().slice(0, 60) || 'Anticipo familiar',
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
    event(a, f, role, 'Condiciones propuestas. Esperando que el adolescente las acepte.');
    if (!original) f.agreements.unshift(a);
    return '';
  }
  const a = f.agreements.find(
    (a) => a.id === c.id && a.childId === childId && a.parentId === f.parent.id
  );
  if (!a) return 'Este préstamo no pertenece al perfil seleccionado.';
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
        (t.dueDate = addDays(f.today, (a.firstDueDays ?? a.days) + i * (a.intervalDays ?? 1)))
    );
    a.dueDate = a.tasks.at(-1)!.dueDate;
    a.originalDueDate = a.dueDate;
    if (a.latePolicy) a.latePolicy.effectiveFrom = f.today;
    event(a, f, role, 'Condiciones aceptadas. Anticipo entregado una sola vez.');
    child.history.unshift({
      id: Date.now(),
      text: 'Anticipo familiar recibido: ' + a.title,
      amount: a.amount,
      kind: 'family',
      date: dateLabel(f.today),
    });
    return '';
  }
  if (a.status !== 'active') return 'Este préstamo no está abierto. Su historial se conserva.';
  if (c.type === 'report') {
    if (!integer(c.units, 1, 1000)) return 'Indica una cantidad entera de unidades.';
    if (c.taskId === 'penalty') {
      if (c.units > penaltyUnits(a, f.today) - penaltyReported(a))
        return 'La cantidad supera las unidades adicionales pendientes.';
      (a.penaltyReports ??= []).push({
        id: crypto.randomUUID(),
        units: c.units,
        submittedAt: f.today,
        status: 'submitted',
      });
    } else {
      const task = a.tasks.find((t) => t.id === c.taskId);
      if (!task) return 'La entrega no pertenece a este préstamo.';
      if (c.units > (task.units ?? 1) - taskReported(task))
        return 'La cantidad supera las unidades pendientes de esta entrega.';
      task.reports = taskReports(task);
      task.reports.push({
        id: crypto.randomUUID(),
        units: c.units,
        submittedAt: f.today,
        status: 'submitted',
      });
      syncTask(task);
    }
    event(a, f, role, `Reportó ${c.units} unidad(es). En espera de revisión familiar.`);
    return '';
  }
  if (c.type === 'review') {
    const task = c.taskId === 'penalty' ? undefined : a.tasks.find((t) => t.id === c.taskId);
    const report = (
      c.taskId === 'penalty' ? a.penaltyReports : (task?.reports ?? (task ? taskReports(task) : []))
    )?.find((r) => r.id === c.reportId);
    if (!report || report.status !== 'submitted')
      return 'Esta entrega ya fue revisada o no pertenece al préstamo.';
    if (task && !task.reports) task.reports = taskReports(task);
    const target = (c.taskId === 'penalty' ? a.penaltyReports : task?.reports)!.find(
      (r) => r.id === c.reportId
    )!;
    target.status = c.accept ? 'validated' : 'rejected';
    target.validatedAt = f.today;
    target.feedback = c.accept
      ? 'Entrega confirmada.'
      : c.feedback.trim().slice(0, 180) || 'Revisemos esta entrega juntos.';
    if (task) syncTask(task);
    event(
      a,
      f,
      role,
      c.accept
        ? `Confirmó ${target.units} unidad(es), reportadas el ${target.submittedAt}.`
        : target.feedback
    );
    finishIfPaid(f, a);
    return '';
  }
  if (c.type === 'extend') {
    if (!validDate(c.date) || c.date <= a.dueDate! || c.date < f.today)
      return 'El nuevo vencimiento debe ser posterior al actual y no estar en el pasado.';
    const shift = dayDifference(c.date, a.dueDate!);
    if (
      a.tasks.some(
        (t) =>
          taskValidated(t) < (t.units ?? 1) && addDays(t.dueDate ?? a.dueDate!, shift) < f.today
      )
    )
      return 'Amplía el plazo lo suficiente para que la primera entrega pendiente no quede en el pasado.';
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
        return 'Esta ampliación quedó en el pasado. Pide una nueva propuesta.';
      const shift = dayDifference(a.proposedDueDate, a.dueDate!);
      const accrued = penaltyUnits(a, f.today);
      a.tasks.forEach((t) => {
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
        'Desactivó las unidades adicionales; no quedan cargos pendientes por demora.'
      );
      finishIfPaid(f, a);
      return '';
    }
    if (!overdueDays(a, f.today)) return 'Esta opción se habilita cuando hay entregas vencidas.';
    a.proposedLatePolicy = { ...c.policy, effectiveFrom: f.today, carryUnits: 0 };
    event(
      a,
      f,
      role,
      `Propuso ${c.policy.unitsPerDay} unidades por día, tope ${c.policy.capUnits}, gracia ${c.policy.graceDays} días y plazo adicional ${c.policy.paymentWindowDays} días. Sin cobro retroactivo. Falta aceptación.`
    );
    return '';
  }
  if (c.type === 'accept-policy') {
    if (!a.proposedLatePolicy) return 'No hay condiciones adicionales pendientes.';
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
      event(
        a,
        f,
        role,
        'No aceptó nuevas unidades adicionales. Se conservan las condiciones anteriores.'
      );
    delete a.proposedLatePolicy;
    return '';
  }
  return 'Acción no reconocida.';
}
