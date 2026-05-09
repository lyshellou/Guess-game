const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const rooms = db.collection('rooms');

function normalizeRoomCode(roomCode) {
  return String(roomCode || '').trim();
}

function createPlayer(openid) {
  return {
    openid,
    name: `玩家${openid.slice(-4)}`,
    joinedAt: db.serverDate()
  };
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

  if (room.status === 'closed') {
    return {
      ok: false,
      message: '房间已关闭'
    };
  }

  const players = room.players || [];
  const alreadyJoined = players.some((player) => player.openid === openid);

  if (alreadyJoined) {
    return {
      ok: true,
      room,
      openid
    };
  }

  if (players.length >= (room.maxPlayers || 8)) {
    return {
      ok: false,
      message: '房间已满'
    };
  }

  const nextPlayers = players.concat(createPlayer(openid));

  await rooms.doc(room._id).update({
    data: {
      players: nextPlayers,
      updatedAt: db.serverDate()
    }
  });

  return {
    ok: true,
    room: {
      ...room,
      players: nextPlayers
    },
    openid
  };
};
