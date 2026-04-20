const api = require('../../utils/api');

const recorderManager = wx.getRecorderManager();

Page({
  data: {
    title: '',
    participants: '',
    meetingId: '',
    isRecording: false,
    transcriptDraft: '',
    statusText: '未开始'
  },

  onLoad(options) {
    this.setData({
      title: decodeURIComponent(options.title || '会议'),
      participants: decodeURIComponent(options.participants || '')
    });

    recorderManager.onStart(() => this.setData({ isRecording: true, statusText: '录音中...' }));
    recorderManager.onStop(() => this.setData({ isRecording: false, statusText: '录音结束，待整理' }));
  },

  async onReady() {
    try {
      const attendees = this.data.participants.split(',').map((x) => x.trim()).filter(Boolean);
      const data = await api.startMeeting({ title: this.data.title, attendees, scenario: 'requirements' });
      this.setData({ meetingId: data.meetingId });
    } catch (err) {
      wx.showToast({ title: err.message || '创建会议失败', icon: 'none' });
    }
  },

  toggleRecording() {
    if (this.data.isRecording) {
      recorderManager.stop();
      return;
    }

    recorderManager.start({
      duration: 3600000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3'
    });
  },

  onDraftInput(e) {
    this.setData({ transcriptDraft: e.detail.value });
  },

  async appendDraft() {
    if (!this.data.meetingId || !this.data.transcriptDraft.trim()) {
      wx.showToast({ title: '请先输入转写文本', icon: 'none' });
      return;
    }

    try {
      await api.appendTranscript(this.data.meetingId, this.data.transcriptDraft);
      this.setData({ transcriptDraft: '' });
      wx.showToast({ title: '已追加到会议', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: err.message || '追加失败', icon: 'none' });
    }
  },

  async finishMeeting() {
    if (!this.data.meetingId) {
      wx.showToast({ title: '会议ID缺失', icon: 'none' });
      return;
    }

    try {
      const result = await api.finishMeeting({
        meetingId: this.data.meetingId,
        transcriptText: this.data.transcriptDraft
      });
      getApp().globalData.latestMeeting = result;
      wx.navigateTo({ url: '/pages/summary/summary' });
    } catch (err) {
      wx.showToast({ title: err.message || '生成纪要失败', icon: 'none' });
    }
  }
});
