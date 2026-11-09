import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnitReport } from '../core/models';
import { dateLabel } from '../core/agreement-rules';
import { reportEvidence, reviewReminder } from '../core/evidence-rules';
import { times } from '../core/ui-copy';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="unit-report evidence-report">
      <div class="report-content">
        <strong>Actividad realizada {{ times(report().units) }}</strong>
        <span>{{ evidence(report(), today()) }}</span>
        <small
          >{{ parent() ? 'Aviso recibido el' : 'Avisaste el' }}
          {{ date(report().submittedAt) }}</small
        >
        @if (report().performedAt && report().performedAt !== report().submittedAt) {
          <small>Fecha de la actividad según el aviso: {{ date(report().performedAt) }}.</small>
        }
        @if (report().validatedAt) {
          <small
            >{{ parent() ? 'Respondiste el' : 'Tu familia respondió el' }}
            {{ date(report().validatedAt) }}</small
          >
        }
        @if (report().note) {
          <p>{{ report().note }}</p>
        }
        @if (report().status === 'rejected') {
          <p>{{ report().feedback }}</p>
        }
        @if (reminder(report(), today()); as message) {
          <p class="review-reminder">{{ message }}</p>
        }
        @if (report().dispute; as d) {
          <div class="dispute-context">
            <b>Pediste conversar el {{ date(d.openedAt) }}</b>
            <p>{{ d.reason }}</p>
            @if (d.status === 'resolved') {
              <small>Conversaron el {{ date(d.resolvedAt) }}</small>
              <p>{{ d.response }}</p>
              @if (d.resolution === 'unverifiable') {
                <p>
                  No hay información para dar la actividad por hecha ni por incumplida. El préstamo
                  sigue abierto.
                </p>
              }
            }
          </div>
        }
        @if (
          active() &&
          parent() &&
          report().status === 'submitted' &&
          report().dispute?.status !== 'open'
        ) {
          <div class="row">
            <button class="small-action" (click)="review.emit(true)">Confirmar actividad</button>
            <button class="small-action muted" (click)="review.emit(false)">
              Pedir que la revise
            </button>
          </div>
        }
        @if (active() && !parent() && report().status === 'rejected' && !report().dispute) {
          <button class="small-action muted" (click)="editing = !editing">
            Pedir que lo revisen juntos
          </button>
          @if (editing) {
            <label class="field-label" [for]="'dispute-' + report().id"
              >¿Qué te gustaría aclarar?</label
            >
            <textarea
              [id]="'dispute-' + report().id"
              [(ngModel)]="reason"
              maxlength="180"
              rows="2"
            ></textarea>
            <button
              class="secondary full"
              [disabled]="!reason.trim()"
              (click)="dispute.emit(reason)"
            >
              Enviar mi explicación
            </button>
          }
        }
        @if (
          active() &&
          parent() &&
          (report().dispute?.status === 'open' || report().dispute?.resolution === 'unverifiable')
        ) {
          <label class="field-label" [for]="'response-' + report().id"
            >¿Qué pudieron aclarar?</label
          >
          <textarea
            [id]="'response-' + report().id"
            [(ngModel)]="response"
            maxlength="180"
            rows="2"
          ></textarea>
          <button
            class="secondary full"
            [disabled]="!response.trim()"
            (click)="resolve.emit({ resolution: 'confirmed', response })"
          >
            Confirmar actividad realizada
          </button>
          @if (report().dispute?.status === 'open') {
            <button
              class="text-button"
              [disabled]="!response.trim()"
              (click)="resolve.emit({ resolution: 'unverifiable', response })"
            >
              Dejar sin confirmar
            </button>
          }
        }
        @if (report().reviews?.length) {
          <details class="report-reviews">
            <summary>Ver respuestas anteriores</summary>
            @for (r of report().reviews; track $index) {
              <p>
                {{ date(r.at) }} · {{ r.accepted ? 'Confirmación' : 'Observación' }}:
                {{ r.feedback }}
              </p>
            }
          </details>
        }
      </div>
    </div>
  `,
})
export class ReportCardComponent {
  report = input.required<UnitReport>();
  today = input.required<string>();
  parent = input(false);
  active = input(false);
  review = output<boolean>();
  dispute = output<string>();
  resolve = output<{ resolution: 'confirmed' | 'unverifiable'; response: string }>();
  editing = false;
  reason = '';
  response = '';
  date = dateLabel;
  evidence = reportEvidence;
  reminder = reviewReminder;
  times = times;
}
