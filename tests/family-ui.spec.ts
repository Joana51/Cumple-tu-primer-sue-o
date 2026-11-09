import { test, expect, Page } from '@playwright/test';
const key = 'primer-sueno-familia-v6';
const family = (p: Page) => p.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
async function role(p: Page, parent: boolean) {
  await p
    .getByRole('button', { name: parent ? 'Vista del adulto' : 'Vista del hijo', exact: true })
    .click();
  await expect(p.locator(parent ? '.parent-app' : 'app-mobile')).toBeVisible();
}
const childLoans = (p: Page) =>
  p
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: 'Préstamos', exact: true })
    .click();
const parentLoans = (p: Page) =>
  p
    .getByRole('navigation', { name: 'Navegación adulta' })
    .getByRole('button', { name: 'Préstamos', exact: true })
    .click();

test('el aviso explica la actividad exacta de su fecha y cuántas veces faltan', async ({
  page,
}) => {
  await page.goto('/');
  await role(page, true);
  await page.locator('.parent-child-card').filter({ hasText: 'Lucía' }).click();
  await role(page, false);
  await childLoans(page);
  await page.locator('.loan-card').filter({ hasText: 'Un paso para mi bicicleta' }).click();
  await page.getByRole('button', { name: 'Avisar que hice la actividad', exact: true }).click();
  await expect(page.locator('.sheet-description')).toContainText('Guardar mis hojas y dibujos');
  await expect(page.locator('.sheet-description')).toContainText('hasta 1 vez');
  await expect(page.getByLabel('¿Cuántas veces la realizaste?')).toHaveValue('1');
  await expect(page.locator('app-loans')).not.toContainText('unidades');
});

