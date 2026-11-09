import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  standalone: true,
  styles:
    ':host{display:inline-flex;width:48px;height:48px;flex-shrink:0}svg{width:100%;height:100%}',
  template: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect width="64" height="64" rx="18" fill="#173e72" />
    <circle cx="31" cy="12" r="6" fill="#ffd183" />
    <path d="M31 9v6" stroke="#173e72" stroke-width="2" stroke-linecap="round" />
    <path
      d="M13 35c0-8 8-12 18-12h6l7-4 1 8c2 1 4 3 5 6h4v10h-6c-2 2-4 4-6 5l-2 6h-6l-1-5h-8l-2 5h-6v-8c-3-3-4-7-4-11Z"
      fill="#ffb34c"
    />
    <path
      d="M13 34c-7 0-7-6-3-6 4 0 3 5-1 4"
      stroke="#ffb34c"
      stroke-width="3"
      stroke-linecap="round"
    />
    <path d="M26 27h9" stroke="#173e72" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="43" cy="33" r="1.8" fill="#173e72" />
    <path d="M21 34c1-3 4-4 7-4" stroke="#ffdca6" stroke-width="2.5" stroke-linecap="round" />
  </svg>`,
})
export class BrandMarkComponent {}
