import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search events' })
  @ApiResponse({ status: 200, description: 'Events found' })
  async searchEvents(
    @Query('q') search?: string,
    @Query('eventType') eventType?: string,
    @Query('format') format?: string,
    @Query('isFree') isFree?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.eventsService.searchEvents({
      search,
      eventType,
      format,
      isFree,
      limit,
      offset,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get event by slug' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEvent(@Param('slug') slug: string) {
    return this.eventsService.getEventBySlug(slug);
  }
}
