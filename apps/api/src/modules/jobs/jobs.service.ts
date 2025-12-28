import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, and, like, or, desc, sql, gte } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { jobPostings, bizProfiles } from '@/database/schema';

@Injectable()
export class JobsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Search jobs
   */
  async searchJobs(query: {
    search?: string;
    employmentType?: string;
    city?: string;
    state?: string;
    isRemote?: boolean;
    salaryMin?: number;
    limit?: number;
    offset?: number;
  }) {
    const { search, employmentType, city, state, isRemote, salaryMin, limit = 24, offset = 0 } = query;

    let whereConditions = [
      eq(jobPostings.isPublished, true),
      eq(jobPostings.status, 'active'),
    ];

    if (search) {
      whereConditions.push(
        or(
          like(jobPostings.title, `%${search}%`),
          like(jobPostings.description, `%${search}%`),
        ),
      );
    }

    if (employmentType) {
      whereConditions.push(eq(jobPostings.jobType, employmentType));
    }

    if (city) {
      whereConditions.push(eq(jobPostings.city, city));
    }

    if (state) {
      whereConditions.push(eq(jobPostings.state, state));
    }

    if (isRemote !== undefined) {
      whereConditions.push(eq(jobPostings.isRemote, isRemote));
    }

    if (salaryMin !== undefined) {
      whereConditions.push(gte(jobPostings.salaryMin, salaryMin));
    }

    const results = await this.db.query.jobPostings.findMany({
      where: and(...whereConditions),
      limit,
      offset,
      orderBy: [desc(jobPostings.postedAt || jobPostings.createdAt)],
      with: {
        category: true,
        employer: {
          columns: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            isVerified: true,
          },
        },
      },
    });

    // Get total count
    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(jobPostings)
      .where(and(...whereConditions));

    return {
      data: results,
      count: Number(total[0]?.count || 0),
    };
  }

  /**
   * Get job by slug
   */
  async getJobBySlug(slug: string) {
    const job = await this.db.query.jobPostings.findFirst({
      where: eq(jobPostings.slug, slug),
      with: {
        category: true,
        employer: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }
}
