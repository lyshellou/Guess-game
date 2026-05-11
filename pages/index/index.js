Page({
  data: {
    roomCode: '',
    creating: false,
    joining: false
  },

  handleRoomCodeInput(event) {
    const roomCode = String(event.detail.value || '').replace(/\D/g, '').slice(0, 6);
    this.setData({ roomCode });
  },

  async handleCreateRoom() {
    if (this.data.creating || this.data.joining) {
      return;
    }

    if (!this.ensureCloudReady()) {
      return;
    }

    this.setData({ creating: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'createRoom'
      });

      const response = result.result || {};
      if (!response.ok) {
        throw new Error(response.message || '创建房间失败');
      }

      this.goToRoom(response.room.roomCode);
    } catch (error) {
      this.showError(error.message || '创建房间失败，请稍后再试');
    } finally {
      this.setData({ creating: false });
    }
  },

  async handleJoinRoom() {
    if (this.data.creating || this.data.joining) {
      return;
    }

    if (!this.ensureCloudReady()) {
      return;
    }

    const roomCode = this.data.roomCode.trim();
    if (!/^\d{6}$/.test(roomCode)) {
      this.showError('请输入 6 位房号');
      return;
    }

    this.setData({ joining: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'joinRoom',
        data: { roomCode }
      });

      const response = result.result || {};
      if (!response.ok) {
        throw new Error(response.message || '加入房间失败');
      }

      this.goToRoom(response.room.roomCode);
    } catch (error) {
      this.showError(error.message || '加入房间失败，请稍后再试');
    } finally {
      this.setData({ joining: false });
    }
  },

  goToRoom(roomCode) {
    wx.navigateTo({
      url: `/pages/room/room?roomCode=${roomCode}`
    });
  },

  ensureCloudReady() {
    const app = getApp();
    if (app.globalData.cloudReady) {
      return true;
    }

    wx.showModal({
      title: '云开发未配置',
      content: '请先使用真实小程序 AppID 打开项目，并把 app.js 中的 cloudEnvId 改成你的云开发环境 ID，然后部署 createRoom 云函数。',
      showCancel: false
    });

    return false;
  },

  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none'
    });
  }
});
