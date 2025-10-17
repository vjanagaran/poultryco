import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';

interface Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  loading: boolean;
}

export default function PhotoHeadlineStep({ data, onNext, onBack }: Props) {
  const [formData, setFormData] = useState({
    headline: data.headline || '',
    bio: data.bio || '',
    profile_photo_url: data.profile_photo_url || null,
  });

  const handlePickPhoto = () => {
    // TODO: Implement image picker
    Alert.alert(
      'Photo Upload',
      'Photo upload will be implemented with Expo Image Picker',
      [{ text: 'OK' }]
    );
  };

  const handleNext = () => {
    // All fields are optional in this step
    onNext(formData);
  };

  const handleSkip = () => {
    onNext({
      headline: '',
      bio: '',
      profile_photo_url: null,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Make your profile stand out</Text>
          <Text style={styles.subtitle}>
            Add a photo and headline to help others recognize you
          </Text>
        </View>

        <View style={styles.form}>
          {/* Profile Photo */}
          <View style={styles.field}>
            <Text style={styles.label}>Profile Photo (Optional)</Text>
            <View style={styles.photoSection}>
              <TouchableOpacity style={styles.photoCircle} onPress={handlePickPhoto}>
                {formData.profile_photo_url ? (
                  <Image
                    source={{ uri: formData.profile_photo_url }}
                    style={styles.photoImage}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>📷</Text>
                    <Text style={styles.photoPlaceholderLabel}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.photoInfo}>
                <Text style={styles.photoTitle}>Upload a profile picture</Text>
                <Text style={styles.photoHint}>
                  A clear, professional photo helps others recognize you
                </Text>
                <TouchableOpacity onPress={handlePickPhoto}>
                  <Text style={styles.photoLink}>Choose from gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Headline */}
          <View style={styles.field}>
            <Text style={styles.label}>Headline (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.headline}
              onChangeText={(text) => setFormData({ ...formData, headline: text })}
              placeholder="e.g., Poultry Farmer & Consultant"
              placeholderTextColor={colors.textTertiary}
              maxLength={150}
            />
            <Text style={styles.hint}>
              {formData.headline.length}/150 characters
            </Text>
            <Text style={styles.hint}>
              A professional title that describes what you do
            </Text>
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.label}>About (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Tell others about yourself, your experience, and what you're looking for on PoultryCo..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.hint}>
              {formData.bio.length}/500 characters
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Why add these?</Text>
              <Text style={styles.infoText}>
                • A photo makes your profile 10x more recognizable{'\n'}
                • A good headline helps people understand your expertise{'\n'}
                • Your bio is your chance to make a great first impression
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={onBack}>
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={handleSkip}>
          <Text style={styles.buttonSecondaryText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleNext}>
          <Text style={styles.buttonPrimaryText}>Continue</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGray,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 32,
  },
  photoPlaceholderLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  photoInfo: {
    flex: 1,
  },
  photoTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  photoHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  photoLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9', // Light green background for better readability
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.md,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: '#1B5E20', // Darker green for better contrast
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  buttonPrimary: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});

