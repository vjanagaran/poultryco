'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatList } from './ChatList';
import { ChatArea } from './ChatArea';
import { ContactInfo } from './ContactInfo';

export function MessagesContainer() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    searchParams.get('conversation')
  );
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
    
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* WhatsApp-style 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat List */}
        <div className={`
          w-full md:w-[400px] lg:w-[420px] bg-white border-r border-gray-200 flex-shrink-0
          ${selectedConversationId ? 'hidden md:block' : 'block'}
        `}>
          <ChatList
            selectedConversationId={selectedConversationId}
            onSelectConversation={(id) => {
              setSelectedConversationId(id);
              router.push(`/messages?conversation=${id}`, { scroll: false });
            }}
          />
        </div>

        {/* Middle Panel - Chat Area */}
        <div className={`
          flex-1 flex flex-col bg-[#efeae2]
          ${selectedConversationId ? 'block' : 'hidden md:flex'}
        `}>
          {selectedConversationId ? (
            <ChatArea
              conversationId={selectedConversationId}
              onBack={() => {
                setSelectedConversationId(null);
                router.push('/messages', { scroll: false });
              }}
              onToggleContactInfo={() => setShowContactInfo(!showContactInfo)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg
                  className="w-32 h-32 mx-auto mb-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h2 className="text-2xl font-light mb-2">PoultryCo Messages</h2>
                <p className="text-gray-400">
                  Select a chat to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Contact Info (Optional) */}
        {selectedConversationId && showContactInfo && (
          <div className="hidden lg:block w-[360px] bg-white border-l border-gray-200 flex-shrink-0">
            <ContactInfo
              conversationId={selectedConversationId}
              onClose={() => setShowContactInfo(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

