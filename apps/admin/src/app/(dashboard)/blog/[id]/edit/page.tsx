'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RichTextEditor from '@/components/RichTextEditor'
import TagInput from '@/components/TagInput'
import ImageUpload from '@/components/ImageUpload'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

/* Commented out - not currently used
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category_id: string | null
  status: string
  scheduled_for: string | null
  meta_title: string | null
  meta_description: string | null
  featured_image: string | null
  featured_image_alt: string | null
}
*/

export default function EditBlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    status: 'draft',
    scheduled_for: '',
    meta_title: '',
    meta_description: '',
    featured_image: '',
    featured_image_alt: '',
  })

  useEffect(() => {
    fetchPost()
    fetchCategories()
    fetchTags()
  }, [postId])

  async function fetchPost() {
    try {
      setFetching(true)
      
      // Fetch post
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (postError) throw postError
      if (!post) {
        alert('Post not found')
        router.push('/blog')
        return
      }

      // Fetch post tags
      const { data: postTags, error: tagsError } = await supabase
        .from('blog_post_tags')
        .select('tag_id')
        .eq('post_id', postId)

      if (tagsError) throw tagsError

      // Set form data
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category_id: post.category_id || '',
        status: post.status || 'draft',
        scheduled_for: post.scheduled_for ? new Date(post.scheduled_for).toISOString().slice(0, 16) : '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        featured_image: post.featured_image || '',
        featured_image_alt: post.featured_image_alt || '',
      })

      setSelectedTags(postTags?.map(pt => pt.tag_id) || [])
    } catch (error) {
      console.error('Error fetching post:', error)
      alert(error instanceof Error ? error.message : 'Failed to load post')
      router.push('/blog')
    } finally {
      setFetching(false)
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  async function fetchTags() {
    try {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('id, name, slug')
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  async function createTag(name: string): Promise<Tag> {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('blog_tags')
      .insert([{ name, slug }])
      .select()
      .single()

    if (error) throw error

    // Refresh tags list
    fetchTags()

    return data
  }

  async function handleImageUploadForEditor(): Promise<string> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) {
          resolve('')
          return
        }

        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `blog/content/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

          const { data, error } = await supabase.storage
            .from('cdn-poultryco')
            .upload(fileName, file)

          if (error) throw error

          const { data: { publicUrl } } = supabase.storage
            .from('cdn-poultryco')
            .getPublicUrl(data.path)

          resolve(publicUrl)
        } catch (error) {
          console.error('Upload error:', error)
          resolve('')
        }
      }
      input.click()
    })
  }

  async function handleSubmit(e: React.FormEvent, action: 'draft' | 'schedule' | 'publish') {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      alert('Title and content are required')
      return
    }

    if (action === 'schedule' && !formData.scheduled_for) {
      alert('Please select a schedule date/time')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const now = new Date().toISOString()
      let status = formData.status
      let published_at = null

      if (action === 'publish') {
        status = 'published'
        published_at = now
      } else if (action === 'schedule') {
        status = 'scheduled'
        published_at = null
      } else {
        status = 'draft'
      }

      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        category_id: formData.category_id || null,
        status,
        published_at,
        scheduled_for: action === 'schedule' ? formData.scheduled_for : null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        featured_image: formData.featured_image || null,
        featured_image_alt: formData.featured_image_alt || null,
        word_count: formData.content.split(/\s+/).length,
        reading_time_minutes: Math.ceil(formData.content.split(/\s+/).length / 200),
      }

      const { error: postError } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', postId)

      if (postError) throw postError

      // Update tags
      // First, delete existing tags
      await supabase
        .from('blog_post_tags')
        .delete()
        .eq('post_id', postId)

      // Then insert new tags
      if (selectedTags.length > 0) {
        const tagLinks = selectedTags.map(tagId => ({
          post_id: postId,
          tag_id: tagId,
        }))

        const { error: tagsError } = await supabase
          .from('blog_post_tags')
          .insert(tagLinks)

        if (tagsError) throw tagsError
      }

      alert(`Post ${action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'updated'} successfully!`)
      router.push('/blog')
    } catch (error) {
      console.error('Error updating post:', error)
      alert(error instanceof Error ? error.message : 'Failed to update post')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (fetching) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin inline-block w-12 h-12 border-4 border-gray-300 border-t-green-600 rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading post...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          <p className="text-gray-600 mt-1">Update your blog post</p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter an engaging title..."
              className="w-full px-4 py-3 text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Slug */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="post-url-slug"
            />
            <p className="text-sm text-gray-500 mt-1">
              www.poultryco.net/blog/{formData.slug || 'post-slug'}
            </p>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              onImageUpload={handleImageUploadForEditor}
            />
            <p className="text-sm text-gray-500 mt-2">
              Word count: {formData.content.split(/\s+/).filter(Boolean).length} | 
              Reading time: ~{Math.ceil(formData.content.split(/\s+/).filter(Boolean).length / 200)} min
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="Brief summary that appears in post listings..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ImageUpload
              currentImage={formData.featured_image}
              onUploadComplete={(url) => setFormData({ ...formData, featured_image: url })}
              label="Featured Image"
              folder="blog/featured"
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Alt Text
              </label>
              <input
                type="text"
                name="featured_image_alt"
                value={formData.featured_image_alt}
                onChange={handleChange}
                placeholder="Describe the image for accessibility..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                No category? <a href="/blog/categories" className="text-green-600 hover:underline">Create one</a>
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <TagInput
                availableTags={tags}
                selectedTags={selectedTags}
                onChange={setSelectedTags}
                onCreateTag={createTag}
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {formData.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule For *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_for"
                    value={formData.scheduled_for}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SEO Fields */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  placeholder="SEO title (defaults to post title)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="SEO description (defaults to excerpt)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-6 sticky bottom-0">
            <button
              type="button"
              onClick={() => router.push('/blog')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-green-600 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </button>

              {formData.status === 'scheduled' && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'schedule')}
                  disabled={loading || !formData.scheduled_for}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Scheduling...' : 'Schedule Post'}
                </button>
              )}
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'publish')}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

