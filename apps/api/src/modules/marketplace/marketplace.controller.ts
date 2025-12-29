import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get('products/search')
  @ApiOperation({ summary: 'Search products' })
  @ApiResponse({ status: 200, description: 'Products found' })
  async searchProducts(
    @Query('q') search?: string,
    @Query('category') category?: string,
    @Query('inStock') inStock?: boolean,
    @Query('priceMin') priceMin?: number,
    @Query('priceMax') priceMax?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.marketplaceService.searchProducts({
      search,
      category,
      inStock,
      priceMin,
      priceMax,
      limit,
      offset,
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async getCategories(@Query('level') level?: number) {
    return this.marketplaceService.getCategories(level);
  }
}

