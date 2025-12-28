import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved' })
  async getConversations(@CurrentUser('profileId') profileId: string) {
    return this.messagesService.getConversations(profileId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @Param('id') id: string,
    @CurrentUser('profileId') profileId: string,
  ) {
    return this.messagesService.getConversation(id, profileId);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created' })
  async createConversation(
    @CurrentUser('profileId') profileId: string,
    @Body() data: { type: 'direct' | 'group'; participantIds: string[]; name?: string },
  ) {
    return this.messagesService.createConversation(profileId, {
      type: data.type,
      participantIds: data.participantIds,
      name: data.name,
    });
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved' })
  async getMessages(
    @Param('id') conversationId: string,
    @CurrentUser('profileId') profileId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.messagesService.getMessages(conversationId, profileId, { limit, before });
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @Param('id') conversationId: string,
    @CurrentUser('profileId') profileId: string,
    @Body() data: { content: string; messageType?: 'text' | 'image' | 'file'; mediaUrl?: string },
  ) {
    return this.messagesService.sendMessage(conversationId, profileId, data);
  }

  @Put('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markAsRead(
    @Param('id') messageId: string,
    @CurrentUser('profileId') profileId: string,
  ) {
    return this.messagesService.markMessageAsRead(messageId, profileId);
  }

  @Put('conversations/:id/read')
  @ApiOperation({ summary: 'Mark all messages in conversation as read' })
  @ApiResponse({ status: 200, description: 'Conversation marked as read' })
  async markConversationAsRead(
    @Param('id') conversationId: string,
    @CurrentUser('profileId') profileId: string,
  ) {
    return this.messagesService.markConversationAsRead(conversationId, profileId);
  }
}
