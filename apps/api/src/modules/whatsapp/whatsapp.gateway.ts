import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/whatsapp',
  cors: {
    // Use ADMIN_URL if set, otherwise fall back to CORS_ORIGIN, then defaults
    origin: process.env.ADMIN_URL?.split(',') || 
            process.env.CORS_ORIGIN?.split(',') || 
            ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002', 'https://admin.poultryco.net'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
})
export class WhatsAppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhatsAppGateway.name);
  private connectedClients: Map<string, Set<string>> = new Map(); // accountId -> Set of socketIds
  private currentQRCodes: Map<string, { qrCode: string; expiresIn: number; timestamp: number }> = new Map(); // Store current QR codes

  afterInit(server: Server) {
    this.logger.log('WhatsApp WebSocket Gateway initialized on namespace /whatsapp');
    this.logger.log('WebSocket server ready for connections');
    
    // Configure Socket.IO server to handle CORS for polling transport
    // Note: server.engine might not be available in all Socket.IO versions
    // CORS is primarily handled by the @WebSocketGateway decorator configuration
    try {
      if (server.engine) {
        server.engine.on('connection_error', (err: any) => {
          this.logger.error('Socket.IO connection error:', err);
        });
        
        // Ensure CORS headers are set for all transports (including polling)
        server.engine.on('headers', (headers: any, req: any) => {
          const origin = req.headers.origin;
          const allowedOrigins = process.env.ADMIN_URL?.split(',') || 
                                 process.env.CORS_ORIGIN?.split(',') || 
                                 ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002', 'https://admin.poultryco.net'];
          
          if (origin && allowedOrigins.includes(origin)) {
            headers['Access-Control-Allow-Origin'] = origin;
            headers['Access-Control-Allow-Credentials'] = 'true';
            headers['Access-Control-Allow-Methods'] = 'GET, POST';
            headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
          }
        });
      }
    } catch (error) {
      this.logger.warn('Could not configure Socket.IO engine CORS handlers:', error);
      this.logger.log('CORS is configured via @WebSocketGateway decorator');
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to /whatsapp namespace: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove client from all account subscriptions
    this.connectedClients.forEach((clients, accountId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.connectedClients.delete(accountId);
      }
    });
  }

  @SubscribeMessage('subscribe:account')
  async handleSubscribeAccount(client: Socket, accountId: string) {
    if (!this.connectedClients.has(accountId)) {
      this.connectedClients.set(accountId, new Set());
    }
    this.connectedClients.get(accountId)!.add(client.id);
    this.logger.log(`Client ${client.id} subscribed to account ${accountId}`);
    
    // Join room for this account
    client.join(`account:${accountId}`);
    
    // Send current QR code if available
    const storedQR = this.currentQRCodes.get(accountId);
    if (storedQR) {
      // Calculate remaining time
      const elapsed = Math.floor((Date.now() - storedQR.timestamp) / 1000);
      const remaining = Math.max(0, storedQR.expiresIn - elapsed);
      
      if (remaining > 0) {
        client.emit('qr:code', {
          accountId,
          qrCode: storedQR.qrCode,
          expiresIn: remaining,
          timestamp: storedQR.timestamp,
        });
        this.logger.log(`Sent current QR code to client ${client.id} for account ${accountId} (${remaining}s remaining)`);
      } else {
        // QR expired, remove it
        this.currentQRCodes.delete(accountId);
      }
    }
    
    return { success: true, accountId };
  }

  @SubscribeMessage('unsubscribe:account')
  handleUnsubscribeAccount(client: Socket, accountId: string) {
    const clients = this.connectedClients.get(accountId);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.connectedClients.delete(accountId);
      }
    }
    client.leave(`account:${accountId}`);
    this.logger.log(`Client ${client.id} unsubscribed from account ${accountId}`);
    
    return { success: true, accountId };
  }

  // Emit QR code to all clients subscribed to this account
  emitQRCode(accountId: string, qrCode: string, expiresIn: number = 20) {
    // Store QR code for new subscribers
    this.currentQRCodes.set(accountId, {
      qrCode,
      expiresIn,
      timestamp: Date.now(),
    });
    
    const qrEvent = {
      accountId,
      qrCode,
      expiresIn,
      timestamp: Date.now(),
    };
    
    // Get all clients in the room
    const room = this.server.sockets.adapter.rooms.get(`account:${accountId}`);
    const clientCount = room ? room.size : 0;
    
    this.logger.log(`Emitting QR code for account ${accountId} to ${clientCount} client(s)`);
    this.logger.debug(`QR code event:`, { accountId, hasQR: !!qrCode, expiresIn, clientCount });
    
    this.server.to(`account:${accountId}`).emit('qr:code', qrEvent);
    this.logger.log(`✅ QR code emitted for account ${accountId}`);
  }

  // Emit status update to all clients subscribed to this account
  emitStatus(accountId: string, status: string, data?: any) {
    this.server.to(`account:${accountId}`).emit('status:update', {
      accountId,
      status,
      data,
      timestamp: Date.now(),
    });
    this.logger.log(`Status update emitted for account ${accountId}: ${status}`);
    
    // Clear QR code when account is ready/connected
    if (status === 'active' || status === 'ready') {
      this.currentQRCodes.delete(accountId);
    }
  }

  // Emit connection state change
  emitConnectionState(accountId: string, state: string, details?: any) {
    this.server.to(`account:${accountId}`).emit('connection:state', {
      accountId,
      state,
      details,
      timestamp: Date.now(),
    });
  }

  // Emit phone number detected
  emitPhoneNumber(accountId: string, phoneNumber: string, pushName?: string) {
    // Use room-based emission (clients join account:${accountId} room)
    this.server.to(`account:${accountId}`).emit('phone:detected', {
      accountId,
      phoneNumber,
      pushName,
      timestamp: Date.now(),
    });
    this.logger.debug(`Emitted phone detected for account ${accountId}: ${phoneNumber}`);
  }

  // Emit error
  emitError(accountId: string, error: string, details?: any) {
    this.server.to(`account:${accountId}`).emit('error', {
      accountId,
      error,
      details,
      timestamp: Date.now(),
    });
  }
}

