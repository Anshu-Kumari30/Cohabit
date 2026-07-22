import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Connect to the Socket.io server with JWT authentication.
 * Returns the existing connection if already connected.
 * @param {string} token - JWT token from localStorage
 * @returns {import('socket.io-client').Socket}
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  return socket;
};

/**
 * Disconnect the socket.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket fully disconnected');
  }
};

/**
 * Get the current socket instance (may be null if not connected).
 * @returns {import('socket.io-client').Socket | null}
 */
export const getSocket = () => socket;
