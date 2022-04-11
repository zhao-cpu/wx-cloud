// pages/articleDetail/articleDetail.js
const db = wx.cloud.database();
const _ = db.command;
const $ = _.aggregate;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    articleId: "",
    detail: null,
    prevIndex: -1, // 上个页面传递的索引
  },
  // 点赞
  async handleLike() {
    try {
      const { articleId } = this.data;
      let userId = wx.getStorageSync("userInfo")?._id;
      let res = await db
        .collection("like")
        .where({
          articleId,
          userId,
        })
        .count();
      if (res.total > 0) {
        await db
          .collection("like")
          .where({
            articleId,
            userId,
          })
          .remove();
      } else {
        let data = await db.collection("like").add({
          data: {
            articleId,
            userId,
          },
        });
        console.log(data);
      }
    } catch (error) {}
  },
  // 展示评论弹框
  handleShowComment() {
    wx.showToast({
      title: "暂未开放",
      icon: "none",
    });
  },
  // 管理
  async handleSetting() {
    try {
      const { articleId, prevIndex } = this.data;
      let res = await wx.showActionSheet({
        itemList: ["编辑", "删除"],
      });
      if (res.tapIndex === 0) {
        console.log("编辑");
        wx.navigateTo({
          url: `/pages/submit/submit?id=${articleId}`,
        });
      } else if (res.tapIndex === 1) {
        console.log("删除");
        wx.showModal({
          title: "您确定删除吗？",
          success: async (result) => {
            if (result.confirm) {
              wx.showLoading({
                title: "删除中",
                mask: true,
              });
              let data = await db.collection("article").doc(articleId).remove();
              wx.hideLoading();
              console.log(data);
              wx.navigateBack({
                delta: 1,
              });
              if (prevIndex > -1) {
                const pages = getCurrentPages();
                const prePage = pages?.[pages.length - 2];
                prePage?.data?.articleData?.splice(prevIndex, 1);
                prePage?.setData({
                  ["articleData"]: prePage?.data?.articleData,
                });
              }
            }
          },
        });
      }
    } catch (error) {
      wx.hideLoading();
    }
  },
  //   预览
  handlePreview(e) {
    const { detail } = this.data;
    const { index } = e.currentTarget.dataset;
    console.log(index, detail);
    wx.previewImage({
      urls: detail.images,
      current: detail.images[index],
    });
  },
  onLoad: function (options) {
    console.log("options", options);
    this.setData({
      articleId: options?.id,
      prevIndex: options?.index ?? -1,
    });
  },
  async _initDetail() {
    try {
      const { articleId } = this.data;
      wx.showNavigationBarLoading();

      let data = await wx.cloud.callFunction({
        name: "article",
        data: {
          articleId,
          openId: wx.getStorageSync("openId"),
        },
      });
      console.log("data", data);

      this.setData({ detail: data.result });
      wx.hideNavigationBarLoading();
    } catch (error) {
      console.log(error);
    }
  },

  onShow: function () {
    this._initDetail();
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
