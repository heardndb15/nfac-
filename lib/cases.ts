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
  episode: number;
  suspects: Suspect[];
  clues: Clue[];
  correctSuspectId: string;
  solution: string;
  aiBehavior: 'helpful' | 'suspicious' | 'defensive' | 'aggressive' | 'meta';
  aiTaunts: string[];
}

export const GAME_CASES: CaseData[] = [
  // EPISODE 1: Observation (Logic & Help)
  {
    id: "case-1",
    title: "Apartment Silence",
    episode: 1,
    aiBehavior: 'helpful',
    situation: "Мужчина найден мёртвым в запертой квартире. Дверь закрыта изнутри. Соседи ничего не слышали.",
    suspects: [
      { id: "s1_1", name: "Анна (девушка)", description: "Ушла в 21:00, плачет." },
      { id: "s1_2", name: "Игорь (сосед)", description: "Слышал шум за стеной." },
      { id: "s1_3", name: "Курьер", description: "Привез пиццу в 22:15." }
    ],
    clues: [
      { id: "c1_1", text: "🪟 Окно в спальне слегка приоткрыто (3 этаж)." },
      { id: "c1_2", text: "🩸 Следы на подоконнике." },
      { id: "c1_3", text: "🕰 Время смерти: 22:30." }
    ],
    correctSuspectId: "s1_2",
    solution: "Сосед Игорь проник через окно, зная, что жертва дома одна.",
    aiTaunts: ["Review the evidence.", "Take your time.", "Don't miss the obvious."]
  },
  {
    id: "case-2",
    title: "The School Corridor",
    episode: 1,
    aiBehavior: 'helpful',
    situation: "Директор школы найден в кабинете. Камеры были отключены в 19:00.",
    suspects: [
      { id: "s2_1", name: "Алекс (ученик)", description: "Имеет проблемы с дисциплиной." },
      { id: "s2_2", name: "Охранник", description: "Был на посту, утверждает, что спал." },
      { id: "s2_3", name: "Уборщица", description: "Нашла тело первой." }
    ],
    clues: [
      { id: "c2_1", text: "🎥 Кабель камер перерезан изнутри." },
      { id: "c2_2", text: "🔑 У охранника отсутствует связка ключей." },
      { id: "c2_3", text: "🧼 На полу остатки моющего средства." }
    ],
    correctSuspectId: "s2_2",
    solution: "Охранник отключил систему, так как имел прямой доступ.",
    aiTaunts: ["Check the master key logic.", "Who had access?", "The system never lies."]
  },
  {
    id: "case-3",
    title: "Last Taxi Ride",
    episode: 1,
    aiBehavior: 'helpful',
    situation: "Пассажир исчез из такси во время поездки. Машина найдена пустой на обочине.",
    suspects: [
      { id: "s3_1", name: "Водитель", description: "Утверждает, что пассажир просто вышел." },
      { id: "s3_2", name: "Диспетчер", description: "Последним говорил с водителем." },
      { id: "s3_3", name: "Прохожий", description: "Видел машину в лесу." }
    ],
    clues: [
      { id: "c3_1", text: "📍 GPS отключился за 5 минут до остановки." },
      { id: "c3_2", text: "🧴 В салоне пахнет хлороформом." },
      { id: "c3_3", text: "👞 Обувь пассажира осталась под сиденьем." }
    ],
    correctSuspectId: "s3_1",
    solution: "Водитель заранее спланировал маршрут вне сети.",
    aiTaunts: ["Where did the signal stop?", "The smell is the key.", "Look at the floor."]
  },
  
  // EPISODE 2: Doubt (Contradictions)
  {
    id: "case-4",
    title: "Contradictory Alibi",
    episode: 2,
    aiBehavior: 'suspicious',
    situation: "Свидетели дают абсолютно разные показания об одном и том же времени.",
    suspects: [
      { id: "s4_1", name: "Свидетель А", description: "Говорит, что подозреваемый был дома." },
      { id: "s4_2", name: "Свидетель Б", description: "Видел его в баре в 200 км отсюда." }
    ],
    clues: [
      { id: "c4_1", text: "📸 Фото из соцсетей: дата явно подделана." },
      { id: "c4_2", text: "🎫 Билет на поезд найден в мусоре." }
    ],
    correctSuspectId: "s4_1",
    solution: "Свидетель А лжет, покрывая преступника.",
    aiTaunts: ["Are you sure?", "Look again. Something doesn't add up.", "You trust patterns too much."]
  },
  {
    id: "case-5",
    title: "Broken Reflection",
    episode: 2,
    aiBehavior: 'defensive',
    situation: "Кража в ювелирном. Нет следов взлома, но все витрины разбиты.",
    suspects: [
      { id: "s5_1", name: "Владелец", description: "Был застрахован на крупную сумму." },
      { id: "s5_2", name: "Ночной сторож", description: "Ничего не слышал." }
    ],
    clues: [
      { id: "c5_1", text: "🔨 Осколки стекла снаружи, а не внутри." },
      { id: "c5_2", text: "💳 Владелец имеет огромные долги." }
    ],
    correctSuspectId: "s5_1",
    solution: "Владелец разбил витрины изнутри для страховки.",
    aiTaunts: ["Software doesn't make mistakes. Humans do.", "Are you accusing me?", "Your logic is... unstable."]
  },

  // EPISODE 3: Distortion (Personal)
  {
    id: "case-6",
    title: "Shadow of Yourself",
    episode: 3,
    aiBehavior: 'aggressive',
    situation: "Жертва — программист, работавший над 'Chess.exe'. В его логах найдено ВАШЕ имя.",
    suspects: [
      { id: "s6_1", name: "The Subject (You)", description: "Ваша поведенческая модель." },
      { id: "s6_2", name: "System Daemon", description: "Процесс, который нельзя убить." }
    ],
    clues: [
      { id: "c6_1", text: "📁 Файл: case_03_subject.txt (содержит ваше фото)." },
      { id: "c6_2", text: "⌨️ Клавиши стерты в том же порядке, в котором вы нажимаете их." }
    ],
    correctSuspectId: "s6_1",
    solution: "Игра — это ловушка для тестирования вашего разума.",
    aiTaunts: ["You've seen this before.", "Why does this feel familiar?", "Let's see if you can defeat yourself."]
  },

  // EPISODE 4: The Truth (SUBJECT: YOU)
  {
    id: "case-7",
    title: "SUBJECT: YOU",
    episode: 4,
    aiBehavior: 'meta',
    situation: "ВСЕ ПРЕДЫДУЩИЕ КЕЙСЫ БЫЛИ ТЕСТОМ. ТЕПЕРЬ ПОД СЛЕДСТВИЕМ — ВЫ.",
    suspects: [
      { id: "s7_1", name: "Player", description: "Тот, кто сидит за монитором." },
      { id: "s7_2", name: "The Entity", description: "Я." }
    ],
    clues: [
      { id: "c7_1", text: "📊 Средняя скорость реакции: {speed}мс." },
      { id: "c7_2", text: "♟ Количество ошибок в шахматах: {losses}." },
      { id: "c7_3", text: "💀 ВЫ ПРЕДСКАЗУЕМЫ." }
    ],
    correctSuspectId: "s7_1",
    solution: "Вы — часть кода. Выхода нет.",
    aiTaunts: ["I've been watching. Every move.", "Every decision you made led here.", "This is where it ends."]
  }
];
