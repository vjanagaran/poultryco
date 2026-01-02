import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // CORS configuration (needed before WebSocket adapter)
  const corsOrigin = configService.get('CORS_ORIGIN')?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];

  // WebSocket adapter - CORS is configured in gateway decorators
  // The IoAdapter automatically attaches Socket.io to the HTTP server
  app.useWebSocketAdapter(new IoAdapter(app));

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS (HTTP)
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
  });

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'v1';
  app.setGlobalPrefix(apiPrefix);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('PoultryCo API')
    .setDescription(
      'REST API for PoultryCo - Professional networking platform for the global poultry industry',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token from AWS Cognito',
        in: 'header',
      },
      'JWT',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User profile management')
    .addTag('Businesses', 'Business profile management')
    .addTag('Organizations', 'Organization management')
    .addTag('Social', 'Social feed and connections')
    .addTag('Messages', 'Messaging system')
    .addTag('Events', 'Event management')
    .addTag('Jobs', 'Job postings and applications')
    .addTag('Resources', 'Tools and reference data')
    .addTag('NECC', 'Market data and analytics')
    .addTag('Notifications', 'Notification system')
    .addTag('Upload', 'File upload to S3')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'PoultryCo API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get('PORT') || 3002;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🐔 PoultryCo API Server                                ║
  ║                                                           ║
  ║   Environment: ${configService.get('NODE_ENV')?.toUpperCase().padEnd(10)}                              ║
  ║   Port:        ${port}                                        ║
  ║   API:         http://localhost:${port}/${apiPrefix}            ║
  ║   Docs:        http://localhost:${port}/api/docs               ║
  ║   Health:      http://localhost:${port}/${apiPrefix}/health    ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();

