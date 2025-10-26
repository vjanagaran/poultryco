'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Connection {
  id: string;
  full_name: string;
  profile_slug: string;
  profile_photo_url: string | null;
  headline: string | null;
}

export function NewConversationModal({ isOpen, onClose }: NewConversationModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && user) {
      fetchConnections();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = connections.filter(
        (conn) =>
          conn.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conn.headline?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConnections(filtered);
    } else {
      setFilteredConnections(connections);
    }
  }, [searchQuery, connections]);

  const fetchConnections = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all connections (2-way approved connections)
      const { data, error } = await supabase
        .from('connections')
        .select(`
          connected_user:profiles!connections_connected_user_id_fkey(
            id,
            full_name,
            profile_slug,
            profile_photo_url,
            headline
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const connList = data?.map((item: any) => item.connected_user) || [];
      setConnections(connList);
      setFilteredConnections(connList);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (connectionId: string) => {
    if (!user) return;

    setCreating(true);
    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversation_participants')
        .select('conversation_id, conversations!inner(*)')
        .eq('user_id', user.id)
        .then(async (result) => {
          if (result.error) throw result.error;

          // Filter for 1-on-1 conversations with this user
          const userConversations = result.data || [];
          for (const participant of userConversations) {
            const { data: otherParticipants } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', participant.conversation_id)
              .neq('user_id', user.id);

            if (
              otherParticipants &&
              otherParticipants.length === 1 &&
              otherParticipants[0].user_id === connectionId
            ) {
              return { data: participant.conversation_id };
            }
          }
          return { data: null };
        });

      if (existingConv && existingConv.data) {
        // Navigate to existing conversation
        router.push(`/messages?conversation=${existingConv.data}`);
        onClose();
        return;
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: false,
          created_by: user.id,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: newConv.id,
            user_id: user.id,
            is_admin: true,
          },
          {
            conversation_id: newConv.id,
            user_id: connectionId,
            is_admin: false,
          },
        ]);

      if (participantsError) throw participantsError;

      // Navigate to new conversation
      router.push(`/messages?conversation=${newConv.id}`);
      onClose();
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">New Message</h2>
          <button
            onClick={onClose}
            disabled={creating}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connections..."
              className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-green-500"
              disabled={creating}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Connections list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              {connections.length === 0 ? (
                <>
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-1">No connections yet</p>
                  <p className="text-sm">Connect with people to start messaging</p>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-1">No matches found</p>
                  <p className="text-sm">Try searching with a different name</p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredConnections.map((connection) => (
                <button
                  key={connection.id}
                  onClick={() => startConversation(connection.id)}
                  disabled={creating}
                  className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 overflow-hidden">
                    {connection.profile_photo_url ? (
                      <Image
                        src={connection.profile_photo_url}
                        alt={connection.full_name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {connection.full_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {connection.full_name}
                    </div>
                    {connection.headline && (
                      <div className="text-sm text-gray-500 truncate">
                        {connection.headline}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  {creating ? (
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

