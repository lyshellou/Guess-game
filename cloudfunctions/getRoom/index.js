const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const rooms = db.collection('rooms');

function normalizeRoomCode(roomCode) {
  return String(roomCode || '').trim();
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const roomCode = normalizeRoomCode(event.roomCode);

  if (!openid) {
    return {
      ok: false,
      message: '无法获取用户身份'
    };
  }

  if (!/^\d{6}$/.test(roomCode)) {
    return {
      ok: false,
      message: '请输入 6 位房号'
    };
  }

  const query = await rooms.where({ roomCode }).limit(1).get();
  const room = query.data[0];

  if (!room) {
    return {
      ok: false,
      message: '房间不存在'
    };
  }

  return {
    ok: true,
    room,
    openid
  };
};
