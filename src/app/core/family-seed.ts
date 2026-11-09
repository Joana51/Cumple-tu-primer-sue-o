import { Agreement, ChildAccount, DemoState, FamilyState } from './models';
import { addDays, localToday } from './agreement-rules';

export function familySeed(first: DemoState, today = localToday()): FamilyState {
  const lucia: ChildAccount = {
    id: 'lucia',
    profile: { name: 'Lucía', age: 11, avatar: 'L', notifications: true, interest: 'Música' },
    balance: 55,
    weeklySavingsBudget: 10,
    goals: [
      {
        id: 1,
        name: 'Mi bicicleta',
        target: 300,
        saved: 60,
        weeks: 12,
        protected: true,
        art: 'bike',
      },
      {
        id: 2,
        name: 'Mis audífonos',
        target: 120,
        saved: 20,
        weeks: 10,
        protected: true,
        art: 'headphones',
      },
      {
        id: 3,
        name: 'Mi viaje al mar',
        target: 500,
        saved: 50,
        weeks: 20,
        protected: true,
        art: 'trip',
      },
    ],
    history: [
      { id: 2, text: 'Aporte a mi bicicleta', amount: 20, kind: 'deposit', date: 'Esta semana' },
      { id: 1, text: 'Aporte de mi familia', amount: 10, kind: 'family', date: 'Esta semana' },
    ],
    requests: [],
    lessons: [],
    reward: 0,
    praise: '',
    earnedBadges: ['first-goal', 'first-saving'],
  };
  const agreements: Agreement[] = [];
  const make = (childId: string, index: number, delay: number, title: string): Agreement => {
    const due = addDays(today, -14 - index * 15),
      completed = addDays(due, delay),
      accepted = addDays(due, -7);
    return {
      id: `sample-${childId}-${index}`,
      childId,
      parentId: 'mariana',
      title,
      amount: [20, 15, 30, 10][index % 4],
      reason: 'Un anticipo para mis planes',
      terms: 'Una actividad breve acordada en familia.',
      status: 'completed',
      days: 7,
      createdAt: accepted,
      acceptedAt: accepted,
      dueDate: due,
      originalDueDate: due,
      completedAt: completed,
      validatedAt: completed,
      renegotiations: 0,
      tasks: [
        {
          id: `task-${index}`,
          title,
          status: 'validated',
          submittedAt: completed,
          validatedAt: completed,
        },
      ],
      events: [
        {
          id: `event-${childId}-${index}`,
          at: completed,
          actor: 'parent',
          text: 'Acción confirmada en familia.',
        },
      ],
    };
  };
  [-2, 0, -1, 3].forEach((d, i) =>
    agreements.push(
      make(
        'alex',
        i,
        d,
        [
          'Organizar mis libros',
          'Ayudar a ordenar la mesa',
          'Cuidar las plantas',
          'Preparar mi mochila',
        ][i]
      )
    )
  );
  [0, 2, 5].forEach((d, i) =>
    agreements.push(
      make(
        'lucia',
        i,
        d,
        ['Ordenar mis materiales', 'Regar las plantas con ayuda', 'Organizar mis juguetes'][i]
      )
    )
  );
  agreements.push({
    id: 'sample-lucia-active',
    childId: 'lucia',
    parentId: 'mariana',
    title: 'Un paso para mi bicicleta',
    amount: 20,
    goalId: 1,
    reason: 'Quiero avanzar en mi bicicleta',
    terms: 'Ordenar juntas los materiales de arte, en dos momentos breves.',
    status: 'active',
    days: 7,
    createdAt: addDays(today, -11),
    acceptedAt: addDays(today, -10),
    dueDate: addDays(today, -3),
    originalDueDate: addDays(today, -3),
    renegotiations: 0,
    tasks: [
      {
        id: 'lucia-art-1',
        title: 'Separar los lápices y colores',
        status: 'validated',
        submittedAt: addDays(today, -5),
        validatedAt: addDays(today, -4),
      },
      { id: 'lucia-art-2', title: 'Guardar mis hojas y dibujos', status: 'pending' },
    ],
    events: [
      {
        id: 'lucia-seed-event',
        at: addDays(today, -10),
        actor: 'child',
        text: 'Acuerdo aceptado. Anticipo recibido.',
      },
    ],
  });
  return {
    version: 6,
    parent: { id: 'mariana', name: 'Mariana', balance: 1000 },
    children: [{ ...first, id: 'alex', weeklySavingsBudget: 20 }, lucia],
    agreements,
    today,
  };
}
