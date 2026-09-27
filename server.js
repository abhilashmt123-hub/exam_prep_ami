const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const questionsPath = path.join(dataDir, 'questions.json');
const resultsPath = path.join(dataDir, 'results.json');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }

fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(resultsPath)) writeJson(resultsPath, { attempts: [] });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api/tests', (_req, res) => {
  const tests = readJson(questionsPath, { tests: [] }).tests || [];
  const attempts = readJson(resultsPath, { attempts: [] }).attempts || [];
  res.json(tests.map(({ id, title, questions }) => ({
    id, title, questionCount: questions.length,
    bestScore: attempts.filter(a => a.testId === id).reduce((best, a) => Math.max(best, a.score), null)
  })));
});
app.get('/api/random-test', (_req, res) => {
  const tests = readJson(questionsPath, { tests: [] }).tests || [];
  const questionsPerSection = 5;
  const targetSize = tests.length * questionsPerSection;
  const shuffle = list => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const bank = tests.flatMap(test => test.questions.map(question => ({ ...question, sourceTest: test.id })));
  if (bank.length < targetSize || tests.some(test => test.questions.length < questionsPerSection)) {
    return res.status(500).json({ error: 'The question bank needs at least five questions in every section.' });
  }
  // Every test includes exactly five questions from every learning section.
  const selected = tests.flatMap(test => shuffle(test.questions).slice(0, questionsPerSection).map(question => ({ ...question, sourceTest: test.id })));
  res.json({
    id: `practice-${Date.now()}`,
    title: 'Practice Test',
    questions: shuffle(selected)
  });
});
app.get('/api/tests/:id', (req, res) => {
  const test = (readJson(questionsPath, { tests: [] }).tests || []).find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });
  res.json(test);
});
app.get('/api/history', (_req, res) => res.json(readJson(resultsPath, { attempts: [] }).attempts || []));
app.post('/api/results', (req, res) => {
  const { testId, score, total, title = 'Practice Test' } = req.body;
  if (typeof testId !== 'string' || !Number.isInteger(score) || !Number.isInteger(total)) return res.status(400).json({ error: 'Invalid result' });
  const store = readJson(resultsPath, { attempts: [] });
  store.attempts.push({ testId, title, score, total, completedAt: new Date().toISOString() });
  writeJson(resultsPath, store);
  res.status(201).json({ ok: true });
});
app.listen(port, () => console.log(`LKG Talent Exam Practice is ready at http://localhost:${port}`));
