// pages/articleDetail/articleDetail.js
import time from "../../common/tools/timeFrom";
import timer from "../../common/tools/timeFormat";

Page({
  data: {
    articleId: "",
    detail: null,
    prevIndex: -1, // 上个页面传递的索引
    content: "",
  },
  // 评论内容
  handleInput(e) {
    const { value } = e.detail;
    this.setData({ content: value });
  },
  // 发送评论
  async handleComment() {
    try {
      let userInfo = wx.getStorageSync("userInfo");
      let { articleId, content } = this.data;
      content = content.replace(/^\s*|\s*$/g, "");
      if (!content) {
        return wx.showToast({
          title: "请输入内容",
          icon: "none",
        });
      }
      wx.showLoading({
        title: "评论中...",
        mask: true,
      });
      await wx.cloud.callFunction({
        name: "article",
        data: {
          action: "comment",
          id: articleId,
          content: content,
          image: [],
          nickName: userInfo?.nickName,
          avatarUrl: userInfo?.avatarUrl,
        },
      });
      wx.hideLoading();
      this.setData({ content: "" });
      this._initDetail();
    } catch (error) {
      console.log(error);
      wx.hideLoading();
    }
  },
  // 点赞
  async handleLike() {
    try {
      const { articleId, detail } = this.data;
      let type = 0;

      let userInfo = wx.getStorageSync("userInfo");
      if (userInfo._id) {
        if (detail?.isZan) type = 0;
        else {
          type = 1;
          // 点赞 触发订阅消息
          await wx.cloud.callFunction({
            name: "subscribe",
            data: {
              openId: detail?.openId,
              name: userInfo?.nickName,
              content: `你的文章${detail?.title?.slice(0, 10)}收到新的点赞`,
              id: articleId,
              time: timer(Date.now(), "yyyy年mm月dd日 hh:MM"),
            },
          });
        }
        wx.showLoading({
          title: "加载中...",
          mask: true,
        });
        await wx.cloud.callFunction({
          name: "article",
          data: {
            type,
            action: "zan",
            articleId,
            userId: wx.getStorageSync("userInfo")?._id,
          },
        });
        wx.hideLoading();
        this.setData({
          "detail.isZan": type == 1 ? true : false,
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
    } catch (error) {
      console.log(error);
      wx.hideLoading();
    }
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
              wx.cloud.callFunction({
                name: "article",
                data: {
                  action: "remove",
                  articleId,
                },
              });
              wx.hideLoading();
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

    this._initDetail();
  },
  async _initDetail() {
    try {
      const { articleId } = this.data;
      wx.showNavigationBarLoading();
      wx.showLoading({
        title: "加载中...",
        mask: true,
      });
      let data = await wx.cloud.callFunction({
        name: "article",
        data: {
          action: "detail",
          articleId,
          openId: wx.getStorageSync("openId"),
          userId: wx.getStorageSync("userInfo")?._id,
        },
      });
      wx.hideLoading();
      console.log("data", data);

      data.result.timeStr = time(
        data.result?.updateTime || 1650106923108,
        false
      );
      this.setData({ detail: data.result });
      wx.hideNavigationBarLoading();
    } catch (error) {
      console.log(error);
      wx.hideNavigationBarLoading();
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
  onPullDownRefresh: function () {
    this._initDetail();
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
