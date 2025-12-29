import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { AuthService } from '../auth/auth.service';

interface UserConnection {
  profileId: string;
  socketIds: Set<string>;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
}

@Injectable()
export class SocketService {
  private logger: Logger = new Logger('SocketService');
  public server: Server;
  private userConnections: Map<string, UserConnection> = new Map();

  constructor(private authService: AuthService) {}

  /**
   * Validate WebSocket connection token
   */
  async validateConnection(token: string) {
    try {
      const user = await this.authService.validateToken(token);
      return {
        userId: user.id,
        email: user.email,
        profileId: user.profile?.id,
      };
    } catch (error) {
      this.logger.error('Token validation failed:', error.message);
      return null;
    }
  }

  /**
   * Set user as online
   */
  async setUserOnline(profileId: string, socketId: string) {
    const connection = this.userConnections.get(profileId) || {
      profileId,
      socketIds: new Set(),
      status: 'online',
      lastSeen: new Date(),
    };

    connection.socketIds.add(socketId);
    connection.status = 'online';
    connection.lastSeen = new Date();

    this.userConnections.set(profileId, connection);

    this.logger.log(`User ${profileId} is online (${connection.socketIds.size} connections)`);
  }

  /**
   * Set user as offline
   */
  async setUserOffline(profileId: string, socketId: string) {
    const connection = this.userConnections.get(profileId);

    if (connection) {
      connection.socketIds.delete(socketId);

      if (connection.socketIds.size === 0) {
        connection.status = 'offline';
        connection.lastSeen = new Date();
        this.logger.log(`User ${profileId} is offline`);
      } else {
        this.logger.log(
          `User ${profileId} still has ${connection.socketIds.size} active connections`,
        );
      }

      this.userConnections.set(profileId, connection);
    }
  }

  /**
   * Update user presence status
   */
  async updateUserPresence(profileId: string, status: 'online' | 'away' | 'busy') {
    const connection = this.userConnections.get(profileId);

    if (connection) {
      connection.status = status;
      connection.lastSeen = new Date();
      this.userConnections.set(profileId, connection);
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(profileId: string): boolean {
    const connection = this.userConnections.get(profileId);
    return connection ? connection.socketIds.size > 0 : false;
  }

  /**
   * Get user's online status
   */
  getUserStatus(profileId: string): 'online' | 'away' | 'busy' | 'offline' {
    const connection = this.userConnections.get(profileId);
    return connection?.status || 'offline';
  }

  /**
   * Emit event to specific user
   */
  emitToUser(profileId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`user:${profileId}`).emit(event, data);
    }
  }

  /**
   * Emit event to conversation
   */
  emitToConversation(conversationId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`conversation:${conversationId}`).emit(event, data);
    }
  }

  /**
   * Emit notification to user
   */
  emitNotification(profileId: string, notification: any) {
    if (this.server) {
      this.server.to(`notifications:${profileId}`).emit('notification:new', notification);
    }
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    let count = 0;
    this.userConnections.forEach((connection) => {
      if (connection.socketIds.size > 0) {
        count++;
      }
    });
    return count;
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    const onlineUsers: string[] = [];
    this.userConnections.forEach((connection, profileId) => {
      if (connection.socketIds.size > 0) {
        onlineUsers.push(profileId);
      }
    });
    return onlineUsers;
  }
}

