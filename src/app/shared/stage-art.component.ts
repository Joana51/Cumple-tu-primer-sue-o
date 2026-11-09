import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stage-art',
  standalone: true,
  styles: ':host{display:block;pointer-events:none}svg{display:block;width:100%;height:100%}',
  template: `<svg
    viewBox="0 0 200 120"
    fill="none"
    aria-hidden="true"
    focusable="false"
    [attr.data-stage]="band()"
  >
    @switch (band()) {
      @case ('junior') {
        <circle cx="149" cy="32" r="28" fill="var(--motif-a, #ffd277)" />
        <path d="M46 20h42v42A42 42 0 0 1 46 20Z" fill="var(--motif-b, #ff9b83)" />
        <rect x="102" y="70" width="43" height="43" rx="14" fill="var(--motif-c, #91b7ee)" />
        <path
          d="M20 96c30-36 35-2 60-22s42-18 63-25"
          stroke="currentColor"
          stroke-width="3"
          stroke-dasharray="2 8"
          stroke-linecap="round"
        />
        <circle cx="25" cy="91" r="6" fill="currentColor" />
        <circle cx="76" cy="76" r="6" fill="currentColor" />
      }
      @case ('explorer') {
        <path d="m33 24 75-19-20 61-75 19 20-61Z" fill="var(--motif-a, #a5b6ff)" />
        <path d="m92 41 72-19-19 61-72 19 19-61Z" stroke="currentColor" stroke-width="3" />
        <path d="m143 72 39-10-10 32-39 10 10-32Z" fill="var(--motif-b, #ffbd73)" />
        <path
          d="m20 105 69-18m-59 30 69-18"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
        />
      }
      @default {
        <path
          d="M22 12v96m24-96v96m24-96v96m24-96v96m24-96v96m24-96v96m24-96v96M10 24h180M10 48h180M10 72h180M10 96h180"
          stroke="currentColor"
          stroke-opacity=".35"
        />
        <path d="M46 96V24h96v48H94v24H46Z" stroke="currentColor" stroke-width="2" />
        <path d="M118 24h24v24" stroke="var(--motif-b, #d39a44)" stroke-width="4" />
        <circle cx="46" cy="96" r="4" fill="var(--motif-b, #d39a44)" />
      }
    }
  </svg>`,
})
export class StageArtComponent {
  band = input('explorer');
}
