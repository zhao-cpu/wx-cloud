// pages/mine/mine.js
const app = getApp();
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
  },
  handleLogout() {
    wx.removeStorageSync("userInfo");
    this.setData({ userInfo: null });
    app.globalData.userInfo = null
  },
  async handleLogin() {
    try {
      let openId = app.globalData.openId;
      wx.getUserProfile({
        desc: "用于完善资料",
        success: async (res) => {
          let data = await db
            .collection("user")
            .where({
              openid: openId,
            })
            .get();
          console.log(data, "111");
          if (data.data.length > 0) {
            this.setData({
              userInfo: data.data[0],
            });
            wx.setStorageSync("userInfo", data.data[0]);
          } else {
            let addData = await db.collection("user").add({
              data: {
                avatarUrl: res.userInfo.avatarUrl,
                nickName: res.userInfo.nickName,
                openid: openId,
              },
            });
            console.log("addData", addData);
            this.setData({
              userInfo: res.userInfo,
            });
            wx.setStorageSync("userInfo", res.userInfo);
          }
        },
      });
    } catch (error) {
      console.log(error);
    }
  },
  onLoad: function (options) {},

  onShow: function () {
    app.isLogin();

    this.setData({
      userInfo: app.globalData.userInfo,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
