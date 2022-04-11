// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  let { articleId, openId } = event;
  let data = await db
    .collection("article")
    .aggregate()
    .match({
      _id: articleId,
    })
    .lookup({
      from: "user",
      localField: "openId",
      foreignField: "openid",
      as: "user",
    })
    .end();
  // let data = await db.collection("article").doc(articleId).get();
  db.collection("article")
    .doc(articleId)
    .update({
      data: {
        readNum: _.inc(1),
      },
    });
  console.log(data.list[0]);

  if (data.list[0].openId == openId) {
    data.list[0].isOwn = true;
  } else {
    data.list[0].isOwn = false;
  }

  return data.list[0];
};
