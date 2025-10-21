import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const POSTS_PER_PAGE = 12

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  post_count: number
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  featured_image_alt: string | null
  published_at: string
  reading_time_minutes: number | null
  author_name: string | null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: category } = await supabase
    .from('blog_categories')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    return { title: 'Category Not Found - PoultryCo Blog' }
  }

  return {
    title: `${category.name} - PoultryCo Blog`,
    description: category.description || `Browse all ${category.name} posts on PoultryCo Blog`,
  }
}

async function getCategory(slug: string) {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Category
}

async function getCategoryPosts(categoryId: string, page: number = 1) {
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const { data, error, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error:', error)
    return { posts: [], totalPages: 0 }
  }

  const totalPages = count ? Math.ceil(count / POSTS_PER_PAGE) : 0

  return {
    posts: data as BlogPost[],
    totalPages,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const page = parseInt(pageParam || '1')
  const { posts, totalPages } = await getCategoryPosts(category.id, page)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="text-white py-16"
        style={{
          background: `linear-gradient(135deg, ${category.color || '#2B7A4B'} 0%, ${category.color ? category.color + 'dd' : '#1F5937'} 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            {category.icon && <span className="text-4xl">{category.icon}</span>}
            <h1 className="text-4xl md:text-5xl font-bold">{category.name}</h1>
          </div>
          {category.description && (
            <p className="text-xl text-white/90 max-w-3xl">
              {category.description}
            </p>
          )}
          <div className="mt-4 text-white/80">
            {category.post_count} {category.post_count === 1 ? 'post' : 'posts'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/blog" className="text-green-600 hover:text-green-700">
            Blog
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{category.name}</span>
        </nav>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posts in this category yet.</p>
            <Link
              href="/blog"
              className="inline-block mt-4 text-green-600 hover:text-green-700 font-semibold"
            >
              ← Back to all posts
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/blog/category/${slug}?page=${page - 1}`}
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
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Link
                          key={pageNum}
                          href={`/blog/category/${slug}?page=${pageNum}`}
                          className={`px-4 py-2 rounded-lg ${
                            pageNum === page
                              ? 'bg-green-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    } else if (
                      pageNum === page - 2 ||
                      pageNum === page + 2
                    ) {
                      return <span key={pageNum} className="px-2">...</span>
                    }
                    return null
                  })}
                </div>

                {page < totalPages && (
                  <Link
                    href={`/blog/category/${slug}?page=${page + 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

