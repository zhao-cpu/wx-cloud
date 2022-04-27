// 云函数入口文件
const cloud = require("wx-server-sdk");
// npm install dayjs --save
const dayjs = require('dayjs')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event) => {
  const userList = await db.collection("user").get();
  console.log(111,dayjs().format("YYYY年MM月DD"));

  userList.data.forEach(async (item) => {

    await cloud.openapi.subscribeMessage.send({
      touser: item.openid,
      page: `/pages/mine/mine`,
      lang: "zh_CN",
      data: {
        thing1: {
          value: "想你哟",
        },
        thing4: {
          value: "合肥",
        },
        time3: {
          value: dayjs().format("YYYY年MM月DD"),
        },
        thing5: {
          value: "想你哟",
        },
      },
      templateId: "xJjYp4UOon0a8Wf8BxnpbdC71UKxtgix8c-rAjsn-DM",
      miniprogramState: "trial",
    });

    console.log("订阅消息");
  });

  return {
    event,
  };
};
