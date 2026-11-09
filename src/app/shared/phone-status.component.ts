import { Component } from '@angular/core';
@Component({
  selector: 'app-phone-status',
  standalone: true,
  styles: ':host{display:contents}',
  template: ` <div class="phone-status" aria-hidden="true">
    <b>9:41</b>
    <div class="dynamic-island"></div>
    <div class="status-icons">
      <svg viewBox="0 0 18 14">
        <path d="M2 12v-2m4 2V7m4 5V4m4 8V1" stroke="currentColor" stroke-width="2.4" />
      </svg>
      <svg viewBox="0 0 18 14">
        <path
          d="M1 4q8-7 16 0M4 7q5-4 10 0m-7 3q2-2 4 0"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        />
        <circle cx="9" cy="12" r="1" />
      </svg>
      <svg viewBox="0 0 25 14">
        <rect x="1" y="2" width="20" height="10" rx="3" stroke="currentColor" fill="none" />
        <rect x="3" y="4" width="16" height="6" rx="1" />
        <path d="M23 5v4" stroke="currentColor" stroke-width="2" />
      </svg>
    </div>
  </div>`,
})
export class PhoneStatusComponent {}
