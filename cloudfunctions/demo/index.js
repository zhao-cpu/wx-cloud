// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const $ = _.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // cs_student
  let cStudent = await db.collection("cs_student").get();
  let cName = await db.collection("cs_name").get();

  console.log("cStudent", cStudent);
  console.log("cName", cName);

  let mer = await db.collection("cs_name").aggregate().lookup({
    from: "cs_student",
    localField: "_id",
    foreignField: "cs_gl",
    as: "cname"
  }).end()

  return {
    mer,
    cStudent,
    cName,
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
