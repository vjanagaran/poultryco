'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/messagingUtils';
import Image from 'next/image';

interface MessageInputProps {
  conversationId: string;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  onSend: (content: string, mediaUrls: string[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  conversationId,
  replyToMessage,
  onCancelReply,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      setUploading(true);
      const mediaUrls: string[] = [];

      // Upload attachments if any
      if (attachments.length > 0) {
        // TODO: Implement actual file upload to Supabase Storage
        // For now, we'll use placeholder URLs
        for (const file of attachments) {
          // In production, upload to Supabase Storage and get URL
          const url = URL.createObjectURL(file);
          mediaUrls.push(url);
        }
      }

      await onSend(message.trim(), mediaUrls);
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 10)); // Max 10 files
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Common emojis (in production, use a proper emoji picker library)
  const commonEmojis = ['😊', '👍', '❤️', '😂', '😢', '🙏', '🎉', '🔥', '💯', '✅'];

  return (
    <div className="border-t bg-gray-50 p-4">
      {/* Reply preview */}
      {replyToMessage && (
        <div className="mb-2 px-3 py-2 bg-white rounded-lg border-l-4 border-green-600 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-green-600 mb-0.5">
              Replying to {replyToMessage.sender?.full_name}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {replyToMessage.message_type === 'text'
                ? replyToMessage.content
                : '📎 Attachment'}
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="ml-2 p-1 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="relative">
              {file.type.startsWith('image/') ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-0.5 hover:bg-opacity-70"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 bg-white rounded-lg border-2 border-gray-200 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600 truncate max-w-[100px]">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="mb-2 bg-white rounded-lg shadow-lg p-3 flex flex-wrap gap-2">
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setMessage((prev) => prev + emoji);
                setShowEmojiPicker(false);
                textareaRef.current?.focus();
              }}
              className="text-2xl hover:bg-gray-100 rounded p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full"
            title="Emoji"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full"
            title="Attach file"
            disabled={uploading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Text input */}
        <div className="flex-1 bg-white rounded-full border border-gray-300 focus-within:border-green-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-transparent outline-none resize-none max-h-[120px]"
            rows={1}
            disabled={uploading || disabled}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={(!message.trim() && attachments.length === 0) || uploading}
          className={`p-3 rounded-full transition-colors ${
            message.trim() || attachments.length > 0
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title="Send"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>

      {/* Character count (optional) */}
      {message.length > 4500 && (
        <div className="mt-1 text-xs text-right text-gray-500">
          {message.length} / 5000
        </div>
      )}
    </div>
  );
}

