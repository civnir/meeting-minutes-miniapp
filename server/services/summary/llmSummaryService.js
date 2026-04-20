const { requestJson } = require('../../lib/httpClient');

function buildPrompt({ title, attendees, segments }) {
  const transcript = segments.map((s) => `${s.speaker}: ${s.text}`).join('\n');
  return `你是资深项目经理。请把会议内容整理成 JSON。\n会议标题: ${title}\n参会人: ${attendees.join('、')}\n\n转写:\n${transcript}`;
}

function ensureSchema(summary) {
  if (!summary || !summary.title || !Array.isArray(summary.topics)) {
    throw new Error('LLM 输出结构不合法');
  }
  return summary;
}

async function buildSummaryByLlm({ title, attendees, segments, apiUrl, apiKey, model }) {
  if (!apiUrl || !apiKey) {
    throw new Error('LLM 未配置：缺少 LLM_API_URL 或 LLM_API_KEY');
  }

  const response = await requestJson(apiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: '仅输出 JSON，结构需包含 title/date/attendees/topics，topics 含 topic/decision/risks/todos。'
        },
        {
          role: 'user',
          content: buildPrompt({ title, attendees, segments })
        }
      ]
    },
    timeoutMs: 40000
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) throw new Error('LLM 返回内容为空');

  const summary = typeof content === 'string' ? JSON.parse(content) : content;
  return ensureSchema(summary);
}

module.exports = {
  buildSummaryByLlm
};
