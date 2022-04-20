const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  try {
    const { openId, name, content, id, time } = event;
    await cloud.openapi.subscribeMessage.send({
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
          value: time,
        },
      },
      templateId: "2NREbnRpV9MWezQ4Pg785jxQduYz1rG6AU1TFOVdjK0",
      miniprogramState: "formal",
    });
    return {
      errCode: 1,
    };
  } catch (err) {
    return {
      errCode: 0,
    };
  }
};
