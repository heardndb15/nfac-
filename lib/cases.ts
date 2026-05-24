export interface Suspect {
  id: string;
  name: string;
  description: string;
}

export interface Clue {
  id: string;
  text: string;
}

export interface CaseData {
  id: string;
  title: string;
  situation: string;
  suspects: Suspect[];
  clues: Clue[];
  correctSuspectId: string;
  solution: string;
  aiTaunts: string[];
}

export const GAME_CASES: CaseData[] = [
  {
    id: "case-1",
    title: "Apartment Silence",
    situation: "Мужчина найден мёртвым в квартире. Дверь была закрыта изнутри.",
    suspects: [
      { id: "s1_1", name: "Анна (девушка)", description: "недавно ссорились, утверждает, что ушла в 21:00" },
      { id: "s1_2", name: "Игорь (сосед)", description: "слышал шум, жаловался на жертву" },
      { id: "s1_3", name: "Дмитрий (друг)", description: "был должен деньги, утверждает, что не приходил" }
    ],
    clues: [
      { id: "c1_1", text: "⏰ Время смерти: 22:30" },
      { id: "c1_2", text: "📱 Телефон жертвы: сообщение Анне в 22:10" },
      { id: "c1_3", text: "🚪 Дверь закрыта изнутри" },
      { id: "c1_4", text: "🪟 Окно слегка открыто" },
      { id: "c1_5", text: "👣 Следы обуви на подоконнике" }
    ],
    correctSuspectId: "s1_2",
    solution: "Игорь (сосед) проник через окно.",
    aiTaunts: ["You ignored the window.", "You missed the obvious.", "Your logic is flawed."]
  },
  {
    id: "case-2",
    title: "School Corridor",
    situation: "Учитель найден мёртвым в школе после занятий.",
    suspects: [
      { id: "s2_1", name: "Студент Алекс", description: "конфликтовал с учителем" },
      { id: "s2_2", name: "Учитель Марина", description: "работала допоздна" },
      { id: "s2_3", name: "Охранник", description: "был на смене" }
    ],
    clues: [
      { id: "c2_1", text: "🎥 Камеры не работали" },
      { id: "c2_2", text: "🧼 Пол был недавно вымыт" },
      { id: "c2_3", text: "🔑 У охранника есть доступ везде" },
      { id: "c2_4", text: "📚 У студента был экзамен на следующий день" },
      { id: "c2_5", text: "🕒 Время смерти: после 20:00" }
    ],
    correctSuspectId: "s2_3",
    solution: "Охранник отключил камеры и убрал следы.",
    aiTaunts: ["You trusted the wrong person.", "Safety is an illusion.", "You look but you don't see."]
  },
  {
    id: "case-3",
    title: "Late Night Ride",
    situation: "Человек пропал после поездки на машине.",
    suspects: [
      { id: "s3_1", name: "Водитель такси", description: "последний видел жертву" },
      { id: "s3_2", name: "Друг", description: "звонил перед исчезновением" },
      { id: "s3_3", name: "Коллега", description: "конфликт на работе" }
    ],
    clues: [
      { id: "c3_1", text: "📍 GPS машины остановился в лесу" },
      { id: "c3_2", text: "🧾 Оплата прошла успешно" },
      { id: "c3_3", text: "📞 Последний звонок — другу" },
      { id: "c3_4", text: "🚗 В машине найдены следы борьбы" },
      { id: "c3_5", text: "🕒 Время: поздняя ночь" }
    ],
    correctSuspectId: "s3_1",
    solution: "У водителя такси был полный контроль над маршрутом.",
    aiTaunts: ["You let the driver dictate the route.", "You overlooked the isolation.", "Poor deduction skills."]
  }
];
