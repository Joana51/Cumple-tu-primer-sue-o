import { Component, ElementRef, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DemoStore } from '../core/demo.store';
import { Agreement, LatePolicy, LoanTerms, money } from '../core/models';
import {
  addDays,
  agreementOpen,
  agreementProgress,
  agreementStatus,
  dateLabel,
  overdueDays,
  penaltyUnits,
  penaltyReported,
  penaltyValidated,
  penaltyDeadline,
  taskReports,
  taskReported,
  taskValidated,
} from '../core/agreement-rules';
import { LoanCommand, makeSchedule, termsError, policyError } from '../core/loan-engine';
import { IconComponent } from '../shared/icon.component';
import { ReportCardComponent } from './report-card.component';
import { evidenceSummary } from '../core/evidence-rules';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [FormsModule, IconComponent, ReportCardComponent],
  templateUrl: './loans.component.html',
})
export class LoansComponent {
  store = inject(DemoStore);
  host = inject(ElementRef<HTMLElement>);
  childId = input.required<string>();
  view = signal<'list' | 'request' | 'offer' | 'detail' | 'report' | 'policy' | 'extension'>(
    'list'
  );
  filter = signal('todos');
  selectedId = signal('');
  error = '';
  notice = signal('');
  step = 0;
  amount = 20;
  reason = '';
  goalId: string | number = '';
  title = '';
  accepted = false;
  reportTaskId = '';
  units = 1;
  performedAt = '';
  reportNote = '';
  feedback = 'Revisemos esta entrega juntos.';
  newDate = '';
  terms: LoanTerms = this.defaults();
  policy: LatePolicy = this.defaultPolicy();
  child = computed(() => this.store.child(this.childId())!);
  parent = computed(() => this.store.role() === 'parent');
  today = computed(() => this.store.family().today);
  loans = computed(() =>
    this.store
      .family()
      .agreements.filter((a) => a.childId === this.childId())
      .sort((a, b) => {
        const rank = {
          requested: 0,
          offered: 1,
          active: 2,
          completed: 3,
          declined: 4,
          cancelled: 5,
        };
        return rank[a.status] - rank[b.status] || b.createdAt.localeCompare(a.createdAt);
      })
  );
  selected = computed(() => this.loans().find((a) => a.id === this.selectedId()));
  open = computed(() => this.loans().some(agreementOpen));
  visible = computed(() =>
    this.loans().filter(
      (a) =>
        this.filter() === 'todos' ||
        (this.filter() === 'solicitudes' && ['requested', 'offered'].includes(a.status)) ||
        (this.filter() === 'vigentes' && a.status === 'active' && this.status(a) !== 'En mora') ||
        (this.filter() === 'mora' && this.status(a) === 'En mora') ||
        (this.filter() === 'cerrados' && a.status === 'completed')
    )
  );
  money = money;
  dateLabel = dateLabel;
  taskReports = taskReports;
  taskReported = taskReported;
  taskValidated = taskValidated;
  progress = agreementProgress;
  penaltyReported = penaltyReported;
  penaltyValidated = penaltyValidated;
  penaltyDeadline = penaltyDeadline;
  evidenceSummary = evidenceSummary;
  constructor() {
    effect(() => {
      this.childId();
      this.store.role();
      this.view.set('list');
      this.selectedId.set('');
      this.error = '';
    });
  }
  defaultPolicy(): LatePolicy {
    return { enabled: false, unitsPerDay: 1, capUnits: 10, graceDays: 0, paymentWindowDays: 7 };
  }
  defaults(): LoanTerms {
    return {
      amount: 20,
      unitLabel: 'Sesión de lectura de 15 minutos',
      totalUnits: 3,
      unitsPerInstallment: 1,
      intervalDays: 3,
      firstDueDays: 3,
      terms: 'Elegimos una actividad segura y la revisamos juntos.',
      latePolicy: this.defaultPolicy(),
    };
  }
  status(a: Agreement) {
    return agreementStatus(a, this.today());
  }
  overdue(a: Agreement) {
    return overdueDays(a, this.today());
  }
  penalty(a: Agreement) {
    return penaltyUnits(a, this.today());
  }
  get schedule() {
    return this.step > 0 &&
      !termsError({ ...this.terms, latePolicy: { ...this.terms.latePolicy, enabled: false } })
      ? makeSchedule(this.terms, this.today())
      : [];
  }
  get remaining() {
    const a = this.selected();
    if (!a) return 0;
    const task = a.tasks.find((t) => t.id === this.reportTaskId);
    return this.reportTaskId === 'penalty'
      ? Math.max(0, this.penalty(a) - penaltyReported(a))
      : task
        ? Math.max(0, (task.units ?? 1) - taskReported(task))
        : 0;
  }
  navigate(view: ReturnType<typeof this.view>) {
    this.error = '';
    this.view.set(view);
    requestAnimationFrame(() =>
      this.host.nativeElement.closest('.mobile-scroll')?.scrollTo({ top: 0 })
    );
  }
  detail(a: Agreement) {
    this.selectedId.set(a.id);
    this.accepted = false;
    this.navigate('detail');
  }
  start() {
    this.selectedId.set('');
    this.amount = 20;
    this.reason = '';
    this.goalId = '';
    this.title = 'Anticipo para mi próximo sueño';
    this.terms = this.defaults();
    this.step = 0;
    this.navigate(this.parent() ? 'offer' : 'request');
  }
  offer(a: Agreement) {
    this.selectedId.set(a.id);
    this.title = a.title;
    this.goalId = a.goalId ?? '';
    this.terms = { ...this.defaults(), amount: a.amount };
    this.step = 0;
    this.navigate('offer');
  }
  command(command: LoanCommand, success: string) {
    this.error = this.store.loanCommand(this.childId(), command);
    if (!this.error) {
      this.notice.set(success);
      return true;
    }
    return false;
  }
  request() {
    if (
      this.command(
        {
          type: 'request',
          amount: Number(this.amount),
          reason: this.reason,
          goalId: this.goalId === '' ? undefined : Number(this.goalId),
        },
        'Tu solicitud llegó a tu familia. Aún no se ha entregado dinero.'
      )
    )
      this.navigate('list');
  }
  nextOffer() {
    if (
      this.step === 0 &&
      (!this.terms.amount || this.terms.amount > this.store.family().parent.balance)
    ) {
      this.error = 'Revisa el monto y el fondo familiar disponible.';
      return;
    }
    if (this.step === 1) {
      const error = termsError({
        ...this.terms,
        latePolicy: { ...this.terms.latePolicy, enabled: false },
      });
      if (error) {
        this.error = error;
        return;
      }
    }
    if (this.step === 2) {
      const error = policyError(this.terms.latePolicy);
      if (error) {
        this.error = error;
        return;
      }
    }
    if (this.step < 3) {
      this.step++;
      this.error = '';
      return;
    }
    if (
      this.command(
        {
          type: 'offer',
          id: this.selected()?.id,
          title: this.title,
          goalId: this.goalId === '' ? undefined : Number(this.goalId),
          terms: this.terms,
        },
        'Propuesta enviada. El anticipo se entregará cuando la acepte.'
      )
    )
      this.navigate('list');
  }
  accept(yes: boolean) {
    const a = this.selected()!;
    if (
      this.command(
        { type: 'accept', id: a.id, accept: yes },
        yes
          ? '¡Acuerdo aceptado! El anticipo está en tu saldo disponible.'
          : 'Puedes conversar y pedir otra propuesta.'
      )
    )
      this.detail(this.loans().find((x) => x.id === a.id)!);
  }
  decline() {
    const a = this.selected()!;
    if (
      this.command(
        { type: 'decline', id: a.id, reason: 'Conversemos un plan más cómodo antes de continuar.' },
        'Solicitud atendida. No se entregó dinero.'
      )
    )
      this.navigate('list');
  }
  report(taskId: string) {
    this.reportTaskId = taskId;
    this.units = Math.max(1, this.remaining);
    this.performedAt = this.today();
    this.reportNote = '';
    this.navigate('report');
  }
  sendReport() {
    if (
      this.command(
        {
          type: 'report',
          id: this.selectedId(),
          taskId: this.reportTaskId,
          units: Number(this.units),
          performedAt: this.performedAt,
          note: this.reportNote,
        },
        'Entrega registrada. Tu familia podrá revisarla.'
      )
    )
      this.navigate('detail');
  }
  review(taskId: string, reportId: string, yes: boolean) {
    this.command(
      {
        type: 'review',
        id: this.selectedId(),
        taskId,
        reportId,
        accept: yes,
        feedback: this.feedback,
      },
      yes ? 'Entrega confirmada.' : 'Se envió una observación para revisar juntos.'
    );
  }
  dispute(taskId: string, reportId: string, reason: string) {
    this.command(
      { type: 'dispute', id: this.selectedId(), taskId, reportId, reason },
      'Revisión solicitada. Se conserva tu reporte original.'
    );
  }
  resolveDispute(
    taskId: string,
    reportId: string,
    result: { resolution: 'confirmed' | 'unverifiable'; response: string }
  ) {
    this.command(
      { type: 'resolve-dispute', id: this.selectedId(), taskId, reportId, ...result },
      result.resolution === 'confirmed'
        ? 'Entrega confirmada tras conversar.'
        : 'Sin conclusión verificable: no se atribuye éxito ni fracaso externo.'
    );
  }
  extension() {
    const a = this.selected()!;
    this.newDate = [addDays(this.today(), 7), addDays(a.dueDate!, 7)].sort().at(-1)!;
    this.navigate('extension');
  }
  proposeExtension() {
    if (
      this.command(
        { type: 'extend', id: this.selectedId(), date: this.newDate },
        'Ampliación propuesta. El plazo actual sigue vigente hasta que la acepte.'
      )
    )
      this.navigate('detail');
  }
  acceptExtension(yes: boolean) {
    this.command(
      { type: 'accept-extension', id: this.selectedId(), accept: yes },
      yes ? 'Nuevo plazo aceptado.' : 'Conservas el plazo vigente.'
    );
  }
  editPolicy() {
    this.policy = { ...this.defaultPolicy(), ...this.selected()?.latePolicy, enabled: true };
    this.navigate('policy');
  }
  savePolicy() {
    if (
      this.command(
        { type: 'late-policy', id: this.selectedId(), policy: this.policy },
        this.policy.enabled
          ? 'Propuesta enviada. Empezará al día siguiente de su aceptación, sin cobro retroactivo.'
          : 'Unidades adicionales desactivadas.'
      )
    )
      this.navigate('detail');
  }
  disablePolicy() {
    this.command(
      {
        type: 'late-policy',
        id: this.selectedId(),
        policy: { ...this.selected()!.latePolicy!, enabled: false },
      },
      'Recargo desactivado. El retraso se conserva en el registro.'
    );
  }
  acceptPolicy(yes: boolean) {
    this.command(
      { type: 'accept-policy', id: this.selectedId(), accept: yes },
      yes
        ? 'Condiciones aceptadas. Las nuevas unidades se cuentan desde mañana.'
        : 'Conservas las condiciones anteriores.'
    );
  }
}
