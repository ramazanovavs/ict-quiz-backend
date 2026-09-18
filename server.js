require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// В проде укажи ALLOWED_ORIGIN = адрес твоей страницы, чтобы запросы принимались только с него.
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// 15 недель курса «Информационно-коммуникационные технологии» — из силлабуса
// ЗКУ им. М. Утемисова (раздел «4 Структура и содержание дисциплины» + СРСП/СРС).
// material — отправная точка для модели, не исчерпывающий список: она вправе
// расширять и усложнять вопросы в рамках темы недели.
const WEEK_TOPICS = [
  { week: 1, topic: 'Роль ИКТ в развитии общества, стандарты ИКТ',
    material: 'Текущие возможности и виды ИКТ; этапы информационного развития общества; связь целей развития и ИКТ; стандарты ИКТ. Подтема (практическое занятие №2-3): системы счисления — перевод чисел между двоичной, восьмеричной, десятичной и шестнадцатеричной системами; арифметические операции (сложение, вычитание, умножение, деление) с числами в этих системах.' },
  { week: 2, topic: 'Архитектура компьютерных систем',
    material: 'Архитектура и компоненты компьютерных систем; использование компьютерных систем. Подтема: комплектация устройств ПК, подключение внешних (периферийных) устройств.' },
  { week: 3, topic: 'Операционные системы: функции, права доступа, аутентификация',
    material: 'Функции ОС; роль ОС в управлении ресурсами; взаимодействие приложений; сравнение ОС (Windows, macOS, Linux); настройка прав доступа; методы аутентификации (пароли, биометрия).' },
  { week: 4, topic: 'Взаимодействие человека и компьютера: интерфейсы (CLI, GUI)',
    material: 'Интерфейсы командной строки, их параметры; меню, звуковой и речевой интерфейс; графический интерфейс (WIMP/GUI, Post-WIMP). Подтема: практическая работа с текстовым редактором как пример прикладного интерфейса.' },
  { week: 5, topic: 'Системы баз данных: архитектура, нормализация',
    material: 'Три уровня архитектуры БД и их функции; стек БД; нормализация базы данных; нормальные формы 1НФ, 2НФ, 3НФ.' },
  { week: 6, topic: 'Анализ и управление данными, работа в MS Excel',
    material: 'Методы анализа, сбора, классификации и прогнозирования данных; формулы и графические возможности табличного редактора MS Excel; обработка числовой информации.' },
  { week: 7, topic: 'Сети и телекоммуникации, IP-адресация, маршрутизация',
    material: 'Устройства и средства передачи данных, виды сетей; IP-адрес и настройка маршрутизации; преимущества LAN и WAN; сравнение технологий FDDI, Ethernet, Token Ring. Подтема: сетевые топологии (звезда, кольцо, шина); устройства связи и проектирование сети крупной организации.' },
  { week: 8, topic: 'Кибербезопасность: вирусы, пароли, ЭЦП',
    material: 'Компьютерные вирусы и способы защиты от них, пути распространения; надёжность пароля; электронная цифровая подпись. Подтема: принципы криптографической защиты информации; установка пароля на компьютер и на документ.' },
  { week: 9, topic: 'Интернет-технологии и CMS (WordPress)',
    material: 'Виды CMS и их особенности; платформа WordPress: установка, настройка, шаблоны, плагины; компоненты CMS (обучающий ресурс, магазин, электронная форма).' },
  { week: 10, topic: 'Облачные и мобильные технологии',
    material: 'Поиск информации в интернете; облачные сервисы для обработки и хранения данных; облачные технологии. Подтема: практическое использование Google Docs и Microsoft Office Web Apps.' },
  { week: 11, topic: 'Мультимедийные технологии, MS PowerPoint',
    material: 'Работа с MS PowerPoint; медиа в контексте HCI — текст, изображение, аудио, видео, компьютерная графика. Подтема: технология обработки мультимедийной информации (презентации); сервис Canva и его основные возможности.' },
  { week: 12, topic: 'Умные технологии (Smart TV, умный дом)',
    material: 'Smart TV технологии (Apple TV, Google TV, Opera TV); умный дом, автоматизация и мониторинг, SMART-устройства.' },
  { week: 13, topic: 'Электронный бизнес, обучение и правительство',
    material: 'Модели электронного бизнеса, правовое регулирование; архитектура и платформы электронного обучения; концепция и сервисы электронного правительства.' },
  { week: 14, topic: 'ИКТ в профессиональной сфере',
    material: 'Программные решения для профессиональной сферы; безопасность индустриальных ИТ; применение ИКТ в медицине, энергетике и других отраслях.' },
  { week: 15, topic: 'Перспективы развития ИКТ, стартапы',
    material: 'Экосистема ИТ-предпринимательства, поддержка стартапов; программы акселерации и инкубации; перспективы развития электронных технологий. Подтема: инновационное образование.' }
];

