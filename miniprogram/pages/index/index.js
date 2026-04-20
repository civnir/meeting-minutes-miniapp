Page({
  data: {
    meetingTitle: '需求评审会',
    participants: '产品,研发,测试'
  },

  onTitleInput(e) {
    this.setData({ meetingTitle: e.detail.value });
  },

  onParticipantsInput(e) {
    this.setData({ participants: e.detail.value });
  },

  startMeeting() {
    const { meetingTitle, participants } = this.data;
    const query = `title=${encodeURIComponent(meetingTitle)}&participants=${encodeURIComponent(participants)}`;
    wx.navigateTo({ url: `/pages/meeting/meeting?${query}` });
  }
});
