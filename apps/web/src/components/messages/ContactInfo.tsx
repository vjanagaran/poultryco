'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@/lib/messagingUtils';
// Removed Supabase import - using API
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

interface ContactInfoProps {
  conversationId: string;
  onClose: () => void;
}

export function ContactInfo({ conversationId, onClose }: ContactInfoProps) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [activeTab, setActiveTab] = useState<'media' | 'docs' | 'links'>('media');

  useEffect(() => {
    if (conversationId && user) {
      fetchConversation();
      fetchMediaFiles();
    }
  }, [conversationId, user, activeTab]);

  const fetchConversation = async () => {
    if (!user) return;

    try {
      // Get conversation via API
      const conv = await getConversation(conversationId);
      
      // Transform to match expected format
      const otherParticipant = conv.participants?.find(
        (p: any) => p.profileId !== user.id
      );

      setConversation({
        ...conv,
        is_group: conv.conversationType !== 'direct',
        other_participant: otherParticipant?.profile ? {
          id: otherParticipant.profile.id,
          full_name: `${otherParticipant.profile.firstName} ${otherParticipant.profile.lastName}`,
          profile_slug: otherParticipant.profile.slug,
          profile_photo_url: otherParticipant.profile.profilePhoto,
          headline: otherParticipant.profile.headline,
        } : undefined,
        participants: conv.participants?.map((p: any) => p.profile),
      } as any);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchMediaFiles = async () => {
    if (!conversationId) return;

    setLoadingMedia(true);
    try {
      // Get messages with media via API
      const result = await getMessages(conversationId, { 
        limit: 100,
        // Filter for messages with media
      });
      
      const messages = result.data?.filter((msg: any) => msg.mediaUrl) || [];
        .limit(50);

      if (error) throw error;

      // Filter by type
      const filtered = messages?.filter((msg) => {
        if (activeTab === 'media') {
          return ['image', 'video'].includes(msg.message_type);
        } else if (activeTab === 'docs') {
          return ['document', 'audio'].includes(msg.message_type);
        }
        return false;
      });

      setMediaFiles(filtered || []);
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  if (!conversation) return null;

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Contact Info</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile section */}
        <div className="p-6 flex flex-col items-center border-b">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 overflow-hidden mb-3">
            {conversation.is_group ? (
              conversation.group_photo_url ? (
                <Image
                  src={conversation.group_photo_url}
                  alt={conversation.group_name || 'Group'}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {conversation.group_name?.charAt(0)}
                </div>
              )
            ) : conversation.other_participant?.profile_photo_url ? (
              <Image
                src={conversation.other_participant.profile_photo_url}
                alt={conversation.other_participant.full_name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                {conversation.other_participant?.full_name.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {conversation.is_group
              ? conversation.group_name
              : conversation.other_participant?.full_name}
          </h2>
          {!conversation.is_group && conversation.other_participant?.headline && (
            <p className="text-sm text-gray-600 text-center mb-3">
              {conversation.other_participant.headline}
            </p>
          )}
          {conversation.is_group && (
            <p className="text-sm text-gray-600">
              {conversation.participants?.length} participants
            </p>
          )}

          {/* Quick actions */}
          {!conversation.is_group && conversation.other_participant && (
            <div className="flex gap-4 mt-4">
              <Link
                href={`/me/${conversation.other_participant.profile_slug}`}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-xs">Profile</span>
              </Link>
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="text-xs">Mute</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-xs">Search</span>
              </button>
            </div>
          )}
        </div>

        {/* Group participants */}
        {conversation.is_group && conversation.participants && (
          <div className="border-b">
            <div className="px-4 py-3 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">
                {conversation.participants.length} Participants
              </h3>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {conversation.participants.map((participant: any) => (
                <Link
                  key={participant.id}
                  href={`/me/${participant.profile_slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 overflow-hidden flex-shrink-0">
                    {participant.profile_photo_url ? (
                      <Image
                        src={participant.profile_photo_url}
                        alt={participant.full_name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                        {participant.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {participant.full_name}
                    </div>
                    {participant.headline && (
                      <div className="text-sm text-gray-500 truncate">
                        {participant.headline}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Media tabs */}
        <div className="border-b">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('media')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'media'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'docs'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'links'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Links
            </button>
          </div>

          {/* Media grid */}
          <div className="p-4">
            {loadingMedia ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No {activeTab} shared yet
              </div>
            ) : activeTab === 'media' ? (
              <div className="grid grid-cols-3 gap-1">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="relative aspect-square">
                    {file.media_urls?.map((url: string, idx: number) => (
                      <Image
                        key={idx}
                        src={url}
                        alt="Media"
                        fill
                        className="object-cover rounded cursor-pointer hover:opacity-75"
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {mediaFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        Document
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(file.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional options */}
        <div className="border-b">
          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left">
            <span className="text-sm text-gray-700">Mute notifications</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left">
            <span className="text-sm text-gray-700">Disappearing messages</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left">
            <span className="text-sm text-gray-700">Encryption</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-green-600">End-to-end</span>
            </div>
          </button>
        </div>

        {/* Danger zone */}
        <div className="p-4 space-y-2">
          <button className="w-full px-4 py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded">
            Block Contact
          </button>
          <button className="w-full px-4 py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded">
            Report Contact
          </button>
          <button className="w-full px-4 py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded">
            Delete Chat
          </button>
        </div>
      </div>
    </div>
  );
}

