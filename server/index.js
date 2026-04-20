const express = require('express');
const cors = require('cors');
const { splitSpeakerLines } = require('./services/mockAsrService');
const { buildSummary } = require('./services/summaryService');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const meetings = new Map();

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/api/meetings/start', (req, res) => {
  const { title, attendees = [] } = req.body || {};
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  const meetingId = `mtg_${Date.now()}`;
  meetings.set(meetingId, {
    meetingId,
    title,
    attendees,
    createdAt: new Date().toISOString()
  });

  return res.json({ meetingId });
});

app.post('/api/meetings/finish', (req, res) => {
  const { meetingId, transcriptText } = req.body || {};
  const meeting = meetings.get(meetingId);

  if (!meeting) {
    return res.status(404).json({ error: 'meeting not found' });
  }

  if (!transcriptText || !transcriptText.trim()) {
    return res.status(400).json({ error: 'transcriptText is required' });
  }

  const segments = splitSpeakerLines(transcriptText);
  const summary = buildSummary({
    title: meeting.title,
    attendees: meeting.attendees,
    segments
  });

  const result = {
    meetingId,
    segments,
    summary
  };

  meetings.set(meetingId, {
    ...meeting,
    result,
    finishedAt: new Date().toISOString()
  });

  return res.json(result);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`meeting server running at http://127.0.0.1:${port}`);
});
