import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@poultryco/design-system';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';

// Import step components (we'll create these next)
import BasicInfoStep from './wizard/BasicInfoStep';
import RoleSelectionStep from './wizard/RoleSelectionStep';
import PhotoHeadlineStep from './wizard/PhotoHeadlineStep';
import PrivacyStep from './wizard/PrivacyStep';

const STEPS = [
  { id: 1, title: 'Basic Info', component: BasicInfoStep },
  { id: 2, title: 'Your Roles', component: RoleSelectionStep },
  { id: 3, title: 'Profile Photo', component: PhotoHeadlineStep },
  { id: 4, title: 'Privacy', component: PrivacyStep },
];

export default function ProfileCreationWizard({ onComplete }: { onComplete: () => void }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { updateProfile, addRole } = useProfile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    full_name: '',
    location_state: '',
    location_district: '',
    location_city: '',
    phone: user?.phone || '',
    email: user?.email || '',
    whatsapp_number: '',
    headline: '',
    bio: '',
    profile_photo_url: null,
    is_public: true,
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const currentStepData = STEPS.find(s => s.id === currentStep);
  const StepComponent = currentStepData?.component;

  const handleNext = async (stepData: any) => {
    if (currentStep < STEPS.length) {
      // Update profile data
      setProfileData({ ...profileData, ...stepData });
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save everything
      await handleComplete(stepData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async (finalStepData: any) => {
    setLoading(true);
    try {
      // Merge all data
      const completeData = { ...profileData, ...finalStepData };

      // Generate profile slug from name and location
      const slug = completeData.full_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + (completeData.location_city || completeData.location_district || completeData.location_state)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');

      // Update profile
      await updateProfile({
        full_name: completeData.full_name,
        profile_slug: slug,
        location_state: completeData.location_state,
        location_district: completeData.location_district,
        location_city: completeData.location_city,
        phone: completeData.phone,
        whatsapp_number: completeData.whatsapp_number || null,
        headline: completeData.headline || null,
        bio: completeData.bio || null,
        profile_photo_url: completeData.profile_photo_url || null,
        is_public: completeData.is_public,
      });

      // Add selected roles
      for (const role of selectedRoles) {
        await addRole(role);
      }

      // Complete!
      onComplete();
    } catch (error: any) {
      console.error('Error completing profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {STEPS.map((step, index) => (
            <View key={step.id} style={styles.progressStepContainer}>
              <View
                style={[
                  styles.progressStep,
                  currentStep >= step.id && styles.progressStepActive,
                  currentStep > step.id && styles.progressStepComplete,
                ]}
              >
                {currentStep > step.id ? (
                  <Text style={styles.progressStepTextComplete}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.progressStepText,
                      currentStep >= step.id && styles.progressStepTextActive,
                    ]}
                  >
                    {step.id}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.progressLabel,
                  currentStep >= step.id && styles.progressLabelActive,
                ]}
              >
                {step.title}
              </Text>
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    currentStep > step.id && styles.progressLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Step Content */}
      <View style={styles.content}>
        {StepComponent && (
          <StepComponent
            data={profileData}
            selectedRoles={selectedRoles}
            onRolesChange={setSelectedRoles}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={currentStep === 1}
            isLast={currentStep === STEPS.length}
            loading={loading}
          />
        )}
      </View>

      {/* Step Indicator Text */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Step {currentStep} of {STEPS.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  progressStepActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressStepComplete: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  progressStepText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray,
  },
  progressStepTextActive: {
    color: colors.white,
  },
  progressStepTextComplete: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  progressLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  progressLine: {
    position: 'absolute',
    top: 18,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  progressLineActive: {
    backgroundColor: colors.success,
  },
  content: {
    flex: 1,
  },
  footer: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

