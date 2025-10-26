'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, formatConversationTime } from '@/lib/messagingUtils';
import { NewConversationModal } from './NewConversationModal';
import { GroupCreationModal } from './GroupCreationModal';
import Image from 'next/image';

interface ChatListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ChatList({ selectedConversationId, onSelectConversation }: ChatListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'contacts'>('chats');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToConversations();
    }
  }, [user, activeTab]);

  const fetchConversations = async () => {
    if (!user) return;

    const supabase = createClient();
    setLoading(true);

    try {
      // Get user's conversations with participants
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          *,
          conversations!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('conversations.last_message_at', { ascending: false, nullsFirst: false });

      if (!participants) {
        setConversations([]);
        return;
      }

      // Filter by active tab
      let filteredConversations = participants.map(p => p.conversations);
      
      if (activeTab === 'chats') {
        filteredConversations = filteredConversations.filter(c => !c.is_group);
      } else if (activeTab === 'groups') {
        filteredConversations = filteredConversations.filter(c => c.is_group);
      }

      // For one-on-one chats, get the other participant's info
      const conversationsWithInfo = await Promise.all(
        filteredConversations.map(async (conv) => {
          const participant = participants.find(p => p.conversation_id === conv.id);
          
          if (!conv.is_group) {
            // Get other participant
            const { data: otherParticipants } = await supabase
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
              .eq('conversation_id', conv.id)
              .neq('user_id', user.id)
              .single();

            return {
              ...conv,
              other_participant: otherParticipants?.user,
              unread_count: participant?.unread_count || 0,
              is_muted: participant?.is_muted || false,
            };
          }

          return {
            ...conv,
            unread_count: participant?.unread_count || 0,
            is_muted: participant?.is_muted || false,
          };
        })
      );

      setConversations(conversationsWithInfo as Conversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    if (!user) return;

    const supabase = createClient();

    // Subscribe to conversation updates
    const channel = supabase
      .channel('conversations-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    
    if (conv.is_group) {
      return conv.group_name?.toLowerCase().includes(query);
    } else {
      return conv.other_participant?.full_name.toLowerCase().includes(query);
    }
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#f0f2f5] px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">Chats</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <button
              onClick={() => setShowNewConversation(true)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              title="New chat"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setShowNewGroup(true)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              title="New group"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-12 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chats'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'groups'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Groups
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Contacts
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-8 text-center">
            <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-sm">
              Start a conversation with your connections
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                selectedConversationId === conversation.id ? 'bg-gray-100' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 overflow-hidden">
                  {conversation.is_group ? (
                    conversation.group_photo_url ? (
                      <Image
                        src={conversation.group_photo_url}
                        alt={conversation.group_name || 'Group'}
                        width={48}
                        height={48}
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
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                      {conversation.other_participant?.full_name.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                {/* Unread badge */}
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conversation.is_group
                      ? conversation.group_name
                      : conversation.other_participant?.full_name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatConversationTime(conversation.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {conversation.is_muted && (
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  <p className={`text-sm truncate ${conversation.unread_count && conversation.unread_count > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                    {conversation.last_message_preview || 'No messages yet'}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Modals */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
      />
      <GroupCreationModal
        isOpen={showNewGroup}
        onClose={() => setShowNewGroup(false)}
      />
    </div>
  );
}

