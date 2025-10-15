import React, { useState } from 'react';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

type AuthScreen = 'login' | 'signup' | 'forgotPassword';

export default function AuthNavigator() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onNavigateToSignup={() => setCurrentScreen('signup')}
            onNavigateToForgotPassword={() => setCurrentScreen('forgotPassword')}
          />
        );
      case 'signup':
        return (
          <SignupScreen
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'forgotPassword':
        return (
          <ForgotPasswordScreen
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      default:
        return (
          <LoginScreen
            onNavigateToSignup={() => setCurrentScreen('signup')}
            onNavigateToForgotPassword={() => setCurrentScreen('forgotPassword')}
          />
        );
    }
  };

  return renderScreen();
}

