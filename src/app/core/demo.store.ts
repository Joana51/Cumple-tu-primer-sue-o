import { computed, Injectable, signal } from '@angular/core';
import {
  Activity,
  DemoState,
  Goal,
  STORAGE_KEY,
  FAMILY_STORAGE_KEY,
  ChildAccount,
  FamilyState,
  Role,
  Agreement,
  AgreementTask,
  isGoalCompleted,
  roundMoney,
} from './models';
import { familySeed } from './family-seed';
import {
  addDays,
  agreementMetrics,
  agreementOpen,
  dayDifference,
  localToday,
  validDate,
  observeDelays,
  dateLabel,
} from './agreement-rules';
import { executeLoanCommand, LoanCommand } from './loan-engine';

export function initialState(): DemoState {
  return {
    profile: { name: 'Alex', age: 14, avatar: 'A', notifications: true, interest: 'Tecnología' },
    balance: 165,
    goals: [
      {
        id: 1,
        name: 'Mi primera tablet',
        target: 600,
        saved: 180,
        weeks: 12,
        protected: true,
        art: 'tablet',
      },
    ],
    history: [
      { id: 3, text: 'Aporte a mi tablet', amount: 30, kind: 'deposit', date: 'Hoy' },
      { id: 2, text: 'Aporte de mi familia', amount: 50, kind: 'family', date: 'Ayer' },
      { id: 1, text: 'Mi primer ahorro', amount: 100, kind: 'deposit', date: 'Esta semana' },
    ],
    requests: [],
    lessons: [],
    reward: 0,
    praise: '',
    earnedBadges: [],
  };
}

function validState(s: DemoState): boolean {
  return (
    !!s &&
    typeof s.profile?.name === 'string' &&
    s.profile.name.trim().length > 0 &&
    s.profile.name.length <= 24 &&
    Number.isInteger(s.profile.age) &&
    s.profile.age >= 10 &&
    s.profile.age <= 17 &&
    Number.isFinite(s.balance) &&
    s.balance >= 0 &&
    Array.isArray(s.goals) &&
    s.goals.every(
      (g) =>
        Number.isFinite(g.id) &&
        typeof g.name === 'string' &&
        g.name.length > 0 &&
        Number.isFinite(g.target) &&
        g.target > 0 &&
        Number.isFinite(g.saved) &&
        g.saved >= 0 &&
        g.saved <= g.target &&
        Number.isFinite(g.weeks) &&
        g.weeks > 0
    ) &&
    new Set(s.goals.map((g) => g.id)).size === s.goals.length &&
    Array.isArray(s.history) &&
    Array.isArray(s.requests) &&
    Array.isArray(s.lessons) &&
    (s.earnedBadges === undefined ||
      (Array.isArray(s.earnedBadges) && s.earnedBadges.every((b) => typeof b === 'string')))
  );
}

@Injectable({ providedIn: 'root' })
export class DemoStore {
  readonly scenarioVersion = signal(0);
  readonly persistenceWarning = signal('');
  readonly role = signal<Role>('child');
  readonly previewChildId = signal('alex');
  readonly parentChildId = signal('alex');
  readonly family = signal<FamilyState>(this.restoreFamily());
  readonly state = computed(() => this.child(this.previewChildId())!);
  readonly demoChildId = computed(() =>
    this.role() === 'parent' ? this.parentChildId() : this.previewChildId()
  );
  readonly demoChild = computed(() => this.child(this.demoChildId())!);
  readonly demoAgeBand = computed(() =>
    this.demoChild().profile.age <= 12
      ? 'junior'
      : this.demoChild().profile.age <= 15
        ? 'explorer'
        : 'teen'
  );
  readonly demoBandLabel = computed(
    () =>
      ({
        junior: 'Descubre · 10–12 años',
        explorer: 'Construye · 13–15 años',
        teen: 'Proyecta · 16–17 años',
      })[this.demoAgeBand()]
  );
  readonly childAgreements = computed(() =>
    this.family().agreements.filter((a) => a.childId === this.previewChildId())
  );
  readonly saved = computed(() =>
    this.state().goals.reduce((sum, g) => roundMoney(sum + g.saved), 0)
  );
  readonly protectedSaved = computed(() =>
    this.state()
      .goals.filter((g) => g.protected)
      .reduce((sum, g) => roundMoney(sum + g.saved), 0)
  );
  readonly ageBand = computed(() =>
    this.state().profile.age <= 12 ? 'junior' : this.state().profile.age <= 15 ? 'explorer' : 'teen'
  );
  readonly bandLabel = computed(
    () =>
      ({
        junior: 'Descubre · 10–12 años',
        explorer: 'Construye · 13–15 años',
        teen: 'Proyecta · 16–17 años',
      })[this.ageBand()]
  );
  readonly pending = computed(() => this.state().requests.filter((r) => r.status === 'pending'));
  readonly activeGoals = computed(() => this.state().goals.filter((g) => !isGoalCompleted(g)));
  readonly completedGoals = computed(() => this.state().goals.filter(isGoalCompleted));

