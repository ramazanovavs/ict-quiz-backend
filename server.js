require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// В проде укажи ALLOWED_ORIGIN = адрес твоей страницы, чтобы запросы принимались только с него.
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

const LANGS = ['ru', 'kk', 'en'];
const LANG_NAMES = { ru: 'русском', kk: 'казахском', en: 'английском' };

// 15 недель курса «Информационно-коммуникационные технологии» — из силлабуса
// ЗКУ им. М. Утемисова (раздел «4 Структура и содержание дисциплины» + СРСП/СРС).
// material — источник на русском (из самого силлабуса), отправная точка для
// модели, не исчерпывающий список: она вправе расширять и усложнять вопросы
// в рамках темы недели. topic — название темы в трёх языках; при генерации на
// казахском/английском заголовок темы уходит в промпт уже переведённым, а
// material остаётся на русском как справочный материал — модель сама
// переносит смысл на нужный язык вывода.
const WEEK_TOPICS = [
  { week: 1,
    topic: { ru: 'Роль ИКТ в развитии общества, стандарты ИКТ', kk: 'ААТ-ның қоғам дамуындағы рөлі, ААТ стандарттары', en: "The role of ICT in society's development, ICT standards" },
    material: 'Текущие возможности и виды ИКТ; этапы информационного развития общества; связь целей развития и ИКТ; стандарты ИКТ. Подтема (практическое занятие №2-3): системы счисления — перевод чисел между двоичной, восьмеричной, десятичной и шестнадцатеричной системами; арифметические операции (сложение, вычитание, умножение, деление) с числами в этих системах.' },
  { week: 2,
    topic: { ru: 'Архитектура компьютерных систем', kk: 'Компьютерлік жүйелер архитектурасы', en: 'Computer systems architecture' },
    material: 'Архитектура и компоненты компьютерных систем; использование компьютерных систем. Подтема: комплектация устройств ПК, подключение внешних (периферийных) устройств.' },
  { week: 3,
    topic: { ru: 'Операционные системы: функции, права доступа, аутентификация', kk: 'Операциялық жүйелер: функциялары, қатынау құқықтары, аутентификация', en: 'Operating systems: functions, access rights, authentication' },
    material: 'Функции ОС; роль ОС в управлении ресурсами; взаимодействие приложений; сравнение ОС (Windows, macOS, Linux); настройка прав доступа; методы аутентификации (пароли, биометрия).' },
  { week: 4,
    topic: { ru: 'Взаимодействие человека и компьютера: интерфейсы (CLI, GUI)', kk: 'Адам мен компьютердің өзара әрекеттесуі: интерфейстер (CLI, GUI)', en: 'Human-computer interaction: interfaces (CLI, GUI)' },
    material: 'Интерфейсы командной строки, их параметры; меню, звуковой и речевой интерфейс; графический интерфейс (WIMP/GUI, Post-WIMP). Подтема: практическая работа с текстовым редактором как пример прикладного интерфейса.' },
  { week: 5,
    topic: { ru: 'Системы баз данных: архитектура, нормализация', kk: 'Дерекқор жүйелері: архитектурасы, нормалануы', en: 'Database systems: architecture, normalization' },
    material: 'Три уровня архитектуры БД и их функции; стек БД; нормализация базы данных; нормальные формы 1НФ, 2НФ, 3НФ.' },
  { week: 6,
    topic: { ru: 'Анализ и управление данными, работа в MS Excel', kk: 'Деректерді талдау және басқару, MS Excel-де жұмыс', en: 'Data analysis and management, working in MS Excel' },
    material: 'Методы анализа, сбора, классификации и прогнозирования данных; формулы и графические возможности табличного редактора MS Excel; обработка числовой информации.' },
  { week: 7,
    topic: { ru: 'Сети и телекоммуникации, IP-адресация, маршрутизация', kk: 'Желілер және телекоммуникациялар, IP-адрестеу, маршруттау', en: 'Networks and telecommunications, IP addressing, routing' },
    material: 'Устройства и средства передачи данных, виды сетей; IP-адрес и настройка маршрутизации; преимущества LAN и WAN; сравнение технологий FDDI, Ethernet, Token Ring. Подтема: сетевые топологии (звезда, кольцо, шина); устройства связи и проектирование сети крупной организации.' },
  { week: 8,
    topic: { ru: 'Кибербезопасность: вирусы, пароли, ЭЦП', kk: 'Киберқауіпсіздік: вирустар, парольдер, ЭЦҚ', en: 'Cybersecurity: viruses, passwords, digital signatures' },
    material: 'Компьютерные вирусы и способы защиты от них, пути распространения; надёжность пароля; электронная цифровая подпись. Подтема: принципы криптографической защиты информации; установка пароля на компьютер и на документ.' },
  { week: 9,
    topic: { ru: 'Интернет-технологии и CMS (WordPress)', kk: 'Интернет-технологиялар және CMS (WordPress)', en: 'Internet technologies and CMS (WordPress)' },
    material: 'Виды CMS и их особенности; платформа WordPress: установка, настройка, шаблоны, плагины; компоненты CMS (обучающий ресурс, магазин, электронная форма).' },
  { week: 10,
    topic: { ru: 'Облачные и мобильные технологии', kk: 'Бұлтты және мобильді технологиялар', en: 'Cloud and mobile technologies' },
    material: 'Поиск информации в интернете; облачные сервисы для обработки и хранения данных; облачные технологии. Подтема: практическое использование Google Docs и Microsoft Office Web Apps.' },
  { week: 11,
    topic: { ru: 'Мультимедийные технологии, MS PowerPoint', kk: 'Мультимедиа технологиялары, MS PowerPoint', en: 'Multimedia technologies, MS PowerPoint' },
    material: 'Работа с MS PowerPoint; медиа в контексте HCI — текст, изображение, аудио, видео, компьютерная графика. Подтема: технология обработки мультимедийной информации (презентации); сервис Canva и его основные возможности.' },
  { week: 12,
    topic: { ru: 'Умные технологии (Smart TV, умный дом)', kk: 'Ақылды технологиялар (Smart TV, ақылды үй)', en: 'Smart technologies (Smart TV, smart home)' },
    material: 'Smart TV технологии (Apple TV, Google TV, Opera TV); умный дом, автоматизация и мониторинг, SMART-устройства.' },
  { week: 13,
    topic: { ru: 'Электронный бизнес, обучение и правительство', kk: 'Электрондық бизнес, оқыту және үкімет', en: 'E-business, e-learning and e-government' },
    material: 'Модели электронного бизнеса, правовое регулирование; архитектура и платформы электронного обучения; концепция и сервисы электронного правительства.' },
  { week: 14,
    topic: { ru: 'ИКТ в профессиональной сфере', kk: 'Кәсіби саладағы ААТ', en: 'ICT in the professional sphere' },
    material: 'Программные решения для профессиональной сферы; безопасность индустриальных ИТ; применение ИКТ в медицине, энергетике и других отраслях.' },
  { week: 15,
    topic: { ru: 'Перспективы развития ИКТ, стартапы', kk: 'ААТ дамуының перспективалары, стартаптар', en: 'Prospects for ICT development, startups' },
    material: 'Экосистема ИТ-предпринимательства, поддержка стартапов; программы акселерации и инкубации; перспективы развития электронных технологий. Подтема: инновационное образование.' }
];

