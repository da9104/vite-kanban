import { io, Socket } from 'socket.io-client';

// The URL of your Node.js backend
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

// Initialize the socket with 'autoConnect: false'
// We will manually call .connect() in our AuthProvider once the user is logged in
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket'], // Forces WebSocket (better for performance than polling)
});

// Optional: Global listeners for debugging
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection Error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});