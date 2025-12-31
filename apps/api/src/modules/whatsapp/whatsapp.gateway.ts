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
    origin: process.env.ADMIN_URL?.split(',') || ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
})
export class WhatsAppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhatsAppGateway.name);
  private connectedClients: Map<string, Set<string>> = new Map(); // accountId -> Set of socketIds

  afterInit(server: Server) {
    this.logger.log('WhatsApp WebSocket Gateway initialized on namespace /whatsapp');
    this.logger.log('WebSocket server ready for connections');
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
  handleSubscribeAccount(client: Socket, accountId: string) {
    if (!this.connectedClients.has(accountId)) {
      this.connectedClients.set(accountId, new Set());
    }
    this.connectedClients.get(accountId)!.add(client.id);
    this.logger.log(`Client ${client.id} subscribed to account ${accountId}`);
    
    // Join room for this account
    client.join(`account:${accountId}`);
    
    // Check if there's a current QR code for this account and send it immediately
    // This handles the case where QR was emitted before subscription
    // Note: We'd need to store QR codes in the gateway or get from account service
    // For now, the account service will re-emit on next QR generation
    
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
    this.server.to(`account:${accountId}`).emit('qr:code', {
      accountId,
      qrCode,
      expiresIn,
      timestamp: Date.now(),
    });
    this.logger.log(`QR code emitted for account ${accountId}`);
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

