// app.js
App({
  onLaunch: async function () {
    /* 更新版本提示 */
    if (!wx.canIUse("getUpdateManager")) {
      return;
    }
    const updateManager = wx.getUpdateManager();
    if (updateManager) {
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        // console.log(res.hasUpdate);
      });
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: "更新提示",
          content: "新版本已经准备好，是否重启应用？",
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate();
            }
          },
        });
      });
      updateManager.onUpdateFailed(function () {
        // 新版本下载失败
      });
    }
    /* 更新版本提示 end*/

    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: "cloud1-7gaeky1165d57e77",
        traceUser: true,
      });

      this.getOpenId();
    }
  },
  async getOpenId() {
    const app = this;
    let openId = wx.getStorageSync("openId");
    if (openId) {
      app.globalData.openId = openId;
      app.isLogin();
    } else {
      let data = await wx.cloud.callFunction({
        name: "getOpenId",
      });
      console.log(data);
      let openId = data.result.openId;
      wx.setStorageSync("openId", openId);
      app.globalData.openId = openId;
      app.isLogin();
    }
  },
  isLogin() {
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo && userInfo.nickName) {
      this.globalData.userInfo = userInfo;
      this.globalData.userLogin = true;
    } else {
      this.globalData.userLogin = false;
    }
  },
  globalData: {
    openId: null,
    userInfo: null,
    userLogin: false,
  },
});
