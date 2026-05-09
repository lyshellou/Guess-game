const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const rooms = db.collection('rooms');

function createRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function createPlayer(openid) {
  return {
    openid,
    name: `玩家${openid.slice(-4)}`,
    joinedAt: db.serverDate()
  };
}

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return {
      ok: false,
      message: '无法获取用户身份'
    };
  }

  for (let index = 0; index < 5; index += 1) {
    const roomCode = createRoomCode();
    const existing = await rooms.where({ roomCode }).count();

    if (existing.total > 0) {
      continue;
    }

    const room = {
      roomCode,
      ownerOpenid: openid,
      status: 'waiting',
      maxPlayers: 8,
      players: [createPlayer(openid)],
      gameState: {
        type: null,
        data: {}
      },
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    };

    const addResult = await rooms.add({
      data: room
    });

    return {
      ok: true,
      room: {
        _id: addResult._id,
        ...room
      },
      openid
    };
  }

  return {
    ok: false,
    message: '房号生成失败，请重试'
  };
};
