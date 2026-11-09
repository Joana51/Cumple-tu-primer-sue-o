import { test, expect } from '@playwright/test';
import { familySeed } from '../src/app/core/family-seed';
import { DemoState, FamilyState, LoanTerms, Role } from '../src/app/core/models';
import { executeLoanCommand, LoanCommand } from '../src/app/core/loan-engine';
import {
  agreementMetrics,
  agreementStatus,
  observeDelays,
  penaltyUnits,
  taskValidated,
} from '../src/app/core/agreement-rules';

function fixture() {
  const base: DemoState = {
    profile: { name: 'Alex', age: 14, avatar: 'A', notifications: true, interest: 'Tecnología' },
    balance: 165,
    goals: [
      { id: 1, name: 'Tablet', target: 600, saved: 180, weeks: 12, art: 'tablet', protected: true },
    ],
    history: [],
    requests: [],
    lessons: [],
    reward: 0,
    praise: '',
    earnedBadges: [],
  };
  const f = familySeed(base, '2026-11-08');
  f.agreements = [];
  return f;
}
const terms = (enabled = false): LoanTerms => ({
  amount: 20,
  unitLabel: 'Sesión de lectura',
  totalUnits: 2,
  unitsPerInstallment: 1,
  intervalDays: 1,
  firstDueDays: 1,
  terms: 'Lo acordamos juntos.',
  latePolicy: { enabled, unitsPerDay: 5, capUnits: 12, graceDays: 0, paymentWindowDays: 7 },
});
function send(
  f: FamilyState,
  role: Role,
  childId: string,
  command: LoanCommand,
  actorChildId = childId
) {
  const copy = structuredClone(f);
  observeDelays(copy);
  const error = executeLoanCommand(copy, role, actorChildId, childId, command);
  if (!error) {
    observeDelays(copy);
    Object.assign(f, copy);
  }
  return error;
}
function ok(f: FamilyState, role: Role, childId: string, command: LoanCommand) {
  expect(send(f, role, childId, command)).toBe('');
}
function offer(f: FamilyState, childId = 'alex', t = terms()) {
  ok(f, 'parent', childId, { type: 'offer', title: 'Para mi sueño', goalId: 1, terms: t });
  return f.agreements.find((a) => a.childId === childId)!.id;
}
function accepted(f: FamilyState, t = terms()) {
  const id = offer(f, 'alex', t);
  ok(f, 'child', 'alex', { type: 'accept', id, accept: true });
  return id;
}
function loan(f: FamilyState, id: string) {
  return f.agreements.find((a) => a.id === id)!;
}
function report(f: FamilyState, id: string, taskId: string, units = 1) {
  ok(f, 'child', 'alex', { type: 'report', id, taskId, units });
  const a = loan(f, id);
  return (
    taskId === 'penalty' ? a.penaltyReports! : a.tasks.find((t) => t.id === taskId)!.reports!
  ).at(-1)!.id;
}
function review(f: FamilyState, id: string, taskId: string, reportId: string, accept = true) {
  ok(f, 'parent', 'alex', {
    type: 'review',
    id,
    taskId,
    reportId,
    accept,
    feedback: 'Revisemos juntos la actividad.',
  });
}

test('solicitar, proponer y aceptar son estados separados; el anticipo se entrega solo una vez al hijo correcto', () => {
  const f = fixture();
  const sibling = structuredClone(f.children[1]);
  ok(f, 'child', 'alex', { type: 'request', amount: 20, reason: 'Para mi tablet', goalId: 1 });
  const id = f.agreements[0].id;
  expect(f.children[0].balance).toBe(165);
  expect(f.parent.balance).toBe(1000);
  ok(f, 'parent', 'alex', { type: 'offer', id, title: 'Tablet', terms: terms() });
  expect(f.children[0].balance).toBe(165);
  const before = structuredClone(f);
  expect(send(f, 'child', 'lucia', { type: 'accept', id, accept: true })).not.toBe('');
  expect(f).toEqual(before);
  ok(f, 'child', 'alex', { type: 'accept', id, accept: true });
  expect(f.children[0].balance).toBe(185);
  expect(f.parent.balance).toBe(980);
  expect(f.children[1]).toEqual(sibling);
  expect(f.children[0].goals[0].saved).toBe(180);
  expect(send(f, 'child', 'alex', { type: 'accept', id, accept: true })).not.toBe('');
  expect(f.children[0].balance + f.parent.balance).toBe(1165);
});

