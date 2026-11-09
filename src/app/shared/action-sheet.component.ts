import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';
import { IconComponent } from './icon.component';
@Component({
  selector: 'app-action-sheet',
  standalone: true,
  imports: [IconComponent],
  styles: ':host{display:contents}',
  template: `<div class="sheet-backdrop" (click)="closed.emit()"></div>
    <section
      class="app-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-sheet-title"
      #dialog
      tabindex="-1"
      (keydown)="keyboard($event)"
    >
      <div class="sheet-grabber" aria-hidden="true"></div>
      <header class="sheet-header">
        <h2 id="action-sheet-title">{{ title() }}</h2>
        <button
          type="button"
          class="icon-button"
          aria-label="Cerrar ventana"
          (click)="closed.emit()"
        >
          <app-icon name="close" />
        </button>
      </header>
      <div class="sheet-content"><ng-content /></div>
    </section>`,
})
export class ActionSheetComponent {
  title = input.required<string>();
  closed = output<void>();
  dialog = viewChild<ElementRef<HTMLElement>>('dialog');
  lastFocus = document.activeElement as HTMLElement;
  constructor() {
    effect(() => this.dialog()?.nativeElement.focus());
  }
  ngOnDestroy() {
    if (this.lastFocus?.isConnected) this.lastFocus.focus();
  }
  keyboard(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.closed.emit();
    }
    if (e.key !== 'Tab') return;
    const elements = this.dialog()?.nativeElement.querySelectorAll<HTMLElement>(
      'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]'
    );
    if (!elements?.length) return;
    const first = elements[0],
      last = elements[elements.length - 1];
    if (
      e.shiftKey &&
      (document.activeElement === first || document.activeElement === this.dialog()?.nativeElement)
    ) {
      e.preventDefault();
      last.focus();
    } else if (
      !e.shiftKey &&
      (document.activeElement === last || document.activeElement === this.dialog()?.nativeElement)
    ) {
      e.preventDefault();
      first.focus();
    }
  }
}
