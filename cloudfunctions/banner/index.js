// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database()
  // let data = await db
  //   .collection("article")
  //   .aggregate()
  //   .lookup({
  //     from: "user",
  //     localField: "openId",
  //     foreignField: "openid",
  //     as: "lb",
  //   })
  //   .end();

  // console.log(data);
  let data = await cloud.database().collection('banner').get()

  return {
    data,
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
