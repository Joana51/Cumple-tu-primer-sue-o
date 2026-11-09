import { test, expect, Page } from '@playwright/test';
import { executeLoanCommand } from '../src/app/core/loan-engine';
import { addDays } from '../src/app/core/agreement-rules';
import { FamilyState, LoanTerms } from '../src/app/core/models';
const key = 'primer-sueno-familia-v6';
const state = (p: Page): Promise<FamilyState> =>
  p.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
async function prepare(page: Page, reject = false) {
  await page.goto('/');
  await page.getByLabel('Nombre', { exact: true }).fill('Alex test');
  const f = await state(page);
  f.agreements = [];
  const terms: LoanTerms = {
    amount: 20,
    unitLabel: 'Sesión de lectura',
    totalUnits: 1,
    unitsPerInstallment: 1,
    intervalDays: 1,
    firstDueDays: 1,
    terms: 'Leemos y conversamos.',
    latePolicy: { enabled: true, unitsPerDay: 1, capUnits: 5, graceDays: 0, paymentWindowDays: 7 },
  };
  expect(
    executeLoanCommand(f, 'parent', 'alex', 'alex', {
      type: 'offer',
      title: 'Lectura acordada',
      terms,
    })
  ).toBe('');
  const a = f.agreements[0];
  expect(
    executeLoanCommand(f, 'child', 'alex', 'alex', { type: 'accept', id: a.id, accept: true })
  ).toBe('');
  expect(
    executeLoanCommand(f, 'child', 'alex', 'alex', {
      type: 'report',
      id: a.id,
      taskId: a.tasks[0].id,
      units: 1,
      note: 'Terminé la lectura.',
    })
  ).toBe('');
  if (reject)
    expect(
      executeLoanCommand(f, 'parent', 'alex', 'alex', {
        type: 'review',
        id: a.id,
        taskId: a.tasks[0].id,
        reportId: a.tasks[0].reports![0].id,
        accept: false,
        feedback: 'Conversemos sobre la lectura.',
      })
    ).toBe('');
  else f.today = addDays(f.today, 14);
  await page.evaluate(({ key, f }) => localStorage.setItem(key, JSON.stringify(f)), { key, f });
  await page.reload();
  return a.tasks[0].reports![0].submittedAt;
}
async function loans(page: Page, parent = false) {
  if (parent) await page.getByRole('button', { name: 'Vista del adulto', exact: true }).click();
  await page
    .getByRole('navigation', { name: parent ? 'Navegación adulta' : 'Navegación principal' })
    .getByRole('button', { name: 'Préstamos', exact: true })
    .click();
  await page.locator('.loan-card').filter({ hasText: 'Lectura acordada' }).click();
}
test('revisión olvidada visible, neutral y confirmación tardía conserva el reporte', async ({
  page,
}) => {
  const original = await prepare(page);
  await loans(page, true);
  await expect(page.locator('.evidence-panel')).toContainText('sin información suficiente');
  await expect(page.locator('.evidence-report')).toContainText('14 días sin respuesta');
  await page
    .locator('.evidence-report')
    .getByRole('button', { name: 'Confirmar actividad', exact: true })
    .click();
  await expect(page.locator('.loan-detail-hero')).toContainText('Préstamo completado');
  await expect(page.locator('.evidence-report')).toContainText('Confirmado después de 14 días');
  expect((await state(page)).agreements[0].tasks[0].reports![0].submittedAt).toBe(original);
  await page.reload();
  await loans(page);
  await expect(page.locator('.evidence-report')).toContainText('Confirmado después de 14 días');
  await expect(page.getByRole('button', { name: 'Agregar al historial', exact: true })).toHaveCount(
    0
  );
});
test('el hijo cuestiona una observación; el adulto conversa y deja un resultado neutral', async ({
  page,
}) => {
  await prepare(page, true);
  await loans(page);
  await page.getByRole('button', { name: 'Pedir que lo revisen juntos', exact: true }).click();
  await page.getByLabel('¿Qué te gustaría aclarar?').fill('Podemos conversar sobre lo que leí.');
  await page.getByRole('button', { name: 'Enviar mi explicación', exact: true }).click();
  await expect(page.locator('.evidence-report')).toContainText('Revisión solicitada');
  await page.getByRole('button', { name: 'Vista del adulto', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Navegación adulta' })
    .getByRole('button', { name: 'Préstamos', exact: true })
    .click();
  await page.locator('.loan-card').filter({ hasText: 'Lectura acordada' }).click();
  await page.getByLabel('¿Qué pudieron aclarar?').fill('Aún no tenemos información suficiente.');
  await page.getByRole('button', { name: 'Dejar sin confirmar', exact: true }).click();
  await expect(page.locator('.evidence-report')).toContainText('Sin información suficiente');
  expect((await state(page)).agreements[0].status).toBe('active');
  await page
    .getByLabel('¿Qué pudieron aclarar?')
    .fill('Ahora pudimos conversar y confirmar la actividad.');
  await page.getByRole('button', { name: 'Confirmar actividad realizada', exact: true }).click();
  await expect(page.locator('.loan-detail-hero')).toContainText('Préstamo completado');
  await page.getByText('Ver respuestas anteriores', { exact: true }).click();
  await expect(page.locator('.report-reviews')).toContainText('Observación');
  await expect(page.locator('.report-reviews')).toContainText('Confirmación');
});
