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
  switch (event.action) {
    case "detail":
      return detail(event);
    case "zan":
      return zan(event);
    case "remove":
      return remove(event);
    case "likeList":
      return likeList(event);
    case "footmark":
      return footmark(event);
    case "list":
      return list(event);
    case "comment":
      return comment(event);
    default:
      return {};
  }
};
// 发布评论
async function comment(event) {
  try {
    const { id, content, image, nickName, avatarUrl } = event;
    const openId = cloud.getWXContext().OPENID;
    let data = await db
      .collection("article")
      .where({
        _id: id,
      })
      .update({
        data: {
          comments: _.push({ id, content, image, openId, nickName, avatarUrl }),
        },
      });
  } catch (error) {
    console.log(error);
  }
}

// 列表
async function list(event) {
  try {
    let { page = 1, limit = 10 } = event;
    let skip = (page - 1) * limit;
    let title = event.title ? event.title : "";
    return await cloud
      .database()
      .collection("article")
      .where({
        title: new db.RegExp({
          regexp: ".*" + title,
          options: "is",
        }),
      })
      .skip(skip)
      .limit(limit)
      .get();
  } catch (error) {
    console.log(error);
  }
}
// 足迹
async function footmark(event) {
  try {
    let { page, limit } = event;

    let skip = (page - 1) * limit;
    let data = await db
      .collection("footmark")
      .aggregate()
      .match({
        openId: cloud.getWXContext().OPENID,
      })
      .sort({
        updateTime: -1,
      })
      .skip(skip)
      .limit(limit)
      .lookup({
        from: "article",
        localField: "articleId",
        foreignField: "_id",
        as: "user",
      })
      .addFields({
        userInfo: $.arrayElemAt(["$user", 0]),
      })
      .project({
        user: 0,
      })

      .end();

    console.log("api", data);
    return data.list;
  } catch (error) {}
}
// 点赞列表
async function likeList(event) {
  try {
    let { page, limit } = event;

    let skip = (page - 1) * limit;
    console.log("skip", skip, "limit", limit);
    let data = await db
      .collection("like")
      .aggregate()
      .match({
        openId: cloud.getWXContext().OPENID,
      })
      .skip(skip)
      .limit(limit)
      .lookup({
        from: "article",
        localField: "articleId",
        foreignField: "_id",
        as: "user",
      })
      .addFields({
        userInfo: $.arrayElemAt(["$user", 0]),
      })
      .project({
        user: 0,
      })

      .end();

    console.log("api", data);
    return data.list;
  } catch (error) {}
}
// 删除
async function remove(event) {
  try {
    let { articleId } = event;
    await db.collection("article").doc(articleId).remove();
    await db
      .collection("footmark")
      .where({
        articleId,
      })
      .remove();
    await db
      .collection("like")
      .where({
        articleId,
      })
      .remove();
  } catch (error) {
    console.log(error);
  }
}
// 赞操作
async function zan(event) {
  try {
    const { articleId, userId, type } = event;
    // type == 1 点赞 否则 取消点赞
    if (type != 1) {
      await db
        .collection("like")
        .where({
          articleId,
          openId: cloud.getWXContext().OPENID,
        })
        .remove();
    } else {
      let data = await db.collection("like").add({
        data: {
          articleId,
          openId: cloud.getWXContext().OPENID,
        },
      });
      console.log(data);
    }
  } catch (error) {
    console.log(error);
  }
}

// 获取详情
async function detail(event) {
  try {
    let { articleId, openId } = event;

    let footmark = await db
      .collection("footmark")
      .where({
        openId,
        articleId,
      })
      .count();
    if (footmark.total > 0) {
      await db
        .collection("footmark")
        .where({
          openId,
          articleId,
        })
        .update({
          data: {
            openId,
            articleId,
            updateTime: Date.now(),
          },
        });
    } else {
      await db.collection("footmark").add({
        data: {
          openId,
          articleId,
          updateTime: Date.now(),
        },
      });
    }

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
      .lookup({
        from: "like",
        localField: "_id",
        foreignField: "articleId",
        as: "likes",
      })
      .addFields({
        userInfo: $.arrayElemAt(["$user", 0]),
      })
      .project({
        user: 0,
      })
      .end();

    // 阅读量 +1
    db.collection("article")
      .doc(articleId)
      .update({
        data: {
          readNum: _.inc(1),
        },
      });
    // 点赞数量
    const likeCount = await db.collection("like").where({
      articleId,
    }).count();
    console.log('likeCount',likeCount);
    data.list[0].likeCount = likeCount.total || 0;
    // 判断是否点过赞
    let count = await db
      .collection("like")
      .where({
        articleId,
        openId,
      })
      .count();
    // 已点赞
    if (count.total > 0) data.list[0].isZan = true;
    // 未点赞
    else data.list[0].isZan = false;

    if (data.list[0].openId == openId) data.list[0].isOwn = true;
    else data.list[0].isOwn = false;

    return data.list[0];
  } catch (error) {
    console.log(error);
  }
}
