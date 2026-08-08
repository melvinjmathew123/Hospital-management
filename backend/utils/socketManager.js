// utils/socketManager.js
// ─── In-memory socket registry ─────────────────────────────────────────────────
// Maps userId (string) → socketId (string).
// On reconnect the old entry is simply overwritten.

const userSocketMap = new Map(); // userId → socketId
let _io = null;

/**
 * Call once after socket.io is initialised in server.js.
 * @param {import('socket.io').Server} io
 */
function init(io) {
  _io = io;
}

/**
 * Register / update a user's socket connection.
 * @param {string} userId
 * @param {string} socketId
 */
function registerSocket(userId, socketId) {
  userSocketMap.set(String(userId), socketId);
}

/**
 * Remove a user's socket entry on disconnect.
 * @param {string} socketId
 */
function unregisterSocket(socketId) {
  for (const [uid, sid] of userSocketMap.entries()) {
    if (sid === socketId) {
      userSocketMap.delete(uid);
      break;
    }
  }
}

/**
 * Emit a notification event to a specific user.
 * @param {string} userId
 * @param {object} payload  – { title, message, type, icon }
 */
function emitToUser(userId, payload) {
  if (!_io) return;
  const sid = userSocketMap.get(String(userId));
  if (sid) {
    _io.to(sid).emit('notification', { ...payload, timestamp: new Date() });
  }
}

/**
 * Emit a notification event to ALL currently connected users of a given role.
 * @param {string}   role        – e.g. 'Hospital Admin'
 * @param {object}   payload     – { title, message, type, icon }
 * @param {object[]} usersArray  – array of User objects with ._id and .role
 */
function emitToRole(role, payload, usersArray = []) {
  if (!_io) return;
  const roleUsers = usersArray.filter((u) => u.role === role);
  roleUsers.forEach((u) => emitToUser(u._id, payload));
}

module.exports = { init, registerSocket, unregisterSocket, emitToUser, emitToRole };
