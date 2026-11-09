import { Component } from '@angular/core';
import { BrandMarkComponent } from './brand-mark.component';
@Component({
  selector: 'app-demo-notice',
  standalone: true,
  imports: [BrandMarkComponent],
  styles: ':host{display:contents}',
  template: `<aside class="independence-notice" aria-label="Aviso de independencia del prototipo">
    <app-brand-mark /><strong>Mi primer sueño · Demo independiente</strong>
  </aside>`,
})
export class DemoNoticeComponent {}
