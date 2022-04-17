// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  try {
    const { openId, name, content, id } = event;
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openId,
      page: `/pages/articleDetail/articleDetail?id=${id}`,
      lang: "zh_CN",
      data: {
        thing1: {
          value: content,
        },
        thing3: {
          value: name,
        },
        time2: {
          value: "2022年04月11日 23:55",
        },
      },
      templateId: "2NREbnRpV9MWezQ4Pg785jxQduYz1rG6AU1TFOVdjK0",
      miniprogramState: "developer",
    });
    return result;
  } catch (err) {
    return err;
  }
  //   return {
  //     event,
  //     openid: wxContext.OPENID,
  //     appid: wxContext.APPID,
  //     unionid: wxContext.UNIONID,
  //   };
};
