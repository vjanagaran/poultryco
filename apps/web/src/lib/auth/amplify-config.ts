/**
 * AWS Amplify Configuration
 * Used for token management (refresh, storage) and OAuth (Google Sign-In)
 * 
 * Hybrid Approach:
 * - API Backend: OTP request/verify, logout
 * - Amplify SDK: Token refresh (automatic), token storage, OAuth
 */

import { Amplify } from 'aws-amplify';

const userPoolId = process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID;
const clientId = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID;
const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1';

if (!userPoolId || !clientId) {
  console.warn('AWS Cognito credentials not configured for Amplify');
}

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: userPoolId || '',
      userPoolClientId: clientId || '',
      region: region,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [
            typeof window !== 'undefined' 
              ? `${window.location.origin}/auth/callback`
              : 'http://localhost:3000/auth/callback'
          ],
          redirectSignOut: [
            typeof window !== 'undefined'
              ? `${window.location.origin}/`
              : 'http://localhost:3000/'
          ],
          responseType: 'code',
          providers: ['Google'], // Add more providers as needed
        },
      },
    },
  },
};

// Configure Amplify
if (userPoolId && clientId) {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig;

