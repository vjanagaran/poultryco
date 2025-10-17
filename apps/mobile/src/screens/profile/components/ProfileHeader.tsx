import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';
import type { Profile, ProfileStats } from '../../../contexts/ProfileContext';

interface Props {
  profile: Profile;
  stats: ProfileStats | null;
  editMode?: boolean;
}

export default function ProfileHeader({ profile, stats, editMode }: Props) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case 'trusted':
        return '🌟';
      case 'verified':
        return '✓';
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Cover/Background */}
      <View style={styles.coverBackground} />

      {/* Profile Photo */}
      <View style={styles.photoContainer}>
        {profile.profile_photo_url ? (
          <Image source={{ uri: profile.profile_photo_url }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoInitials}>{getInitials(profile.full_name)}</Text>
          </View>
        )}
        {getVerificationIcon(profile.verification_level) && (
          <View style={styles.verificationBadge}>
            <Text style={styles.verificationIcon}>
              {getVerificationIcon(profile.verification_level)}
            </Text>
          </View>
        )}
        {editMode && (
          <TouchableOpacity style={styles.editPhotoButton}>
            <Text style={styles.editPhotoIcon}>📷</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.full_name}</Text>
          {profile.verification_level !== 'basic' && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {profile.verification_level === 'trusted' ? 'Trusted' : 'Verified'}
              </Text>
            </View>
          )}
        </View>

        {profile.headline && (
          <Text style={styles.headline}>{profile.headline}</Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            📍 {profile.location_city || profile.location_district || profile.location_state}
            {profile.location_state && `, ${profile.location_state}`}
          </Text>
        </View>

        {profile.phone_verified && (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              ✓ Phone Verified
            </Text>
          </View>
        )}

        {!profile.is_public && (
          <View style={styles.privateNotice}>
            <Text style={styles.privateIcon}>🔒</Text>
            <Text style={styles.privateText}>Private Profile</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingBottom: spacing.lg,
  },
  coverBackground: {
    height: 120,
    backgroundColor: colors.primary,
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: -60,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitials: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '700',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  verificationIcon: {
    fontSize: 16,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  editPhotoIcon: {
    fontSize: 16,
  },
  infoContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  headline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  privateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  privateIcon: {
    fontSize: 14,
  },
  privateText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

