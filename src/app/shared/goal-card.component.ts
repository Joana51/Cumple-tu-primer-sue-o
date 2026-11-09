import { Component, input, output } from '@angular/core';
import { Goal, money, progress, isGoalCompleted } from '../core/models';
import { IconComponent } from './icon.component';
import { DreamArtComponent } from './dream-art.component';
@Component({
  selector: 'app-goal-card',
  standalone: true,
  imports: [IconComponent, DreamArtComponent],
  template: ` <article class="goal-card">
    <div class="goal-visual" [class.completed]="completed(goal())">
      <span class="pill" [class.green]="completed(goal())"
        ><app-icon [name]="completed(goal()) ? 'check' : goal().protected ? 'shield' : 'star'" />{{
          completed(goal())
            ? '¡Sueño cumplido!'
            : goal().protected
              ? 'Ahorro protegido'
              : 'Meta flexible'
        }}</span
      >
      <app-dream-art [kind]="goal().art" [label]="goal().name" />
      <span class="goal-visual-note">{{
        completed(goal()) ? 'UN LOGRO PARA RECORDAR' : 'UN PASO MÁS CERCA'
      }}</span>
    </div>
    <div class="goal-body">
      <div class="row">
        <h3>{{ goal().name }}</h3>
        <button
          class="icon-button compact"
          (click)="details.emit(goal())"
          [attr.aria-label]="'Ver detalle de ' + goal().name"
        >
          <app-icon name="chevron" />
        </button>
      </div>
      <div class="goal-numbers">
        <strong>{{ money(completed(goal()) ? goal().target : goal().saved) }}</strong
        ><span>{{ completed(goal()) ? 'meta cumplida' : 'de ' + money(goal().target) }}</span
        ><b>{{ progress(goal()) }}%</b>
      </div>
      <div
        class="progress-track"
        role="progressbar"
        [attr.aria-valuenow]="progress(goal())"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-label]="'Avance de ' + goal().name"
      >
        <span [style.width.%]="progress(goal())"></span>
      </div>
      <p class="goal-caption">
        {{
          completed(goal())
            ? goal().saved > 0
              ? 'Aún reservado para tu sueño: ' + money(goal().saved)
              : 'Tu ahorro ya está disponible para usar. El logro es tuyo.'
            : 'Te faltan ' + money(goal().target - goal().saved) + '. A tu ritmo, tú puedes.'
        }}
      </p>
      <button
        class="primary full"
        (click)="completed(goal()) ? details.emit(goal()) : deposit.emit(goal())"
      >
        <app-icon [name]="completed(goal()) ? 'trophy' : 'plus'" />{{
          completed(goal())
            ? goal().saved > 0
              ? 'Celebrar mi logro'
              : 'Ver mi logro'
            : 'Agregar a mi sueño'
        }}
      </button>
    </div>
  </article>`,
})
export class GoalCardComponent {
  goal = input.required<Goal>();
  deposit = output<Goal>();
  details = output<Goal>();
  money = money;
  progress = progress;
  completed = isGoalCompleted;
}