  child(id: string): ChildAccount | undefined {
    return this.family().children.find((c) => c.id === id);
  }
  setRole(role: Role): void {
    if (role === 'parent') this.parentChildId.set(this.previewChildId());
    else this.previewChildId.set(this.parentChildId());
    this.role.set(role);
  }
  selectDemoChild(id: string): void {
    if (!this.child(id)) return;
    if (this.role() === 'parent') this.parentChildId.set(id);
    else this.previewChildId.set(id);
  }
  focusChild(id: string): void {
    if (this.role() === 'parent' && this.child(id)) this.parentChildId.set(id);
  }
  private permitted(role: Role, childId: string): boolean {
    return (
      this.role() === role &&
      !!this.child(childId) &&
      (role === 'parent' || this.previewChildId() === childId)
    );
  }
  private restoreFamily(): FamilyState {
    try {
      const raw = localStorage.getItem(FAMILY_STORAGE_KEY);
      if (raw) {
        const f = JSON.parse(raw) as FamilyState;
        if (
          f.version === 6 &&
          f.parent?.id &&
          Number.isFinite(f.parent.balance) &&
          f.parent.balance >= 0 &&
          validDate(f.today) &&
          Array.isArray(f.children) &&
          f.children.length &&
          new Set(f.children.map((c) => c.id)).size === f.children.length &&
          f.children.every((c) => c.id && validState(c)) &&
          Array.isArray(f.agreements) &&
          f.agreements.every(
            (a) =>
              f.children.some((c) => c.id === a.childId) &&
              a.parentId === f.parent.id &&
              Number.isFinite(a.amount) &&
              a.amount > 0 &&
              Array.isArray(a.tasks) &&
              Array.isArray(a.events)
          )
        ) {
          f.children.forEach((c) => this.preserveAchievements(c, true));
          return f;
        }
        this.persistenceWarning.set(
          'No pudimos recuperar la familia. Cargamos una demostración nueva.'
        );
      }
    } catch {
      this.persistenceWarning.set(
        'No se pudo recuperar la familia guardada. Puedes seguir con datos de ejemplo.'
      );
    }
    return familySeed(this.restore());
  }
  private persist(f: FamilyState): void {
    observeDelays(f);
    f.children.forEach((c) => this.preserveAchievements(c));
    this.family.set(f);
    try {
      localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(f));
    } catch {
      this.persistenceWarning.set('Esta sesión no se podrá guardar en el navegador.');
    }
  }
  configureProfile(childId: string, value: Partial<DemoState['profile']>): void {
    if (!this.child(childId)) return;
    this.mutate((s) => {
      s.profile = {
        ...s.profile,
        ...value,
        name: (value.name ?? s.profile.name).slice(0, 24) || 'Alex',
        age: Math.max(10, Math.min(17, Number(value.age ?? s.profile.age))),
      };
    }, childId);
  }
  setDemoDate(date: string): string {
    if (!validDate(date)) return 'Elige una fecha válida.';
    const latest = this.family()
      .agreements.flatMap((a) => [a.createdAt, ...a.events.map((e) => e.at)])
      .sort()
      .at(-1);
    if (latest && date < latest)
      return 'No puedes elegir una fecha anterior a una acción registrada. Carga otra historia para empezar de nuevo.';
    const f = structuredClone(this.family());
    f.today = date;
    this.persist(f);
    return '';
  }
  addChild(name: string, age: number, budget: number): string {
    if (this.role() !== 'parent') return 'Esta acción corresponde a la vista adulta.';
    if (
      !name.trim() ||
      name.trim().length > 24 ||
      !Number.isInteger(age) ||
      age < 10 ||
      age > 17 ||
      !Number.isFinite(budget) ||
      budget < 0
    )
      return 'Escribe un nombre, una edad de 10 a 17 años y un ahorro semanal entre S/ 0 y S/ 10 000.';
    if (this.family().children.length >= 6) return 'Esta demo admite hasta seis perfiles.';
    const base = initialState();
    base.profile = {
      ...base.profile,
      name: name.trim(),
      age,
      avatar: name.trim()[0].toUpperCase(),
    };
    base.goals = [];
    base.balance = 0;
    base.history = [];
    const f = structuredClone(this.family());
    f.children.push({ ...base, id: crypto.randomUUID(), weeklySavingsBudget: roundMoney(budget) });
    this.persist(f);
    return '';
  }
  setWeeklyBudget(childId: string, value: number): void {
    if (!this.permitted('parent', childId) || !Number.isFinite(value) || value < 0 || value > 10000)
      return;
    this.mutate((s) => {
      s.weeklySavingsBudget = roundMoney(value);
    }, childId);
  }
  metrics(childId: string) {
    return this.permitted('parent', childId)
      ? agreementMetrics(
          this.family().agreements.filter((a) => a.childId === childId),
          this.family().today
        )
      : null;
  }
  loanCommand(childId: string, command: LoanCommand): string {
    const f = structuredClone(this.family());
    observeDelays(f);
    const error = executeLoanCommand(f, this.role(), this.previewChildId(), childId, command);
    if (!error) this.persist(f);
    return error;
  }
  setFamilyFunds(value: number): void {
    if (!Number.isFinite(value) || value < 0 || value > 100000) return;
    const f = structuredClone(this.family());
    f.parent.balance = roundMoney(value);
    this.persist(f);
  }
  plan(childId: string) {
    const c = this.child(childId)!;
    const active = c.goals.filter((g) => !isGoalCompleted(g));
    const needed = roundMoney(active.reduce((n, g) => n + (g.target - g.saved) / g.weeks, 0));
    return {
      needed,
      capacity: c.weeklySavingsBudget,
      count: active.length,
      exceeds: needed > c.weeklySavingsBudget,
      message: !active.length
        ? 'Es un buen momento para elegir su próximo sueño.'
        : !c.weeklySavingsBudget
          ? 'Aún no hay un aporte semanal acordado. Conversen antes de fijar plazos.'
          : needed > c.weeklySavingsBudget
            ? `Sus ${active.length} metas necesitan aproximadamente S/ ${needed.toFixed(2)} por semana; acordaron S/ ${c.weeklySavingsBudget.toFixed(2)}. Prioricen una meta o amplíen los plazos.`
            : 'El plan cabe en el aporte semanal acordado. Revisen juntos si sigue siendo cómodo.',
    };
  }

  private preserveAchievements(s: DemoState, recoverLegacyHistory = false): DemoState {
    // Migrar sesiones anteriores y guardar los hitos aparte de los fondos actuales.
    for (const goal of s.goals) {
      const previousAchievement =
        recoverLegacyHistory &&
        s.goals.filter((other) => other.name === goal.name).length === 1 &&
        s.history.some(
          (h) =>
            h.kind === 'achievement' &&
            (h.text === '¡Meta alcanzada! ' + goal.name ||
              (s.goals.length === 1 && h.text === '¡Alcanzaste tu primera meta!'))
        );
      if ((goal.saved >= goal.target || previousAchievement) && !goal.completedAt)
        goal.completedAt = new Date().toISOString();
    }
    const badges = new Set(s.earnedBadges || []);
    if (s.goals.length) badges.add('first-goal');
    if (
      s.goals.some((g) => g.saved > 0) ||
      s.history.some((h) => h.amount > 0 && (h.kind === 'deposit' || h.kind === 'family'))
    )
      badges.add('first-saving');
    if (s.lessons.length) badges.add('first-lesson');
    if (s.goals.some(isGoalCompleted)) badges.add('completed-goal');
    s.earnedBadges = [...badges];
    return s;
  }

  private restore(): DemoState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (validState(s)) return this.preserveAchievements(s, true);
        this.persistenceWarning.set(
          'No pudimos recuperar la sesión. Cargamos un ejemplo; los datos anteriores siguen guardados.'
        );
      }
      // El registro anterior permanece intacto: esta migración solo copia datos.
      const raw = localStorage.getItem('primer-sueno-demo-v2');
      if (raw) {
        const old = JSON.parse(raw);
        const s = initialState();
        s.profile = {
          ...s.profile,
          ...old.profile,
          name: old.profile?.name || 'Alex',
          age: Number(old.profile?.age || 14),
        };
        s.balance = old.balance ?? 165;
        s.goals = (old.goals || []).map((g: Goal) => ({ ...g, art: g.art || 'star' }));
        s.history = (old.history || []).map((h: { msg: string; date: string }, i: number) => ({
          id: i,
          text: h.msg,
          date: h.date || 'Antes',
          amount: 0,
          kind: 'achievement',
        }));
        s.requests = (old.requests || [])
          .map(
            (r: {
              id: number;
              goalId?: number;
              goalName: string;
              amount: number;
              status: string;
            }) => ({
              ...r,
              goalId: r.goalId ?? s.goals.find((g) => g.name === r.goalName)?.id,
              reason: 'Solicitud de la demo anterior',
            })
          )
          .filter((r: { goalId?: number }) => r.goalId !== undefined);
        s.reward = Number(old.reward) || 0;
        if (validState(s)) return this.preserveAchievements(s, true);
      }
    } catch {
      this.persistenceWarning.set(
        'No pudimos abrir los datos guardados. Puedes probar la demo con los ejemplos.'
      );
    }
    return this.preserveAchievements(initialState());
  }

  private commit(s: ChildAccount, childId = this.previewChildId()): void {
    const f = structuredClone(this.family());
    const index = f.children.findIndex((c) => c.id === childId);
    if (index < 0) return;
    f.children[index] = this.preserveAchievements(s) as ChildAccount;
    this.persist(f);
  }
  private mutate(fn: (s: ChildAccount) => void, childId = this.previewChildId()): void {
    const original = this.child(childId);
    if (!original) return;
    const s = this.preserveAchievements(structuredClone(original)) as ChildAccount;
    fn(s);
    this.commit(s, childId);
  }
  private log(s: DemoState, text: string, amount: number, kind: Activity['kind']): void {
    s.history.unshift({ id: Date.now(), text, amount, kind, date: dateLabel(this.family().today) });
    s.history = s.history.slice(0, 30);
  }
  profile(value: Partial<DemoState['profile']>): void {
    if (this.role() !== 'child') return;
    this.mutate((s) => {
      s.profile = {
        ...s.profile,
        ...value,
        name: (value.name ?? s.profile.name).trim().slice(0, 24) || 'Alex',
        age: Math.max(10, Math.min(17, Math.round(value.age ?? s.profile.age))),
      };
    });
  }
  setBalance(n: number, childId = this.demoChildId()): void {
    if (Number.isFinite(n) && n >= 0 && n <= 100000)
      this.mutate((s) => {
        s.balance = roundMoney(n);
      }, childId);
  }
  setSaved(id: number, n: number, childId = this.demoChildId()): void {
    if (!Number.isFinite(n)) return;
    this.mutate((s) => {
      const g = s.goals.find((g) => g.id === id);
      if (g) {
        g.saved = roundMoney(Math.max(0, Math.min(g.target, n)));
        s.requests = s.requests.filter((r) => r.goalId !== id || r.status !== 'pending');
      }
    }, childId);
  }
  saveGoal(value: Omit<Goal, 'id' | 'saved'>, id?: number): string {
    if (this.role() !== 'child') return 'Cambia a la vista del hijo para crear una meta de ahorro.';
    if (
      !value.name.trim() ||
      !Number.isFinite(value.target) ||
      value.target < 1 ||
      value.target > 100000 ||
      !Number.isInteger(value.weeks) ||
      value.weeks < 1 ||
      value.weeks > 260
    )
      return 'Escribe un nombre, un costo entre S/ 1 y S/ 100 000 y un plazo de 1 a 260 semanas.';
    const current = this.state().goals.find((g) => g.id === id);
    if (current && isGoalCompleted(current))
      return 'Este sueño ya está cumplido. Crea una nueva meta para tu próximo objetivo.';
    if (current && value.target < current.saved)
      return 'El costo debe ser igual o mayor al dinero ya ahorrado.';
    if (
      current?.protected &&
      current.saved > 0 &&
      (!value.protected || value.target < current.target)
    )
      return 'Tu meta tiene ahorro protegido. Para reducir el costo o desactivar la protección, primero solicita el retiro y acuerda el cambio con tu familia.';
    if (current && this.pending().some((r) => r.goalId === id))
      return 'Resuelve primero la solicitud de retiro con tu familia.';
    this.mutate((s) => {
      if (current) {
        const i = s.goals.findIndex((g) => g.id === id);
        s.goals[i] = { ...current, ...value, name: value.name.trim().slice(0, 42) };
      } else {
        s.goals.push({ ...value, name: value.name.trim().slice(0, 42), id: Date.now(), saved: 0 });
        this.log(s, 'Creaste una nueva meta: ' + value.name, 0, 'achievement');
      }
    });
    return '';
  }
  deposit(id: number, amount: number, family = false): string {
    return this.depositFor(
      family ? this.parentChildId() : this.previewChildId(),
      id,
      amount,
      family
    );
  }
  depositFor(childId: string, id: number, amount: number, family = true): string {
    if (!this.permitted(family ? 'parent' : 'child', childId))
      return 'No puedes hacer esta operación desde esta vista.';
    const child = this.child(childId)!;
    const g = child.goals.find((g) => g.id === id);
    if (!g || !Number.isFinite(amount) || amount <= 0 || roundMoney(amount) !== amount)
      return 'Escribe un monto mayor que S/ 0, con hasta 2 decimales.';
    if (isGoalCompleted(g)) return 'Este sueño ya está cumplido. Puedes empezar una nueva meta.';
    if (!family && amount > child.balance)
      return 'No tienes suficiente dinero disponible. Prueba con un monto menor.';
    if (amount > roundMoney(g.target - g.saved))
      return 'El monto es mayor de lo que falta para la meta. Reduce el aporte.';
    this.mutate((s) => {
      const goal = s.goals.find((g) => g.id === id)!;
      goal.saved = roundMoney(goal.saved + amount);
      if (!family) s.balance = roundMoney(s.balance - amount);
      this.log(
        s,
        family ? 'Tu familia aportó a ' + goal.name : 'Aporte a ' + goal.name,
        amount,
        family ? 'family' : 'deposit'
      );
      if (goal.saved >= goal.target) this.log(s, '¡Meta alcanzada! ' + goal.name, 0, 'achievement');
    }, childId);
    return '';
  }
  withdraw(id: number, amount: number, reason: string): string {
    if (this.role() !== 'child') return 'Cambia a la vista del hijo para solicitar el retiro.';
    const g = this.state().goals.find((g) => g.id === id);
    if (
      !g ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > g.saved ||
      roundMoney(amount) !== amount
    )
      return 'Elige un monto mayor que S/ 0 y menor o igual a lo ahorrado. Usa hasta 2 decimales.';
    if (this.pending().some((r) => r.goalId === id))
      return 'Ya hay una solicitud pendiente para esta meta.';
    if (g.protected && !isGoalCompleted(g) && !reason.trim())
      return 'Cuéntale a tu familia por qué necesitas este retiro.';
    this.mutate((s) => {
      if (g.protected && !isGoalCompleted(g))
        s.requests.unshift({
          id: Date.now(),
          goalId: id,
          goalName: g.name,
          amount,
          reason: reason.trim().slice(0, 180),
          status: 'pending',
        });
      else {
        s.goals.find((g) => g.id === id)!.saved = roundMoney(g.saved - amount);
        s.balance = roundMoney(s.balance + amount);
        this.log(s, 'Retiro de ' + g.name, -amount, 'withdraw');
      }
    });
    return '';
  }
  resolve(id: number, approve: boolean): string {
    return this.resolveFor(this.parentChildId(), id, approve);
  }
  resolveFor(childId: string, id: number, approve: boolean): string {
    if (!this.permitted('parent', childId)) return 'Solo la vista adulta puede autorizar retiros.';
    const child = this.child(childId)!;
    const r = child.requests.find((r) => r.id === id && r.status === 'pending');
    if (!r) return 'Esta solicitud ya fue resuelta.';
    const g = child.goals.find((g) => g.id === r.goalId);
    if (approve && (!g || r.amount > g.saved))
      return 'El ahorro disponible cambió. Revisa la meta.';
    this.mutate((s) => {
      s.requests.find((r) => r.id === id)!.status = approve ? 'approved' : 'rejected';
      if (approve) {
        s.goals.find((g) => g.id === r.goalId)!.saved = roundMoney(g!.saved - r.amount);
        s.balance = roundMoney(s.balance + r.amount);
      }
      this.log(
        s,
        approve
          ? 'Tu familia autorizó el retiro de ' + r.goalName
          : 'Tu familia propone conversar sobre el retiro',
        approve ? -r.amount : 0,
        'withdraw'
      );
    }, childId);
    return '';
  }
  cancelGoal(id: number): string {
    if (this.role() !== 'child') return 'Esta acción corresponde al adolescente.';
    if (this.childAgreements().some((a) => a.goalId === id && agreementOpen(a)))
      return 'Esta meta tiene un préstamo o una solicitud pendiente. Termina o resuelve ese acuerdo antes de cerrar la meta.';
    this.mutate((s) => {
      const g = s.goals.find((g) => g.id === id);
      if (!g || g.saved > 0 || isGoalCompleted(g)) return;
      s.goals = s.goals.filter((g) => g.id !== id);
      s.requests = s.requests.filter((r) => r.goalId !== id);
      this.log(s, 'Cerraste la meta ' + g.name, 0, 'achievement');
    });
    return '';
  }
  completeLesson(id: string): void {
    if (this.role() !== 'child') return;
    this.mutate((s) => {
      if (!s.lessons.includes(id)) {
        s.lessons.push(id);
        this.log(s, 'Completaste una actividad de aprendizaje', 0, 'achievement');
      }
    });
  }
  praise(): void {
    this.praiseFor(this.parentChildId());
  }
  praiseFor(childId: string): void {
    if (!this.permitted('parent', childId)) return;
    this.mutate((s) => {
      s.praise = 'Me encanta verte planificar tus sueños. ¡Estoy contigo en cada paso!';
      this.log(s, 'Tu familia te envió un mensaje de ánimo', 0, 'family');
    }, childId);
  }
  scenario(key: string): void {
    const current = this.family();
    const f = familySeed(initialState());
    for (const child of current.children) {
      const seeded = f.children.find((c) => c.id === child.id);
      if (seeded) seeded.profile = { ...child.profile };
      else {
        const base = initialState();
        f.children.push({
          ...base,
          id: child.id,
          profile: { ...child.profile },
          balance: 0,
          goals: [],
          history: [],
          weeklySavingsBudget: child.weeklySavingsBudget,
        });
      }
    }
    const s = f.children.find((c) => c.id === this.demoChildId())!;
    if ((key === 'withdraw' || key === 'achieved') && !s.goals.length)
      s.goals = structuredClone(initialState().goals);
    if (key === 'start') {
      s.goals = [];
      s.history = [];
      s.balance = 100;
    }
    if (key === 'withdraw') {
      s.requests = [
        {
          id: Date.now(),
          goalId: s.goals[0].id,
          goalName: s.goals[0].name,
          amount: Math.min(30, s.goals[0].saved),
          reason: 'Necesito comprar materiales para mi proyecto del colegio.',
          status: 'pending',
        },
      ];
    }
    if (key === 'achieved') {
      s.goals[0].saved = s.goals[0].target;
      s.history.unshift({
        id: 4,
        text: '¡Alcanzaste tu primera meta!',
        amount: 0,
        kind: 'achievement',
        date: 'Hoy',
      });
    }
    if (key !== 'default') f.agreements = f.agreements.filter((a) => a.childId !== s.id);
    this.persist(f);
    this.scenarioVersion.update((n) => n + 1);
  }
}
