import { test, expect } from '@playwright/test';

test('el jurado empieza con vista, hijo y edad; los ajustes opcionales se abren de uno en uno', async ({
  page,
}) => {
  await page.goto('/');
  const panel = page.locator('.simulator-panel');
  await expect(panel.getByRole('button', { name: 'Vista del hijo', exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Vista del adulto', exact: true })).toBeVisible();
  await expect(page.locator('#demo-child')).toBeVisible();
  await expect(page.getByLabel('Cambia la edad')).toBeVisible();
  await expect(panel.locator('input:visible,select:visible')).toHaveCount(2);
  await expect(panel.locator('.demo-optional > details:not([open])')).toHaveCount(3);
  await expect(page.locator('#demo-name')).toBeHidden();
  await expect(page.locator('#demo-date')).toHaveCount(0);
  await page.locator('.demo-settings > summary').click();
  await expect(page.getByLabel('Nombre', { exact: true })).toBeVisible();
  await page.locator('.demo-time > summary').click();
  await expect(page.locator('#demo-name')).toBeHidden();
  const before = await page.locator('.demo-today strong').innerText();
  await page.getByRole('button', { name: 'Pasar 1 día', exact: true }).click();
  await expect(page.locator('.demo-today strong')).not.toHaveText(before);
});

test('el ejemplo necesita confirmación y abre al hijo correcto aunque se cargue desde la vista adulta', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Vista del adulto', exact: true }).click();
  await page.locator('#demo-child').selectOption('lucia');
  await page.locator('.demo-examples > summary').click();
  await page.getByRole('button', { name: 'Ver una meta cumplida' }).click();
  await expect(page.locator('.parent-app')).toBeVisible();
  await expect(page.locator('.scenario-confirm')).toContainText('toda la familia');
  await page.getByRole('button', { name: 'Conservar lo que probé', exact: true }).click();
  await expect(page.locator('.parent-app')).toBeVisible();
  await expect(page.locator('.scenario-confirm')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver una meta cumplida' }).click();
  await page.getByRole('button', { name: 'Cargar ejemplo', exact: true }).click();
  await expect(page.locator('app-mobile .mobile-header')).toContainText('Lucía');
  await expect(page.locator('.goal-card')).toContainText('Mi bicicleta');
  await expect(page.locator('.goal-card [role=progressbar]')).toHaveAttribute(
    'aria-valuenow',
    '100'
  );
  await expect(page.getByRole('button', { name: 'Vista del hijo', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

test('en móvil se puede cerrar desde cualquier altura y volver al inicio del panel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Abrir controles de demo' });
  await opener.click();
  await expect(page.getByRole('button', { name: 'Cerrar controles' })).toBeFocused();
  await page.locator('.demo-settings > summary').click();
  await page.locator('#demo-family-funds').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Cerrar controles' })).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(page.locator('.simulator-panel')).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await expect.poll(() => page.locator('.simulator-panel').evaluate((e) => e.scrollTop)).toBe(0);
  await expect(page.getByLabel('Cambia la edad')).toBeInViewport();
});
