import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        let databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not defined in environment variables');
        }

        // Remove any surrounding quotes that might have been included
        databaseUrl = databaseUrl.trim().replace(/^["']|["']$/g, '');

        // URL-encode special characters in the password part
        // Match: postgresql://user:password@host
        const urlMatch = databaseUrl.match(/^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/);
        if (urlMatch) {
          const [, prefix, password, suffix] = urlMatch;
          // URL-encode special characters in password
          const encodedPassword = encodeURIComponent(password);
          databaseUrl = `${prefix}${encodedPassword}${suffix}`;
        }

        // Log the URL (masked) for debugging
        const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
        console.log(`[DatabaseModule] Connecting to database: ${maskedUrl.substring(0, 50)}...`);

        const client = postgres(databaseUrl, {
          max: 10,
          idle_timeout: 20,
          connect_timeout: 10,
          // Use 'prefer' for local development, 'require' for production
          ssl: databaseUrl.includes('localhost') ? 'prefer' : 'require',
        });

        return drizzle(client, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}

