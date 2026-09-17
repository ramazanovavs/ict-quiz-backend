require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// В проде укажи ALLOWED_ORIGIN = адрес твоей страницы, чтобы запросы принимались только с него.
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

const TOPICS_LLM = [
  'Алгоритмы и программирование',
  'Сети и Интернет',
  'Базы данных',
  'Аппаратное обеспечение и ОС',
  'Информационная безопасность'
];

function buildPrompt(topics, perTopic) {
  const topicList = topics.map((t) => `"${t}"`).join(', ');
  return `Ты — генератор тестовых вопросов по дисциплине «Информационно-коммуникационные технологии» (ИКТ) для входного тестирования уровня подготовки студентов университета.

Сгенерируй ровно ${topics.length * perTopic} вопросов с одним правильным ответом из четырёх вариантов — по ${perTopic} вопросов на каждую из тем: ${topicList}.

Правила:
1. Вопросы и варианты ответов — на русском языке, уровень базового курса информатики в вузе.
2. У каждого вопроса ровно 4 варианта в поле "options" и ровно один правильный.
3. "correct_index" — индекс правильного варианта в массиве options (0, 1, 2 или 3), вычисленный тобой заранее и точно соответствующий содержимому options.
4. Не включай вопросы на перевод чисел между системами счисления и вычисление логических выражений — эти темы не нужны.
5. Прежде чем вернуть ответ, ещё раз проверь для каждого вопроса, что среди 4 вариантов есть ровно один верный и он указан в correct_index.

Верни ТОЛЬКО JSON-массив (без markdown, без пояснений вне JSON) из объектов строго такого вида:
{"topic": "одна из тем выше дословно", "question": "текст вопроса", "options": ["вариант1","вариант2","вариант3","вариант4"], "correct_index": 0, "explanation": "краткое объяснение правильного ответа в 1-2 предложениях"}`;
}

// Сервер сам перепроверяет форму ответа модели — фронтенд доверяет только этому,
// а не тому, что скажет модель при последующей проверке.
function validateQuestions(data, topics) {
  if (!Array.isArray(data)) return [];
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
        typeof q.topic === 'string' &&
        topics.includes(q.topic) &&
        typeof q.explanation === 'string'
    )
    .map((q) => ({
      topic: q.topic,
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
    const topics =
      Array.isArray(req.body && req.body.topics) && req.body.topics.length
        ? req.body.topics
        : TOPICS_LLM;
    const perTopic = Number(req.body && req.body.perTopic) || 5;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: 'server_misconfigured', message: 'OPENAI_API_KEY не задан на сервере (.env)' });
    }
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const prompt = buildPrompt(topics, perTopic);

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
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
    const cleaned = validateQuestions(parsed, topics);

    if (cleaned.length === 0) {
      return res.status(502).json({ error: 'invalid_json', message: 'Не удалось получить валидные вопросы от модели' });
    }

    res.json(cleaned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', message: err.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ICT quiz backend listening on port ${PORT}`));
