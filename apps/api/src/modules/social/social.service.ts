import { Injectable, NotFoundException, Inject, ForbiddenException } from '@nestjs/common';
import { eq, and, like, or, desc, sql, isNull, inArray } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import {
  socPosts,
  socPostLikes,
  socPostComments,
  socConnections,
  socFollows,
  profiles,
} from '@/database/schema';

@Injectable()
export class SocialService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Get posts feed
   */
  async getFeed(profileId: string, params?: { limit?: number; offset?: number }) {
    const { limit = 20, offset = 0 } = params || {};

    // Get posts from connections and followed users
    const connections = await this.db
      .select({ profileId: socConnections.addresseeId })
      .from(socConnections)
      .where(
        and(
          eq(socConnections.requesterId, profileId),
          eq(socConnections.status, 'accepted'),
        ),
      );

    const following = await this.db
      .select({ profileId: socFollows.followingId })
      .from(socFollows)
      .where(eq(socFollows.followerId, profileId));

    const authorIds = [
      profileId,
      ...connections.map((c: any) => c.profileId),
      ...following.map((f: any) => f.profileId),
    ];

    const posts = await this.db.query.socPosts.findMany({
      where: and(
        eq(socPosts.isPublished, true),
        isNull(socPosts.deletedAt),
        inArray(socPosts.authorId, authorIds),
      ),
      limit,
      offset,
      orderBy: [desc(socPosts.createdAt)],
      with: {
        author: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            slug: true,
            profilePhoto: true,
            headline: true,
          },
        },
      },
    });

    return posts;
  }

  /**
   * Get post by ID
   */
  async getPost(postId: string) {
    const post = await this.db.query.socPosts.findFirst({
      where: and(eq(socPosts.id, postId), isNull(socPosts.deletedAt)),
      with: {
        author: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            slug: true,
            profilePhoto: true,
            headline: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  /**
   * Create a post
   */
  async createPost(authorId: string, data: {
    content: string;
    title?: string;
    postType?: string;
    mediaUrls?: string[];
    tags?: string[];
  }) {
    const [post] = await this.db
      .insert(socPosts)
      .values({
        authorId,
        content: data.content,
        title: data.title,
        postType: data.postType || 'post',
        mediaUrls: data.mediaUrls || [],
        tags: data.tags || [],
      })
      .returning();

    // Increment posts count
    await this.db
      .update(profiles)
      .set({
        postsCount: sql`${profiles.postsCount} + 1`,
      })
      .where(eq(profiles.id, authorId));

    return this.getPost(post.id);
  }

  /**
   * Like a post
   */
  async likePost(postId: string, profileId: string) {
    // Check if already liked
    const existing = await this.db.query.socPostLikes.findFirst({
      where: and(eq(socPostLikes.postId, postId), eq(socPostLikes.profileId, profileId)),
    });

    if (existing) {
      return { success: true, liked: true };
    }

    // Add like
    await this.db.insert(socPostLikes).values({
      postId,
      profileId,
    });

    // Increment likes count
    await this.db
      .update(socPosts)
      .set({
        likesCount: sql`${socPosts.likesCount} + 1`,
      })
      .where(eq(socPosts.id, postId));

    return { success: true, liked: true };
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string, profileId: string) {
    await this.db
      .delete(socPostLikes)
      .where(and(eq(socPostLikes.postId, postId), eq(socPostLikes.profileId, profileId)));

    // Decrement likes count
    await this.db
      .update(socPosts)
      .set({
        likesCount: sql`GREATEST(${socPosts.likesCount} - 1, 0)`,
      })
      .where(eq(socPosts.id, postId));

    return { success: true, liked: false };
  }

  /**
   * Get connection stats
   */
  async getConnectionStats(profileId: string) {
    // Get connections count (accepted)
    const connectionsCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(socConnections)
      .where(
        and(
          or(
            eq(socConnections.requesterId, profileId),
            eq(socConnections.addresseeId, profileId),
          ),
          eq(socConnections.status, 'accepted'),
        ),
      );

    // Get followers count
    const followersCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(socFollows)
      .where(eq(socFollows.followingId, profileId));

    // Get following count
    const followingCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(socFollows)
      .where(eq(socFollows.followerId, profileId));

    return {
      connections: Number(connectionsCount[0]?.count || 0),
      followers: Number(followersCount[0]?.count || 0),
      following: Number(followingCount[0]?.count || 0),
    };
  }

  /**
   * Send connection request
   */
  async sendConnectionRequest(requesterId: string, addresseeId: string, message?: string) {
    // Check if already exists
    const existing = await this.db.query.socConnections.findFirst({
      where: or(
        and(
          eq(socConnections.requesterId, requesterId),
          eq(socConnections.addresseeId, addresseeId),
        ),
        and(
          eq(socConnections.requesterId, addresseeId),
          eq(socConnections.addresseeId, requesterId),
        ),
      ),
    });

    if (existing) {
      throw new ForbiddenException('Connection request already exists');
    }

    const [connection] = await this.db
      .insert(socConnections)
      .values({
        requesterId,
        addresseeId,
        message,
        status: 'pending',
      })
      .returning();

    return connection;
  }

  /**
   * Accept connection request
   */
  async acceptConnectionRequest(connectionId: string, profileId: string) {
    const connection = await this.db.query.socConnections.findFirst({
      where: and(
        eq(socConnections.id, connectionId),
        or(
          eq(socConnections.requesterId, profileId),
          eq(socConnections.addresseeId, profileId),
        ),
      ),
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.status !== 'pending') {
      throw new ForbiddenException('Connection request already processed');
    }

    await this.db
      .update(socConnections)
      .set({
        status: 'accepted',
        respondedAt: new Date(),
      })
      .where(eq(socConnections.id, connectionId));

    // Update connection counts
    await this.db
      .update(profiles)
      .set({
        connectionsCount: sql`${profiles.connectionsCount} + 1`,
      })
      .where(eq(profiles.id, connection.requesterId));

    await this.db
      .update(profiles)
      .set({
        connectionsCount: sql`${profiles.connectionsCount} + 1`,
      })
      .where(eq(profiles.id, connection.addresseeId));

    return { success: true };
  }

  /**
   * Get connections
   */
  async getConnections(profileId: string, params?: { status?: string }) {
    const { status = 'accepted' } = params || {};

    // Get connections where user is requester
    const asRequester = await this.db
      .select()
      .from(socConnections)
      .where(
        and(
          eq(socConnections.requesterId, profileId),
          eq(socConnections.status, status),
        ),
      );

    // Get connections where user is addressee
    const asAddressee = await this.db
      .select()
      .from(socConnections)
      .where(
        and(
          eq(socConnections.addresseeId, profileId),
          eq(socConnections.status, status),
        ),
      );

    // Combine and get profile details
    const allConnections = [...asRequester, ...asAddressee];
    const otherProfileIds = allConnections.map((conn: any) =>
      conn.requesterId === profileId ? conn.addresseeId : conn.requesterId,
    );

    const otherProfiles = await this.db.query.profiles.findMany({
      where: inArray(profiles.id, otherProfileIds),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        slug: true,
        profilePhoto: true,
        headline: true,
      },
    });

    const profileMap = new Map(otherProfiles.map((p: any) => [p.id, p]));

    // Map connections with other user info
    return allConnections.map((conn: any) => ({
      ...conn,
      otherUser: profileMap.get(
        conn.requesterId === profileId ? conn.addresseeId : conn.requesterId,
      ),
    }));
  }
}
