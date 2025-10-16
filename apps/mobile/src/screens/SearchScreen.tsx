import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@poultryco/design-system';
import { BackIcon } from '../components/icons/HeaderIcons';
import { SearchIcon } from '../components/icons/TabIcons';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const insets = useSafeAreaInsets();

  const tabs = ['All', 'People', 'Business', 'Products'];
  const categories = ['Farmers', 'Veterinarians', 'Feed Mills', 'Hatcheries', 'Equipment'];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerLeft}>
          <BackIcon color={colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Directory</Text>
        <TouchableOpacity style={styles.headerRight}>
          <SearchIcon active={true} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIconText}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search professionals, businesses, products..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity key={category} style={styles.categoryChip}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>

          {/* Person Result */}
          <TouchableOpacity style={styles.resultCard}>
            <View style={styles.resultAvatar}>
              <Text style={styles.avatarText}>Dr.S</Text>
            </View>
            <View style={styles.resultInfo}>
              <View style={styles.resultNameRow}>
                <Text style={styles.resultName}>Dr. Suresh</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Vet</Text>
                </View>
              </View>
              <Text style={styles.resultDescription}>
                Poultry Disease Specialist • Namakkal
              </Text>
              <Text style={styles.resultMeta}>⭐ 4.9 rating • 500+ consultations</Text>
            </View>
          </TouchableOpacity>

          {/* Business Result */}
          <TouchableOpacity style={styles.resultCard}>
            <View style={[styles.resultAvatar, styles.avatarBusiness]}>
              <Text style={styles.avatarText}>SF</Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>Sakthi Feeds</Text>
              <Text style={styles.resultDescription}>
                Feed Manufacturer • All poultry feeds
              </Text>
              <Text style={styles.resultMeta}>📍 Erode • 2K followers</Text>
            </View>
          </TouchableOpacity>

          {/* Product Result */}
          <TouchableOpacity style={styles.resultCard}>
            <View style={[styles.resultAvatar, styles.avatarProduct]}>
              <Text style={styles.avatarText}>P</Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>Broiler Finisher Feed</Text>
              <Text style={styles.resultDescription}>
                By Supreme Feeds • ₹1,900/bag
              </Text>
              <Text style={styles.resultMeta}>18% Protein • Available in 50kg</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Near You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Near You</Text>
          <TouchableOpacity style={styles.resultCard}>
            <View style={styles.resultAvatar}>
              <Text style={styles.avatarText}>VH</Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>Venkat Hatcheries</Text>
              <Text style={styles.resultDescription}>Day-old chicks supplier</Text>
              <Text style={styles.resultMeta}>📍 5 km away • Open now</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.xxl,
  },
  searchIconText: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.xs,
    borderRadius: spacing.borderRadius.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: spacing.borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryChip: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
  },
  categoryText: {
    fontSize: typography.fontSize.caption,
    color: colors.primary,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.sm,
  },
  resultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarBusiness: {
    backgroundColor: colors.secondary,
  },
  avatarProduct: {
    backgroundColor: colors.accent,
  },
  avatarText: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  resultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  resultName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginRight: spacing.xs,
  },
  badge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.tiny,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  resultDescription: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultMeta: {
    fontSize: typography.fontSize.small,
    color: colors.textTertiary,
  },
});

