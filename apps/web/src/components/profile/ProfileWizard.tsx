'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
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
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Fetch existing profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          location_state: profile.location_state || '',
          location_district: profile.location_district || '',
          location_city: profile.location_city || '',
          phone: profile.phone || user.phone || '',
          email: profile.email || user.email || '',
          whatsapp_number: profile.whatsapp_number || '',
          headline: profile.headline || '',
          bio: profile.bio || '',
          profile_photo_url: profile.profile_photo_url || null,
          is_public: profile.is_public ?? true,
        });
      } else {
        // Pre-fill with user metadata
        setProfileData(prev => ({
          ...prev,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
        }));
      }

      // Fetch existing roles
      const { data: roles } = await supabase
        .from('profile_roles')
        .select('role_type')
        .eq('profile_id', user.id)
        .eq('is_active', true);

      if (roles) {
        setSelectedRoles(roles.map(r => r.role_type));
      }
    };

    fetchUser();
  }, [router]);

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
    setLoading(true);
    
    try {
      const supabase = createClient();
      const completeData = { ...profileData, ...finalStepData };

      // Generate profile slug
      const slug = completeData.full_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + (completeData.location_city || completeData.location_district || completeData.location_state)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      // Calculate profile strength
      let strength = 25; // Base
      if (completeData.full_name) strength += 15;
      if (completeData.location_state) strength += 10;
      if (completeData.headline) strength += 15;
      if (completeData.bio) strength += 15;
      if (completeData.profile_photo_url) strength += 20;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: completeData.full_name,
          profile_slug: slug,
          location_state: completeData.location_state,
          location_district: completeData.location_district,
          location_city: completeData.location_city,
          phone: completeData.phone,
          email: completeData.email,
          whatsapp_number: completeData.whatsapp_number || null,
          headline: completeData.headline || null,
          bio: completeData.bio || null,
          profile_photo_url: completeData.profile_photo_url || null,
          is_public: completeData.is_public,
          profile_strength: strength,
          last_profile_update_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Delete existing roles and re-add
      await supabase
        .from('profile_roles')
        .delete()
        .eq('profile_id', user.id);

      // Add selected roles
      if (selectedRoles.length > 0) {
        const rolesToInsert = selectedRoles.map((role, index) => ({
          profile_id: user.id,
          role_type: role,
          is_active: true,
          is_primary: index === 0,
          sort_order: index,
        }));

        const { error: rolesError } = await supabase
          .from('profile_roles')
          .insert(rolesToInsert);

        if (rolesError) throw rolesError;
      }

      // Save role-specific details
      for (const [roleType, details] of Object.entries(roleDetails)) {
        if (Object.keys(details).length > 0) {
          const tableName = `profile_${roleType}_details`;
          await supabase
            .from(tableName)
            .upsert({
              profile_id: user.id,
              ...details,
            });
        }
      }

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

