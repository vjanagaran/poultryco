import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@poultryco/design-system';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import { BackIcon, EditIcon } from '../../components/icons/HeaderIcons';

// Import profile components
import ProfileHeader from './components/ProfileHeader';
import ProfileStrength from './components/ProfileStrength';
import RolesList from './components/RolesList';
import StatsBar from './components/StatsBar';
import AboutSection from './components/AboutSection';
import ExperienceList from './components/ExperienceList';
import EducationList from './components/EducationList';
import SkillsGrid from './components/SkillsGrid';

export default function EnhancedProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { profile, roles, stats, loading, fetchProfile, fetchRoles, fetchStats } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchRoles(), fetchStats()]);
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No profile found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <BackIcon size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setEditMode(!editMode)}
        >
          <EditIcon size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header with Photo, Name, Headline */}
        <ProfileHeader
          profile={profile}
          stats={stats}
          editMode={editMode}
        />

        {/* Profile Strength Indicator */}
        {profile.profile_strength < 100 && (
          <ProfileStrength strength={profile.profile_strength} />
        )}

        {/* Stats Bar */}
        <StatsBar stats={stats} />

        {/* Roles Section */}
        <RolesList roles={roles} editMode={editMode} />

        {/* About Section */}
        {profile.bio && <AboutSection bio={profile.bio} editMode={editMode} />}

        {/* Experience Section */}
        <ExperienceList profileId={profile.id} editMode={editMode} />

        {/* Education Section */}
        <EducationList profileId={profile.id} editMode={editMode} />

        {/* Skills Section */}
        <SkillsGrid profileId={profile.id} editMode={editMode} />

        {/* Settings & Sign Out */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔒</Text>
            <Text style={styles.settingText}>Privacy Settings</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>✓</Text>
            <Text style={styles.settingText}>Verification</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🏆</Text>
            <Text style={styles.settingText}>Badges & Achievements</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.settingIcon}>🚪</Text>
            <Text style={[styles.settingText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: insets.bottom + 20 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: '600',
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  settingText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  settingArrow: {
    ...typography.h3,
    color: colors.textTertiary,
  },
  signOutButton: {
    marginTop: spacing.md,
  },
  signOutText: {
    color: colors.error,
    fontWeight: '600',
  },
});

