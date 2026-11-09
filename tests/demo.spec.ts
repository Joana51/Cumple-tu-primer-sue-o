import { test, expect, Page } from '@playwright/test';

const key = 'primer-sueno-angular-v5';
const state = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
const nav = (page: Page, label: string) =>
  page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: label, exact: true })
    .click();
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('aportar, proteger el saldo, solicitar y autorizar un retiro; persiste al recargar', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Agregar a mi sueño', exact: true }).click();
  await page.getByLabel('¿Cuánto quieres guardar? (S/)').fill('25.50');
  await page.getByRole('button', { name: 'Guardar para mi sueño', exact: true }).click();
  let s = await state(page);
  expect(s.balance).toBe(139.5);
  expect(s.goals[0].saved).toBe(205.5);
  await page.getByRole('button', { name: 'Ver detalle de Mi primera tablet' }).click();
  await page.getByRole('button', { name: 'Solicitar un retiro', exact: true }).click();
  await page.getByLabel('Monto a retirar (S/)').fill('30');
  await page.getByLabel('¿Para qué necesitas este dinero?').fill('Materiales para el colegio');
  await page.getByRole('button', { name: 'Enviar solicitud a mi familia' }).click();
  s = await state(page);
  expect(s.balance).toBe(139.5);
  expect(s.goals[0].saved).toBe(205.5);
  expect(s.requests[0].status).toBe('pending');
  await nav(page, 'Familia');
  await page.getByRole('button', { name: 'Autorizar retiro', exact: true }).click();
  s = await state(page);
  expect(s.balance).toBe(169.5);
  expect(s.goals[0].saved).toBe(175.5);
  expect(s.requests[0].status).toBe('approved');
  await expect(page.getByRole('button', { name: 'Autorizar retiro', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.balance-amount')).toHaveText('S/ 169.50');
});

test('crear y modificar una meta, rechazar el exceso de saldo y aportar desde familia', async ({
  page,
}) => {
  await nav(page, 'Sueños');
  await page.getByRole('button', { name: 'Crear un nuevo sueño' }).click();
  await page.getByRole('button', { name: 'Bicicleta', exact: true }).click();
  await page.getByLabel('Nombre de tu sueño').fill('Mi bicicleta');
  await page.getByLabel('¿Cuánto cuesta? (S/)').fill('300');
  await page.getByLabel('Plazo en semanas').fill('10');
  await expect(page.locator('.suggestion')).toContainText('S/ 30.00 por semana');
  await page.getByRole('button', { name: 'Empezar mi sueño', exact: true }).click();
  await page.getByRole('button', { name: 'Ver detalle de Mi bicicleta' }).click();
  await page.getByRole('button', { name: 'Modificar mi meta' }).click();
  await page.getByLabel('¿Cuánto cuesta? (S/)').fill('350');
  await page.getByRole('button', { name: 'Actualizar mi plan' }).click();
  expect((await state(page)).goals[1].target).toBe(350);
  await page.getByRole('button', { name: 'Agregar a mi sueño', exact: true }).last().click();
  await page.getByLabel('¿Cuánto quieres guardar? (S/)').fill('999');
  await page.getByRole('button', { name: 'Guardar para mi sueño', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect((await state(page)).balance).toBe(165);
  await page.keyboard.press('Escape');
  await nav(page, 'Familia');
  await page.getByRole('button', { name: 'Aportar', exact: true }).click();
  await page.getByLabel('Elige qué sueño acompañar').selectOption({ label: 'Mi bicicleta' });
  await page.getByLabel('¿Cuánto quieres aportar? (S/)').fill('10');
  await page.getByRole('button', { name: 'Confirmar aporte familiar' }).click();
  expect((await state(page)).goals[1].saved).toBe(10);
  expect((await state(page)).balance).toBe(165);
});

test('edad adapta estilo, contenido y actividad; contestar no cierra la actividad', async ({
  page,
}) => {
  await page.getByLabel('Edad del usuario').fill('10');
  await nav(page, 'Aprende');
  await expect(page.locator('.mobile-app')).toHaveAttribute('data-age', 'junior');
  await expect(page.locator('.learning-hero')).toContainText('¡Vamos a descubrir!');
  await page.locator('.learning-card').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'B Guardar S/ 5' }).click();
  await page.getByRole('button', { name: 'Explorar mi respuesta' }).click();
  await expect(page.locator('.quiz-feedback')).toContainText('¡Una buena decisión!');
  expect((await state(page)).lessons).toContain('j1');
  await page.getByRole('button', { name: 'Seguir mi camino' }).click();
  await page.getByLabel('Edad del usuario').fill('17');
  await expect(page.locator('.mobile-app')).toHaveAttribute('data-age', 'teen');
  await expect(page.locator('.learning-card').first()).toContainText('Presupuesto con intención');
});

test('escenarios requieren confirmación y permiten completar y liberar el ahorro', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Escenarios', exact: true }).click();
  await page.getByRole('button', { name: '¡Lo logré!' }).click();
  await expect(page.getByRole('button', { name: 'Cargar escenario' })).toBeVisible();
  await page.getByRole('button', { name: 'Cargar escenario' }).click();
  await expect(page.locator('.goal-visual')).toContainText('¡Sueño cumplido!');
  await page.getByRole('button', { name: 'Celebrar mi logro' }).click();
  await page.getByRole('button', { name: 'Usar mi ahorro para este sueño' }).click();
  await page.getByLabel('Monto a retirar (S/)').fill('600');
  await page.getByRole('button', { name: 'Devolver a mi saldo disponible' }).click();
  expect((await state(page)).balance).toBe(765);
  expect((await state(page)).requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Modo presentación', exact: true }).click();
  await expect(page.locator('.simulator-panel')).toBeHidden();
  await expect(page.locator('.phone-frame')).toBeVisible();
});

test('diálogo encierra el foco, Escape lo devuelve y no hay errores de ejecución', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.getByRole('button', { name: 'Agregar a mi sueño', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Cerrar ventana' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('button', { name: 'Guardar para mi sueño', exact: true })
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Agregar a mi sueño', exact: true })).toBeFocused();
  for (const label of ['Sueños', 'Protegido', 'Aprende', 'Familia', 'Inicio'])
    await nav(page, label);
  expect(errors).toEqual([]);
});

test('móvil real: sin desbordamiento horizontal, navegación fija y controles externos accesibles', async ({
  page,
}) => {
  for (const width of [320, 390, 650, 768, 1024, 1366]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.mobile-navigation')).toBeInViewport();
  await page.getByRole('button', { name: 'Abrir controles de demo' }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('Sam');
  await page.getByRole('button', { name: 'Cerrar controles' }).click();
  await expect(page.locator('.mobile-header')).toContainText('¡Hola, Sam!');
  await nav(page, 'Protegido');
  await expect(page.locator('.mobile-navigation')).toBeInViewport();
});

test('migra datos previos sin borrar la copia original', async ({ page }) => {
  const old = {
    profile: { name: 'Luz', age: 12, avatar: '🦊' },
    balance: 42,
    goals: [
      {
        id: 9,
        name: 'Mi guitarra',
        target: 400,
        saved: 60,
        weeks: 8,
        protected: true,
        emoji: '🎸',
      },
    ],
    history: [],
    requests: [],
  };
  await page.evaluate(
    ({ old, key }) => {
      localStorage.removeItem(key);
      localStorage.setItem('primer-sueno-demo-v2', JSON.stringify(old));
    },
    { old, key }
  );
  await page.reload();
  await expect(page.locator('.mobile-header')).toContainText('Luz');
  await expect(page.locator('.goal-card')).toContainText('Mi guitarra');
  await page.getByLabel('Edad del usuario').fill('13');
  expect((await state(page)).goals[0].saved).toBe(60);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('primer-sueno-demo-v2')!).balance)
  ).toBe(42);
});

test('editar no evade la protección y conversar primero mantiene intactos los fondos', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Ver detalle de Mi primera tablet' }).click();
  await page.getByRole('button', { name: 'Modificar mi meta' }).click();
  await expect(page.getByLabel('Proteger mi ahorro')).toBeDisabled();
  await page.getByLabel('¿Cuánto cuesta? (S/)').fill('180');
  await page.getByRole('button', { name: 'Actualizar mi plan' }).click();
  await expect(page.getByRole('alert')).toContainText('Tu meta tiene ahorro protegido');
  await page.keyboard.press('Escape');
  await expect(page.locator('.goal-card')).toContainText('de S/ 600.00');
  await page.getByRole('button', { name: 'Ver detalle de Mi primera tablet' }).click();
  await page.getByRole('button', { name: 'Solicitar un retiro', exact: true }).click();
  await page.getByLabel('¿Para qué necesitas este dinero?').fill('Cambiar mis planes');
  await page.getByRole('button', { name: 'Enviar solicitud a mi familia' }).click();
  await nav(page, 'Familia');
  await page.getByRole('button', { name: 'Conversar primero' }).click();
  const s = await state(page);
  expect(s.balance).toBe(165);
  expect(s.goals[0].saved).toBe(180);
  expect(s.requests[0].status).toBe('rejected');
});

test('identidad independiente y aviso visibles en presentación, formularios y móvil', async ({
  page,
}) => {
  const notice = page.getByRole('complementary', { name: 'Aviso de independencia del prototipo' });
  await expect(notice).toContainText('Mi primer sueño · Demo independiente');
  await expect(notice).not.toContainText(/BCP|Yape/);
  await expect(page.locator('.studio-header')).not.toContainText('PROTOTIPO INTERACTIVO');
  await expect(page.locator('.bcp-wordmark')).toHaveCount(0);
  await expect(page.locator('.concept-signature')).toContainText('triadTech');
  await expect(page.locator('.panel-footer')).not.toContainText('Integración');
  await page.getByRole('button', { name: 'Modo presentación', exact: true }).click();
  await expect(notice).toBeInViewport();
  await page.getByRole('button', { name: 'Agregar a mi sueño', exact: true }).click();
  await expect(notice).toBeInViewport();
  let noticeBox = await notice.boundingBox();
  let dialogBox = await page.getByRole('dialog').boundingBox();
  expect(noticeBox!.y + noticeBox!.height).toBeLessThanOrEqual(dialogBox!.y);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Salir de presentación' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(notice).toBeInViewport();
  await page.getByRole('button', { name: 'Agregar a mi sueño', exact: true }).click();
  noticeBox = await notice.boundingBox();
  dialogBox = await page.getByRole('dialog').boundingBox();
  expect(noticeBox!.y + noticeBox!.height).toBeLessThanOrEqual(dialogBox!.y);
});

test('la meta y sus insignias permanecen cumplidas tras usar todo el ahorro y recargar', async ({
  page,
}) => {
  await page.locator('#demo-balance').fill('420');
  await page.locator('#demo-balance').press('Tab');
  await page.getByRole('button', { name: 'Agregar a mi sueño', exact: true }).click();
  await page.getByLabel('¿Cuánto quieres guardar? (S/)').fill('420');
  await page.getByRole('button', { name: 'Guardar para mi sueño', exact: true }).click();
  const completedAt = (await state(page)).goals[0].completedAt;
  expect(completedAt).toBeTruthy();
  for (const amount of [200, 400]) {
    await page.getByRole('button', { name: 'Celebrar mi logro' }).click();
    await page.getByRole('button', { name: 'Usar mi ahorro para este sueño' }).click();
    await expect(page.getByLabel('¿Para qué necesitas este dinero?')).toHaveCount(0);
    await page.getByLabel('Monto a retirar (S/)').fill(String(amount));
    await page.getByRole('button', { name: 'Devolver a mi saldo disponible' }).click();
  }
  const s = await state(page);
  expect(s.balance).toBe(600);
  expect(s.goals[0].saved).toBe(0);
  expect(s.goals[0].completedAt).toBe(completedAt);
  expect(s.earnedBadges).toContain('completed-goal');
  expect(s.requests).toHaveLength(0);
  await page.reload();
  await nav(page, 'Sueños');
  await expect(page.locator('.completed-goals')).toContainText('Mi primera tablet');
  await expect(page.locator('.completed-goals [role="progressbar"]')).toHaveAttribute(
    'aria-valuenow',
    '100'
  );
  await expect(page.getByRole('button', { name: 'Agregar a mi sueño', exact: true })).toHaveCount(
    0
  );
  await page.getByRole('button', { name: 'Ver mi logro' }).click();
  await expect(page.getByRole('button', { name: 'Modificar mi meta' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cerrar esta meta', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Crear mi próximo sueño' }).click();
  await page.getByLabel('Nombre de tu sueño').fill('Mi primera tablet');
  await page.getByLabel('¿Cuánto cuesta? (S/)').fill('50');
  await page.getByRole('button', { name: 'Empezar mi sueño', exact: true }).click();
  await page.reload();
  await nav(page, 'Inicio');
  await expect(page.locator('.goal-card')).toContainText('Mi primera tablet');
  await expect(page.locator('.goal-card [role="progressbar"]')).toHaveAttribute(
    'aria-valuenow',
    '0'
  );
  await nav(page, 'Aprende');
  await page.getByRole('button', { name: 'Mis logros', exact: true }).click();
  await expect(page.locator('.badge-card').filter({ hasText: 'Un sueño cumplido' })).toHaveClass(
    /earned/
  );
  await expect(page.locator('.badge-card').filter({ hasText: 'Un paso de ahorro' })).toHaveClass(
    /earned/
  );
  await nav(page, 'Familia');
  await page.getByRole('button', { name: 'Ver resumen', exact: true }).click();
  await expect(
    page.locator('.summary-grid > div').filter({ hasText: 'Metas alcanzadas' })
  ).toContainText('1');
});

test('una sesión previa sin hitos se migra y conserva su meta cumplida al retirar', async ({
  page,
}) => {
  await page.getByLabel('Nombre', { exact: true }).fill('Mara');
  await page.evaluate((k) => {
    const saved = JSON.parse(localStorage.getItem(k)!);
    saved.goals[0].saved = saved.goals[0].target;
    delete saved.goals[0].completedAt;
    delete saved.earnedBadges;
    localStorage.setItem(k, JSON.stringify(saved));
  }, key);
  await page.reload();
  await page.getByRole('button', { name: 'Celebrar mi logro' }).click();
  await page.getByRole('button', { name: 'Usar mi ahorro para este sueño' }).click();
  await page.getByLabel('Monto a retirar (S/)').fill('600');
  await page.getByRole('button', { name: 'Devolver a mi saldo disponible' }).click();
  await page.reload();
  await expect(page.locator('.goal-visual')).toContainText('¡Sueño cumplido!');
  expect((await state(page)).goals[0].completedAt).toBeTruthy();
  expect((await state(page)).earnedBadges).toContain('completed-goal');
});

test('Inicio muestra progreso y aporte sin desplazarse en las tres edades', async ({ page }) => {
  for (const size of [
    { width: 1366, height: 768 },
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    for (const age of [10, 14, 17]) {
      if (size.width <= 650)
        await page.getByRole('button', { name: 'Abrir controles de demo' }).click();
      await page.getByLabel('Edad del usuario').fill(String(age));
      if (size.width <= 650) await page.getByRole('button', { name: 'Cerrar controles' }).click();
      await expect(
        page.getByRole('button', { name: 'Agregar a mi sueño', exact: true })
      ).toBeInViewport({ ratio: 1 });
      await expect(page.locator('.goal-card [role="progressbar"]')).toBeInViewport({ ratio: 1 });
      expect(await page.locator('.mobile-scroll').evaluate((e) => e.scrollTop)).toBe(0);
    }
  }
  await nav(page, 'Familia');
  await expect(page.locator('.mobile-app')).not.toContainText('sin autenticación real');
  await page.getByRole('button', { name: 'Abrir mi perfil' }).click();
  await expect(page.locator('.mobile-app')).not.toContainText(
    'nombre ficticio para la presentación'
  );
});
