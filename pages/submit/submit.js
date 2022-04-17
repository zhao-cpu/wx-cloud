// pages/submit/submit.js
const db = wx.cloud.database();
Page({
  data: {
    title: "",
    desc: "",
    imageData: [],
    detailId: "",
    detail: null,
  },
  // 获取表单数据
  handleInput(e) {
    const { name } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({ [name]: value });
  },
  //   选择图片
  handleChooseImage() {
    let { imageData } = this.data;
    if (imageData.length >= 9)
      return wx.showToast({
        title: "最多只能选择9张图片",
        icon: "none",
      });
    wx.chooseImage({
      count: 9 - imageData.length,
      success: async (res) => {
        console.log(res.tempFilePaths);

        let temp = res.tempFilePaths;
        wx.showLoading({
          title: "加载中...",
          icon: "none",
        });
        for (let i = 0; i < temp.length; i++) {
          let data = await wx.cloud.uploadFile({
            cloudPath: new Date().getTime() + "i", // 上传至云端的路径
            filePath: temp[i], // 小程序临时文件路径
          });
          console.log(data);
          imageData.push(data.fileID);
        }
        wx.hideLoading();
        this.setData({
          imageData,
        });
      },
    });
  },
  async handleSubmit() {
    try {
      wx.requestSubscribeMessage({
        tmplIds: ["2NREbnRpV9MWezQ4Pg785jxQduYz1rG6AU1TFOVdjK0"],
        success: async (res) => {
          console.log(res);
          let { title, desc, imageData, detailId } = this.data;
          title = title.replace(/^\s*|\s*$/g, "");
          desc = desc.replace(/^\s*|\s*$/g, "");
          if (!title || title.length > 30) {
            return wx.showToast({
              title: "请输入标题（30字以内）",
              icon: "none",
            });
          }
          if (!desc) {
            return wx.showToast({
              title: "请输入内容",
              icon: "none",
            });
          }
          let data;
          wx.showLoading({
            title: "加载中",
            mask: true,
          });
          if (detailId) {
            //   编辑
            data = await wx.cloud
              .database()
              .collection("article")
              .doc(detailId)
              .update({
                data: {
                  title,
                  desc,
                  images: imageData,
                  updateTime: Date.now(),
                },
              });
          } else {
            data = await wx.cloud
              .database()
              .collection("article")
              .add({
                data: {
                  title,
                  desc,
                  images: imageData,
                  openId: wx.getStorageSync("openId"),
                  updateTime: Date.now(),
                },
              });
          }
          wx.hideLoading();
          console.log(data);
          if (detailId) {
            wx.navigateBack({
              delta: 1,
            });
          } else {
            wx.redirectTo({
              url: `/pages/articleDetail/articleDetail?id=${data._id}`,
            });
          }
        },
      });
    } catch (error) {}
  },
  onLoad: function (options) {
    this.setData({ detailId: options?.id });
    if (options?.id) {
      wx.setNavigationBarTitle({
        title: "编辑",
      });
      this._initDetail();
    }
  },
  async _initDetail() {
    try {
      const { detailId } = this.data;
      let data = await db.collection("article").doc(detailId).get();
      console.log(data);
      this.setData({
        detail: data.data,
        title: data.data.title,
        desc: data.data.desc,
        imageData: data.data.images,
      });
    } catch (error) {
      console.log(error);
    }
  },

  onShow: function () {},

  onShareAppMessage: function () {},
});
