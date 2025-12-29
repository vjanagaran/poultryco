import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocketService } from './socket.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/',
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketGateway');

  constructor(
    private socketService: SocketService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Socket.io server initialized');
    this.socketService.server = server;
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Validate token and get user
      const user = await this.socketService.validateConnection(token);
      
      if (!user) {
        this.logger.warn(`Client ${client.id} authentication failed`);
        client.disconnect();
        return;
      }

      // Store user info in socket
      client.data.user = user;
      client.data.profileId = user.profileId;

      // Join user's personal room
      client.join(`user:${user.profileId}`);

      // Track online status
      await this.socketService.setUserOnline(user.profileId, client.id);

      this.logger.log(`Client ${client.id} connected as user ${user.profileId}`);

      // Emit online status to connections
      this.server.to(`user:${user.profileId}`).emit('user:online', {
        profileId: user.profileId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const profileId = client.data.profileId;

    if (profileId) {
      await this.socketService.setUserOffline(profileId, client.id);

      // Emit offline status
      this.server.to(`user:${profileId}`).emit('user:offline', {
        profileId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Client ${client.id} disconnected (user ${profileId})`);
    } else {
      this.logger.log(`Client ${client.id} disconnected`);
    }
  }

  // ===== MESSAGING EVENTS =====

  @SubscribeMessage('message:send')
  @UseGuards(WsJwtGuard)
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; content: string; messageType?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const profileId = client.data.profileId;

    // Emit to conversation participants
    this.server.to(`conversation:${data.conversationId}`).emit('message:new', {
      conversationId: data.conversationId,
      senderId: profileId,
      content: data.content,
      messageType: data.messageType || 'text',
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  @SubscribeMessage('message:typing')
  @UseGuards(WsJwtGuard)
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const profileId = client.data.profileId;

    this.server.to(`conversation:${data.conversationId}`).emit('message:typing', {
      conversationId: data.conversationId,
      profileId,
      isTyping: data.isTyping,
    });

    return { success: true };
  }

  @SubscribeMessage('message:read')
  @UseGuards(WsJwtGuard)
  async handleMessageRead(
    @MessageBody() data: { conversationId: string; messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const profileId = client.data.profileId;

    this.server.to(`conversation:${data.conversationId}`).emit('message:read', {
      conversationId: data.conversationId,
      messageId: data.messageId,
      readBy: profileId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  // ===== CONVERSATION EVENTS =====

  @SubscribeMessage('conversation:join')
  @UseGuards(WsJwtGuard)
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation:${data.conversationId}`);
    this.logger.log(`Client ${client.id} joined conversation ${data.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('conversation:leave')
  @UseGuards(WsJwtGuard)
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation:${data.conversationId}`);
    this.logger.log(`Client ${client.id} left conversation ${data.conversationId}`);
    return { success: true };
  }

  // ===== NOTIFICATION EVENTS =====

  @SubscribeMessage('notification:subscribe')
  @UseGuards(WsJwtGuard)
  async handleSubscribeNotifications(@ConnectedSocket() client: Socket) {
    const profileId = client.data.profileId;
    client.join(`notifications:${profileId}`);
    return { success: true };
  }

  // ===== PRESENCE EVENTS =====

  @SubscribeMessage('presence:update')
  @UseGuards(WsJwtGuard)
  async handlePresenceUpdate(
    @MessageBody() data: { status: 'online' | 'away' | 'busy' },
    @ConnectedSocket() client: Socket,
  ) {
    const profileId = client.data.profileId;

    await this.socketService.updateUserPresence(profileId, data.status);

    // Broadcast to connections
    this.server.emit('presence:changed', {
      profileId,
      status: data.status,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }
}

