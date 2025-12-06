import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { NeccService } from './necc.service';

@ApiTags('NECC')
@Controller('necc')
export class NeccController {
  constructor(private neccService: NeccService) {}

  // =====================================================
  // ZONES
  // =====================================================

  @Get('zones')
  @ApiOperation({ summary: 'Get all active zones' })
  @ApiResponse({ status: 200, description: 'List of zones' })
  async getAllZones() {
    return this.neccService.getAllZones();
  }

  @Get('zones/count')
  @ApiOperation({ summary: 'Get zones count' })
  @ApiResponse({ status: 200, description: 'Zones count' })
  async getZonesCount() {
    const count = await this.neccService.getZonesCount();
    return { count };
  }

  @Get('zones/:id')
  @ApiOperation({ summary: 'Get zone by ID' })
  @ApiResponse({ status: 200, description: 'Zone details' })
  @ApiResponse({ status: 404, description: 'Zone not found' })
  async getZoneById(@Param('id') id: string) {
    const zone = await this.neccService.getZoneById(id);
    if (!zone) {
      throw new BadRequestException('Zone not found');
    }
    return zone;
  }

  @Get('zones/slug/:slug')
  @ApiOperation({ summary: 'Get zone by slug' })
  @ApiResponse({ status: 200, description: 'Zone details' })
  @ApiResponse({ status: 404, description: 'Zone not found' })
  async getZoneBySlug(@Param('slug') slug: string) {
    const zone = await this.neccService.getZoneBySlug(slug);
    if (!zone) {
      throw new BadRequestException('Zone not found');
    }
    return zone;
  }

  @Get('zones/type/:type')
  @ApiOperation({ summary: 'Get zones by type' })
  @ApiResponse({ status: 200, description: 'List of zones' })
  async getZonesByType(
    @Param('type') type: 'production_center' | 'consumption_center',
  ) {
    return this.neccService.getZonesByType(type);
  }

  // =====================================================
  // PRICES
  // =====================================================

  @Get('prices/today')
  @ApiOperation({ summary: "Get today's prices for all zones" })
  @ApiResponse({ status: 200, description: 'List of prices' })
  async getTodayPrices() {
    return this.neccService.getTodayPrices();
  }

  @Get('prices/yesterday')
  @ApiOperation({ summary: "Get yesterday's prices for all zones" })
  @ApiResponse({ status: 200, description: 'List of prices' })
  async getYesterdayPrices() {
    return this.neccService.getYesterdayPrices();
  }

