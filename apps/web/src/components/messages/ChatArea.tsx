'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Message,
  Conversation,
  sendMessage,
  markConversationRead,
  markMessageDelivered,
  getMessageStatus,
  formatMessageTime,
  groupMessagesByDate,
  isUserOnline,
  formatLastSeen,
} from '@/lib/messagingUtils';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MessageSearch } from './MessageSearch';
import Image from 'next/image';
import Link from 'next/link';

interface ChatAreaProps {
  conversationId: string;
  onBack: () => void;
  onToggleContactInfo: () => void;
}

export function ChatArea({ conversationId, onBack, onToggleContactInfo }: ChatAreaProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && user) {
      fetchConversation();
      fetchMessages();
      subscribeToMessages();
      markConversationRead(conversationId, user.id);
    }
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    if (!user) return;

    const supabase = createClient();

    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conv) return;

      // Get other participant for one-on-one chats
      if (!conv.is_group) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select(`
            *,
            user:profiles!user_id(
              id,
              full_name,
              profile_slug,
              profile_photo_url,
              headline
            )
          `)
          .eq('conversation_id', conversationId)
          .neq('user_id', user.id)
          .single();

        setConversation({
          ...conv,
          other_participant: otherParticipant?.user,
        } as Conversation);
      } else {
        setConversation(conv as Conversation);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;

    const supabase = createClient();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(
            id,
            full_name,
            profile_slug,
            profile_photo_url
          ),
          reply_to:messages!reply_to_message_id(
            id,
            content,
            message_type,
            sender:profiles!sender_id(full_name)
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data as Message[]) || []);

      // Mark messages as delivered
      if (data) {
        data.forEach((msg: Message) => {
          if (msg.sender_id !== user.id && !msg.delivered_to.includes(user.id)) {
            markMessageDelivered(msg.id, user.id);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Fetch full message with sender info
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id(
                id,
                full_name,
                profile_slug,
                profile_photo_url
              )
            `)
            .eq('id', newMessage.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as Message]);
            
            // Mark as delivered and read
            if (data.sender_id !== user.id) {
              await markMessageDelivered(data.id, user.id);
              await markConversationRead(conversationId, user.id);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const deletedMessage = payload.old as Message;
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleSendMessage = async (content: string, mediaUrls: string[]) => {
    if (!user || !content.trim() && mediaUrls.length === 0) return;

    setSending(true);

    try {
      const messageType = mediaUrls.length > 0 ? 'image' : 'text';
      
      await sendMessage(
        conversationId,
        user.id,
        content,
        messageType,
        mediaUrls,
        replyToMessage?.id
      );

      setReplyToMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      messageElement.classList.add('bg-yellow-100');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100');
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Conversation not found</p>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);
  const participantIds = [user!.id]; // Add other participant IDs here

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {/* Back button (mobile) */}
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-gray-100 rounded-full -ml-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar */}
        <Link
          href={
            conversation.is_group
              ? '#'
              : `/me/${conversation.other_participant?.profile_slug}`
          }
          className="flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 overflow-hidden cursor-pointer">
            {conversation.is_group ? (
              conversation.group_photo_url ? (
                <Image
                  src={conversation.group_photo_url}
                  alt={conversation.group_name || 'Group'}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                  {conversation.group_name?.charAt(0) || 'G'}
                </div>
              )
            ) : conversation.other_participant?.profile_photo_url ? (
              <Image
                src={conversation.other_participant.profile_photo_url}
                alt={conversation.other_participant.full_name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                {conversation.other_participant?.full_name.charAt(0) || '?'}
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">
            {conversation.is_group
              ? conversation.group_name
              : conversation.other_participant?.full_name}
          </h2>
          <p className="text-xs text-gray-500 truncate">
            {conversation.is_group ? (
              `${conversation.participants?.length || 0} members`
            ) : typingUsers.size > 0 ? (
              <span className="text-green-600">typing...</span>
            ) : isUserOnline(conversation.other_participant?.last_seen_at) ? (
              <span className="text-green-600">online</span>
            ) : (
              formatLastSeen(conversation.other_participant?.last_seen_at)
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Search messages"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={onToggleContactInfo}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d4' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-2">
            {/* Date divider */}
            <div className="flex items-center justify-center">
              <div className="bg-white/90 px-3 py-1 rounded-lg shadow-sm text-xs text-gray-600">
                {date}
              </div>
            </div>

            {/* Messages */}
            {msgs.map((message, index) => {
              const isOwn = message.sender_id === user?.id;
              const showAvatar = !isOwn && (index === msgs.length - 1 || msgs[index + 1]?.sender_id !== message.sender_id);
              
              return (
                <div key={message.id} id={`message-${message.id}`} className="transition-colors duration-300">
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    status={getMessageStatus(message, user!.id, participantIds)}
                    onReply={() => setReplyToMessage(message)}
                  />
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        conversationId={conversationId}
        replyToMessage={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
        onSend={handleSendMessage}
        disabled={sending}
      />

      {/* Search overlay */}
      {showSearch && (
        <MessageSearch
          conversationId={conversationId}
          onClose={() => setShowSearch(false)}
          onMessageClick={scrollToMessage}
        />
      )}
    </div>
  );
}

