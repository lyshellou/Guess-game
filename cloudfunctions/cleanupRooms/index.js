const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
const rooms = db.collection('rooms');
const roomCodes = db.collection('roomCodes');

const RETENTION_HOURS = 5;
const PAGE_SIZE = 100;

async function reserveRoomCode(room) {
  if (!room.roomCode) {
    return;
  }

  const existing = await roomCodes.where({ roomCode: room.roomCode }).count();
  if (existing.total > 0) {
    return;
  }

  await roomCodes.add({
    data: {
      roomCode: room.roomCode,
      reservedAt: db.serverDate(),
      source: 'cleanupRooms'
    }
  });
}

exports.main = async () => {
  const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);
  let removed = 0;

  while (true) {
    const query = await rooms.where({
      status: 'closed',
      closedAt: _.lte(cutoff)
    }).limit(PAGE_SIZE).get();

    if (!query.data.length) {
      break;
    }

    for (const room of query.data) {
      await reserveRoomCode(room);
      await rooms.doc(room._id).remove();
      removed += 1;
    }

    if (query.data.length < PAGE_SIZE) {
      break;
    }
  }

  return {
    ok: true,
    removed,
    cutoff
  };
};
