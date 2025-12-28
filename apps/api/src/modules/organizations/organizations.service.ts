import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, and, like, or, desc, sql, gte } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { orgProfiles } from '@/database/schema';

@Injectable()
export class OrganizationsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Search organizations
   */
  async searchOrganizations(query: {
    search?: string;
    city?: string;
    state?: string;
    organizationType?: string;
    limit?: number;
    offset?: number;
  }) {
    const { search, city, state, organizationType, limit = 24, offset = 0 } = query;

    let whereConditions = [eq(orgProfiles.isActive, true)];

    if (search) {
      whereConditions.push(
        or(
          like(orgProfiles.name, `%${search}%`),
          like(orgProfiles.tagline, `%${search}%`),
          like(orgProfiles.about, `%${search}%`),
        ),
      );
    }

    if (city) {
      whereConditions.push(eq(orgProfiles.city, city));
    }

    if (state) {
      whereConditions.push(eq(orgProfiles.state, state));
    }

    if (organizationType) {
      whereConditions.push(eq(orgProfiles.organizationTypeId, organizationType));
    }

    const results = await this.db.query.orgProfiles.findMany({
      where: and(...whereConditions),
      limit,
      offset,
      orderBy: [desc(orgProfiles.createdAt)],
      with: {
        organizationType: true,
      },
    });

    // Get total count
    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(orgProfiles)
      .where(and(...whereConditions));

    return {
      data: results,
      count: Number(total[0]?.count || 0),
    };
  }

  /**
   * Get organization by slug
   */
  async getOrganizationBySlug(slug: string) {
    const organization = await this.db.query.orgProfiles.findFirst({
      where: eq(orgProfiles.slug, slug),
      with: {
        organizationType: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }
}
