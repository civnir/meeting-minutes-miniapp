Page({
  data: {
    meeting: null
  },

  onShow() {
    const meeting = getApp().globalData.latestMeeting;
    if (!meeting) {
      wx.showToast({ title: '暂无会议数据', icon: 'none' });
      return;
    }
    this.setData({ meeting });
  },

  copySummary() {
    const { meeting } = this.data;
    if (!meeting) return;

    const lines = [
      `会议：${meeting.summary.title}`,
      `日期：${meeting.summary.date}`,
      `参会：${meeting.summary.attendees.join('、')}`,
      '',
      ...meeting.summary.topics.map((t, idx) => `${idx + 1}. ${t.topic}\n- 结论：${t.decision}\n- 风险：${t.risks.join('；')}\n- 待办：${t.todos.map((x) => `${x.owner}:${x.task}(${x.dueDate})`).join('；')}`)
    ];

    wx.setClipboardData({ data: lines.join('\n') });
  }
});
