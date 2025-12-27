import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { eq, and, or, like, desc, asc, inArray, gte, lte, sql, count } from 'drizzle-orm';
import { contentTags, contentTagAssignments, pillarTagAssignments } from '@/database/schema';

// TODO: Create marketing tables in database schema
// Tables needed:
// - stakeholder_segments
// - ndp_categories
// - content_topics
// - content_topic_segments
// - content_types
// - pillar_types
// - content_pillars
// - content_pillar_types
// - content_ideas
// - content
// - marketing_channels
// - content_schedule
// - social_media_kpis
// - platform_kpis

@Injectable()
export class MarketingService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  // =====================================================
  // NDP CATEGORIES
  // =====================================================

  async getNdpCategories() {
    // TODO: Implement when ndp_categories table exists
    return [];
  }

  // =====================================================
  // STAKEHOLDER SEGMENTS
  // =====================================================

  async getStakeholderSegments() {
    // TODO: Implement when stakeholder_segments table exists
    return [];
  }

  async getStakeholderSegmentById(id: string) {
    // TODO: Implement
    return null;
  }

  async createStakeholderSegment(data: any) {
    // TODO: Implement
    throw new Error('Stakeholder segments table not yet created.');
  }

  async updateStakeholderSegment(id: string, data: any) {
    // TODO: Implement
    throw new Error('Stakeholder segments table not yet created.');
  }

  async deleteStakeholderSegment(id: string) {
    // TODO: Implement
    throw new Error('Stakeholder segments table not yet created.');
  }

  // =====================================================
  // CONTENT TOPICS
  // =====================================================

  async getContentTopics(filters?: { categoryId?: string; search?: string }) {
    // TODO: Implement when content_topics table exists
    return [];
  }

  async getContentTopicById(id: string) {
    // TODO: Implement
    return null;
  }

  async createContentTopic(data: any) {
    // TODO: Implement
    throw new Error('Content topics table not yet created.');
  }

  async updateContentTopic(id: string, data: any) {
    // TODO: Implement
    throw new Error('Content topics table not yet created.');
  }

  async deleteContentTopic(id: string) {
    // TODO: Implement
    throw new Error('Content topics table not yet created.');
  }

  // =====================================================
  // CONTENT PILLARS
  // =====================================================

  async getContentPillars(filters?: { status?: string; search?: string }) {
    // TODO: Implement when content_pillars table exists
    return [];
  }

  async getContentPillarById(id: string) {
    // TODO: Implement
    return null;
  }

  async createContentPillar(data: any) {
    // TODO: Implement
    throw new Error('Content pillars table not yet created.');
  }

  async updateContentPillar(id: string, data: any) {
    // TODO: Implement
    throw new Error('Content pillars table not yet created.');
  }

  async deleteContentPillar(id: string) {
    // TODO: Implement
    throw new Error('Content pillars table not yet created.');
  }

  // =====================================================
  // CONTENT
  // =====================================================

  async getContent(filters?: { status?: string; pillarId?: string; topicId?: string }) {
    // TODO: Implement when content table exists
    return [];
  }

  async getContentById(id: string) {
    // TODO: Implement
    return null;
  }

  async createContent(data: any) {
    // TODO: Implement
    throw new Error('Content table not yet created.');
  }

  async updateContent(id: string, data: any) {
    // TODO: Implement
    throw new Error('Content table not yet created.');
  }

  async deleteContent(id: string) {
    // TODO: Implement
    throw new Error('Content table not yet created.');
  }

  // =====================================================
  // CONTENT IDEAS
  // =====================================================

  async getContentIdeas(filters?: { status?: string; pillarId?: string; topicId?: string }) {
    // TODO: Implement when content_ideas table exists
    return [];
  }

  async getContentIdeaById(id: string) {
    // TODO: Implement
    return null;
  }

  async createContentIdea(data: any) {
    // TODO: Implement
    throw new Error('Content ideas table not yet created.');
  }

  async updateContentIdea(id: string, data: any) {
    // TODO: Implement
    throw new Error('Content ideas table not yet created.');
  }

  async deleteContentIdea(id: string) {
    // TODO: Implement
    throw new Error('Content ideas table not yet created.');
  }

  // =====================================================
  // MARKETING CHANNELS
  // =====================================================

  async getMarketingChannels() {
    // TODO: Implement when marketing_channels table exists
    return [];
  }

  async getMarketingChannelById(id: string) {
    // TODO: Implement
    return null;
  }

  async createMarketingChannel(data: any) {
    // TODO: Implement
    throw new Error('Marketing channels table not yet created.');
  }

  async updateMarketingChannel(id: string, data: any) {
    // TODO: Implement
    throw new Error('Marketing channels table not yet created.');
  }

  async deleteMarketingChannel(id: string) {
    // TODO: Implement
    throw new Error('Marketing channels table not yet created.');
  }

  // =====================================================
  // CONTENT SCHEDULE
  // =====================================================

  async getContentSchedule(filters?: { startDate?: string; endDate?: string; channelId?: string; status?: string }) {
    // TODO: Implement when content_schedule table exists
    return [];
  }

  async getContentScheduleById(id: string) {
    // TODO: Implement
    return null;
  }

  async createContentSchedule(data: any) {
    // TODO: Implement
    throw new Error('Content schedule table not yet created.');
  }

  async updateContentSchedule(id: string, data: any) {
    // TODO: Implement
    throw new Error('Content schedule table not yet created.');
  }

  async deleteContentSchedule(id: string) {
    // TODO: Implement
    throw new Error('Content schedule table not yet created.');
  }

  // =====================================================
  // KPIs
  // =====================================================

  async getSocialMediaKpis(filters?: { channelId?: string; startDate?: string; endDate?: string }) {
    // TODO: Implement when social_media_kpis table exists
    return [];
  }

  async getPlatformKpis(filters?: { startDate?: string; endDate?: string }) {
    // TODO: Implement when platform_kpis table exists
    return [];
  }

  async createSocialMediaKpi(data: any) {
    // TODO: Implement
    throw new Error('Social media KPIs table not yet created.');
  }

  async createPlatformKpi(data: any) {
    // TODO: Implement
    throw new Error('Platform KPIs table not yet created.');
  }

  // =====================================================
  // DASHBOARD STATS
  // =====================================================

  async getMarketingDashboardStats() {
    // TODO: Implement when tables exist
    return {
      topicsCount: 0,
      segmentsCount: 0,
      pillarsCount: 0,
      channelsCount: 0,
      scheduledCount: 0,
    };
  }

  // =====================================================
  // CONTENT TAGS
  // =====================================================

  async getContentTags() {
    return this.db
      .select()
      .from(contentTags)
      .orderBy(asc(contentTags.name));
  }

  async getPopularContentTags(limit: number = 10) {
    return this.db
      .select()
      .from(contentTags)
      .orderBy(desc(contentTags.usageCount))
      .limit(limit);
  }

  async getContentTagById(id: string) {
    const [tag] = await this.db
      .select()
      .from(contentTags)
      .where(eq(contentTags.id, id))
      .limit(1);

    if (!tag) {
      throw new NotFoundException('Content tag not found');
    }

    return tag;
  }

  async createContentTag(data: any) {
    if (!data.name) {
      throw new BadRequestException('Tag name is required');
    }

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(data.name);
    }

    // Check for duplicate slug
    const existing = await this.db
      .select()
      .from(contentTags)
      .where(eq(contentTags.slug, data.slug))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('A tag with this slug already exists');
    }

    const [tag] = await this.db
      .insert(contentTags)
      .values({
        name: data.name,
        slug: data.slug,
        color: data.color || '#6366F1',
        description: data.description || null,
        createdBy: data.createdBy || null,
      })
      .returning();

    return tag;
  }

  async updateContentTag(id: string, data: any) {
    const existing = await this.getContentTagById(id);

    // Generate slug if name changed and slug not provided
    if (data.name && !data.slug && data.name !== existing.name) {
      data.slug = this.generateSlug(data.name);
    }

    // Check for duplicate slug
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await this.db
        .select()
        .from(contentTags)
        .where(eq(contentTags.slug, data.slug))
        .limit(1);

      if (duplicate.length > 0) {
        throw new BadRequestException('A tag with this slug already exists');
      }
    }

    const [tag] = await this.db
      .update(contentTags)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.description !== undefined && { description: data.description }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(contentTags.id, id))
      .returning();

    return tag;
  }

  async deleteContentTag(id: string) {
    await this.getContentTagById(id); // Throws if not found
    await this.db.delete(contentTags).where(eq(contentTags.id, id));
    return true;
  }

  // =====================================================
  // PILLAR-TAG RELATIONSHIPS
  // =====================================================

  async getPillarTags(pillarId: string) {
    const tags = await this.db
      .select({
        id: contentTags.id,
        name: contentTags.name,
        slug: contentTags.slug,
        color: contentTags.color,
        description: contentTags.description,
        usageCount: contentTags.usageCount,
        createdAt: contentTags.createdAt,
        updatedAt: contentTags.updatedAt,
      })
      .from(pillarTagAssignments)
      .innerJoin(contentTags, eq(pillarTagAssignments.tagId, contentTags.id))
      .where(eq(pillarTagAssignments.pillarId, pillarId));

    return tags;
  }

  async setPillarTags(pillarId: string, tagIds: string[]) {
    // Remove existing tags
    await this.db.delete(pillarTagAssignments).where(eq(pillarTagAssignments.pillarId, pillarId));

    // Add new tags
    if (tagIds.length > 0) {
      await this.db.insert(pillarTagAssignments).values(
        tagIds.map((tagId) => ({
          pillarId,
          tagId,
        }))
      );
    }
  }

  async removePillarTag(pillarId: string, tagId: string) {
    await this.db
      .delete(pillarTagAssignments)
      .where(and(eq(pillarTagAssignments.pillarId, pillarId), eq(pillarTagAssignments.tagId, tagId)));
  }

  // =====================================================
  // UTILITIES
  // =====================================================

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
