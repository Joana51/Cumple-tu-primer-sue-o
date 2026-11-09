import {
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoStore } from '../core/demo.store';
import { Art, Goal, Page, money, progress, roundMoney, isGoalCompleted } from '../core/models';
import { Lesson, getLessons } from '../core/lessons';
import { IconComponent } from '../shared/icon.component';
import { GoalCardComponent } from '../shared/goal-card.component';
import { DreamArtComponent } from '../shared/dream-art.component';
import { PhoneStatusComponent } from '../shared/phone-status.component';
import { DemoNoticeComponent } from '../shared/demo-notice.component';
import { LoansComponent } from '../loans/loans.component';

type Modal =
  | ''
  | 'create'
  | 'detail'
  | 'deposit'
  | 'withdraw'
  | 'family-deposit'
  | 'lesson'
  | 'notifications'
  | 'summary'
  | 'cancel';
@Component({
  selector: 'app-mobile',
  standalone: true,
  imports: [
    FormsModule,
    NgTemplateOutlet,
    IconComponent,
    GoalCardComponent,
    DreamArtComponent,
    PhoneStatusComponent,
    DemoNoticeComponent,
    LoansComponent,
  ],
  templateUrl: './mobile.component.html',
})
export class MobileComponent {
  store = inject(DemoStore);
  page = input<Page>('inicio');
  pageChange = output<Page>();
  scroll = viewChild<ElementRef<HTMLElement>>('scroll');
  sheet = viewChild<ElementRef<HTMLElement>>('sheet');
  modal = signal<Modal>('');
  selectedId = 0;
  editingId?: number;
  toast = signal('');
  error = '';
  toastTimer?: ReturnType<typeof setTimeout>;
  private lastFocus?: HTMLElement;
  money = money;
  progress = progress;
  Math = Math;
  round = roundMoney;
  showBalance = true;
  learnTab: 'lessons' | 'achievements' = 'lessons';
  ages = [10, 11, 12, 13, 14, 15, 16, 17];
  incomplete = (g: Goal) => !isGoalCompleted(g);
  completed = isGoalCompleted;
  get featuredGoal() {
    return this.store.activeGoals()[0] || this.store.completedGoals()[0];
  }
  form = { name: '', target: 600, weeks: 12, protected: true, art: 'tablet' as Art };
  amount = 20;
  reason = '';
  lesson: Lesson = getLessons('explorer')[0];
  choice = -1;
  answered = false;
  profileName = '';
  profileAge = 14;
  profileAvatar = 'A';
  nav: { page: Page; icon: string; label: string }[] = [
    { page: 'inicio', icon: 'home', label: 'Inicio' },
    { page: 'suenos', icon: 'star', label: 'Sueños' },
    { page: 'acuerdos', icon: 'wallet', label: 'Préstamos' },
    { page: 'aprende', icon: 'book', label: 'Aprende' },
    { page: 'familia', icon: 'heart', label: 'Familia' },
  ];
  artChoices: { art: Art; name: string }[] = [
    { art: 'tablet', name: 'Tablet' },
    { art: 'bike', name: 'Bicicleta' },
    { art: 'headphones', name: 'Audífonos' },
    { art: 'trip', name: 'Viaje' },
    { art: 'star', name: 'Otra meta' },
  ];
  constructor() {
    effect(() => {
      this.page();
      this.store.previewChildId();
      untracked(() => {
        this.modal.set('');
        this.scroll()?.nativeElement.scrollTo({ top: 0 });
        this.syncProfile();
      });
    });
    // Cambiar de edad también cambia las preguntas y cierra una actividad en curso.
    effect(() => {
      this.store.ageBand();
      untracked(() => {
        if (this.modal() === 'lesson') this.close();
      });
    });
    effect(() => {
      this.store.scenarioVersion();
      untracked(() => this.close());
    });
  }
  get state() {
    return this.store.state();
  }
  get selected() {
    return this.state.goals.find((g) => g.id === this.selectedId);
  }
  get lessons() {
    return getLessons(this.store.ageBand());
  }
  get pageTitle() {
    return {
      inicio: 'Tu dinero y tus metas',
      suenos: 'Mis sueños',
      protegido: 'Mi ahorro protegido',
      aprende: 'Aprende a tu ritmo',
      familia: 'Mi familia',
      perfil: 'Mi perfil',
      acuerdos: 'Mis préstamos familiares',
    }[this.page()];
  }
  get modalTitle() {
    return {
      '': '',
      create: this.editingId ? 'Editar meta de ahorro' : 'Crear meta de ahorro',
      detail: 'Detalle de mi meta',
      deposit: 'Agregar ahorro',
      withdraw: 'Retirar ahorro',
      'family-deposit': 'Acompañar su sueño',
      lesson: 'Aprende con tus decisiones',
      notifications: 'Tus novedades',
      summary: 'Avances en familia',
      cancel: 'Cerrar meta de ahorro',
    }[this.modal()];
  }
  hasPending(id: number) {
    return this.store.pending().some((r) => r.goalId === id);
  }
  retryLesson() {
    this.answered = false;
    this.choice = -1;
  }
  adjustFamilyAmount() {
    this.amount = Math.min(
      20,
      this.selected ? roundMoney(this.selected.target - this.selected.saved) : 0
    );
  }
  get monthlyContributions() {
    return roundMoney(
      this.state.history
        .filter((h) => (h.kind === 'deposit' || h.kind === 'family') && h.amount > 0)
        .reduce((n, h) => n + h.amount, 0)
    );
  }
  get badges() {
    return [
      {
        icon: 'star',
        title: 'Mi primera meta',
        done: this.state.earnedBadges.includes('first-goal'),
      },
      {
        icon: 'shield',
        title: 'Mi primer ahorro',
        done: this.state.earnedBadges.includes('first-saving'),
      },
      {
        icon: 'book',
        title: 'Mi primera actividad',
        done: this.state.earnedBadges.includes('first-lesson'),
      },
      {
        icon: 'trophy',
        title: 'Un sueño cumplido',
        done: this.state.earnedBadges.includes('completed-goal'),
      },
    ];
  }
  go(page: Page): void {
    this.close();
    this.pageChange.emit(page);
  }
  syncProfile(): void {
    this.profileName = this.state.profile.name;
    this.profileAge = this.state.profile.age;
    this.profileAvatar = this.state.profile.avatar;
  }
  notify(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 4000);
  }
  open(type: Modal, goal?: Goal): void {
    this.lastFocus = document.activeElement as HTMLElement;
    this.error = '';
    this.selectedId = goal?.id ?? this.state.goals[0]?.id ?? 0;
    if (type === 'family-deposit') this.selectedId = this.store.activeGoals()[0]?.id ?? 0;
    if (type === 'create') {
      this.editingId = undefined;
      this.form = { name: '', target: 600, weeks: 12, protected: true, art: 'tablet' };
    }
    if (type === 'deposit' || type === 'family-deposit')
      this.amount = Math.min(
        20,
        this.selected ? roundMoney(this.selected.target - this.selected.saved) : 0,
        type === 'deposit' ? this.state.balance : Infinity
      );
    if (type === 'withdraw') {
      this.amount = Math.min(30, this.selected?.saved ?? 0);
      this.reason = '';
    }
    this.modal.set(type);
    setTimeout(() => this.sheet()?.nativeElement.focus());
  }
  close(): void {
    this.modal.set('');
    this.error = '';
    setTimeout(() => this.lastFocus?.isConnected && this.lastFocus.focus());
  }
  editGoal(g: Goal): void {
    this.open('create', g);
    this.editingId = g.id;
    this.form = {
      name: g.name,
      target: g.target,
      weeks: g.weeks,
      protected: g.protected,
      art: g.art,
    };
  }
  chooseArt(choice: { art: Art; name: string }): void {
    this.form.art = choice.art;
    if (!this.editingId)
      this.form.name =
        choice.art === 'star'
          ? ''
          : 'Mi ' + (choice.art === 'headphones' ? 'par de audífonos' : choice.name.toLowerCase());
  }
  saveGoal(): void {
    this.error = this.store.saveGoal(this.form, this.editingId);
    if (!this.error) {
      this.close();
      this.go('suenos');
      this.notify(
        this.editingId ? 'Cambios de la meta guardados.' : 'Meta creada. Ya puedes agregar ahorro.'
      );
    }
  }
  deposit(): void {
    this.error = this.store.deposit(
      this.selectedId,
      Number(this.amount),
      this.modal() === 'family-deposit'
    );
    if (!this.error) {
      const done = this.selected && this.selected.saved >= this.selected.target;
      this.close();
      this.notify(done ? '¡Lo lograste! Tu sueño está al 100%.' : 'Ahorro añadido a tu meta.');
    }
  }
  withdraw(): void {
    const pending = this.selected?.protected && !isGoalCompleted(this.selected);
    this.error = this.store.withdraw(this.selectedId, Number(this.amount), this.reason);
    if (!this.error) {
      this.close();
      this.notify(
        pending
          ? 'Solicitud enviada. Tu ahorro sigue protegido.'
          : 'El dinero volvió a tu saldo disponible.'
      );
    }
  }
  resolve(id: number, yes: boolean): void {
    const error = this.store.resolve(id, yes);
    this.notify(
      error ||
        (yes
          ? 'Retiro autorizado. El dinero ya está disponible para gastar.'
          : 'Tu familia no autorizó el retiro. El ahorro sigue en la meta; pueden conversar y enviar otra solicitud.')
    );
  }
  startLesson(lesson: Lesson): void {
    this.lesson = lesson;
    this.choice = -1;
    this.answered = false;
    this.open('lesson');
  }
  answer(): void {
    if (this.choice < 0) return;
    this.answered = true;
    if (this.choice === this.lesson.answer) this.store.completeLesson(this.lesson.id);
  }
  saveProfile(): void {
    if (!this.profileName.trim()) return;
    this.store.profile({
      name: this.profileName,
      age: Number(this.profileAge),
      avatar: this.profileAvatar,
    });
    this.notify('Cambios de perfil guardados.');
  }
  cancelSelectedGoal(): void {
    if (!this.selected) return;
    this.error = this.store.cancelGoal(this.selected.id);
    if (!this.error) {
      this.close();
      this.notify('Meta cerrada. Puedes elegir un nuevo sueño.');
    }
  }
  keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
    if (event.key === 'Tab') {
      const items = this.sheet()?.nativeElement.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select, textarea, [tabindex="0"]'
      );
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === this.sheet()?.nativeElement)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === this.sheet()?.nativeElement)
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  get weeklySuggestion() {
    return this.form.target > 0 && this.form.weeks > 0
      ? Math.ceil((this.form.target / this.form.weeks) * 100) / 100
      : 0;
  }
}
