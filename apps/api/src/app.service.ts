import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getInfo() {
    return {
      name: 'PoultryCo API',
      version: '1.0.0',
      description: 'Professional networking platform for the global poultry industry',
      documentation: '/api/docs',
      endpoints: {
        health: '/v1/health',
        auth: '/v1/auth',
        users: '/v1/users',
        businesses: '/v1/businesses',
        organizations: '/v1/organizations',
        social: '/v1/social',
        messages: '/v1/messages',
        events: '/v1/events',
        jobs: '/v1/jobs',
        resources: '/v1/resources',
        necc: '/v1/necc',
        notifications: '/v1/notifications',
        upload: '/v1/upload',
      },
    };
  }
}

