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
        health: '/api/v1/health',
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        businesses: '/api/v1/businesses',
        organizations: '/api/v1/organizations',
        social: '/api/v1/social',
        messages: '/api/v1/messages',
        events: '/api/v1/events',
        jobs: '/api/v1/jobs',
        resources: '/api/v1/resources',
        necc: '/api/v1/necc',
        notifications: '/api/v1/notifications',
        upload: '/api/v1/upload',
      },
    };
  }
}

