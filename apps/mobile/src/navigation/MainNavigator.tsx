import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@poultryco/design-system';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ToolsScreen from '../screens/ToolsScreen';
import EnhancedProfileScreen from '../screens/profile/EnhancedProfileScreen';
import { HomeIcon, SearchIcon, MessagesIcon, ToolsIcon, ProfileIcon } from '../components/icons/TabIcons';

type TabScreen = 'Home' | 'Search' | 'Messages' | 'Tools' | 'Profile';

export default function MainNavigator() {
  const [activeTab, setActiveTab] = useState<TabScreen>('Home');
  const insets = useSafeAreaInsets();

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
        return <EnhancedProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Content */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Tab Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('Home')}
          >
            <HomeIcon active={activeTab === 'Home'} size={24} />
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
            <SearchIcon active={activeTab === 'Search'} size={24} />
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
            <MessagesIcon active={activeTab === 'Messages'} size={24} />
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
            <ToolsIcon active={activeTab === 'Tools'} size={24} />
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
            <ProfileIcon active={activeTab === 'Profile'} size={24} />
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    gap: 4,
  },
  navLabel: {
    fontSize: typography.fontSize.tiny,
    color: colors.textTertiary,
    marginTop: 2,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});

