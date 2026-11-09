import { LoanTerms } from './models';

export const times = (n: number) => `${n} ${n === 1 ? 'vez' : 'veces'}`;
export const days = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`;
export function activityPlan(t: LoanTerms): string {
  if (
    !t.unitLabel.trim() ||
    ![t.totalUnits, t.unitsPerInstallment, t.intervalDays, t.firstDueDays].every(
      (n) => Number.isInteger(n) && n > 0
    )
  )
    return 'Completa la actividad, las veces y los días para ver el resumen del plan.';
  const remainder = t.totalUnits % t.unitsPerInstallment;
  return (
    `Actividad: «${t.unitLabel}». Hacerla ${times(t.totalUnits)} en total: ${times(t.unitsPerInstallment)} cada ${days(t.intervalDays)}. La primera fecha será ${days(t.firstDueDays)} después de aceptar.` +
    (remainder && t.totalUnits > t.unitsPerInstallment
      ? ` En la última fecha solo faltará hacerla ${times(remainder)}.`
      : '')
  );
}
// Explain system wording from older sessions without changing the stored audit trail.
export function readableLoanEvent(text: string): string {
  if (
    !/^(Reportó|Confirmó|Préstamo completado|Desactivó|Propuso \d+ unidades|No aceptó nuevas unidades)/.test(
      text
    )
  )
    return text;
  return text
    .replace(/(\d+) unidad\(es\)/g, (_, n) => times(Number(n)))
    .replace(/unidades base/g, 'actividades acordadas')
    .replace(/unidades adicionales/g, 'actividades extra')
    .replace(/unidades por día/g, 'veces extra por día')
    .replace(/unidades/g, 'veces que se hace la actividad')
    .replace(/anticipo/gi, 'dinero adelantado')
    .replace(/sin atribuir incumplimiento externo/g, 'sin marcarlo como incumplimiento')
    .replace(
      /sin atribuir éxito ni fracaso externo/g,
      'sin dar la actividad por hecha ni por incumplida'
    );
}
