import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DemoStore } from './core/demo.store';
import { Page, ParentPage, Role, money } from './core/models';
import { addDays } from './core/agreement-rules';
import { IconComponent } from './shared/icon.component';
import { MobileComponent } from './mobile/mobile.component';
import { ParentComponent } from './parent/parent.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, IconComponent, MobileComponent, ParentComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  store = inject(DemoStore);
  page = signal<Page>('inicio');
  parentPage = signal<ParentPage>('home');
  panelMessage = signal('');
  switchRole(role: Role) {
    this.store.setRole(role);
    this.page.set('inicio');
    this.parentPage.set('home');
  }
  showFeature(page: Page) {
    if (this.store.role() === 'child') this.page.set(page);
    else this.parentPage.set(page === 'familia' ? 'children' : 'detail');
  }
  advanceDate(days: number) {
    this.panelMessage.set(this.store.setDemoDate(addDays(this.store.family().today, days)));
  }
  changeDate(date: string) {
    this.panelMessage.set(this.store.setDemoDate(date));
  }
  presentation = signal(false);
  panelOpen = signal(false);
  panelTab = signal<'profile' | 'scenarios'>('profile');
  scenarioConfirm = '';
  money = money;
  private viewport = signal({ width: window.innerWidth, height: window.innerHeight });
  phoneScale = computed(() => {
    const { width, height } = this.viewport();
    if (width <= 650) return 1;
    // Ampliar también la interfaz, no solo el marco o el ancho disponible.
    const surroundingWidth = this.presentation() ? 32 : width > 1150 ? 640 : 350;
    const surroundingHeight = this.presentation() ? 32 : 100;
    return Math.min(1.6, (height - surroundingHeight) / 700, (width - surroundingWidth) / 390);
  });
  @HostListener('window:resize') onResize() {
    this.viewport.set({ width: window.innerWidth, height: window.innerHeight });
  }
  scenarios = [
    {
      id: 'default',
      icon: 'home',
      title: 'Un sueño en marcha',
      text: 'Tablet al 30% y S/ 165 disponibles.',
      page: 'inicio' as Page,
    },
    {
      id: 'start',
      icon: 'spark',
      title: 'Mi primer sueño',
      text: 'Una cuenta lista para crear su primera meta.',
      page: 'suenos' as Page,
    },
    {
      id: 'withdraw',
      icon: 'shield',
      title: 'Un imprevisto, en familia',
      text: 'Un retiro pendiente de autorización familiar.',
      page: 'familia' as Page,
    },
    {
      id: 'achieved',
      icon: 'trophy',
      title: '¡Lo logré!',
      text: 'La meta al 100%. Un logro para celebrar.',
      page: 'inicio' as Page,
    },
  ];
  changeNumber(kind: 'balance' | 'saved', value: string): void {
    if (value.trim() === '') return;
    const n = Number(value);
    if (kind === 'balance') this.store.setBalance(n);
    else {
      const g = this.store.demoChild().goals[0];
      if (g) this.store.setSaved(g.id, n);
    }
  }
  loadScenario(key: string): void {
    this.store.scenario(key);
    this.page.set(this.scenarios.find((s) => s.id === key)?.page || 'inicio');
    this.scenarioConfirm = '';
  }
  togglePresentation(): void {
    this.presentation.update((v) => !v);
    this.panelOpen.set(false);
  }
}
