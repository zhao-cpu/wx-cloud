// pages/search/search.js
Page({
  data: {
    title: "",
    detail: {
      page: 1,
      limit: 10,
      data: [],
      noMore: false,
    },
  },
  handleInput(e) {
    const title = e.detail.value;
    this.setData({ title });
  },
  handleSearch() {
    this._init(1);
  },
  handleNav(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/articleDetail/articleDetail?id=${id}`,
    });
  },
  async _init(num) {
    try {
      let { page, limit, data, noMore } = this.data.detail;
      const { title } = this.data;

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
          action: "list",
          title,
          page,
          limit,
        },
      });
      wx.hideLoading();
      console.log("data", res);

      if (res.result?.data.length < limit) {
        this.setData({
          [`detail.noMore`]: true,
        });
      }
      if (page != 1) {
        res.result.data = data.concat(res.result?.data);
      }
      this.setData({
        [`detail.data`]: res.result?.data,
        [`detail.page`]: page + 1,
      });
    } catch (error) {
      console.log(error);
      wx.hideLoading();
    }
  },
  onReachBottom: function () {
    this._init();
  },
});
