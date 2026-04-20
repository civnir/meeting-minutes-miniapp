const path = require('path');

function toBool(value, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  env: process.env.NODE_ENV || 'development',
  internalApiKey: process.env.INTERNAL_API_KEY || '',
  asrProvider: process.env.ASR_PROVIDER || 'mock',
  summaryProvider: process.env.SUMMARY_PROVIDER || 'rule',
  asrApiUrl: process.env.ASR_API_URL || '',
  asrApiKey: process.env.ASR_API_KEY || '',
  llmApiUrl: process.env.LLM_API_URL || '',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'qwen-plus',
  persistMeetings: toBool(process.env.PERSIST_MEETINGS, true),
  dbFile: process.env.DB_FILE || path.join(__dirname, 'data', 'meetings.json')
};
