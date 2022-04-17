// pages/like/like.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detail: {
      page: 1,
      limit: 10,
      data: [],
      noMore: false,
    },
  },

  handleNav(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/articleDetail/articleDetail?id=${id}`,
    });
  },
  onLoad: async function (options) {
    await this._init(1);
  },
  async _init(num) {
    try {
      let { page, limit, data, noMore } = this.data.detail;

      if (num) page = num;
      if (noMore && page > 1) {
        return;
      } else {
        this.setData({
          [`detail.noMore`]: false,
        });
      }
      wx.showLoading({
        title: "加载中...",
        mask: true,
      });
      let res = await wx.cloud.callFunction({
        name: "article",
        data: {
          action: "likeList",
          page,
          limit,
        },
      });
      wx.hideLoading();
      console.log("data", res);

      if (res.result.length < limit) {
        this.setData({
          [`detail.noMore`]: true,
        });
      }
      if (page != 1) {
        res.result = data.concat(res.result);
      }
      this.setData({
        [`detail.data`]: res.result,
        [`detail.page`]: page + 1,
      });
    } catch (error) {
      console.log(error);
      wx.hideLoading();
    }
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
  onPullDownRefresh: async function () {
    await this._init(1);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._init();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
