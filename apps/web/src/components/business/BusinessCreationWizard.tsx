'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import BasicInfoStep from './steps/BasicInfoStep';
import ContactLocationStep from './steps/ContactLocationStep';
import PhotosStep from './steps/PhotosStep';
import TypeSpecificStep from './steps/TypeSpecificStep';

const STEPS = [
  { id: 1, title: 'Basic Information', component: BasicInfoStep },
  { id: 2, title: 'Contact & Location', component: ContactLocationStep },
  { id: 3, title: 'Photos', component: PhotosStep },
  { id: 4, title: 'Business Details', component: TypeSpecificStep },
];

export function BusinessCreationWizard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    // Basic Info
    business_name: '',
    business_slug: '',
    display_name: '',
    tagline: '',
    about: '',
    business_type: '' as string,
    company_size: '',
    founded_year: new Date().getFullYear(),
    website_url: '',
    
    // Contact & Location
    headquarters_address: '',
    headquarters_state: '',
    headquarters_city: '',
    phone: '',
    email: '',
    whatsapp_business: '',
    
    // Photos
    logo_url: null as string | null,
    cover_photo_url: null as string | null,
    
    // Type-Specific
    typeSpecificData: {} as Record<string, any>,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Auto-generate slug from business name
    if (businessData.business_name && !businessData.business_slug) {
      const slug = businessData.business_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setBusinessData(prev => ({ ...prev, business_slug: slug }));
    }
  }, [businessData.business_name, businessData.business_slug]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const supabase = createClient();

      // Check if slug is unique
      const { data: existingBusiness } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('business_slug', businessData.business_slug)
        .single();

      if (existingBusiness) {
        alert('Business slug already exists. Please choose a different name or slug.');
        setLoading(false);
        return;
      }

      // Create business profile
      const { data: business, error: businessError } = await supabase
        .from('business_profiles')
        .insert({
          business_name: businessData.business_name,
          business_slug: businessData.business_slug,
          display_name: businessData.display_name || null,
          tagline: businessData.tagline || null,
          about: businessData.about || null,
          business_type: businessData.business_type,
          company_size: businessData.company_size || null,
          founded_year: businessData.founded_year || null,
          website_url: businessData.website_url || null,
          logo_url: businessData.logo_url,
          cover_photo_url: businessData.cover_photo_url,
          owner_id: user.id,
          is_verified: true,  // Auto-verify business profiles
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Create business contact record
      const { error: contactError } = await supabase
        .from('business_profiles_contact')
        .insert({
          business_profile_id: business.id,
          headquarters_address: businessData.headquarters_address || null,
          headquarters_state: businessData.headquarters_state,
          headquarters_city: businessData.headquarters_city || null,
          phone: businessData.phone || null,
          email: businessData.email || null,
          whatsapp_business: businessData.whatsapp_business || null,
        });

      if (contactError) throw contactError;

      // Create type-specific details if applicable
      if (businessData.business_type === 'farm' && Object.keys(businessData.typeSpecificData).length > 0) {
        await supabase
          .from('business_farm_details')
          .insert({
            business_profile_id: business.id,
            ...businessData.typeSpecificData,
          });
      } else if (
        ['medicine_company', 'equipment_supplier', 'chick_supplier', 'distributor'].includes(businessData.business_type) &&
        Object.keys(businessData.typeSpecificData).length > 0
      ) {
        await supabase
          .from('business_supplier_details')
          .insert({
            business_profile_id: business.id,
            ...businessData.typeSpecificData,
          });
      }

      // Auto-add owner as team member with admin rights
      await supabase
        .from('business_team_members')
        .insert({
          business_profile_id: business.id,
          profile_id: user.id,
          role_title: 'Owner',
          is_admin: true,
          can_post_updates: true,
          can_manage_products: true,
          can_manage_jobs: true,
          can_view_analytics: true,
          show_on_page: true,
        });

      // Show success message and redirect to edit page
      alert('Business profile created successfully! You can now edit and manage your profile.');
      router.push(`/com/${business.business_slug}/edit`);
    } catch (error: any) {
      console.error('Error creating business:', error);
      alert(error.message || 'Failed to create business profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Business Profile</h1>
          <p className="text-gray-600">
            Showcase your poultry business on PoultryCo
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.id
                        ? 'bg-green-600 text-white'
                        : currentStep === step.id
                        ? 'bg-green-600 text-white ring-4 ring-green-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span
                    className={`text-xs mt-2 hidden sm:block ${
                      currentStep >= step.id ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6">
          <CurrentStepComponent
            data={businessData}
            onChange={setBusinessData}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                Creating...
              </span>
            ) : currentStep === STEPS.length ? (
              'Create Business Profile'
            ) : (
              'Next →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

