import { computed, Injectable, signal } from '@angular/core';
import { Activity, DemoState, Goal, STORAGE_KEY, isGoalCompleted, roundMoney } from './models';

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
  readonly state = signal<DemoState>(this.restore());
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
        'El almacenamiento no está disponible o contiene datos inválidos. Puedes seguir usando la demo.'
      );
    }
    return this.preserveAchievements(initialState());
  }

  private commit(s: DemoState): void {
    this.preserveAchievements(s);
    this.state.set(s);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      this.persistenceWarning.set('Esta sesión no se podrá guardar en el navegador.');
    }
  }
  private mutate(fn: (s: DemoState) => void): void {
    const s = this.preserveAchievements(structuredClone(this.state()));
    fn(s);
    this.commit(s);
  }
  private log(s: DemoState, text: string, amount: number, kind: Activity['kind']): void {
    s.history.unshift({ id: Date.now(), text, amount, kind, date: 'Hoy' });
    s.history = s.history.slice(0, 30);
  }
  profile(value: Partial<DemoState['profile']>): void {
    this.mutate((s) => {
      s.profile = {
        ...s.profile,
        ...value,
        name: (value.name ?? s.profile.name).trim().slice(0, 24) || 'Alex',
        age: Math.max(10, Math.min(17, Math.round(value.age ?? s.profile.age))),
      };
    });
  }
  setBalance(n: number): void {
    if (Number.isFinite(n) && n >= 0 && n <= 100000)
      this.mutate((s) => {
        s.balance = roundMoney(n);
      });
  }
  setSaved(id: number, n: number): void {
    if (!Number.isFinite(n)) return;
    this.mutate((s) => {
      const g = s.goals.find((g) => g.id === id);
      if (g) {
        g.saved = roundMoney(Math.max(0, Math.min(g.target, n)));
        s.requests = s.requests.filter((r) => r.goalId !== id || r.status !== 'pending');
      }
    });
  }
  saveGoal(value: Omit<Goal, 'id' | 'saved'>, id?: number): string {
    if (
      !value.name.trim() ||
      !Number.isFinite(value.target) ||
      value.target < 1 ||
      value.target > 100000 ||
      !Number.isInteger(value.weeks) ||
      value.weeks < 1 ||
      value.weeks > 260
    )
      return 'Revisa el nombre, el monto y el plazo de tu meta.';
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
    const g = this.state().goals.find((g) => g.id === id);
    if (!g || !Number.isFinite(amount) || amount <= 0 || roundMoney(amount) !== amount)
      return 'Escribe un monto válido con hasta dos decimales.';
    if (isGoalCompleted(g)) return 'Este sueño ya está cumplido. Puedes empezar una nueva meta.';
    if (!family && amount > this.state().balance)
      return 'Tu saldo disponible no alcanza para este aporte.';
    if (amount > roundMoney(g.target - g.saved))
      return 'El aporte supera lo que falta para alcanzar la meta.';
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
    });
    return '';
  }
  withdraw(id: number, amount: number, reason: string): string {
    const g = this.state().goals.find((g) => g.id === id);
    if (
      !g ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > g.saved ||
      roundMoney(amount) !== amount
    )
      return 'El monto debe estar dentro de tu ahorro y tener hasta dos decimales.';
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
    const r = this.pending().find((r) => r.id === id);
    if (!r) return 'Esta solicitud ya fue resuelta.';
    const g = this.state().goals.find((g) => g.id === r.goalId);
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
    });
    return '';
  }
  cancelGoal(id: number): void {
    this.mutate((s) => {
      const g = s.goals.find((g) => g.id === id);
      if (!g || g.saved > 0 || isGoalCompleted(g)) return;
      s.goals = s.goals.filter((g) => g.id !== id);
      s.requests = s.requests.filter((r) => r.goalId !== id);
      this.log(s, 'Cerraste la meta ' + g.name, 0, 'achievement');
    });
  }
  completeLesson(id: string): void {
    this.mutate((s) => {
      if (!s.lessons.includes(id)) {
        s.lessons.push(id);
        this.log(s, 'Completaste una actividad de aprendizaje', 0, 'achievement');
      }
    });
  }
  praise(): void {
    this.mutate((s) => {
      s.praise = 'Me encanta verte planificar tus sueños. ¡Estoy contigo en cada paso!';
      this.log(s, 'Tu familia te envió un mensaje de ánimo', 0, 'family');
    });
  }
  scenario(key: string): void {
    const s = initialState();
    s.profile = { ...this.state().profile };
    if (key === 'start') {
      s.goals = [];
      s.history = [];
      s.balance = 100;
    }
    if (key === 'withdraw') {
      s.requests = [
        {
          id: Date.now(),
          goalId: 1,
          goalName: s.goals[0].name,
          amount: 30,
          reason: 'Necesito comprar materiales para mi proyecto del colegio.',
          status: 'pending',
        },
      ];
    }
    if (key === 'achieved') {
      s.goals[0].saved = 600;
      s.history.unshift({
        id: 4,
        text: '¡Alcanzaste tu primera meta!',
        amount: 0,
        kind: 'achievement',
        date: 'Hoy',
      });
    }
    this.commit(s);
    this.scenarioVersion.update((n) => n + 1);
  }
}
