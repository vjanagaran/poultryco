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
        
        console.log(`[DatabaseModule] Original DATABASE_URL length: ${databaseUrl.length}, contains #: ${databaseUrl.includes('#')}`);

        // URL-encode special characters in the password part
        // The # character in passwords causes issues, so we need to manually parse and encode
        // Format: postgresql://user:password@host:port/database?params
        const urlPattern = /^(postgresql:\/\/)([^:]+):([^@]+)@(.+)$/;
        const urlMatch = databaseUrl.match(urlPattern);
        
        if (urlMatch && urlMatch.length >= 5) {
          const [, protocol, username, password, rest] = urlMatch;
          console.log(`[DatabaseModule] Regex matched - Username: ${username}, Password length: ${password.length}, Has #: ${password.includes('#')}`);
          
          // Check if password is already URL-encoded (contains % followed by hex digits)
          const isAlreadyEncoded = /%[0-9A-Fa-f]{2}/.test(password);
          
          let encodedPassword: string;
          if (isAlreadyEncoded) {
            // Password is already URL-encoded, use it as-is
            console.log(`[DatabaseModule] Password is already URL-encoded, using as-is`);
            encodedPassword = password;
          } else if (password.includes('#')) {
            // Password contains # but is not encoded, encode it
            encodedPassword = encodeURIComponent(password);
            console.log(`[DatabaseModule] Password encoded: ${password.substring(0, 15)}... -> ${encodedPassword.substring(0, 20)}...`);
          } else {
            // Password doesn't need encoding
            encodedPassword = password;
          }
          
          // Reconstruct the URL with encoded password
          databaseUrl = `${protocol}${username}:${encodedPassword}@${rest}`;
        } else {
          // Try alternative parsing if the above doesn't work
          console.warn(`[DatabaseModule] Regex did not match. URL pattern: ${databaseUrl.substring(0, 60)}...`);
          // Fallback: try to encode # characters manually by splitting on @
          if (databaseUrl.includes('#')) {
            const atIndex = databaseUrl.indexOf('@');
            if (atIndex > 0) {
              const authPart = databaseUrl.substring(0, atIndex);
              const hostPart = databaseUrl.substring(atIndex + 1);
              const colonIndex = authPart.lastIndexOf(':');
              if (colonIndex > 0) {
                const protocolUser = authPart.substring(0, colonIndex);
                const passwordPart = authPart.substring(colonIndex + 1);
                if (passwordPart && passwordPart.includes('#')) {
                  const encodedPassword = encodeURIComponent(passwordPart);
                  databaseUrl = `${protocolUser}:${encodedPassword}@${hostPart}`;
                  console.log(`[DatabaseModule] Manually encoded password containing #`);
                }
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

