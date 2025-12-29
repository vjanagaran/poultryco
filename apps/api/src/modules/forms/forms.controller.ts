import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { AdminJwtGuard } from '../admin/guards/admin-jwt.guard';

@ApiTags('Forms')
@Controller('forms')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class FormsController {
  constructor(private formsService: FormsService) {}

  // Newsletter Subscribers
  @Get('newsletter/subscribers')
  @ApiOperation({ summary: 'Get newsletter subscribers' })
  async getNewsletterSubscribers(@Query('status') status?: string) {
    return this.formsService.getNewsletterSubscribers({ status });
  }

  @Patch('newsletter/subscribers/:id/status')
  @ApiOperation({ summary: 'Update newsletter subscriber status' })
  async updateNewsletterSubscriberStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.formsService.updateNewsletterSubscriberStatus(id, body.status);
  }

  // Contact Submissions
  @Get('contact/submissions')
  @ApiOperation({ summary: 'Get contact submissions' })
  async getContactSubmissions(@Query('status') status?: string) {
    return this.formsService.getContactSubmissions({ status });
  }

  @Patch('contact/submissions/:id/status')
  @ApiOperation({ summary: 'Update contact submission status' })
  async updateContactSubmissionStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.formsService.updateContactSubmissionStatus(id, body.status);
  }

  // Early Access Signups
  @Get('early-access/signups')
  @ApiOperation({ summary: 'Get early access signups' })
  async getEarlyAccessSignups(@Query('status') status?: string) {
    return this.formsService.getEarlyAccessSignups({ status });
  }

  @Patch('early-access/signups/:id/status')
  @ApiOperation({ summary: 'Update early access signup status' })
  async updateEarlyAccessSignupStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.formsService.updateEarlyAccessSignupStatus(id, body.status);
  }

  @Delete('early-access/signups/:id')
  @ApiOperation({ summary: 'Delete early access signup' })
  async deleteEarlyAccessSignup(@Param('id') id: string) {
    await this.formsService.deleteEarlyAccessSignup(id);
    return { success: true };
  }
}
