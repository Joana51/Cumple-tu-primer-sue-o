export interface Lesson {
  id: string;
  title: string;
  concept: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
}
const lessons: Record<string, Lesson[]> = {
  junior: [
    {
      id: 'j1',
      title: 'Un poquito hoy, un sueño mañana',
      concept: 'Ahorrar es guardar una parte para algo que quieres conseguir después.',
      question: 'Recibes S/ 20 y quieres una bicicleta. ¿Qué te ayuda a acercarte a ella?',
      choices: [
        'Gastar los S/ 20 en dulces',
        'Guardar S/ 5 y decidir qué hacer con el resto',
        'Olvidarme de cuánto tengo',
      ],
      answer: 1,
      explanation:
        'Guardar una parte te acerca a tu bicicleta. Puedes empezar con lo que tengas; cada paso cuenta.',
    },
    {
      id: 'j2',
      title: '¿Lo necesito o lo quiero?',
      concept: 'Hay cosas que necesitamos, como los útiles, y cosas que deseamos, como un juguete.',
      question:
        'Mañana necesitas un cuaderno y también quieres un juguete. ¿Qué puedes hacer primero?',
      choices: [
        'Comprar el cuaderno y planear el juguete',
        'Comprar el juguete y olvidar el cuaderno',
        'Gastar sin mirar los precios',
      ],
      answer: 0,
      explanation:
        'Cubrir lo que necesitas primero te permite planear con calma cómo conseguir lo que deseas.',
    },
  ],
  explorer: [
    {
      id: 'e1',
      title: 'Dale un plan a tu próxima meta',
      concept: 'Un presupuesto es un plan sencillo para decidir cuánto usar y cuánto ahorrar.',
      question:
        'Recibes S/ 50 y necesitas S/ 20 para transporte. ¿Qué decisión equilibra tus prioridades?',
      choices: [
        'Ahorrar S/ 50 y quedarme sin transporte',
        'Separar S/ 20 para transporte y parte del resto para mi meta',
        'Gastar todo y ahorrar la próxima vez',
      ],
      answer: 1,
      explanation:
        'Un presupuesto contempla tus necesidades y tu meta. Separar primero lo necesario hace tu plan sostenible.',
    },
    {
      id: 'e2',
      title: 'Tu ahorro tiene su propio espacio',
      concept: 'Separar tus ahorros de tus gastos ayuda a respetar el compromiso que elegiste.',
      question:
        'Tienes S/ 180 reservados para una tablet. Quieres retirar S/ 30. Si ahorras S/ 15 por semana, ¿qué cambia?',
      choices: [
        'Nada: el ahorro sigue igual',
        'Mi meta podría tardar unas 2 semanas más',
        'Perderé todo mi ahorro',
      ],
      answer: 1,
      explanation:
        'S/ 30 equivalen a dos aportes de S/ 15. Puedes cambiar de plan, pero conocer el efecto te ayuda a decidir.',
    },
  ],
  teen: [
    {
      id: 't1',
      title: 'Presupuesto con intención',
      concept:
        'Planifica tus ingresos y gastos; reserva una parte para tu objetivo y un margen para imprevistos.',
      question:
        'Tienes S/ 200, gastos necesarios de S/ 80 y quieres ahorrar. ¿Qué plan es más sostenible?',
      choices: [
        'Reservar los S/ 200 e ignorar mis gastos',
        'Cubrir S/ 80, ahorrar S/ 90 y dejar S/ 30 para imprevistos',
        'Pedir un préstamo para completar la meta',
      ],
      answer: 1,
      explanation:
        'Un plan sostenible cubre gastos, avanza hacia tu objetivo y deja flexibilidad. No existe un porcentaje obligatorio para todos.',
    },
    {
      id: 't2',
      title: 'El costo de elegir',
      concept:
        'El costo de oportunidad es aquello a lo que renuncias cuando eliges una alternativa.',
      question:
        'Usas S/ 60 de tu ahorro para una salida. Con aportes de S/ 20 por semana, ¿qué implica para tu meta?',
      choices: [
        'Necesitaré aproximadamente 3 semanas adicionales',
        'La meta se completará igual de rápido',
        'Nunca podré alcanzar mi objetivo',
      ],
      answer: 0,
      explanation:
        'S/ 60 divididos entre S/ 20 son 3 semanas. Evaluar ese intercambio te permite elegir con información, sin culpas.',
    },
  ],
};
export const getLessons = (band: string) => lessons[band];
