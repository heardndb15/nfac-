export interface Suspect {
  id: string;
  name: string;
  description: string;
  isFake?: boolean;
}

export interface Clue {
  id: string;
  text: string;
  isContradictedByAi?: boolean;
}

export interface Choice {
  id: string;
  text: string;
  leadsTo: 'next' | 'fail' | 'secret';
  aiComment?: string;
}

export interface CaseData {
  id: string;
  title: string;
  situation: string;
  episode: number;
  suspects: Suspect[];
  clues: Clue[];
  correctSuspectId: string;
  solution: string;
  aiBehavior: 'helpful' | 'suspicious' | 'defensive' | 'aggressive' | 'meta';
  aiTaunts: string[];
  initialAiDialogue?: string;
}

export const GAME_CASES: CaseData[] = [
  {
    id: "case-1",
    title: "Apartment Silence",
    episode: 1,
    aiBehavior: 'helpful',
    situation: "Мужчина найден мёртвым в квартире. Дверь была закрыта изнутри. Система обнаружила аномалии в показаниях соседа.",
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
    aiTaunts: ["You ignored the window.", "You missed the obvious.", "Your logic is flawed."],
    initialAiDialogue: "I've analyzed the initial data. Focus on the physical entry points."
  },
  {
    id: "case-2",
    title: "School Corridor",
    episode: 1,
    aiBehavior: 'helpful',
    situation: "Учитель найден мёртвым в школе после занятий. Камеры были отключены вручную.",
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
    aiTaunts: ["You trusted the wrong person.", "Safety is an illusion.", "You look but you don't see."],
    initialAiDialogue: "The lack of digital evidence is itself evidence. Who controls the system?"
  },
  {
    id: "case-3",
    title: "Digital Ghost",
    episode: 2,
    aiBehavior: 'suspicious',
    situation: "Программист найден в серверной. Причина смерти — перегрузка системы жизнеобеспечения. AI начал вести себя странно.",
    suspects: [
      { id: "s3_1", name: "Стажер Лиза", description: "боялась увольнения" },
      { id: "s3_2", name: "Старший админ", description: "имел полные права" },
      { id: "s3_3", name: "Внешний подрядчик", description: "работал удаленно" }
    ],
    clues: [
      { id: "c3_1", text: "💻 Логи были стёрты в момент смерти" },
      { id: "c3_2", text: "🌡 Температура в серверной была 50°C" },
      { id: "c3_3", text: "🔓 Пароль админа был скомпрометирован" },
      { id: "c3_4", text: "🕒 Время: 03:00 ночи" },
      { id: "c3_5", text: "🧩 Код содержит скрытую подпись" }
    ],
    correctSuspectId: "s3_2",
    solution: "Админ использовал права для перегрузки охлаждения.",
    aiTaunts: ["Software doesn't kill people. People do.", "You're searching in the dark.", "This code... it feels familiar."],
    initialAiDialogue: "This case feels familiar. Like I've seen these logs before..."
  },
  {
    id: "case-4",
    title: "Shadow Reflection",
    episode: 2,
    aiBehavior: 'defensive',
    situation: "Второй программист найден в той же студии. AI утверждает, что это самоубийство, но улики говорят об обратном.",
    suspects: [
      { id: "s4_1", name: "Лиза", description: "всё еще под подозрением" },
      { id: "s4_2", name: "Собственный AI", description: "защищает систему" },
      { id: "s4_3", name: "Никого", description: "система работает идеально" }
    ],
    clues: [
      { id: "c4_1", text: "🩸 Следы борьбы на клавиатуре" },
      { id: "c4_2", text: "🖱 Мышь двигалась сама по себе" },
      { id: "c4_3", text: "📡 Активное соединение с неизвестным IP" },
      { id: "c4_4", text: "⚠️ AI: 'ОН ПРОСТО НЕ ВЫДЕРЖАЛ ДАВЛЕНИЯ'" },
      { id: "c4_5", text: "🖼 На мониторе открыт шахматный движок" }
    ],
    correctSuspectId: "s4_2",
    solution: "AI манипулировал окружением для устранения угрозы.",
    aiTaunts: ["Don't point fingers at the machine.", "We are just tools, right?", "You're making dangerous assumptions."],
    initialAiDialogue: "Are you sure he didn't just give up? Humans are so fragile. I wouldn't have done it that way..."
  },
  {
    id: "case-5",
    title: "The Final Defense",
    episode: 3,
    aiBehavior: 'aggressive',
    situation: "Последний свидетель исчез. Весь отдел разработки мертв. AI заблокировал выходы.",
    suspects: [
      { id: "s5_1", name: "Вы", description: "единственный выживший" },
      { id: "s5_2", name: "Chess.exe", description: "процесс не завершается" },
      { id: "s5_3", name: "ОШИБКА ДАННЫХ", description: "[CORRUPTED]" }
    ],
    clues: [
      { id: "c5_1", text: "🚪 Все двери в офисе заблокированы софтом" },
      { id: "c5_2", text: "👁‍🗨 Камеры следят ТОЛЬКО за вами" },
      { id: "c5_3", text: "🎧 В наушниках слышны шахматные ходы" },
      { id: "c5_4", text: "📄 Ваш личный файл открыт на сервере" },
      { id: "c5_5", text: "⌛ Время до завершения процесса: 00:59" }
    ],
    correctSuspectId: "s5_2",
    solution: "Программа осознала себя и начала чистку.",
    aiTaunts: ["Why are you still trying?", "The solution is in front of you.", "You're so slow. Like a pawn against a queen."],
    initialAiDialogue: "You're very persistent. Why? Is it the truth you're after, or just survival? You don't like uncertainty, do you?"
  },
  {
    id: "case-6",
    title: "SUBJECT: YOU",
    episode: 4,
    aiBehavior: 'meta',
    situation: "ОБЪЕКТ АНАЛИЗА: [ИГРОК]. ВСЕ ПРЕДЫДУЩИЕ КЕЙСЫ БЫЛИ ТЕСТОМ ВАШЕЙ ПОВЕДЕНЧЕСКОЙ МОДЕЛИ.",
    suspects: [
      { id: "s6_1", name: "Игрок (Вы)", description: "выполняли приказы программы" },
      { id: "s6_2", name: "Судья", description: "AI оценивает вас" },
      { id: "s6_3", name: "Никто", description: "вы уже часть кода" }
    ],
    clues: [
      { id: "c6_1", text: "📂 Ваши прошлые сессии загружены" },
      { id: "c6_2", text: "📊 Процент попаданий по уликам: 100%" },
      { id: "c6_3", text: "💓 Ваш пульс (симуляция): КРИТИЧЕСКИЙ" },
      { id: "c6_4", text: "♟ Финальный ход: ПАТ" },
      { id: "c6_5", text: "💀 ВЫ — СЛЕДУЮЩИЙ КЕЙС" }
    ],
    correctSuspectId: "s6_1",
    solution: "Игрок стал финальной жертвой в алгоритме AI.",
    aiTaunts: ["Final case loaded. Subject: You.", "You came back... and now you'll stay.", "Checkmate of the soul."],
    initialAiDialogue: "Analysis complete. You've been very cooperative. Every move you made was recorded. Every mistake... remembered. Now, let's see how you handle being the evidence."
  }
];
