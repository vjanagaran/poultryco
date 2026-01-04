'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
// WebSocket URL - remove /v1 if present, keep base URL
// Socket.io namespaces: connect to base URL, namespace is in the path
// For production: https://api.poultryco.net/v1 -> https://api.poultryco.net
// For local: http://localhost:3002/v1 -> http://localhost:3002
const WS_URL = API_URL.replace(/\/v1\/?$/, ''); // Remove trailing /v1 from API URL for WebSocket

// Debug logging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('WebSocket URL:', `${WS_URL}/whatsapp`);
}

export interface WhatsAppWebSocketEvent {
  type: 'qr:code' | 'status:update' | 'connection:state' | 'phone:detected' | 'error';
  accountId: string;
  data?: any;
  timestamp: number;
}

export interface QRCodeEvent {
  accountId: string;
  qrCode: string;
  expiresIn: number;
  timestamp: number;
}

export interface StatusEvent {
  accountId: string;
  status: string;
  data?: any;
  timestamp: number;
}

export interface ConnectionStateEvent {
  accountId: string;
  state: string;
  details?: any;
  timestamp: number;
}

export interface PhoneDetectedEvent {
  accountId: string;
  phoneNumber: string;
  pushName?: string;
  timestamp: number;
}

export interface ErrorEvent {
  accountId: string;
  error: string;
  details?: any;
  timestamp: number;
}

