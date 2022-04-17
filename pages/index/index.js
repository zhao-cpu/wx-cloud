Page({
  data: {
    bannerData: [],
    articleData: [],
  },
  // 跳转详情
  handleNav(e) {
    const { id, type, index } = e.currentTarget.dataset;
    if (type === "detail") {
      wx.navigateTo({
        url: `/pages/articleDetail/articleDetail?id=${id}&index=${index}`,
      });
    } else if (type === "search") {
      wx.navigateTo({
        url: "/pages/search/search",
      });
    } else if (type === "submit") {
      let userInfo = wx.getStorageSync("userInfo");
      if (userInfo._id) {
        wx.navigateTo({
          url: "/pages/submit/submit",
        });
      } else {
        wx.showModal({
          title: "提示",
          content: "登录享受更多功能！",
          success: (res) => {
            if (res.confirm)
              wx.switchTab({
                url: "/pages/mine/mine",
              });
          },
        });
      }
    }
  },
  onLoad: function (options) {
    this._initBanner();
    this._initArtice();
  },
  // 获取轮播数据
  async _initBanner() {
    try {
      let res = await wx.cloud.callFunction({
        name: "banner",
      });
      this.setData({
        bannerData: res.result.data?.data,
      });
    } catch (error) {
      console.log(error);
    }
  },
  // 获取文章数据
  async _initArtice() {
    try {
      wx.showNavigationBarLoading();
      let data = await wx.cloud.database().collection("article").get();
      console.log("data", data);
      this.setData({
        articleData: data.data,
      });
      wx.hideNavigationBarLoading();
    } catch (error) {}
  },

  onShow: function () {},

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
  onPullDownRefresh: function () {
    this._initBanner();
    this._initArtice();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
