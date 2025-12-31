'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getWhatsAppMessages,
  retryWhatsAppMessage,
  type WhatsAppMessage,
} from '@/lib/api/whatsapp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, RotateCw, ExternalLink } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  queued: 'bg-blue-100 text-blue-800',
  sending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800',
  read: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
};

export default function WhatsAppMessagesPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  async function fetchMessages() {
    try {
      setLoading(true);
      const data = await getWhatsAppMessages({
        status: statusFilter || undefined,
        limit: 50,
      });
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry(messageId: string) {
    try {
      await retryWhatsAppMessage(messageId);
      fetchMessages();
    } catch (error) {
      console.error('Error retrying message:', error);
      alert('Error retrying message');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Messages</h1>
          <p className="mt-2 text-gray-600">
            View and manage WhatsApp message delivery status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="read">Read</option>
            <option value="failed">Failed</option>
          </select>
          <Button onClick={fetchMessages}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/marketing/whatsapp/messages/new">
            <Button>
              Send Message
            </Button>
          </Link>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={STATUS_COLORS[message.status] || STATUS_COLORS.pending}>
                        {message.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="font-medium text-gray-900">
                        {message.messageText || message.mediaUrl || message.linkUrl || 'No content'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Type: {message.messageType} • Channel: {message.channelType}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {message.sentAt && (
                        <span>Sent: {new Date(message.sentAt).toLocaleString()}</span>
                      )}
                      {message.deliveredAt && (
                        <span>Delivered: {new Date(message.deliveredAt).toLocaleString()}</span>
                      )}
                      {message.readAt && (
                        <span>Read: {new Date(message.readAt).toLocaleString()}</span>
                      )}
                    </div>
                    {message.errorMessage && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {message.errorMessage}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {message.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetry(message.id)}
                      >
                        <RotateCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    )}
                    <Link href={`/marketing/campaigns/${message.campaignId}`}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && messages.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No messages found
          </h3>
          <p className="text-gray-600 mb-4">
            {statusFilter
              ? 'No messages with this status'
              : 'Start sending WhatsApp messages through campaigns'}
          </p>
          <Link href="/marketing/campaigns">
            <Button>Create Campaign</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

