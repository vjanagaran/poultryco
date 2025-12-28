import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, and, like, or, desc, gte, lte, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { mktProducts, mktCategories, bizProfiles } from '@/database/schema';

@Injectable()
export class MarketplaceService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Search products
   */
  async searchProducts(query: {
    search?: string;
    category?: string;
    inStock?: boolean;
    priceMin?: number;
    priceMax?: number;
    limit?: number;
    offset?: number;
  }) {
    const { search, category, inStock, priceMin, priceMax, limit = 24, offset = 0 } = query;

    let whereConditions = [eq(mktProducts.isPublished, true)];

    if (search) {
      whereConditions.push(
        or(
          like(mktProducts.name, `%${search}%`),
          like(mktProducts.description, `%${search}%`),
        ),
      );
    }

    if (category) {
      whereConditions.push(eq(mktProducts.categoryId, category));
    }

    if (inStock !== undefined) {
      whereConditions.push(eq(mktProducts.stockStatus, inStock ? 'in_stock' : 'out_of_stock'));
    }

    if (priceMin !== undefined) {
      whereConditions.push(gte(mktProducts.price, priceMin.toString()));
    }

    if (priceMax !== undefined) {
      whereConditions.push(lte(mktProducts.price, priceMax.toString()));
    }

    const results = await this.db.query.mktProducts.findMany({
      where: and(...whereConditions),
      limit,
      offset,
      orderBy: [desc(mktProducts.createdAt)],
      with: {
        category: true,
      },
    });

    // Get total count
    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(mktProducts)
      .where(and(...whereConditions));

    return {
      data: results,
      count: Number(total[0]?.count || 0),
    };
  }

  /**
   * Get product categories
   */
  async getCategories(level?: number) {
    let whereConditions = [eq(mktCategories.isActive, true)];

    if (level !== undefined) {
      // Assuming level is stored in metadata or needs to be calculated
      // For now, return all active categories
    }

    return this.db.query.mktCategories.findMany({
      where: and(...whereConditions),
      orderBy: [sql`${mktCategories.displayOrder} ASC`],
    });
  }
}

