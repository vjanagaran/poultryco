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
        // The # character in passwords causes issues, so we need to manually parse and encode
        // Format: postgresql://user:password@host:port/database?params
        const urlPattern = /^(postgresql:\/\/)([^:]+):([^@]+)@(.+)$/;
        const urlMatch = databaseUrl.match(urlPattern);
        
        if (urlMatch) {
          const [, protocol, username, password, rest] = urlMatch;
          // URL-encode the password (especially # which becomes %23)
          const encodedPassword = encodeURIComponent(password);
          // Reconstruct the URL with encoded password
          databaseUrl = `${protocol}${username}:${encodedPassword}@${rest}`;
          console.log(`[DatabaseModule] Password encoded: ${password.substring(0, 10)}... -> ${encodedPassword.substring(0, 15)}...`);
        } else {
          // Try alternative parsing if the above doesn't work
          // Sometimes the URL might already have encoding issues
          console.warn(`[DatabaseModule] Could not parse DATABASE_URL format, attempting manual encoding`);
          // Fallback: try to encode # characters manually
          if (databaseUrl.includes('#')) {
            const parts = databaseUrl.split('@');
            if (parts.length === 2) {
              const [authPart, hostPart] = parts;
              const [protocolUser, passwordPart] = authPart.split(':');
              if (passwordPart && passwordPart.includes('#')) {
                const encodedPassword = encodeURIComponent(passwordPart);
                databaseUrl = `${protocolUser}:${encodedPassword}@${hostPart}`;
                console.log(`[DatabaseModule] Manually encoded password containing #`);
              }
            }
          }
        }

        // Log the URL (masked) for debugging
        const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
        console.log(`[DatabaseModule] Connecting to database: ${maskedUrl.substring(0, 80)}...`);

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

