import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DemoStore } from './core/demo.store';
import { Page, ParentPage, Role, money } from './core/models';
import { addDays, dateLabel } from './core/agreement-rules';
import { IconComponent } from './shared/icon.component';
import { MobileComponent } from './mobile/mobile.component';
import { ParentComponent } from './parent/parent.component';
import { BrandMarkComponent } from './shared/brand-mark.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, IconComponent, MobileComponent, ParentComponent, BrandMarkComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  store = inject(DemoStore);
  page = signal<Page>('inicio');
  parentPage = signal<ParentPage>('home');
  panelMessage = signal('');
  firstStep = computed(() =>
    this.store.role() === 'parent'
      ? 'En el teléfono puedes ver las metas de tus hijos y responder a sus solicitudes.'
      : 'En el teléfono puedes crear metas, agregar ahorro y pedir un préstamo familiar.'
  );
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
  presentation = signal(false);
  panelOpen = signal(false);
  demoPanel = viewChild<ElementRef<HTMLElement>>('demoPanel');
  private controlFocus?: HTMLElement;
  openPanel() {
    this.controlFocus = document.activeElement as HTMLElement;
    this.panelOpen.set(true);
    requestAnimationFrame(() => {
      this.demoPanel()?.nativeElement.scrollTo({ top: 0 });
      if (this.viewport().width <= 650)
        this.demoPanel()
          ?.nativeElement.querySelector<HTMLButtonElement>('.panel-close')
          ?.focus({ preventScroll: true });
    });
  }
  closePanel() {
    const wasOpen = this.panelOpen();
    this.panelOpen.set(false);
    if (wasOpen && this.controlFocus?.isConnected) this.controlFocus.focus({ preventScroll: true });
  }
  @HostListener('document:keydown.escape') closePanelOnEscape() {
    if (this.panelOpen()) this.closePanel();
  }
  scenarioConfirm = '';
  money = money;
  dateLabel = dateLabel;
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
      title: 'Probar el ahorro',
      text: 'Una meta empezada y dinero para seguir ahorrando.',
      page: 'inicio' as Page,
    },
    {
      id: 'withdraw',
      icon: 'shield',
      title: 'Pedir un retiro',
      text: 'Un hijo espera autorización para usar parte de su ahorro.',
      page: 'familia' as Page,
    },
    {
      id: 'achieved',
      icon: 'trophy',
      title: 'Ver una meta cumplida',
      text: 'El ahorro ya alcanza para conseguir la meta.',
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
    this.store.setRole('child');
    this.page.set(this.scenarios.find((s) => s.id === key)?.page || 'inicio');
    this.parentPage.set('home');
    this.scenarioConfirm = '';
    this.panelMessage.set('');
    this.closePanel();
  }
  togglePresentation(): void {
    this.presentation.update((v) => !v);
    this.panelOpen.set(false);
  }
}
