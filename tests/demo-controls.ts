import { Page } from '@playwright/test';

export async function openExampleSettings(page: Page) {
  const section = page.locator('.demo-settings');
  if (!(await section.evaluate((e: HTMLDetailsElement) => e.open)))
    await section.locator('summary').click();
}
