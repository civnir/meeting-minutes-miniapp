const { buildSummaryByLlm } = require('./llmSummaryService');
const { buildRuleSummary } = require('./ruleSummaryService');

async function buildSummary({ provider, title, attendees, segments, llmApiUrl, llmApiKey, llmModel }) {
  if (provider === 'llm') {
    try {
      return await buildSummaryByLlm({
        title,
        attendees,
        segments,
        apiUrl: llmApiUrl,
        apiKey: llmApiKey,
        model: llmModel
      });
    } catch (err) {
      console.warn('[summary] LLM failed, fallback to rules:', err.message);
    }
  }

  return buildRuleSummary({ title, attendees, segments });
}

module.exports = {
  buildSummary
};
