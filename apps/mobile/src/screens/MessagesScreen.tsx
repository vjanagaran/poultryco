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

const AddIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: size - 8, height: 2, backgroundColor: color }} />
    <View style={{ width: 2, height: size - 8, backgroundColor: color, position: 'absolute' }} />
  </View>
);

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Chats');
  const insets = useSafeAreaInsets();

  const tabs = ['Chats', 'Groups', 'Broadcast'];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerLeft}>
          <BackIcon color={colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.headerRight}>
          <AddIcon color={colors.white} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIconText}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
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

        {/* Chat List */}
        <View style={styles.chatList}>
          <TouchableOpacity style={styles.chatItem}>
            <View style={styles.chatAvatar}>
              <Text style={styles.avatarText}>Dr.P</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>Dr. Priya (Vet)</Text>
              <Text style={styles.chatMessage}>
                Thanks for the vaccination schedule 👍
              </Text>
            </View>
            <Text style={styles.chatTime}>10:30 AM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chatItem}>
            <View style={[styles.chatAvatar, styles.avatarGroup]}>
              <Text style={styles.avatarText}>G</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>Namakkal Farmers Group</Text>
              <Text style={styles.chatMessage}>Kumar: New feed prices updated</Text>
            </View>
            <Text style={styles.chatTime}>9:45 AM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chatItem}>
            <View style={styles.chatAvatar}>
              <Text style={styles.avatarText}>SF</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>Supreme Feeds</Text>
              <Text style={styles.chatMessage}>Your order #1234 is ready</Text>
            </View>
            <Text style={styles.chatTime}>Yesterday</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chatItem}>
            <View style={styles.chatAvatar}>
              <Text style={styles.avatarText}>MK</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>Muthu Kumar</Text>
              <Text style={styles.chatMessage}>Can you share FCR calculation?</Text>
            </View>
            <Text style={styles.chatTime}>Yesterday</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chatItem}>
            <View style={[styles.chatAvatar, styles.avatarGroup]}>
              <Text style={styles.avatarText}>G</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>Broiler Management Tips</Text>
              <Text style={styles.chatMessage}>
                Admin: Week 3 feeding guide posted
              </Text>
            </View>
            <Text style={styles.chatTime}>2 days ago</Text>
          </TouchableOpacity>
        </View>

        {/* Message Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message Requests (3)</Text>
          <View style={styles.requestCard}>
            <Text style={styles.requestText}>
              New connection requests from verified members
            </Text>
          </View>
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
  chatList: {
    paddingHorizontal: spacing.md,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarGroup: {
    backgroundColor: colors.accent,
  },
  avatarText: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  chatMessage: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  chatTime: {
    fontSize: typography.fontSize.small,
    color: colors.textTertiary,
  },
  section: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  requestCard: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
  },
  requestText: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
});

