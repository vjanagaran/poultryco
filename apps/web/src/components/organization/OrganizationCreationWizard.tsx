'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ContactStep } from './steps/ContactStep';
import { PhotosStep } from './steps/PhotosStep';
import { ReviewStep } from './steps/ReviewStep';

export function OrganizationCreationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    organization_name: '',
    organization_type: '',
    about: '',
    mission: '',
    vision: '',
    founded_year: '',
    website_url: '',
    
    // Contact
    headquarters_address: '',
    headquarters_city: '',
    headquarters_state: '',
    country: 'India',
    phone: '',
    email: '',
    
    // Photos
    logo_file: null as File | null,
    cover_file: null as File | null,
    logo_preview: null as string | null,
    cover_preview: null as string | null,
  });

  const steps = [
    { number: 1, title: 'Basic Information', component: BasicInfoStep },
    { number: 2, title: 'Contact & Location', component: ContactStep },
    { number: 3, title: 'Photos', component: PhotosStep },
    { number: 4, title: 'Review & Submit', component: ReviewStep },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload photos if provided
      let logoUrl = null;
      let coverUrl = null;

      if (formData.logo_file) {
        const { uploadToStorage } = await import('@/lib/storageUtils');
        const result = await uploadToStorage(formData.logo_file, 'organizations', user.id);
        if (result.success) logoUrl = result.url;
      }

      if (formData.cover_file) {
        const { uploadToStorage } = await import('@/lib/storageUtils');
        const result = await uploadToStorage(formData.cover_file, 'organizations/covers', user.id);
        if (result.success) coverUrl = result.url;
      }

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          organization_name: formData.organization_name,
          organization_type: formData.organization_type,
          about: formData.about || null,
          mission: formData.mission || null,
          vision: formData.vision || null,
          founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
          website_url: formData.website_url || null,
          logo_url: logoUrl,
          cover_photo_url: coverUrl,
          owner_id: user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create contact info
      if (formData.headquarters_address || formData.phone || formData.email) {
        await supabase.from('organizations_contact').insert({
          organization_id: orgData.id,
          headquarters_address: formData.headquarters_address || null,
          headquarters_city: formData.headquarters_city || null,
          headquarters_state: formData.headquarters_state || null,
          country: formData.country,
          phone: formData.phone || null,
          email: formData.email || null,
        });
      }

      // Redirect to organization profile
      router.push(`/org/${orgData.organization_slug}`);
    } catch (error: any) {
      console.error('Error creating organization:', error);
      alert(error.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 text-center hidden md:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <CurrentStepComponent
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            loading={loading}
            isFirstStep={currentStep === 1}
            isLastStep={currentStep === steps.length}
          />
        </div>
      </div>
    </div>
  );
}