function distributeCounts(n, total) {
  // Делит total вопросов между n неделями как можно равномернее:
  // часть недель получает на один вопрос больше, если total не делится нацело.
  const base = Math.floor(total / n);
  const remainder = total % n;
  const counts = new Array(n).fill(base);
  for (let i = 0; i < remainder; i++) counts[i] += 1;
  return counts;
}

function splitDifficulty(n) {
  // 40% лёгких / 40% средних / 20% сложных на n вопросов одной недели.
  // Округление: easy и hard — обычное округление, medium добирает остаток,
  // так итог всегда точно равен n даже при небольших n (2-5 вопросов).
  const easy = Math.round(n * 0.4);
  const hard = Math.round(n * 0.2);
  const medium = Math.max(0, n - easy - hard);
  return { easy, medium, hard };
}

function buildPrompt(weeksWithCounts, lang) {
  const total = weeksWithCounts.reduce((s, w) => s + w.count, 0);
  const langName = LANG_NAMES[lang] || LANG_NAMES.ru;
  const weeksBlock = weeksWithCounts
    .map((w) => `Неделя ${w.week} — «${w.topic[lang] || w.topic.ru}» (сгенерировать ровно ${w.count} вопрос(а/ов): ${w.difficulty.easy} лёгких, ${w.difficulty.medium} средних, ${w.difficulty.hard} сложных)\nМатериал из силлабуса (источник на русском языке): ${w.material}`)
    .join('\n\n');
  const langRule = lang === 'ru'
    ? '1. Вопросы, варианты ответов и объяснения — на русском языке.'
    : `1. Материал из силлабуса ниже приведён на русском языке только как справочный источник смысла — сами вопросы, варианты ответов ("options") и объяснения ("explanation") должны быть написаны ЦЕЛИКОМ на ${langName} языке. Поле "topic" тоже верни на ${langName} языке — так, как оно дано в заголовке недели ниже.`;
  return `Ты — генератор тестовых вопросов по дисциплине «Информационно-коммуникационные технологии» (ИКТ), составленный по силлабусу курса (учебные недели, Западно-Казахстанский университет им. М. Утемисова).

Ниже перечислены недели курса, для каждой указано ровно сколько вопросов нужно сгенерировать и с каким распределением по сложности. Всего по всем неделям вместе — ровно ${total} вопросов с одним правильным ответом из четырёх вариантов:

${weeksBlock}

Уровни сложности (используй как ориентир при составлении каждого вопроса):
- "easy" (лёгкий) — прямое воспроизведение факта, термина или определения из материала.
- "medium" (средний) — применение понятия к конкретной ситуации или рассуждение в один шаг.
- "hard" (сложный) — многошаговое рассуждение, сравнение нескольких понятий между собой или разбор пограничного случая/исключения.

Правила:
${langRule}
2. Указанный материал из силлабуса — отправная точка, а не жёсткая граница: можно расширять его смежными понятиями по теме недели, но не уходи в тему другой недели.
3. Если у недели указана «Подтема» — обязательно распредели вопросы этой недели между заглавной темой и подтемой (не задавай все вопросы недели только по заглавной теме, игнорируя подтему).
4. У каждого вопроса ровно 4 варианта в поле "options" и ровно один правильный.
5. "correct_index" — индекс правильного варианта (0-3), точно соответствующий содержимому options.
6. "week" — номер недели (целое число), к которой относится вопрос, точно как указано выше.
7. "difficulty" — строго одно из трёх значений: "easy", "medium" или "hard" (латиницей, независимо от языка вопроса) — ровно по числу, указанному для этой недели.
8. Прежде чем вернуть ответ, проверь для каждого вопроса, что среди 4 вариантов есть ровно один верный и он указан в correct_index, и что число вопросов по каждой неделе и по каждому уровню сложности точно совпадает с указанным.

Верни ТОЛЬКО JSON-массив (без markdown, без пояснений вне JSON) из объектов строго такого вида:
{"week": 1, "topic": "название темы недели", "difficulty": "easy", "question": "текст вопроса", "options": ["вариант1","вариант2","вариант3","вариант4"], "correct_index": 0, "explanation": "краткое объяснение правильного ответа в 1-2 предложениях"}`;
}

