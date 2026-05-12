App({
  globalData: {
    cloudReady: false,
    cloudEnvId: null
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    let localEnv = {};
    try {
      localEnv = require('./env.local.js');
    } catch (error) {
      console.warn('未找到 env.local.js，请参考 env.example.js 创建本地配置');
    }

    const cloudEnvId = localEnv.cloudEnvId;

    if (!cloudEnvId || cloudEnvId === 'your-env-id') {
      console.warn('请先在 app.js 中配置云开发环境 ID');
      return;
    }

    wx.cloud.init({
      env: cloudEnvId,
      traceUser: true
    });

    this.globalData.cloudEnvId = cloudEnvId;
    this.globalData.cloudReady = true;
  }
});