  @Get('prices/date/:date')
  @ApiOperation({ summary: 'Get prices for a specific date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'List of prices' })
  async getPricesByDate(@Param('date') date: string) {
    return this.neccService.getPricesByDate(date);
  }

  @Get('prices/zone/:zoneId')
  @ApiOperation({ summary: 'Get prices for a specific zone' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results' })
  @ApiResponse({ status: 200, description: 'List of prices' })
  async getZonePrices(
    @Param('zoneId') zoneId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.neccService.getZonePrices(
      zoneId,
      startDate,
      endDate,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('prices/month')
  @ApiOperation({ summary: 'Get prices for a specific month' })
  @ApiQuery({ name: 'year', required: true, description: 'Year (e.g., 2024)' })
  @ApiQuery({ name: 'month', required: true, description: 'Month (1-12)' })
  @ApiResponse({ status: 200, description: 'List of prices' })
  async getMonthPrices(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }
    return this.neccService.getMonthPrices(year, month);
  }

  @Get('prices/year/:year')
  @ApiOperation({ summary: 'Get prices for a specific year' })
  @ApiResponse({ status: 200, description: 'List of prices' })
  async getYearPrices(@Param('year', ParseIntPipe) year: number) {
    return this.neccService.getYearPrices(year);
  }

  @Get('prices/range')
  @ApiOperation({ summary: 'Get prices for a date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'List of prices' })
  async getPricesByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.neccService.getPricesByDateRange(startDate, endDate);
  }

  @Get('prices/stats')
  @ApiOperation({ summary: 'Get price statistics for a date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'zoneId', required: false, description: 'Zone ID (optional)' })
  @ApiResponse({ status: 200, description: 'Price statistics' })
  async getPriceStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('zoneId') zoneId?: string,
  ) {
    return this.neccService.getPriceStats(startDate, endDate, zoneId);
  }

  @Get('prices/average/today')
  @ApiOperation({ summary: "Get today's average price" })
  @ApiResponse({ status: 200, description: 'Average price' })
  async getTodayAverage() {
    const average = await this.neccService.getTodayAverage();
    return { average };
  }

  @Get('prices/average/yesterday')
  @ApiOperation({ summary: "Get yesterday's average price" })
  @ApiResponse({ status: 200, description: 'Average price' })
  async getYesterdayAverage() {
    const average = await this.neccService.getYesterdayAverage();
    return { average };
  }

  // =====================================================
  // MONTHLY AVERAGES
  // =====================================================

  @Get('monthly-averages')
  @ApiOperation({ summary: 'Get monthly price averages' })
  @ApiQuery({ name: 'zoneId', required: false, description: 'Zone ID (optional)' })
  @ApiQuery({ name: 'startMonth', required: false, description: 'Start month (YYYY-MM-01)' })
  @ApiQuery({ name: 'endMonth', required: false, description: 'End month (YYYY-MM-01)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results' })
  @ApiResponse({ status: 200, description: 'List of monthly averages' })
  async getMonthlyAverages(
    @Query('zoneId') zoneId?: string,
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
    @Query('limit') limit?: string,
  ) {
    return this.neccService.getMonthlyAverages(
      zoneId,
      startMonth,
      endMonth,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('monthly-averages/zone/:zoneId')
  @ApiOperation({ summary: 'Get monthly averages for a specific zone' })
  @ApiQuery({ name: 'startMonth', required: false, description: 'Start month (YYYY-MM-01)' })
  @ApiQuery({ name: 'endMonth', required: false, description: 'End month (YYYY-MM-01)' })
  @ApiResponse({ status: 200, description: 'List of monthly averages' })
  async getZoneMonthlyAverages(
    @Param('zoneId') zoneId: string,
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
  ) {
    return this.neccService.getZoneMonthlyAverages(zoneId, startMonth, endMonth);
  }

  @Get('monthly-averages/stats')
  @ApiOperation({ summary: 'Get monthly average statistics' })
  @ApiQuery({ name: 'zoneId', required: false, description: 'Zone ID (optional)' })
  @ApiQuery({ name: 'startMonth', required: false, description: 'Start month (YYYY-MM-01)' })
  @ApiQuery({ name: 'endMonth', required: false, description: 'End month (YYYY-MM-01)' })
  @ApiResponse({ status: 200, description: 'Monthly average statistics' })
  async getMonthlyAverageStats(
    @Query('zoneId') zoneId?: string,
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
  ) {
    return this.neccService.getMonthlyAverageStats(zoneId, startMonth, endMonth);
  }

  // =====================================================
  // YEAR-OVER-YEAR
  // =====================================================

  @Get('yoy/zone/:zoneId')
  @ApiOperation({ summary: 'Get Year-over-Year data for a zone' })
  @ApiQuery({ name: 'minYears', required: false, description: 'Minimum years required (default: 2)' })
  @ApiResponse({ status: 200, description: 'YoY data points' })
  async getZoneYoYData(
    @Param('zoneId') zoneId: string,
    @Query('minYears') minYears?: string,
  ) {
    return this.neccService.getZoneYoYData(
      zoneId,
      minYears ? parseInt(minYears, 10) : 2,
    );
  }

  @Get('yoy/zone/:zoneId/stats')
  @ApiOperation({ summary: 'Get Year-over-Year statistics for a zone' })
  @ApiResponse({ status: 200, description: 'YoY statistics' })
  async getZoneYoYStats(@Param('zoneId') zoneId: string) {
    return this.neccService.getZoneYoYStats(zoneId);
  }

  // =====================================================
  // ADMIN: PRICES (Create, Update, Delete)
  // =====================================================

  @Post('prices')
  @ApiOperation({ summary: 'Create a new price' })
  @ApiResponse({ status: 201, description: 'Price created' })
  @ApiBody({ description: 'Price data' })
  async createPrice(@Body() data: any) {
    return this.neccService.createPrice(data);
  }

  @Patch('prices/:id')
  @ApiOperation({ summary: 'Update a price' })
  @ApiResponse({ status: 200, description: 'Price updated' })
  @ApiBody({ description: 'Price data' })
  async updatePrice(@Param('id') id: string, @Body() data: any) {
    const price = await this.neccService.updatePrice(id, data);
    if (!price) {
      throw new NotFoundException('Price not found');
    }
    return price;
  }

  @Delete('prices/:id')
  @ApiOperation({ summary: 'Delete a price' })
  @ApiResponse({ status: 200, description: 'Price deleted' })
  async deletePrice(@Param('id') id: string) {
    const success = await this.neccService.deletePrice(id);
    if (!success) {
      throw new NotFoundException('Price not found');
    }
    return { success: true };
  }

  // =====================================================
  // ADMIN: SCRAPER
  // =====================================================

  @Post('scraper/run-month')
  @ApiOperation({ summary: 'Run scraper for a specific month/year' })
  @ApiResponse({ status: 200, description: 'Scraper result' })
  @ApiBody({ description: 'Scraper parameters' })
  async runScraper(@Body() body: { month: number; year: number }) {
    if (!body.month || !body.year) {
      throw new BadRequestException('Month and year are required');
    }
    if (body.month < 1 || body.month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }
    return this.neccService.runScraper(body.month, body.year);
  }
}
