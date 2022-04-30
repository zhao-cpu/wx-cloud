// 云函数入口文件
const cloud = require("wx-server-sdk");
// npm install dayjs --save
const dayjs = require("dayjs");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event) => {
  const userList = await db.collection("user").get();
  console.log(111, dayjs().format("YYYY年MM月DD"));
  console.log(222, dayjs().hour());
  // flag true 夜里
  const flag = Number.parseInt(dayjs().hour()) > 10 ? true : false;
  const title = flag ? "晚安" : "早安";
  const remark = flag ? "在不睡明天起不来啦" : "早起搬砖啦";

  userList.data.forEach(async (item) => {
    await cloud.openapi.subscribeMessage.send({
      touser: item.openid,
      page: `/pages/mine/mine`,
      lang: "zh_CN",
      data: {
        thing1: {
          value: title,
        },
        thing4: {
          value: "地球",
        },
        time3: {
          value: dayjs().format("YYYY年MM月DD"),
        },
        thing5: {
          value: remark,
        },
      },
      templateId: "xJjYp4UOon0a8Wf8BxnpbdC71UKxtgix8c-rAjsn-DM",
      miniprogramState: "trial",
    });
  });

  return {
    event,
  };
};
