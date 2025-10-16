import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@poultryco/design-system';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return session ? <MainNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