// Сервер сам перепроверяет форму ответа модели и подставляет канонический топик
// по номеру недели и языку — фронтенд доверяет только этому, а не тому, что
// скажет модель при последующей проверке.
function validateQuestions(data, weeks, lang) {
  if (!Array.isArray(data)) return [];
  const byWeek = new Map(weeks.map((w) => [w.week, w.topic[lang] || w.topic.ru]));
  const ALLOWED_DIFFICULTY = ['easy', 'medium', 'hard'];
  return data
    .filter(
      (q) =>
        q &&
        typeof q.question === 'string' &&
        q.question.trim() &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((o) => typeof o === 'string' && o.trim()) &&
        Number.isInteger(q.correct_index) &&
        q.correct_index >= 0 &&
        q.correct_index <= 3 &&
        Number.isInteger(q.week) &&
        byWeek.has(q.week) &&
        ALLOWED_DIFFICULTY.includes(q.difficulty) &&
        typeof q.explanation === 'string'
    )
    .map((q) => ({
      week: q.week,
      topic: byWeek.get(q.week), // канонический топик из WEEK_TOPICS на нужном языке, не от модели
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation
    }));
}

function extractJson(text) {
  let t = String(text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  try {
    return JSON.parse(t);
  } catch (e) {
    // falls through
  }
  const start = t.indexOf('[');
  const end = t.lastIndexOf(']');
  if (start !== -1 && end !== -1) {
    return JSON.parse(t.slice(start, end + 1));
  }
  throw new Error('Модель вернула невалидный JSON');
}

app.post('/api/generate-questions', async (req, res) => {
  try {
    const lang = LANGS.includes(req.body && req.body.lang) ? req.body.lang : 'ru';
    const requestedWeeks =
      Array.isArray(req.body && req.body.weeks) && req.body.weeks.length
        ? WEEK_TOPICS.filter((w) => req.body.weeks.includes(w.week))
        : WEEK_TOPICS;
    const totalQuestions = Number(req.body && req.body.totalQuestions)
      || requestedWeeks.length * (Number(req.body && req.body.perWeek) || 2);
    const counts = distributeCounts(requestedWeeks.length, totalQuestions);
    const weeksWithCounts = requestedWeeks.map((w, i) => Object.assign({}, w, { count: counts[i], difficulty: splitDifficulty(counts[i]) }));

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: 'server_misconfigured', message: 'OPENAI_API_KEY не задан на сервере (.env)' });
    }
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const prompt = buildPrompt(weeksWithCounts, lang);

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('OpenAI error:', upstream.status, errText);
      return res.status(502).json({ error: 'upstream_error', message: `OpenAI вернул ${upstream.status}` });
    }

    const data = await upstream.json();
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    const parsed = extractJson(content);
    const cleaned = validateQuestions(parsed, requestedWeeks, lang);

    if (cleaned.length === 0) {
      return res.status(502).json({ error: 'invalid_json', message: 'Не удалось получить валидные вопросы от модели' });
    }

    res.json(cleaned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', message: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'ict-quiz-backend',
    endpoints: ['GET /health', 'POST /api/generate-questions']
  });
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ICT quiz backend listening on port ${PORT}`));
