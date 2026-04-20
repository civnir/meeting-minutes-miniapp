const express = require('express');
const cors = require('cors');
const config = require('./config');
const { transcribe } = require('./services/asr');
const { buildSummary } = require('./services/summary');
const { MeetingStore } = require('./services/meetingStore');

const app = express();
const store = new MeetingStore({ filePath: config.dbFile, enablePersistence: config.persistMeetings });

app.use(cors());
app.use(express.json({ limit: '3mb' }));

app.use((req, res, next) => {
  if (!config.internalApiKey) return next();
  const token = req.headers['x-api-key'];
  if (token !== config.internalApiKey) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return next();
});

app.get('/health', (_, res) => {
  res.json({
    ok: true,
    env: config.env,
    asrProvider: config.asrProvider,
    summaryProvider: config.summaryProvider
  });
});

app.get('/api/meetings', (req, res) => {
  const limit = Number(req.query.limit || 20);
  const items = store.list({ limit });
  res.json({ items });
});

app.get('/api/meetings/:meetingId', (req, res) => {
  const meeting = store.get(req.params.meetingId);
  if (!meeting) return res.status(404).json({ error: 'meeting not found' });
  return res.json(meeting);
});

app.post('/api/meetings/start', (req, res) => {
  const { title, attendees = [], scenario = 'general' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });

  const meeting = {
    meetingId: `mtg_${Date.now()}`,
    title,
    attendees,
    scenario,
    transcriptText: '',
    segments: [],
    summary: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.create(meeting);
  return res.json({ meetingId: meeting.meetingId });
});

app.post('/api/meetings/:meetingId/transcript', (req, res) => {
  const { content = '' } = req.body || {};
  if (!content.trim()) return res.status(400).json({ error: 'content is required' });

  const updated = store.update(req.params.meetingId, (prev) => ({
    ...prev,
    transcriptText: [prev.transcriptText, content].filter(Boolean).join('\n'),
    updatedAt: new Date().toISOString()
  }));

  if (!updated) return res.status(404).json({ error: 'meeting not found' });
  return res.json({ ok: true, transcriptLength: updated.transcriptText.length });
});

app.post('/api/meetings/finish', async (req, res) => {
  const { meetingId, transcriptText = '' } = req.body || {};
  const meeting = store.get(meetingId);

  if (!meeting) return res.status(404).json({ error: 'meeting not found' });

  const mergedText = [meeting.transcriptText, transcriptText].filter(Boolean).join('\n').trim();
  if (!mergedText) return res.status(400).json({ error: 'transcriptText is required' });

  try {
    const segments = await transcribe({
      provider: config.asrProvider,
      transcriptText: mergedText,
      asrApiUrl: config.asrApiUrl,
      asrApiKey: config.asrApiKey
    });

    const summary = await buildSummary({
      provider: config.summaryProvider,
      title: meeting.title,
      attendees: meeting.attendees,
      segments,
      llmApiUrl: config.llmApiUrl,
      llmApiKey: config.llmApiKey,
      llmModel: config.llmModel
    });

    const updated = store.update(meetingId, (prev) => ({
      ...prev,
      transcriptText: mergedText,
      segments,
      summary,
      finishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    return res.json({
      meetingId,
      segments: updated.segments,
      summary: updated.summary
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(config.port, () => {
  console.log(`meeting server running at http://127.0.0.1:${config.port}`);
});
