/**
 * Utility functions for Stream features
 * Migrated from Supabase to REST API
 */

import { uploadPostMedia } from './api/upload';
import { apiClient } from './api/client';

// Parse text for @mentions and #hashtags
export interface ParsedContent {
  text: string;
  mentions: { id: string; username: string; start: number; end: number }[];
  hashtags: { tag: string; start: number; end: number }[];
}

export function parseContent(text: string): ParsedContent {
  const mentions: ParsedContent['mentions'] = [];
  const hashtags: ParsedContent['hashtags'] = [];

  // Parse @mentions (e.g., @username)
  const mentionRegex = /@(\w+)/g;
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      id: '', // Will be resolved later
      username: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // Parse #hashtags
  const hashtagRegex = /#(\w+)/g;
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push({
      tag: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return { text, mentions, hashtags };
}

// Upload image to API Storage
export async function uploadPostImage(
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Image must be less than 10MB' };
    }

    // Upload to API
    const result = await uploadPostMedia(file);
    return { success: true, url: result.cdnUrl };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
}

// Search users for @mention autocomplete
export async function searchUsers(query: string, limit: number = 5) {
  try {
    const result = await apiClient.get<{ data: any[] }>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    return result.data.map((profile: any) => ({
      id: profile.id,
      full_name: `${profile.firstName} ${profile.lastName}`,
      profile_slug: profile.slug,
      headline: profile.headline,
      profile_photo_url: profile.profilePhoto,
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// Get trending hashtags
export async function getTrendingHashtags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
  // TODO: Implement trending hashtags endpoint in API
  return [];
}

// Create or get hashtag
export async function ensureHashtag(tag: string): Promise<string | null> {
  // TODO: Implement hashtag creation endpoint in API
  return null;
}

// Format timestamp for display
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Render content with clickable @mentions and #hashtags
export function renderRichContent(content: string): JSX.Element[] {
  const parts: JSX.Element[] = [];
  let lastIndex = 0;
  let key = 0;

  // Combined regex for both mentions and hashtags
  const regex = /(@\w+|#\w+)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>{content.substring(lastIndex, match.index)}</span>
      );
    }

    const text = match[0];
    if (text.startsWith('@')) {
      // Mention
      parts.push(
        <a
          key={key++}
          href={`/me/${text.substring(1)}`}
          className="text-green-600 hover:underline font-medium"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {text}
        </a>
      );
    } else {
      // Hashtag
      parts.push(
        <a
          key={key++}
          href={`/stream?tag=${text.substring(1)}`}
          className="text-blue-600 hover:underline font-medium"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {text}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(<span key={key++}>{content.substring(lastIndex)}</span>);
  }

  return parts;
}

// Format large numbers (1000 -> 1K, 1000000 -> 1M)
export function formatCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }

  if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return `${(count / 1000000).toFixed(1)}M`;
}