test('rechazar no entrega dinero y un hijo no actúa por su hermano ni como adulto', () => {
  const f = fixture();
  const original = structuredClone(f);
  expect(
    send(f, 'child', 'lucia', { type: 'request', amount: 10, reason: 'Otro plan' }, 'alex')
  ).not.toBe('');
  expect(f).toEqual(original);
  expect(
    send(f, 'child', 'alex', { type: 'offer', title: 'Falso adulto', terms: terms() })
  ).not.toBe('');
  const id = offer(f);
  ok(f, 'child', 'alex', { type: 'accept', id, accept: false });
  expect(f.children[0].balance).toBe(165);
  expect(f.parent.balance).toBe(1000);
  expect(loan(f, id).status).toBe('declined');
});

test('dos propuestas no permiten sobregirar el fondo al aceptar', () => {
  const f = fixture();
  f.parent.balance = 20;
  const a = offer(f, 'alex');
  const b = offer(f, 'lucia');
  ok(f, 'child', 'alex', { type: 'accept', id: a, accept: true });
  expect(send(f, 'child', 'lucia', { type: 'accept', id: b, accept: true })).toContain(
    'fondo familiar'
  );
  expect(f.parent.balance).toBe(0);
  expect(f.children[1].balance).toBe(55);
  expect(loan(f, b).status).toBe('offered');
});

test('el calendario respeta unidad, cantidad, frecuencia y remanente final', () => {
  const f = fixture();
  const t = { ...terms(), totalUnits: 5, unitsPerInstallment: 2, intervalDays: 3, firstDueDays: 2 };
  const id = accepted(f, t);
  expect(loan(f, id).tasks.map((t) => [t.units, t.dueDate])).toEqual([
    [2, '2026-11-10'],
    [2, '2026-11-13'],
    [1, '2026-11-16'],
  ]);
  expect(send(f, 'child', 'alex', { type: 'request', amount: 10, reason: 'Otro' })).toContain(
    'abierta'
  );
});

test('entregas parciales, rechazo y nueva entrega no duplican unidades', () => {
  const f = fixture();
  const id = accepted(f, { ...terms(), totalUnits: 3, unitsPerInstallment: 3 });
  const taskId = loan(f, id).tasks[0].id;
  let r = report(f, id, taskId, 2);
  expect(
    send(f, 'child', 'alex', {
      type: 'review',
      id,
      taskId,
      reportId: r,
      accept: true,
      feedback: '',
    })
  ).not.toBe('');
  review(f, id, taskId, r, false);
  expect(taskValidated(loan(f, id).tasks[0])).toBe(0);
  r = report(f, id, taskId, 2);
  review(f, id, taskId, r);
  expect(taskValidated(loan(f, id).tasks[0])).toBe(2);
  expect(send(f, 'child', 'alex', { type: 'report', id, taskId, units: 2 })).not.toBe('');
  r = report(f, id, taskId, 1);
  review(f, id, taskId, r);
  expect(loan(f, id).status).toBe('completed');
  expect(f.parent.balance).toBe(980);
  expect(f.children[0].balance).toBe(185);
  expect(
    send(f, 'parent', 'alex', {
      type: 'review',
      id,
      taskId,
      reportId: r,
      accept: true,
      feedback: '',
    })
  ).not.toBe('');
});

test('la demora del adulto al validar no penaliza una entrega puntual del hijo', () => {
  const f = fixture();
  const id = accepted(f, terms(true));
  const submissions = loan(f, id).tasks.map((t) => ({
    taskId: t.id,
    reportId: report(f, id, t.id),
  }));
  f.today = '2026-11-20';
  observeDelays(f);
  expect(penaltyUnits(loan(f, id), f.today)).toBe(0);
  expect(agreementStatus(loan(f, id), f.today)).toBe('En revisión familiar');
  submissions.forEach((r) => review(f, id, r.taskId, r.reportId));
  expect(loan(f, id).completedAt).toBe('2026-11-08');
  expect(loan(f, id).validatedAt).toBe('2026-11-20');
  const m = agreementMetrics(f.agreements, f.today);
  expect(m.onTime).toBe(1);
  expect(m.everOverdue).toBe(0);
});

test('mora diaria lineal con tope; no se cierra un préstamo con unidades adicionales pendientes', () => {
  const f = fixture();
  const id = accepted(f, terms(true));
  f.today = '2026-11-12';
  observeDelays(f);
  expect(penaltyUnits(loan(f, id), f.today)).toBe(12);
  expect(agreementStatus(loan(f, id), f.today)).toBe('En mora');
  for (const taskId of loan(f, id).tasks.map((t) => t.id)) {
    const r = report(f, id, taskId);
    review(f, id, taskId, r);
  }
  expect(loan(f, id).status).toBe('active');
  f.today = '2026-11-30';
  expect(penaltyUnits(loan(f, id), f.today)).toBe(12);
  const r = report(f, id, 'penalty', 12);
  review(f, id, 'penalty', r);
  expect(loan(f, id).status).toBe('completed');
  expect(agreementMetrics(f.agreements, f.today).late).toBe(1);
  expect(agreementMetrics(f.agreements, f.today).everOverdue).toBe(1);
});

