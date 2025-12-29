'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import BasicInfoStep from './steps/BasicInfoStep';
import RoleSelectionStep from './steps/RoleSelectionStep';
import RoleDetailsStep from './steps/RoleDetailsStep';
import PhotoHeadlineStep from './steps/PhotoHeadlineStep';
import PrivacyStep from './steps/PrivacyStep';

const STEPS = [
  { id: 1, title: 'Basic Info', component: BasicInfoStep },
  { id: 2, title: 'Your Roles', component: RoleSelectionStep },
  { id: 3, title: 'Role Details', component: RoleDetailsStep },
  { id: 4, title: 'Photo & Headline', component: PhotoHeadlineStep },
  { id: 5, title: 'Privacy', component: PrivacyStep },
];

export default function ProfileWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    location_state: '',
    location_district: '',
    location_city: '',
    phone: '',
    email: '',
    whatsapp_number: '',
    headline: '',
    bio: '',
    profile_photo_url: null as string | null,
    is_public: true,
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleDetails, setRoleDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Fetch existing profile via API
        const profile = await apiClient.get(`/users/me`);
        
        if (profile) {
          setProfileData({
            full_name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || '',
            location_state: profile.state || '',
            location_district: profile.district || '',
            location_city: profile.city || '',
            phone: profile.phone || '',
            email: profile.email || '',
            whatsapp_number: profile.whatsappNumber || '',
            headline: profile.headline || '',
            bio: profile.bio || '',
            profile_photo_url: profile.profilePhoto || null,
            is_public: profile.isPublic ?? true,
          });
        } else {
          // Pre-fill with user data
          setProfileData(prev => ({
            ...prev,
            email: user.email || '',
            phone: user.phone || '',
          }));
        }

        // TODO: Fetch existing roles from API
        // const roles = await apiClient.get(`/users/me/roles`);
        // if (roles) {
        //   setSelectedRoles(roles.map((r: any) => r.roleType));
        // }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [router, user]);

  const handleNext = (stepData: any) => {
    if (currentStep < STEPS.length) {
      setProfileData({ ...profileData, ...stepData });
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete(stepData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async (finalStepData: any) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    
    try {
      const completeData = { ...profileData, ...finalStepData };

      // Parse full name into first and last
      const nameParts = completeData.full_name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Update profile via API
      await apiClient.put('/users/me', {
        firstName,
        lastName,
        headline: completeData.headline || null,
        bio: completeData.bio || null,
        profilePhoto: completeData.profile_photo_url || null,
        city: completeData.location_city || null,
        district: completeData.location_district || null,
        state: completeData.location_state || null,
        phone: completeData.phone || null,
        email: completeData.email || null,
        whatsappNumber: completeData.whatsapp_number || null,
        isPublic: completeData.is_public,
      });

      // TODO: Update roles via API when endpoint is available
      // if (selectedRoles.length > 0) {
      //   await apiClient.put('/users/me/roles', { roles: selectedRoles });
      // }

      // Redirect to profile
      router.push('/me');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = STEPS.find(s => s.id === currentStep);
  const StepComponent = currentStepData?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help the community get to know you better</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-colors ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {StepComponent && (
            <StepComponent
              data={profileData}
              selectedRoles={selectedRoles}
              roleDetails={roleDetails}
              onRolesChange={setSelectedRoles}
              onRoleDetailsChange={setRoleDetails}
              onNext={handleNext}
              onBack={handleBack}
              isFirst={currentStep === 1}
              isLast={currentStep === STEPS.length}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

