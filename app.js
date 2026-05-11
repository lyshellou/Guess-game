App({
  globalData: {
    cloudReady: false,
    cloudEnvId: 'your-env-id'
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    if (this.globalData.cloudEnvId === 'your-env-id') {
      console.warn('请先在 app.js 中配置云开发环境 ID');
      return;
    }

    wx.cloud.init({
      env: this.globalData.cloudEnvId,
      traceUser: true
    });

    this.globalData.cloudReady = true;
  }
});
