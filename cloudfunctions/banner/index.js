// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 云函数入口函数
exports.main = async () => {
  let data = await cloud.database().collection("banner").get();
  return {
    data,
  };
};
