import { Component, input } from '@angular/core';
@Component({
  selector: 'app-dream-art',
  standalone: true,
  template: ` <svg viewBox="0 0 240 180" fill="none" role="img" [attr.aria-label]="label()">
    <ellipse cx="121" cy="156" rx="77" ry="11" fill="#173e72" opacity=".08" />
    <circle cx="130" cy="85" r="65" fill="#DBE7FF" />
    <circle cx="184" cy="37" r="9" fill="#FFB85B" />
    <path d="m37 64 4-10 4 10 10 4-10 4-4 10-4-10-10-4Z" fill="#f4a13a" />
    @switch (kind()) {
      @case ('tablet') {
        <g transform="rotate(-12 125 91)">
          <rect x="66" y="24" width="119" height="139" rx="13" fill="#173e72" />
          <rect x="72" y="30" width="107" height="126" rx="8" fill="#1F2942" />
          <rect x="78" y="36" width="95" height="112" rx="4" fill="#B5CEFF" />
          <path d="M78 105c30-53 67 10 95-33v76H78Z" fill="#738FEC" />
          <path d="M78 125c35-39 60 18 95-12v35H78Z" fill="#D5C7FF" />
          <circle cx="123" cy="64" r="17" fill="#FFD58C" />
          <rect x="112" y="151" width="28" height="2" rx="1" fill="#8191B0" />
        </g>
        <g transform="rotate(18 187 105)">
          <rect x="183" y="58" width="6" height="96" rx="3" fill="white" />
          <path d="m183 150 3 8 3-8" fill="#8094BA" />
        </g>
      }
      @case ('bike') {
        <circle cx="63" cy="124" r="31" stroke="#173e72" stroke-width="7" />
        <circle cx="180" cy="124" r="31" stroke="#173e72" stroke-width="7" />
        <path
          d="m63 124 35-58 27 58H63l74-45 43 45-23-68h-16M88 65h23"
          stroke="#f4a13a"
          stroke-width="7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="124" cy="124" r="7" fill="#173e72" />
      }
      @case ('headphones') {
        <path d="M68 111V80a53 53 0 0 1 106 0v31" stroke="#173e72" stroke-width="17" />
        <rect x="55" y="89" width="34" height="58" rx="15" fill="#f4a13a" />
        <rect x="153" y="89" width="34" height="58" rx="15" fill="#f4a13a" />
        <rect x="75" y="97" width="15" height="43" rx="7" fill="#173e72" />
        <rect x="151" y="97" width="15" height="43" rx="7" fill="#173e72" />
      }
      @case ('trip') {
        <rect x="65" y="61" width="115" height="91" rx="15" fill="#f4a13a" />
        <path d="M102 61V45h41v16M89 66v82m68-82v82" stroke="#173e72" stroke-width="7" />
        <circle cx="86" cy="157" r="5" fill="#173e72" />
        <circle cx="160" cy="157" r="5" fill="#173e72" />
        <path d="m107 101 36-14-15 35-5-14Z" fill="white" />
      }
      @default {
        <path
          d="m121 34 19 37 42 7-31 30 7 42-37-20-37 20 7-42-31-30 42-7Z"
          fill="#f4a13a"
          stroke="#173e72"
          stroke-width="5"
          stroke-linejoin="round"
        />
      }
    }
    <path d="m201 118 3-7 3 7 7 3-7 3-3 7-3-7-7-3Z" fill="#7B91DC" />
  </svg>`,
  styles: ':host{display:block}svg{display:block;width:100%;height:100%}',
})
export class DreamArtComponent {
  kind = input('tablet');
  label = input('Ilustración de tu sueño');
}
