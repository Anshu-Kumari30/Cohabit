const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

/**
 * Initialize Socket.io server with JWT authentication.
 * @param {import('http').Server} server - HTTP server instance
 * @param {import('mysql2/promise').Pool} pool - MySQL connection pool
 * @param {string[]} allowedOrigins - CORS allowed origins
 * @returns {import('socket.io').Server}
 */
function initSocket(server, pool, allowedOrigins) {
  io = new Server(server, {
    cors: {
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(null, true); // allow all origins in dev
      },
      credentials: true,
    },
  });

  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

  // Authenticate every socket connection via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const [rows] = await pool.query(
        `SELECT id, first_name AS firstName, last_name AS lastName,
                email, house_id AS houseId
         FROM users WHERE id = ?`,
        [decoded.id]
      );
      if (!rows.length) {
        return next(new Error('User not found'));
      }
      socket.user = rows[0];
      next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.firstName} ${socket.user.lastName} (ID: ${socket.user.id})`);

    // Join personal room for targeted notifications
    socket.join(`user:${socket.user.id}`);

    // Join house room for shared real-time updates
    if (socket.user.houseId) {
      socket.join(`house:${socket.user.houseId}`);
      console.log(`  → Joined house:${socket.user.houseId}`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.firstName} ${socket.user.lastName}`);
    });
  });

  return io;
}

/**
 * Get the Socket.io server instance (must be initialized first).
 * @returns {import('socket.io').Server}
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket() first.');
  }
  return io;
}

module.exports = { initSocket, getIO };
