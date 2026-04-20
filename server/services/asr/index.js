const { transcribeFromText } = require('./mockAsrService');
const { transcribeByAliyun } = require('./aliyunAsrService');

async function transcribe({ provider, transcriptText, asrApiUrl, asrApiKey }) {
  if (!transcriptText || !transcriptText.trim()) {
    throw new Error('transcriptText is required');
  }

  if (provider === 'aliyun') {
    return transcribeByAliyun({ transcriptText, apiUrl: asrApiUrl, apiKey: asrApiKey });
  }

  return transcribeFromText(transcriptText);
}

module.exports = {
  transcribe
};
