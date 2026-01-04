/**
 * AWS Amplify Configuration
 * NOTE: Cognito/Amplify is NOT used - all authentication is handled via API backend
 * This file is kept for backward compatibility but Amplify is not configured
 */

// Amplify is disabled - all auth goes through API backend
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: '',
      userPoolClientId: '',
      region: 'ap-south-1',
    },
  },
};

// Do not configure Amplify - Cognito is not used
export default amplifyConfig;

