// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
 // 订阅消息
      // let subscribe = await wx.cloud.callFunction({
      //   name: "subscribe",
      //   data: {
      //     openId: detail?.openId,
      //     name: wx.getStorageSync("userInfo")?.nickName,
      //     content: `${wx.getStorageSync("userInfo")?.nickName}给你点赞`,
      //     id: detail?._id,
      //   },
      // });
      // console.log(subscribe, "subscribe");
    return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}