import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const POSTS_PER_PAGE = 12

interface Tag {
  id: string
  name: string
  slug: string
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: tag } = await supabase
    .from('blog_tags')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!tag) {
    return { title: 'Tag Not Found - PoultryCo Blog' }
  }

  return {
    title: `#${tag.name} - PoultryCo Blog`,
    description: `Browse all posts tagged with #${tag.name} on PoultryCo Blog`,
  }
}

async function getTag(slug: string) {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Tag
}

async function getTagPosts(tagId: string, page: number = 1) {
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  // First get post IDs from blog_post_tags
  const { data: postTags, error: postTagsError } = await supabase
    .from('blog_post_tags')
    .select('post_id')
    .eq('tag_id', tagId)

  if (postTagsError || !postTags) {
    return { posts: [], totalPages: 0 }
  }

  const postIds = postTags.map(pt => pt.post_id)

  if (postIds.length === 0) {
    return { posts: [], totalPages: 0 }
  }

  // Then get posts
  const { data, error, count } = await supabase
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
      category_id,
      blog_categories (
        name,
        slug,
        color
      )
    `, { count: 'exact' })
    .in('id', postIds)
    .eq('status', 'published')
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

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const tag = await getTag(slug)

  if (!tag) {
    notFound()
  }

  const page = parseInt(pageParam || '1')
  const { posts, totalPages } = await getTagPosts(tag.id, page)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl font-bold text-white/60">#</span>
            <h1 className="text-4xl md:text-5xl font-bold">{tag.name}</h1>
          </div>
          <div className="text-white/80">
            {tag.post_count} {tag.post_count === 1 ? 'post' : 'posts'} tagged with #{tag.name}
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
          <span className="text-gray-600">#{tag.name}</span>
        </nav>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posts with this tag yet.</p>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/blog/tag/${slug}?page=${page - 1}`}
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
                          href={`/blog/tag/${slug}?page=${pageNum}`}
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
                    href={`/blog/tag/${slug}?page=${page + 1}`}
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

