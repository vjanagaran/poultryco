import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Metadata } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const POSTS_PER_PAGE = 12

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  featured_image_alt: string | null
  published_at: string
  reading_time_minutes: number | null
  view_count: number
  author_name: string | null
  category_id: string | null
  blog_categories: {
    name: string
    slug: string
    color: string | null
  }[] | {
    name: string
    slug: string
    color: string | null
  } | null
}

export const metadata: Metadata = {
  title: 'Blog - PoultryCo',
  description: 'Latest insights, tips, and news for poultry professionals. Learn from experts and stay updated with industry trends.',
}

async function getBlogPosts(page: number = 1) {
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const { data: posts, error, count } = await supabase
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
      view_count,
      author_name,
      category_id,
      blog_categories (
        name,
        slug,
        color
      )
    `, { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], totalPages: 0, currentPage: page }
  }

  const totalPages = count ? Math.ceil(count / POSTS_PER_PAGE) : 0

  return {
    posts: posts as BlogPost[],
    totalPages,
    currentPage: page,
  }
}

async function getFeaturedPost() {
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
      author_name,
      blog_categories (
        name,
        slug,
        color
      )
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .lte('published_at', new Date().toISOString())
    .order('featured_order', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) return null
  return data as BlogPost
}

async function getCategories() {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('id, name, slug, post_count, color')
    .eq('is_active', true)
    .order('post_count', { ascending: false })
    .limit(8)

  if (error) return []
  return data
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { posts, totalPages, currentPage } = await getBlogPosts(page)
  const featuredPost = await getFeaturedPost()
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            PoultryCo Blog
          </h1>
          <p className="text-xl text-green-50 max-w-3xl">
            Expert insights, industry trends, and practical advice for poultry professionals worldwide.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Post (only on first page) */}
            {currentPage === 1 && featuredPost && (
              <div className="mb-12">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {featuredPost.featured_image && (
                    <div className="relative h-96">
                      <img
                        src={featuredPost.featured_image}
                        alt={featuredPost.featured_image_alt || featuredPost.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                          ⭐ Featured
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-8">
                    {featuredPost.blog_categories && (
                      <Link
                        href={`/blog/category/${
                          Array.isArray(featuredPost.blog_categories)
                            ? featuredPost.blog_categories[0]?.slug
                            : featuredPost.blog_categories.slug
                        }`}
                        className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
                        style={{
                          backgroundColor: (Array.isArray(featuredPost.blog_categories)
                            ? featuredPost.blog_categories[0]?.color
                            : featuredPost.blog_categories.color) || '#2B7A4B',
                          color: 'white',
                        }}
                      >
                        {Array.isArray(featuredPost.blog_categories)
                          ? featuredPost.blog_categories[0]?.name
                          : featuredPost.blog_categories.name}
                      </Link>
                    )}
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      <Link href={`/blog/${featuredPost.slug}`} className="hover:text-green-600">
                        {featuredPost.title}
                      </Link>
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-gray-600 mb-6 text-lg">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(featuredPost.published_at).toLocaleDateString()}</span>
                        {featuredPost.reading_time_minutes && (
                          <span>• {featuredPost.reading_time_minutes} min read</span>
                        )}
                        {featuredPost.author_name && (
                          <span>• By {featuredPost.author_name}</span>
                        )}
                      </div>
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="text-green-600 font-semibold hover:text-green-700"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blog Posts Grid */}
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No posts found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                    {post.featured_image && (
                      <Link href={`/blog/${post.slug}`}>
                        <div className="relative h-48">
                          <img
                            src={post.featured_image}
                            alt={post.featured_image_alt || post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="p-6">
                      {post.blog_categories && (
                        <Link
                          href={`/blog/category/${
                            Array.isArray(post.blog_categories)
                              ? post.blog_categories[0]?.slug
                              : post.blog_categories.slug
                          }`}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                          style={{
                            backgroundColor: (Array.isArray(post.blog_categories)
                              ? post.blog_categories[0]?.color
                              : post.blog_categories.color) || '#2B7A4B',
                            color: 'white',
                          }}
                        >
                          {Array.isArray(post.blog_categories)
                            ? post.blog_categories[0]?.name
                            : post.blog_categories.name}
                        </Link>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        <Link href={`/blog/${post.slug}`} className="hover:text-green-600">
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        {post.reading_time_minutes && (
                          <span>{post.reading_time_minutes} min read</span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/blog?page=${currentPage - 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ← Previous
                  </Link>
                )}
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <Link
                          key={pageNum}
                          href={`/blog?page=${pageNum}`}
                          className={`px-4 py-2 rounded-lg ${
                            pageNum === currentPage
                              ? 'bg-green-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-2">...</span>
                    }
                    return null
                  })}
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={`/blog?page=${currentPage + 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog/category/${category.slug}`}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || '#2B7A4B' }}
                        />
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {category.post_count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Subscribe CTA */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
              <p className="text-green-50 mb-4">
                Get the latest insights delivered to your inbox.
              </p>
              <Link
                href="/newsletter"
                className="block w-full bg-white text-green-600 text-center font-semibold py-3 rounded-lg hover:bg-green-50 transition-colors"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

