import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, and, like, or, desc, gte, lte, inArray, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { bizProfiles, bizTeamMembers, mktProducts } from '@/database/schema';

@Injectable()
export class BusinessesService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Search businesses
   */
  async searchBusinesses(query: {
    search?: string;
    city?: string;
    state?: string;
    businessType?: string;
    verified?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { search, city, state, businessType, verified, limit = 24, offset = 0 } = query;

    let whereConditions = [eq(bizProfiles.isActive, true)];

    if (search) {
      whereConditions.push(
        or(
          like(bizProfiles.name, `%${search}%`),
          like(bizProfiles.tagline, `%${search}%`),
          like(bizProfiles.about, `%${search}%`),
        ),
      );
    }

    if (city) {
      whereConditions.push(eq(bizProfiles.city, city));
    }

    if (state) {
      whereConditions.push(eq(bizProfiles.state, state));
    }

    if (businessType) {
      whereConditions.push(eq(bizProfiles.businessTypeId, businessType));
    }

    if (verified !== undefined) {
      whereConditions.push(eq(bizProfiles.isVerified, verified));
    }

    const results = await this.db.query.bizProfiles.findMany({
      where: and(...whereConditions),
      limit,
      offset,
      orderBy: [desc(bizProfiles.createdAt)],
      with: {
        businessType: true,
      },
    });

    // Get total count
    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(bizProfiles)
      .where(and(...whereConditions));

    return {
      data: results,
      count: Number(total[0]?.count || 0),
    };
  }

  /**
   * Get business by slug
   */
  async getBusinessBySlug(slug: string) {
    const business = await this.db.query.bizProfiles.findFirst({
      where: eq(bizProfiles.slug, slug),
      with: {
        businessType: true,
        teamMembers: {
          with: {
            profile: true,
          },
        },
        products: {
          where: eq(mktProducts.isPublished, true),
          limit: 10,
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  /**
   * Get business by ID
   */
  async getBusinessById(id: string) {
    const business = await this.db.query.bizProfiles.findFirst({
      where: eq(bizProfiles.id, id),
      with: {
        businessType: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  /**
   * Create business
   */
  async createBusiness(ownerId: string, data: any) {
    const [business] = await this.db
      .insert(bizProfiles)
      .values({
        ownerId,
        ...data,
      })
      .returning();

    return business;
  }

  /**
   * Update business
   */
  async updateBusiness(businessId: string, ownerId: string, data: any) {
    const [updated] = await this.db
      .update(bizProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(bizProfiles.id, businessId), eq(bizProfiles.ownerId, ownerId)))
      .returning();

    if (!updated) {
      throw new NotFoundException('Business not found or unauthorized');
    }

    return updated;
  }

  /**
   * Delete business
   */
  async deleteBusiness(businessId: string, ownerId: string) {
    await this.db
      .update(bizProfiles)
      .set({
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(bizProfiles.id, businessId), eq(bizProfiles.ownerId, ownerId)));

    return { success: true };
  }
}