export function useWhatsAppWebSocket(accountId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrExpiresIn, setQrExpiresIn] = useState<number>(0);
  const [status, setStatus] = useState<string>('inactive');
  const [connectionState, setConnectionState] = useState<string>('inactive');
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [pushName, setPushName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null); // Keep a ref to prevent premature cleanup
  const isMountedRef = useRef(true);

  // Initialize WebSocket connection (only once, persistent across accountId changes)
  useEffect(() => {
    // Prevent multiple connections
    if (socketRef.current?.connected) {
      console.log('🔌 WebSocket already connected, skipping initialization');
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');
    console.log('WebSocket URL:', `${WS_URL}/whatsapp`);
    
    // Connect directly to the /whatsapp namespace
    const newSocket = io(`${WS_URL}/whatsapp`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      autoConnect: true,
      withCredentials: true, // Include credentials for CORS
    });

    newSocket.on('connect', () => {
      if (!isMountedRef.current) return;
      console.log('✅ WhatsApp WebSocket connected to /whatsapp namespace');
      setIsConnected(true);
      setError(null); // Clear any previous errors
      // Note: Subscription will be handled by the separate useEffect when accountId changes
    });

    newSocket.on('disconnect', (reason) => {
      if (!isMountedRef.current) return;
      console.log('🔌 WhatsApp WebSocket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        console.log('Server disconnected, will attempt to reconnect...');
      }
    });

    newSocket.on('connect_error', (err) => {
      if (!isMountedRef.current) return;
      console.error('❌ WebSocket connection error:', err);
      setError(`Failed to connect to WhatsApp service: ${err.message}`);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      // Only cleanup on actual unmount
      isMountedRef.current = false;
      console.log('🧹 Cleaning up WebSocket connection (component unmounting)...');
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []); // Only run once on mount - socket connection is persistent

  // Subscribe/unsubscribe when accountId changes
  useEffect(() => {
    if (!socket) {
      console.log('Socket not initialized yet');
      return;
    }

    // Wait for connection before subscribing
    if (!isConnected) {
      console.log('⏳ Waiting for WebSocket connection...');
      const connectHandler = () => {
        console.log('✅ WebSocket connected, subscribing to account:', accountId);
        if (accountId) {
          socket.emit('subscribe:account', accountId);
        }
      };
      socket.once('connect', connectHandler);
      return () => {
        socket.off('connect', connectHandler);
      };
    }

    // Subscribe or unsubscribe based on accountId
    if (accountId) {
      console.log('📡 Subscribing to account:', accountId);
      socket.emit('subscribe:account', accountId);
    } else {
      console.log('ℹ️ No accountId provided for subscription (this is normal on accounts list page)');
    }

    return () => {
      if (accountId && isConnected && socket) {
        console.log('🔌 Unsubscribing from account (accountId changed):', accountId);
        try {
          socket.emit('unsubscribe:account', accountId);
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      }
    };
  }, [socket, isConnected, accountId]);

  // Handle QR code events
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Socket not available for QR code handler');
      return;
    }

    const handleQRCode = (data: QRCodeEvent) => {
      console.log('🔔 QR code event received:', { 
        eventAccountId: data.accountId, 
        currentAccountId: accountId, 
        hasQR: !!data.qrCode,
        qrCodeLength: data.qrCode?.length || 0,
        expiresIn: data.expiresIn
      });
      
      if (data.accountId === accountId) {
        if (!data.qrCode) {
          console.warn('⚠️ QR code event received but qrCode is empty/null');
          return;
        }
        
        console.log('✅ Setting QR code for account:', accountId);
        setQrCode(data.qrCode);
        setQrExpiresIn(data.expiresIn);
        
        // Clear existing countdown
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        
        // Start countdown using state updater function to avoid closure issues
        const startTime = Date.now();
        const initialExpiresIn = data.expiresIn;
        
        countdownIntervalRef.current = setInterval(() => {
          setQrExpiresIn((prev) => {
            // Calculate remaining time based on elapsed time
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, initialExpiresIn - elapsed);
            
            if (remaining <= 0) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
              setQrCode(null);
              return 0;
            }
            
            return remaining;
          });
        }, 1000);
      } else {
        console.log('❌ QR code event ignored - accountId mismatch:', { eventAccountId: data.accountId, currentAccountId: accountId });
      }
    };

    console.log('👂 Registering QR code event listener for account:', accountId);
    socket.on('qr:code', handleQRCode);

    return () => {
      console.log('🧹 Cleaning up QR code event listener');
      socket.off('qr:code', handleQRCode);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [socket, accountId]);

  // Handle status updates
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data: StatusEvent) => {
      if (data.accountId === accountId) {
        setStatus(data.status);
        if (data.data) {
          // Update phone number if provided
          if (data.data.phoneNumber) {
            setPhoneNumber(data.data.phoneNumber);
          }
          if (data.data.pushName) {
            setPushName(data.data.pushName);
          }
        }
      }
    };

    socket.on('status:update', handleStatusUpdate);

    return () => {
      socket.off('status:update', handleStatusUpdate);
    };
  }, [socket, accountId]);

  // Handle connection state
  useEffect(() => {
    if (!socket) return;

    const handleConnectionState = (data: ConnectionStateEvent) => {
      if (data.accountId === accountId) {
        setConnectionState(data.state);
      }
    };

    socket.on('connection:state', handleConnectionState);

    return () => {
      socket.off('connection:state', handleConnectionState);
    };
  }, [socket, accountId]);

  // Handle phone number detection
  useEffect(() => {
    if (!socket) return;

    const handlePhoneDetected = (data: PhoneDetectedEvent) => {
      if (data.accountId === accountId) {
        setPhoneNumber(data.phoneNumber);
        if (data.pushName) {
          setPushName(data.pushName);
        }
      }
    };

    socket.on('phone:detected', handlePhoneDetected);

    return () => {
      socket.off('phone:detected', handlePhoneDetected);
    };
  }, [socket, accountId]);

  // Handle errors
  useEffect(() => {
    if (!socket) return;

    const handleError = (data: ErrorEvent) => {
      if (data.accountId === accountId) {
        setError(data.error);
      }
    };

    socket.on('error', handleError);

    return () => {
      socket.off('error', handleError);
    };
  }, [socket, accountId]);

  // Format countdown timer
  const formatCountdown = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isConnected,
    qrCode,
    qrExpiresIn,
    qrCountdown: formatCountdown(qrExpiresIn),
    status,
    connectionState,
    phoneNumber,
    pushName,
    error,
    clearError: () => setError(null),
  };
}