function buildPrompt(weeks, perWeek) {
  const weeksBlock = weeks
    .map((w) => `Неделя ${w.week} — «${w.topic}»\nМатериал из силлабуса: ${w.material}`)
    .join('\n\n');
  return `Ты — генератор тестовых вопросов по дисциплине «Информационно-коммуникационные технологии» (ИКТ), составленный по силлабусу курса (учебные недели, Западно-Казахстанский университет им. М. Утемисова).

Для КАЖДОЙ из следующих ${weeks.length} недель сгенерируй ровно ${perWeek} вопрос(ов) с одним правильным ответом из четырёх вариантов — итого ровно ${weeks.length * perWeek} вопросов:

${weeksBlock}

Правила:
1. Вопросы и варианты ответов — на русском языке.
2. Указанный материал из силлабуса — отправная точка, а не жёсткая граница: можно расширять его смежными понятиями по теме недели и делать вопросы сложнее базового уровня, но не уходи в тему другой недели.
3. Если у недели указана «Подтема» — обязательно распредели вопросы этой недели между заглавной темой и подтемой (не задавай все вопросы недели только по заглавной теме, игнорируя подтему).
4. У каждого вопроса ровно 4 варианта в поле "options" и ровно один правильный.
5. "correct_index" — индекс правильного варианта (0-3), точно соответствующий содержимому options.
6. "week" — номер недели (целое число), к которой относится вопрос, точно как указано выше.
7. Прежде чем вернуть ответ, проверь для каждого вопроса, что среди 4 вариантов есть ровно один верный и он указан в correct_index.

Верни ТОЛЬКО JSON-массив (без markdown, без пояснений вне JSON) из объектов строго такого вида:
{"week": 1, "topic": "название темы недели дословно", "question": "текст вопроса", "options": ["вариант1","вариант2","вариант3","вариант4"], "correct_index": 0, "explanation": "краткое объяснение правильного ответа в 1-2 предложениях"}`;
}

// Сервер сам перепроверяет форму ответа модели и подставляет канонический топик
// по номеру недели — фронтенд доверяет только этому, а не тому, что скажет
// модель при последующей проверке.
function validateQuestions(data, weeks) {
  if (!Array.isArray(data)) return [];
  const byWeek = new Map(weeks.map((w) => [w.week, w.topic]));
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
        typeof q.explanation === 'string'
    )
    .map((q) => ({
      week: q.week,
      topic: byWeek.get(q.week), // канонический топик из WEEK_TOPICS, не от модели
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
    const requestedWeeks =
      Array.isArray(req.body && req.body.weeks) && req.body.weeks.length
        ? WEEK_TOPICS.filter((w) => req.body.weeks.includes(w.week))
        : WEEK_TOPICS;
    const perWeek = Number(req.body && req.body.perWeek) || 2;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: 'server_misconfigured', message: 'OPENAI_API_KEY не задан на сервере (.env)' });
    }
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const prompt = buildPrompt(requestedWeeks, perWeek);

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
    const cleaned = validateQuestions(parsed, requestedWeeks);

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