test('sin recargo se registra la mora; desactivarlo no borra el retraso ni devuelve dinero', () => {
  const f = fixture();
  const id = accepted(f, terms(true));
  f.today = '2026-11-12';
  observeDelays(f);
  ok(f, 'parent', 'alex', {
    type: 'late-policy',
    id,
    policy: { ...terms().latePolicy, enabled: false },
  });
  expect(penaltyUnits(loan(f, id), f.today)).toBe(0);
  expect(agreementStatus(loan(f, id), f.today)).toBe('En mora');
  expect(loan(f, id).hadOverdue).toBe(true);
  for (const taskId of loan(f, id).tasks.map((t) => t.id)) {
    const r = report(f, id, taskId);
    review(f, id, taskId, r);
  }
  expect(loan(f, id).status).toBe('completed');
  expect(agreementMetrics(f.agreements, f.today).everOverdue).toBe(1);
  expect(f.children[0].balance).toBe(185);
  expect(f.parent.balance).toBe(980);
});

test('un recargo nuevo requiere aceptación y no aplica retroactivamente', () => {
  const f = fixture();
  const id = accepted(f);
  f.today = '2026-11-12';
  const policy = { ...terms(true).latePolicy, capUnits: 20 };
  ok(f, 'parent', 'alex', { type: 'late-policy', id, policy });
  expect(penaltyUnits(loan(f, id), f.today)).toBe(0);
  ok(f, 'child', 'alex', { type: 'accept-policy', id, accept: true });
  expect(penaltyUnits(loan(f, id), f.today)).toBe(0);
  f.today = '2026-11-13';
  expect(penaltyUnits(loan(f, id), f.today)).toBe(5);
});

test('ampliar requiere aceptación, conserva las unidades ya generadas y la mora histórica', () => {
  const f = fixture();
  const id = accepted(f, {
    ...terms(true),
    latePolicy: { ...terms(true).latePolicy, unitsPerDay: 2, capUnits: 20 },
  });
  f.today = '2026-11-12';
  observeDelays(f);
  expect(penaltyUnits(loan(f, id), f.today)).toBe(6);
  ok(f, 'parent', 'alex', { type: 'extend', id, date: '2026-11-20' });
  expect(loan(f, id).dueDate).toBe('2026-11-10');
  ok(f, 'child', 'alex', { type: 'accept-extension', id, accept: true });
  expect(loan(f, id).dueDate).toBe('2026-11-20');
  expect(loan(f, id).originalDueDate).toBe('2026-11-10');
  expect(penaltyUnits(loan(f, id), f.today)).toBe(6);
  expect(loan(f, id).hadOverdue).toBe(true);
  expect(loan(f, id).renegotiations).toBe(1);
});

test('incumplir una entrega intermedia cuenta aunque termine antes del último vencimiento', () => {
  const f = fixture();
  const id = accepted(f, { ...terms(), intervalDays: 7 });
  f.today = '2026-11-10';
  let taskId = loan(f, id).tasks[0].id;
  let r = report(f, id, taskId);
  review(f, id, taskId, r);
  taskId = loan(f, id).tasks[1].id;
  r = report(f, id, taskId);
  review(f, id, taskId, r);
  const m = agreementMetrics(f.agreements, f.today);
  expect(m.onTimeRate).toBe(0);
  expect(m.late).toBe(1);
  expect(m.averageLateDays).toBe(1);
});

test('el rechazo, los importes inválidos y los plazos imposibles no crean obligaciones', () => {
  const f = fixture();
  for (const t of [
    { ...terms(), amount: -1 },
    { ...terms(), totalUnits: 0 },
    { ...terms(), unitsPerInstallment: 3 },
    { ...terms(), intervalDays: 999 },
    { ...terms(true), latePolicy: { ...terms(true).latePolicy, capUnits: 1 } },
  ]) {
    expect(send(f, 'parent', 'alex', { type: 'offer', title: 'Inválido', terms: t })).not.toBe('');
  }
  expect(f.agreements).toHaveLength(0);
  expect(agreementMetrics([], f.today).onTimeRate).toBeNull();
});
