'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { getEmailTemplates, type EmailTemplate } from '@/lib/api/email-campaigns';

interface CampaignStep {
  step_number: number;
  template_id: string;
  delay_days: number;
  delay_hours: number;
  send_time?: string;
  conditions: {
    profile_completed?: boolean;
    has_logged_in?: boolean;
    min_connections?: number;
    [key: string]: boolean | number | string | undefined;
  };
  is_active: boolean;
  template?: EmailTemplate;
}

const CAMPAIGN_TYPES = [
  {
    value: 'drip',
    label: 'Drip Campaign',
    icon: '💧',
    description: 'Time-based sequence of emails',
  },
  {
    value: 'behavioral',
    label: 'Behavioral',
    icon: '🎯',
    description: 'Triggered by user actions',
  },
  {
    value: 'milestone',
    label: 'Milestone',
    icon: '🏆',
    description: 'Based on achievements',
  },
  {
    value: 're-engagement',
    label: 'Re-engagement',
    icon: '🔄',
    description: 'Win back inactive users',
  },
  {
    value: 'educational',
    label: 'Educational',
    icon: '📚',
    description: 'Learning series',
  },
  {
    value: 'promotional',
    label: 'Promotional',
    icon: '📢',
    description: 'Feature announcements',
  },
];

const PRESET_CAMPAIGNS = {
  welcome: {
    name: 'Welcome Series',
    type: 'drip',
    description: 'Onboard new users with a 5-email welcome sequence',
    steps: [
      {
        name: 'Welcome Email',
        delay_days: 0,
        delay_hours: 0,
        category: 'welcome',
      },
      {
        name: 'Complete Your Profile',
        delay_days: 1,
        delay_hours: 0,
        category: 'onboarding',
        conditions: { profile_completed: false },
      },
      {
        name: 'Discover Features',
        delay_days: 3,
        delay_hours: 0,
        category: 'educational',
      },
      {
        name: 'Connect with Others',
        delay_days: 7,
        delay_hours: 0,
        category: 'network',
        conditions: { min_connections: 0 },
      },
      {
        name: 'First Week Summary',
        delay_days: 7,
        delay_hours: 12,
        category: 'digest',
      },
    ],
  },
  reengagement: {
    name: 'Win-Back Campaign',
    type: 're-engagement',
    description: 'Re-engage users who haven\'t been active in 30+ days',
    steps: [
      {
        name: 'We Miss You',
        delay_days: 0,
        delay_hours: 0,
        category: 'retention',
      },
      {
        name: 'What\'s New',
        delay_days: 3,
        delay_hours: 0,
        category: 'content',
      },
      {
        name: 'Special Offer',
        delay_days: 7,
        delay_hours: 0,
        category: 'promotional',
      },
    ],
  },
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    status: 'draft',
    targeting_rules: {
      user_segments: [] as string[],
      profile_strength: { min: 0, max: 100 },
      days_since_signup: { min: undefined, max: undefined },
      days_inactive: { min: undefined },
      has_connections: undefined,
      has_posts: undefined,
      location_states: [] as string[],
    },
    start_date: '',
    end_date: '',
  });
  const [steps, setSteps] = useState<CampaignStep[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTargetingChange = (field: string, value: string[] | { min?: number; max?: number } | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      targeting_rules: {
        ...prev.targeting_rules,
        [field]: value,
      }
    }));
  };

  const loadPresetCampaign = (presetKey: keyof typeof PRESET_CAMPAIGNS) => {
    const preset = PRESET_CAMPAIGNS[presetKey];
    setFormData(prev => ({
      ...prev,
      name: preset.name,
      type: preset.type,
      description: preset.description,
    }));

    // Create steps based on preset
    const newSteps = preset.steps.map((step, index) => {
      // Find template by category
      const template = templates.find(t => t.category === step.category);
      return {
        step_number: index + 1,
        template_id: template?.id || '',
        delay_days: step.delay_days,
        delay_hours: step.delay_hours,
        send_time: undefined,
        conditions: ('conditions' in step && step.conditions) ? step.conditions : {},
        is_active: true,
        template,
      };
    });
    
    setSteps(newSteps);
  };

  const addStep = () => {
    const newStep: CampaignStep = {
      step_number: steps.length + 1,
      template_id: '',
      delay_days: steps.length === 0 ? 0 : 1,
      delay_hours: 0,
      conditions: {},
      is_active: true,
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (index: number, updates: Partial<CampaignStep>) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], ...updates };
    
    // Update template object if template_id changed
    if (updates.template_id) {
      updatedSteps[index].template = templates.find(t => t.id === updates.template_id);
    }
    
    setSteps(updatedSteps);
  };

  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    updatedSteps.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setSteps(updatedSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || steps.length === 0) {
      alert('Please fill in all required fields and add at least one step');
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          status: formData.status,
          targeting_rules: formData.targeting_rules,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Create campaign steps
      const stepsData = steps.map(step => ({
        campaign_id: campaign.id,
        step_number: step.step_number,
        template_id: step.template_id,
        delay_days: step.delay_days,
        delay_hours: step.delay_hours,
        send_time: step.send_time || null,
        conditions: step.conditions,
        is_active: step.is_active,
      }));

      const { error: stepsError } = await supabase
        .from('campaign_steps')
        .insert(stepsData);

      if (stepsError) throw stepsError;

      router.push('/email-campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Email Campaign</h1>
        <p className="text-gray-600 mt-1">Build automated email sequences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Welcome Series"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Brief description of the campaign goals"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CAMPAIGN_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.type === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Email Sequence</h2>
            <div className="flex gap-2">
              {templates.length > 0 && (
                <div className="relative group">
                  <button
                    type="button"
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                  >
                    Load Preset
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                      type="button"
                      onClick={() => loadPresetCampaign('welcome')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Welcome Series (5 emails)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPresetCampaign('reengagement')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Win-Back Campaign (3 emails)
                    </button>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={addStep}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                + Add Step
              </button>
            </div>
          </div>

          {steps.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No emails in this campaign yet</p>
              <button
                type="button"
                onClick={addStep}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add First Email
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                      {step.step_number}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Template *
                          </label>
                          <select
                            value={step.template_id}
                            onChange={(e) => updateStep(index, { template_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          >
                            <option value="">Select a template</option>
                            {templates.map(template => (
                              <option key={template.id} value={template.id}>
                                {template.name} ({template.category})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Delay Days
                            </label>
                            <input
                              type="number"
                              value={step.delay_days}
                              onChange={(e) => updateStep(index, { delay_days: parseInt(e.target.value) || 0 })}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Delay Hours
                            </label>
                            <input
                              type="number"
                              value={step.delay_hours}
                              onChange={(e) => updateStep(index, { delay_hours: parseInt(e.target.value) || 0 })}
                              min="0"
                              max="23"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Conditions */}
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Send Conditions (Optional)</p>
                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={step.conditions.profile_completed === false}
                              onChange={(e) => updateStep(index, {
                                conditions: {
                                  ...step.conditions,
                                  profile_completed: e.target.checked ? false : undefined
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            Profile incomplete
                          </label>
                          
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={step.conditions.min_connections === 0}
                              onChange={(e) => updateStep(index, {
                                conditions: {
                                  ...step.conditions,
                                  min_connections: e.target.checked ? 0 : undefined
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            No connections
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {index === 0 && (
                    <p className="text-xs text-gray-500 mt-2 ml-16">
                      This email will be sent immediately when someone joins the campaign
                    </p>
                  )}
                  {index > 0 && (
                    <p className="text-xs text-gray-500 mt-2 ml-16">
                      This email will be sent {step.delay_days} days and {step.delay_hours} hours after step {index}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Targeting Rules */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Audience Targeting</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Segments
              </label>
              <div className="flex flex-wrap gap-2">
                {['new', 'inactive', 'active', 'power'].map(segment => (
                  <label key={segment} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.targeting_rules.user_segments.includes(segment)}
                      onChange={(e) => {
                        const segments = e.target.checked
                          ? [...formData.targeting_rules.user_segments, segment]
                          : formData.targeting_rules.user_segments.filter(s => s !== segment);
                        handleTargetingChange('user_segments', segments);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm capitalize">{segment} Users</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Since Signup
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={formData.targeting_rules.days_since_signup.min || ''}
                    onChange={(e) => handleTargetingChange('days_since_signup', {
                      ...formData.targeting_rules.days_since_signup,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={formData.targeting_rules.days_since_signup.max || ''}
                    onChange={(e) => handleTargetingChange('days_since_signup', {
                      ...formData.targeting_rules.days_since_signup,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Inactive (Min)
                </label>
                <input
                  type="number"
                  value={formData.targeting_rules.days_inactive.min || ''}
                  onChange={(e) => handleTargetingChange('days_inactive', {
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/email-campaigns"
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || steps.length === 0}
            className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
