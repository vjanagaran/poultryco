import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ToolsScreen from '../screens/ToolsScreen';
import ProfileScreen from '../screens/ProfileScreen';

type TabScreen = 'Home' | 'Search' | 'Messages' | 'Tools' | 'Profile';

export default function MainNavigator() {
  const [activeTab, setActiveTab] = useState<TabScreen>('Home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Search':
        return <SearchScreen />;
      case 'Messages':
        return <MessagesScreen />;
      case 'Tools':
        return <ToolsScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Content */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Tab Navigation */}
      <SafeAreaView style={styles.bottomNavSafeArea}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('Home')}
          >
            <Text style={[
              styles.navIcon,
              activeTab === 'Home' && styles.navIconActive,
            ]}>
              🏠
            </Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Home' && styles.navLabelActive,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('Search')}
          >
            <Text style={[
              styles.navIcon,
              activeTab === 'Search' && styles.navIconActive,
            ]}>
              🔍
            </Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Search' && styles.navLabelActive,
              ]}
            >
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('Messages')}
          >
            <Text style={[
              styles.navIcon,
              activeTab === 'Messages' && styles.navIconActive,
            ]}>
              💬
            </Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Messages' && styles.navLabelActive,
              ]}
            >
              Messages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('Tools')}
          >
            <Text style={[
              styles.navIcon,
              activeTab === 'Tools' && styles.navIconActive,
            ]}>
              🛠️
            </Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Tools' && styles.navLabelActive,
              ]}
            >
              Tools
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('Profile')}
          >
            <Text style={[
              styles.navIcon,
              activeTab === 'Profile' && styles.navIconActive,
            ]}>
              👤
            </Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Profile' && styles.navLabelActive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  bottomNavSafeArea: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingTop: spacing.xs,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 2,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: typography.fontSize.tiny,
    color: colors.textTertiary,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});

