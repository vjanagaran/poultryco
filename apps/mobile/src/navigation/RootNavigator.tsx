import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@poultryco/design-system';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ProfileCreationWizard from '../screens/profile/ProfileCreationWizard';

export default function RootNavigator() {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Show wizard if user is logged in but profile is null or has no full_name
    if (session && (!profile || !profile.full_name)) {
      setShowWizard(true);
    } else {
      setShowWizard(false);
    }
  }, [session, profile]);

  if (authLoading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not logged in -> show auth
  if (!session) {
    return <AuthNavigator />;
  }

  // Logged in but profile incomplete -> show wizard
  if (showWizard) {
    return <ProfileCreationWizard onComplete={() => setShowWizard(false)} />;
  }

  // Logged in with complete profile -> show main app
  return <MainNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

