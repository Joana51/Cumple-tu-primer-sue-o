import { Component } from '@angular/core';
import { IconComponent } from './icon.component';
@Component({
  selector: 'app-demo-notice',
  standalone: true,
  imports: [IconComponent],
  styles: ':host{display:contents}',
  template: `<aside class="independence-notice" aria-label="Aviso de independencia del prototipo">
    <app-icon name="info" /><strong>Mi primer sueño · Demo independiente</strong>
  </aside>`,
})
export class DemoNoticeComponent {}
