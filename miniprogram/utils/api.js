const BASE_URL = 'http://127.0.0.1:3000';

function request(path, data = {}, method = 'POST') {
  const apiKey = wx.getStorageSync('internal_api_key') || '';

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${path}`,
      method,
      data,
      header: apiKey ? { 'x-api-key': apiKey } : {},
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        reject(new Error(res.data?.error || `请求失败: ${res.statusCode}`));
      },
      fail: (err) => reject(err)
    });
  });
}

function startMeeting(payload) {
  return request('/api/meetings/start', payload);
}

function appendTranscript(meetingId, content) {
  return request(`/api/meetings/${meetingId}/transcript`, { content });
}

function finishMeeting(payload) {
  return request('/api/meetings/finish', payload);
}

function getMeeting(meetingId) {
  return request(`/api/meetings/${meetingId}`, {}, 'GET');
}

module.exports = {
  startMeeting,
  appendTranscript,
  finishMeeting,
  getMeeting
};
