import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DemoStore } from '../core/demo.store';
import { ChildAccount, Goal, ParentPage, money, progress, isGoalCompleted } from '../core/models';
import { dateLabel, agreementStatus } from '../core/agreement-rules';
import { IconComponent } from '../shared/icon.component';
import { PhoneStatusComponent } from '../shared/phone-status.component';
import { DemoNoticeComponent } from '../shared/demo-notice.component';
import { ActionSheetComponent } from '../shared/action-sheet.component';
import { LoansComponent } from '../loans/loans.component';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [
    FormsModule,
    IconComponent,
    PhoneStatusComponent,
    DemoNoticeComponent,
    ActionSheetComponent,
    LoansComponent,
  ],
  templateUrl: './parent.component.html',
})
export class ParentComponent {
  store = inject(DemoStore);
  page = input<ParentPage>('home');
  pageChange = output<ParentPage>();
  scroll = viewChild<ElementRef<HTMLElement>>('scroll');
  sheet = signal<'' | 'add' | 'contribute' | 'goal'>('');
  notice = signal('');
  error = '';
  name = '';
  age = 12;
  budget = 15;
  amount = 10;
  goalId = 0;
  dialogChildId = '';
  selectedGoalId = 0;
  money = money;
  progress = progress;
  dateLabel = dateLabel;
  completed = isGoalCompleted;
  storeGoalActive = (g: Goal) => !isGoalCompleted(g);
  child = computed(() => this.store.child(this.store.parentChildId())!);
  pending = computed(() =>
    this.store
      .family()
      .children.flatMap((c) =>
        c.requests
          .filter((r) => r.status === 'pending')
          .map((r) => ({ childId: c.id, name: c.profile.name, request: r }))
      )
  );
  totalSaved = computed(() => this.store.family().children.reduce((n, c) => n + this.saved(c), 0));
  loanAlerts = computed(() =>
    this.store
      .family()
      .agreements.filter(
        (a) =>
          a.status === 'requested' ||
          a.status === 'offered' ||
          agreementStatus(a, this.store.family().today) === 'Con retraso'
      )
  );
  history = computed(() =>
    this.store
      .family()
      .children.flatMap((c) =>
        c.history.map((h) => ({ ...h, childId: c.id, childName: c.profile.name }))
      )
      .sort((a, b) => b.id - a.id)
      .slice(0, 20)
  );
  get title() {
    return {
      home: 'Mi familia',
      children: 'Mis hijos',
      detail: 'Metas y avances de ' + this.child().profile.name,
      agreements: 'Préstamos familiares',
      activity: 'Movimientos de la familia',
    }[this.page()];
  }
  get dialogChild() {
    return this.store.child(this.dialogChildId);
  }
  get selectedGoal() {
    return this.dialogChild?.goals.find((g) => g.id === this.selectedGoalId);
  }
  nav: { page: ParentPage; icon: string; label: string }[] = [
    { page: 'home', icon: 'home', label: 'Resumen' },
    { page: 'children', icon: 'user', label: 'Hijos' },
    { page: 'agreements', icon: 'wallet', label: 'Préstamos' },
    { page: 'activity', icon: 'clock', label: 'Actividad' },
  ];
  constructor() {
    effect(() => {
      this.page();
      this.store.parentChildId();
      this.sheet.set('');
      this.scroll()?.nativeElement.scrollTo({ top: 0 });
    });
  }
  saved(c: ChildAccount) {
    return c.goals.reduce((n, g) => n + g.saved, 0);
  }
  go(page: ParentPage) {
    this.sheet.set('');
    this.pageChange.emit(page);
  }
  detail(id: string) {
    this.store.focusChild(id);
    this.go('detail');
  }
  loans(id: string) {
    this.store.focusChild(id);
    this.go('agreements');
  }
  add() {
    this.name = '';
    this.age = 12;
    this.budget = 15;
    this.error = '';
    this.sheet.set('add');
  }
  saveChild() {
    this.error = this.store.addChild(this.name, this.age, this.budget);
    if (!this.error) {
      this.sheet.set('');
      this.notice.set('Hijo o hija añadido. Ya puedes ver sus metas.');
    }
  }
  contribute() {
    this.dialogChildId = this.child().id;
    this.goalId = this.child().goals.find((g) => !isGoalCompleted(g))?.id ?? 0;
    this.amount = 10;
    this.error = '';
    this.sheet.set('contribute');
  }
  sendContribution() {
    this.error = this.store.depositFor(this.dialogChildId, this.goalId, Number(this.amount), true);
    if (!this.error) {
      this.sheet.set('');
      this.notice.set('Aporte añadido a la meta seleccionada.');
    }
  }
  goal(g: Goal) {
    this.dialogChildId = this.child().id;
    this.selectedGoalId = g.id;
    this.sheet.set('goal');
  }
  resolve(childId: string, id: number, yes: boolean) {
    const error = this.store.resolveFor(childId, id, yes);
    this.notice.set(
      error ||
        (yes
          ? 'Retiro autorizado. El dinero pasó al saldo de tu hijo.'
          : 'Retiro no autorizado. El ahorro sigue en la meta.')
    );
  }
  praise() {
    this.store.praiseFor(this.child().id);
    this.notice.set('Mensaje enviado a ' + this.child().profile.name + '.');
  }
}
