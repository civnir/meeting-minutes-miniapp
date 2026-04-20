const { requestJson } = require('../../lib/httpClient');

async function transcribeByAliyun({ transcriptText, apiUrl, apiKey }) {
  if (!apiUrl || !apiKey) {
    throw new Error('Aliyun ASR 未配置：缺少 ASR_API_URL 或 ASR_API_KEY');
  }

  // 这里预留为标准 HTTP 适配器，便于对接通义听悟/企业网关。
  // 推荐让你的网关统一返回：{ segments: [{ speaker, startMs, endMs, text }] }
  const result = await requestJson(apiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      transcriptText,
      diarization: true,
      timestamps: true
    },
    timeoutMs: 30000
  });

  if (!Array.isArray(result?.segments)) {
    throw new Error('Aliyun ASR 返回格式错误：缺少 segments 数组');
  }

  return result.segments;
}

module.exports = {
  transcribeByAliyun
};
