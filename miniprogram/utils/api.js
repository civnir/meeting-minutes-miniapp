const BASE_URL = 'http://127.0.0.1:3000';

function request(path, data = {}, method = 'POST') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${path}`,
      method,
      data,
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

function finishMeeting(payload) {
  return request('/api/meetings/finish', payload);
}

module.exports = {
  startMeeting,
  finishMeeting
};
