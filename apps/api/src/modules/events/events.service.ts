import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, and, like, or, desc, sql, gte } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { evtEvents, orgProfiles } from '@/database/schema';

@Injectable()
export class EventsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Search events
   */
  async searchEvents(query: {
    search?: string;
    eventType?: string;
    format?: string;
    isFree?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { search, eventType, format, isFree, limit = 24, offset = 0 } = query;

    let whereConditions = [
      eq(evtEvents.isPublished, true),
      eq(evtEvents.status, 'published'),
      gte(evtEvents.startDate, new Date()),
    ];

    if (search) {
      whereConditions.push(
        or(
          like(evtEvents.title, `%${search}%`),
          like(evtEvents.description, `%${search}%`),
        )!
      );
    }

    if (eventType) {
      whereConditions.push(eq(evtEvents.eventTypeId, eventType));
    }

    if (format) {
      whereConditions.push(eq(evtEvents.eventFormat, format));
    }

    if (isFree !== undefined) {
      whereConditions.push(eq(evtEvents.registrationFee, isFree ? 0 : sql`> 0`));
    }

    const results = await this.db.query.evtEvents.findMany({
      where: and(...whereConditions),
      limit,
      offset,
      orderBy: [sql`${evtEvents.startDate} ASC`],
      with: {
        eventType: true,
        organizer: {
          columns: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    // Get total count
    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(evtEvents)
      .where(and(...whereConditions));

    return {
      data: results,
      count: Number(total[0]?.count || 0),
    };
  }

  /**
   * Get event by slug
   */
  async getEventBySlug(slug: string) {
    const event = await this.db.query.evtEvents.findFirst({
      where: eq(evtEvents.slug, slug),
      with: {
        eventType: true,
        organizer: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }
}
