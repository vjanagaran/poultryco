'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  published_at: string | null
  view_count: number
  author_name: string | null
  category_id: string | null
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [statusFilter])

  async function fetchPosts() {
    try {
      setLoading(true)
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
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

  async function deletePost(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)

      if (error) throw error
      
      setPosts(posts.filter(p => p.id !== id))
      alert('Post deleted successfully')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog content</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/blog/categories"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <span>📁</span>
            <span>Manage Categories</span>
          </Link>
          <Link
            href="/blog/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + New Post
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Total Posts</div>
          <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Published</div>
          <div className="text-2xl font-bold text-green-600">
            {posts.filter(p => p.status === 'published').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Drafts</div>
          <div className="text-2xl font-bold text-gray-600">
            {posts.filter(p => p.status === 'draft').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Total Views</div>
          <div className="text-2xl font-bold text-blue-600">
            {posts.reduce((sum, p) => sum + p.view_count, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No posts found. {searchQuery && 'Try adjusting your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">{post.title}</div>
                        {post.excerpt && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {post.excerpt}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          /{post.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.author_name || 'Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.published_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.view_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/blog/${post.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

