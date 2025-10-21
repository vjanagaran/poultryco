import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  featured_image_alt: string | null
  published_at: string
  reading_time_minutes: number | null
  view_count: number
  author_name: string | null
  category_id: string | null
  meta_title: string | null
  meta_description: string | null
  blog_categories: {
    name: string
    slug: string
    color: string | null
  } | null
}

interface Tag {
  id: string
  name: string
  slug: string
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, meta_title, meta_description, excerpt, featured_image')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return {
      title: 'Post Not Found - PoultryCo Blog',
    }
  }

  return {
    title: post.meta_title || `${post.title} - PoultryCo Blog`,
    description: post.meta_description || post.excerpt || undefined,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.featured_image ? [post.featured_image] : [],
    },
  }
}

async function getPost(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories (
        name,
        slug,
        color
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .single()

  if (error || !data) return null

  // Increment view count
  await supabase
    .from('blog_posts')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id)

  return data as BlogPost
}

async function getPostTags(postId: string) {
  const { data, error } = await supabase
    .from('blog_post_tags')
    .select(`
      blog_tags (
        id,
        name,
        slug
      )
    `)
    .eq('post_id', postId)

  if (error || !data) return []
  return data.map(item => item.blog_tags).filter(Boolean) as Tag[]
}

async function getNextPost(publishedAt: string, currentPostId: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('title, slug, featured_image')
    .eq('status', 'published')
    .lt('published_at', publishedAt)
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data
}

async function getPreviousPost(publishedAt: string, currentPostId: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('title, slug, featured_image')
    .eq('status', 'published')
    .gt('published_at', publishedAt)
    .neq('id', currentPostId)
    .order('published_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) return null
  return data
}

async function getRelatedPosts(categoryId: string | null, currentPostId: string) {
  if (!categoryId) return []

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      featured_image_alt,
      published_at,
      reading_time_minutes,
      blog_categories (
        name,
        slug,
        color
      )
    `)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', currentPostId)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(3)

  if (error || !data) return []
  return data
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const [tags, nextPost, previousPost, relatedPosts] = await Promise.all([
    getPostTags(post.id),
    getNextPost(post.published_at, post.id),
    getPreviousPost(post.published_at, post.id),
    getRelatedPosts(post.category_id, post.id),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {post.featured_image && (
        <div className="relative h-96 bg-gray-900">
          <img
            src={post.featured_image}
            alt={post.featured_image_alt || post.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 text-center">
              {post.blog_categories && (
                <Link
                  href={`/blog/category/${post.blog_categories.slug}`}
                  className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                  style={{
                    backgroundColor: post.blog_categories.color || '#2B7A4B',
                    color: 'white',
                  }}
                >
                  {post.blog_categories.name}
                </Link>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-4 text-white/90">
                <span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                {post.reading_time_minutes && (
                  <span>• {post.reading_time_minutes} min read</span>
                )}
                {post.author_name && (
                  <span>• By {post.author_name}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-xl text-gray-600 mb-8 pb-8 border-b border-gray-200 italic">
              {post.excerpt}
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Share this post:</span>
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://poultryco.net/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://poultryco.net/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Next/Previous Navigation */}
        {(nextPost || previousPost) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {previousPost && (
              <Link
                href={`/blog/${previousPost.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="flex items-center p-6">
                  <div className="flex-shrink-0 mr-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">Previous Post</span>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                      {previousPost.title}
                    </h3>
                  </div>
                </div>
              </Link>
            )}

            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="flex items-center p-6">
                  <div className="flex-1 text-right">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">Next Post</span>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                      {nextPost.title}
                    </h3>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                  {relatedPost.featured_image && (
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <div className="relative h-48">
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.featured_image_alt || relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                  )}
                  <div className="p-6">
                    {relatedPost.blog_categories && (
                      <Link
                        href={`/blog/category/${relatedPost.blog_categories.slug}`}
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                        style={{
                          backgroundColor: relatedPost.blog_categories.color || '#2B7A4B',
                          color: 'white',
                        }}
                      >
                        {relatedPost.blog_categories.name}
                      </Link>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <Link href={`/blog/${relatedPost.slug}`} className="hover:text-green-600">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    {relatedPost.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {relatedPost.excerpt}
                      </p>
                    )}
                    <div className="text-sm text-gray-500">
                      {new Date(relatedPost.published_at).toLocaleDateString()}
                      {relatedPost.reading_time_minutes && (
                        <span> • {relatedPost.reading_time_minutes} min</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Join the PoultryCo Community</h3>
          <p className="text-green-50 mb-6">
            Connect with poultry professionals, access expert resources, and grow your business.
          </p>
          <Link
            href="/early-access"
            className="inline-block bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors"
          >
            Get Early Access
          </Link>
        </div>
      </div>
    </div>
  )
}

