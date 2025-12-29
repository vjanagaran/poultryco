/**
 * Socket.io Client for Real-time Features
 * Replaces Supabase real-time subscriptions
 */

import { io, Socket } from 'socket.io-client';
import { apiClient } from '../api/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

let socket: Socket | null = null;

/**
 * Initialize Socket.io connection
 */
export function initSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const token = apiClient.getToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket.io connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket.io disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Reconnect socket with new token
 */
export function reconnectSocket(): void {
  disconnectSocket();
  return initSocket();
}

// Auto-reconnect when token changes
if (typeof window !== 'undefined') {
  // Listen for storage changes (token updates)
  window.addEventListener('storage', (e) => {
    if (e.key === 'app_token' && socket) {
      reconnectSocket();
    }
  });
}

