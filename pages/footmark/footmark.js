// pages/footmark/footmark.js
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._init(1);
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
          action: "footmark",
          page,
          limit,
        },
      });
      console.log("res", res);
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
      wx.hideLoading();
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
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
