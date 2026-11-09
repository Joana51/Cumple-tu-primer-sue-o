import { Component, input } from '@angular/core';

const paths: Record<string, string> = {
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  star: 'm12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9Z',
  shield: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6ZM8.5 12l2.5 2.5 4.5-5',
  book: 'M12 5v16M3 4h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  close: 'm6 6 12 12M6 18 18 6',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Zm7 4v3',
  check: 'm5 12 4 4L19 6',
  wallet: 'M20 7H4V4h14v3M3 7h18v14H3Zm18 5h-6v4h6',
  trophy: 'M8 3h8v8a4 4 0 0 1-8 0ZM8 5H3v4a4 4 0 0 0 5 4m8-8h5v4a4 4 0 0 1-5 4m-4 2v6m-5 0h10',
  sliders: 'M4 7h16M4 17h16M8 4v6m8 4v6',
  reset: 'M3 10a9 9 0 1 1 1 7M3 3v7h7',
  expand: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9-5v5l3 2',
  info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9-1v6m0-10h.01',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  edit: 'm14 5 5 5M3 21l5-1L21 7l-5-5L3 15Z',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
  down: 'M12 4v16m-6-6 6 6 6-6',
};
@Component({
  selector: 'app-icon',
  standalone: true,
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path" /></svg>',
  styles:
    ':host{display:inline-flex;width:22px;height:22px;flex-shrink:0;vertical-align:middle}svg{width:100%;height:100%}',
})
export class IconComponent {
  name = input('star');
  get path() {
    return paths[this.name()] || paths['star'];
  }
}
