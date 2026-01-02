'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
// WebSocket URL - remove /v1 if present, keep base URL
// Socket.io namespaces: connect to base URL, namespace is in the path
const WS_URL = API_URL.replace(/\/v1\/?$/, ''); // Remove trailing /v1 from API URL for WebSocket

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

  // Initialize WebSocket connection
  useEffect(() => {
    // Connect directly to the /whatsapp namespace
    // The namespace is part of the URL path: http://localhost:3002/whatsapp
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
      console.log('WhatsApp WebSocket connected to /whatsapp namespace');
      setIsConnected(true);
      setError(null); // Clear any previous errors
      
      // Subscribe to account updates if accountId is provided
      if (accountId) {
        console.log('Emitting subscribe:account for:', accountId);
        newSocket.emit('subscribe:account', accountId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WhatsApp WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError(`Failed to connect to WhatsApp service: ${err.message}`);
    });

    setSocket(newSocket);

    return () => {
      if (accountId) {
        newSocket.emit('unsubscribe:account', accountId);
      }
      newSocket.close();
    };
  }, []); // Only run once on mount

  // Subscribe/unsubscribe when accountId changes
  useEffect(() => {
    if (!socket) {
      console.log('Socket not initialized yet');
      return;
    }

    // Wait for connection before subscribing
    if (!isConnected) {
      console.log('Waiting for WebSocket connection...');
      const connectHandler = () => {
        if (accountId) {
          console.log('Subscribing to account after connect:', accountId);
          socket.emit('subscribe:account', accountId);
        }
        socket.off('connect', connectHandler);
      };
      socket.on('connect', connectHandler);
      return () => {
        socket.off('connect', connectHandler);
      };
    }

    if (accountId) {
      console.log('Subscribing to account:', accountId);
      socket.emit('subscribe:account', accountId);
    } else {
      console.log('No accountId provided for subscription');
    }

    return () => {
      if (accountId && isConnected) {
        console.log('Unsubscribing from account:', accountId);
        socket.emit('unsubscribe:account', accountId);
      }
    };
  }, [socket, isConnected, accountId]);

  // Handle QR code events
  useEffect(() => {
    if (!socket) return;

    const handleQRCode = (data: QRCodeEvent) => {
      console.log('QR code event received:', { accountId: data.accountId, currentAccountId: accountId, hasQR: !!data.qrCode });
      if (data.accountId === accountId) {
        console.log('Setting QR code for account:', accountId);
        setQrCode(data.qrCode);
        setQrExpiresIn(data.expiresIn);
        
        // Start countdown
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        
        let remaining = data.expiresIn;
        setQrExpiresIn(remaining);
        
        countdownIntervalRef.current = setInterval(() => {
          remaining -= 1;
          setQrExpiresIn(remaining);
          
          if (remaining <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            setQrCode(null);
            setQrExpiresIn(0);
          }
        }, 1000);
      } else {
        console.log('QR code event ignored - accountId mismatch:', { eventAccountId: data.accountId, currentAccountId: accountId });
      }
    };

    socket.on('qr:code', handleQRCode);

    return () => {
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

