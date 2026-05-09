Page({
  data: {
    roomCode: '',
    room: {},
    players: [],
    currentOpenid: '',
    statusText: '等待中',
    loading: false,
    leaving: false
  },

  onLoad(options) {
    this.setData({
      roomCode: options.roomCode || ''
    });
    this.loadRoom();
  },

  onPullDownRefresh() {
    this.loadRoom().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadRoom() {
    const roomCode = this.data.roomCode;
    if (!roomCode) {
      this.showError('缺少房号');
      return;
    }

    this.setData({ loading: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getRoom',
        data: { roomCode }
      });

      const response = result.result || {};
      if (!response.ok) {
        throw new Error(response.message || '读取房间失败');
      }

      this.setData({
        room: response.room,
        players: response.room.players || [],
        currentOpenid: response.openid || '',
        statusText: response.room.status === 'closed' ? '已关闭' : '等待中'
      });
    } catch (error) {
      this.showError(error.message || '读取房间失败，请稍后再试');
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleLeaveRoom() {
    if (this.data.leaving) {
      return;
    }

    this.setData({ leaving: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'leaveRoom',
        data: { roomCode: this.data.roomCode }
      });

      const response = result.result || {};
      if (!response.ok) {
        throw new Error(response.message || '离开房间失败');
      }

      wx.navigateBack({
        fail: () => {
          wx.redirectTo({
            url: '/pages/index/index'
          });
        }
      });
    } catch (error) {
      this.showError(error.message || '离开房间失败，请稍后再试');
    } finally {
      this.setData({ leaving: false });
    }
  },

  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none'
    });
  }
});