test('préstamo completo: solicitud, condiciones, aceptación, mora, entregas y validación por adulto', async ({
  page,
}) => {
  await page.goto('/');
  await childLoans(page);
  await page.getByRole('button', { name: 'Solicitar un préstamo', exact: true }).click();
  await page.getByLabel('Monto que solicitas (S/)').fill('30');
  await page.getByLabel('¿Para qué meta de ahorro?').selectOption({ label: 'Mi primera tablet' });
  await page.getByLabel('¿Para qué lo necesitas?').fill('Quiero avanzar en mi tablet.');
  await page.getByRole('button', { name: 'Enviar solicitud', exact: true }).click();
  expect((await family(page)).children[0].balance).toBe(165);
  await role(page, true);
  await parentLoans(page);
  await page.locator('.loan-card').filter({ hasText: 'Solicitud enviada' }).click();
  await page.getByRole('button', { name: 'Preparar propuesta', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Actividad a realizar').fill('Lectura compartida de 15 minutos');
  await page.getByLabel('Veces en total').fill('3');
  await page.getByLabel('Veces por fecha').fill('2');
  await page.getByLabel('Días entre fechas').fill('3');
  await page.getByLabel('Primera fecha: en días').fill('2');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.locator('#loan-late-enabled').check();
  await page.getByLabel('Veces extra por día', { exact: true }).fill('2');
  await page.getByLabel('Máximo de veces extra en total', { exact: true }).fill('10');
  await page.getByLabel('Días para completar las actividades extra', { exact: true }).fill('5');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page.locator('.loan-contract')).toContainText('Hacerla 3 veces en total');
  await expect(page.locator('.loan-contract')).toContainText(
    'En la última fecha solo faltará hacerla 1 vez'
  );
  await expect(page.locator('.loan-contract')).not.toContainText('unidades');
  await page.getByRole('button', { name: 'Enviar propuesta', exact: true }).click();
  let f = await family(page);
  expect(f.parent.balance).toBe(1000);
  expect(f.children[0].balance).toBe(165);
  const id = f.agreements.find((a: any) => a.status === 'offered').id;
  await role(page, false);
  await childLoans(page);
  await page.locator('.loan-card').filter({ hasText: 'Propuesta por aceptar' }).click();
  await expect(page.getByRole('button', { name: 'Aceptar y recibir S/ 30.00' })).toBeDisabled();
  await page.locator('.loan-consent input').check();
  await page.getByRole('button', { name: 'Aceptar y recibir S/ 30.00' }).click();
  f = await family(page);
  expect(f.children[0].balance).toBe(195);
  expect(f.children[1].balance).toBe(55);
  expect(f.parent.balance).toBe(970);
  expect(f.children[0].goals[0].saved).toBe(180);
  await page.locator('.demo-time > summary').click();
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Pasar 1 día', exact: true }).click();
  await expect(page.locator('.loan-detail-hero')).toContainText('Con retraso');
  for (let i = 0; i < 2; i++) {
    await page
      .getByRole('button', { name: 'Avisar que hice la actividad', exact: true })
      .first()
      .click();
    await page.getByRole('button', { name: 'Enviar a revisión', exact: true }).click();
  }
  await expect(page.getByRole('button', { name: 'Confirmar actividad', exact: true })).toHaveCount(
    0
  );
  await role(page, true);
  await parentLoans(page);
  await page.locator('.loan-card').filter({ hasText: 'Mi primera tablet' }).click();
  for (let i = 0; i < 2; i++)
    await page
      .locator('.installment-card')
      .getByRole('button', { name: 'Confirmar actividad', exact: true })
      .first()
      .click();
  f = await family(page);
  expect(f.agreements.find((a: any) => a.id === id).status).toBe('active');
  await expect(page.locator('.penalty-card')).toContainText('hacerla 2 veces en total');
  await role(page, false);
  await childLoans(page);
  await page.locator('.loan-card').filter({ hasText: 'Mi primera tablet' }).click();
  await page.getByRole('button', { name: 'Avisar de actividades extra realizadas' }).click();
  await page.getByRole('button', { name: 'Enviar a revisión', exact: true }).click();
  await role(page, true);
  await parentLoans(page);
  await page.locator('.loan-card').filter({ hasText: 'Mi primera tablet' }).click();
  await page
    .locator('.penalty-card')
    .getByRole('button', { name: 'Confirmar actividad', exact: true })
    .click();
  await expect(page.locator('.loan-detail-hero')).toContainText('Préstamo completado');
  f = await family(page);
  expect(f.agreements.find((a: any) => a.id === id).hadOverdue).toBe(true);
  expect(f.children[0].balance).toBe(195);
  expect(f.parent.balance).toBe(970);
  await page.reload();
  await childLoans(page);
  await expect(page.locator('.loan-card').filter({ hasText: 'Mi primera tablet' })).toContainText(
    'Préstamo completado'
  );
});

test('detalle de Lucía permanece adulto, muestra todas sus metas y solo recibe ella el aporte', async ({
  page,
}) => {
  await page.goto('/');
  await role(page, true);
  await page.locator('.parent-child-card').filter({ hasText: 'Lucía' }).click();
  await expect(page.locator('.parent-app .mobile-header')).toContainText(
    'Metas y avances de Lucía'
  );
  await expect(page.locator('.parent-goal')).toHaveCount(3);
  await expect(page.locator('.metric-primary')).toContainText('33%');
  await expect(page.locator('.plan-feedback')).toContainText('Prioricen una meta');
  await page.getByRole('button', { name: 'Aportar a una meta', exact: true }).click();
  await page.getByLabel('Meta de Lucía', { exact: true }).selectOption({ label: 'Mi bicicleta' });
  await page.getByLabel('Aporte voluntario (S/)').fill('10');
  await page.getByRole('button', { name: 'Confirmar aporte a Lucía' }).click();
  let f = await family(page);
  expect(f.children[0].goals[0].saved).toBe(180);
  expect(f.children[1].goals[0].saved).toBe(70);
  await role(page, false);
  await expect(page.locator('.mobile-header')).toContainText('¡Hola, Lucía!');
  await expect(page.locator('.mobile-app')).not.toContainText('observado');
  await expect(page.locator('.mobile-app')).not.toContainText('Puntualidad de sus avisos');
  await expect(page.getByLabel('Cambia la edad')).toHaveValue('11');
  await expect(page.locator('.balance-amount')).toHaveText('S/ 55.00');
  await role(page, true);
  await page
    .getByRole('navigation', { name: 'Navegación adulta' })
    .getByRole('button', { name: 'Hijos', exact: true })
    .click();
  await page.getByRole('button', { name: 'Añadir hijo o hija' }).click();
  await page.getByRole('dialog').getByLabel('Nombre', { exact: true }).fill('Nico');
  await page.getByLabel('Edad (10 a 17)').fill('10');
  await page.getByLabel('Aporte semanal para ahorrar (S/)').fill('5');
  await page.getByRole('button', { name: 'Añadir perfil', exact: true }).click();
  await page.locator('.parent-child-card').filter({ hasText: 'Nico' }).click();
  await expect(page.locator('.metric-primary strong')).toHaveText('—');
});

test('móvil adulto sin desbordamiento y el detalle de un hijo nunca cambia de rol', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir controles de demo' }).click();
  await role(page, true);
  await page.getByRole('button', { name: 'Cerrar controles' }).click();
  await page.locator('.parent-child-card').filter({ hasText: 'Alex' }).click();
  await expect(page.locator('.parent-app')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegación adulta' })).toBeInViewport();
  await expect(page.locator('.parent-profile-heading')).toContainText(
    'DETALLE PARA MADRE, PADRE O TUTOR'
  );
  for (const width of [320, 390, 768, 1024, 1366]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  }
});
