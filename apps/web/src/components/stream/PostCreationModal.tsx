'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { uploadPostImage, searchUsers, parseContent, ensureHashtag } from '@/lib/streamUtils';
import { addPendingPost, cacheMention } from '@/lib/streamOfflineService';
import { createMentionNotifications } from '@/lib/notificationService';
import Image from 'next/image';

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  postType?: 'update' | 'problem' | 'article' | 'photo' | 'question';
}

interface MentionSuggestion {
  id: string;
  full_name: string;
  profile_slug: string;
  headline: string | null;
  profile_photo_url: string | null;
}

export function PostCreationModal({
  isOpen,
  onClose,
  onPostCreated,
  postType = 'update',
}: PostCreationModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<File[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'connections' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mention autocomplete
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  
  // Problem-specific
  const [problemCategory, setProblemCategory] = useState('');
  const [problemUrgency, setProblemUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  
  // Article-specific
  const [articleTitle, setArticleTitle] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle @mention detection
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
      
      // Check if we're still in a mention (no spaces after @)
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setMentionQuery(textAfterAt);
        setMentionStartPos(lastAtSymbol);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [content]);

  // Search users for mentions
  useEffect(() => {
    if (showMentions && mentionQuery.length > 0) {
      const search = async () => {
        const results = await searchUsers(mentionQuery);
        setMentionSuggestions(results);
        setSelectedMentionIndex(0);
      };
      search();
    } else {
      setMentionSuggestions([]);
    }
  }, [showMentions, mentionQuery]);

  // Handle mention selection
  const insertMention = (suggestion: MentionSuggestion) => {
    const before = content.substring(0, mentionStartPos);
    const after = content.substring(mentionStartPos + mentionQuery.length + 1);
    const mention = `@${suggestion.profile_slug} `;
    
    setContent(before + mention + after);
    setShowMentions(false);
    
    // Focus textarea and move cursor
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = before.length + mention.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Handle keyboard navigation for mentions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < mentionSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : mentionSuggestions.length - 1
        );
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        insertMention(mentionSuggestions[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(files);

    for (const file of files) {
      const result = await uploadPostImage(file, user?.id || '');
      
      if (result.success && result.url) {
        setImages((prev) => [...prev, result.url!]);
      } else {
        setError(result.error || 'Failed to upload image');
      }
    }

    setUploadingImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle post submission
  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0 && uploadingImages.length === 0) {
      setError('Please add some content or an image');
      return;
    }

    if (postType === 'article' && !articleTitle.trim()) {
      setError('Article title is required');
      return;
    }

    if (postType === 'problem' && !problemCategory) {
      setError('Please select a problem category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if offline
      if (!navigator.onLine) {
        // Queue post for later
        await addPendingPost({
          content: content.trim(),
          post_type: images.length > 0 && postType === 'update' ? 'photo' : postType,
          visibility,
          media_files: uploadingImages,
          problem_category: postType === 'problem' ? problemCategory : undefined,
          problem_urgency: postType === 'problem' ? problemUrgency : undefined,
          article_title: postType === 'article' ? articleTitle.trim() : undefined,
        });
        
        // Close modal and show success
        onPostCreated();
        onClose();
        resetForm();
        return;
      }

      const supabase = createClient();

      // Parse content for mentions and hashtags
      const parsed = parseContent(content);

      // Create post
      const postData: any = {
        author_id: user?.id,
        content: content.trim(),
        post_type: images.length > 0 && postType === 'update' ? 'photo' : postType,
        media_urls: images,
        media_type: images.length > 0 ? 'image' : null,
        visibility,
      };

      // Add type-specific fields
      if (postType === 'problem') {
        postData.problem_category = problemCategory;
        postData.problem_urgency = problemUrgency;
      }

      if (postType === 'article') {
        postData.article_title = articleTitle.trim();
        postData.article_cover_image = images[0] || null;
      }

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (postError) throw postError;

      // Extract and save hashtags
      if (parsed.hashtags.length > 0) {
        for (const hashtag of parsed.hashtags) {
          const tagId = await ensureHashtag(hashtag.tag);
          
          if (tagId) {
            await supabase
              .from('posts_tags')
              .insert({
                post_id: post.id,
                tag_id: tagId,
              });
          }
        }
      }

      // Cache mentions used
      for (const mention of parsed.mentions) {
        const profile = mentionSuggestions.find(
          (s) => s.profile_slug === mention.username
        );
        if (profile) {
          await cacheMention(profile);
        }
      }

      // Create mention notifications
      await createMentionNotifications(
        post.id,
        content.trim(),
        user.id,
        user.user_metadata?.full_name || 'Someone'
      );

      // Success!
      onPostCreated();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setImages([]);
    setVisibility('public');
    setProblemCategory('');
    setProblemUrgency('medium');
    setArticleTitle('');
    setError('');
  };

  if (!isOpen) return null;

  const charLimit = 5000;
  const charCount = content.length;
  const isOverLimit = charCount > charLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {postType === 'update' && 'Create a post'}
            {postType === 'problem' && 'Report a problem'}
            {postType === 'article' && 'Write an article'}
            {postType === 'photo' && 'Share a photo'}
            {postType === 'question' && 'Ask a question'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Article Title */}
          {postType === 'article' && (
            <input
              type="text"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              placeholder="Article title"
              className="w-full px-4 py-3 text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          )}

          {/* Problem Category */}
          {postType === 'problem' && (
            <div className="grid grid-cols-2 gap-3">
              <select
                value={problemCategory}
                onChange={(e) => setProblemCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select category</option>
                <option value="disease">Disease</option>
                <option value="mortality">Mortality</option>
                <option value="feed">Feed</option>
                <option value="production">Production</option>
                <option value="equipment">Equipment</option>
                <option value="management">Management</option>
                <option value="market">Market</option>
                <option value="legal">Legal</option>
                <option value="other">Other</option>
              </select>

              <select
                value={problemUrgency}
                onChange={(e) => setProblemUrgency(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="low">Low urgency</option>
                <option value="medium">Medium urgency</option>
                <option value="high">High urgency</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          )}

          {/* Content Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                postType === 'problem'
                  ? 'Describe the problem in detail... Use @ to mention someone, # to add hashtags'
                  : 'What do you want to share? Use @ to mention someone, # to add hashtags'
              }
              className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={6}
            />

            {/* Mention Autocomplete Dropdown */}
            {showMentions && mentionSuggestions.length > 0 && (
              <div className="absolute bottom-full mb-2 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                {mentionSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => insertMention(suggestion)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 ${
                      index === selectedMentionIndex ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 overflow-hidden">
                      {suggestion.profile_photo_url && (
                        <Image
                          src={suggestion.profile_photo_url}
                          alt={suggestion.full_name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{suggestion.full_name}</div>
                      <div className="text-xs text-gray-500 truncate">{suggestion.headline || '@' + suggestion.profile_slug}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Character Count */}
            <div className={`text-xs text-right mt-1 ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
              {charCount} / {charLimit}
            </div>
          </div>

          {/* Image Preview */}
          {(images.length > 0 || uploadingImages.length > 0) && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={url}
                    alt={`Upload ${index + 1}`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {uploadingImages.map((file, index) => (
                <div key={`uploading-${index}`} className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t space-y-3">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Image Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Add photos"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Visibility Selector */}
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="public">🌍 Public</option>
                <option value="connections">👥 Connections</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || isOverLimit || (!content.trim() && images.length === 0)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                )}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

