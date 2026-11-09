import { test, expect } from '@playwright/test';

test('las tres edades cambian la composición gráfica sin alterar el dinero ni la navegación', async ({
  page,
}) => {
  await page.goto('/');
  const graphics: string[] = [];
  for (const [age, band] of [
    [10, 'junior'],
    [14, 'explorer'],
    [17, 'teen'],
  ] as const) {
    await page.getByLabel('Cambia la edad').fill(String(age));
    const art = page.locator('.balance-stage-art svg');
    await expect(art).toHaveAttribute('data-stage', band);
    await expect(art).toHaveAttribute('aria-hidden', 'true');
    graphics.push(await art.innerHTML());
    await expect(page.locator('.balance-amount')).toHaveText('S/ 165.00');
    await expect(page.locator('.goal-card [role=progressbar]')).toHaveAttribute(
      'aria-valuenow',
      '30'
    );
    await expect(page.getByRole('button', { name: 'Agregar ahorro', exact: true })).toBeInViewport({
      ratio: 1,
    });
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeInViewport();
  }
  expect(new Set(graphics).size).toBe(3);
});
