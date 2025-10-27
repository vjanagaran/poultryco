'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Confetti from 'react-confetti';

export function WelcomeFlow() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [memberCount, setMemberCount] = useState(5247);
  const [loading, setLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState({
    biggest_challenge: '',
    current_solutions: [] as string[],
    feature_priorities: [] as string[],
    beta_interest: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const interval = setInterval(() => {
      setMemberCount(prev => prev + Math.floor(Math.random() * 3));
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  const handleSurveyChange = (field: string, value: string) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: 'current_solutions' | 'feature_priorities', value: string) => {
    setSurveyData(prev => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const handleSkipSurvey = () => {
    router.push('/dashboard');
  };

  const handleSubmitSurvey = async () => {
    const supabase = createClient();
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (showSurvey) {
    return <SurveyView 
      surveyData={surveyData}
      handleSurveyChange={handleSurveyChange}
      toggleArrayValue={toggleArrayValue}
      handleSkipSurvey={handleSkipSurvey}
      handleSubmitSurvey={handleSubmitSurvey}
    />;
  }

  return <WelcomeView 
    user={user}
    memberCount={memberCount}
    setShowSurvey={setShowSurvey}
    handleSkipSurvey={handleSkipSurvey}
  />;
}

// Survey View Component
function SurveyView({ 
  surveyData, 
  handleSurveyChange, 
  toggleArrayValue,
  handleSkipSurvey,
  handleSubmitSurvey 
}: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Help Us Build What You Need
            </h2>
            <p className="text-gray-600">
              Your answers will directly influence our development priorities. (2 minutes)
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3">
                What&apos;s your biggest challenge as a poultry professional?
              </label>
              <textarea
                rows={4}
                value={surveyData.biggest_challenge}
                onChange={(e) => handleSurveyChange('biggest_challenge', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="E.g., I can't find a vet when birds start dying at night..."
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3">
                How do you currently solve poultry problems?
              </label>
              <div className="space-y-2">
                {['WhatsApp groups', 'Call my vet', 'Google search', 'Ask other farmers', 'Trial and error', 'YouTube videos'].map((option) => (
                  <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={surveyData.current_solutions.includes(option)}
                      onChange={() => toggleArrayValue('current_solutions', option)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3">
                What features are most important to you? (Select top 3)
              </label>
              <div className="space-y-2">
                {['24/7 expert problem solving', 'Searchable knowledge base', 'Verified expert network', 'Market price information', 'Professional networking', 'Job opportunities', 'Industry events', 'Training & education'].map((option) => (
                  <label 
                    key={option} 
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      surveyData.feature_priorities.includes(option)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${
                      surveyData.feature_priorities.length >= 3 && !surveyData.feature_priorities.includes(option)
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={surveyData.feature_priorities.includes(option)}
                      onChange={() => toggleArrayValue('feature_priorities', option)}
                      disabled={surveyData.feature_priorities.length >= 3 && !surveyData.feature_priorities.includes(option)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Selected: {surveyData.feature_priorities.length}/3
              </p>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3">
                Would you be interested in beta testing (December 2025)?
              </label>
              <div className="space-y-2">
                {['Yes, definitely!', 'Maybe, depends on timing', 'No, I\'ll wait for full launch'].map((option) => (
                  <label 
                    key={option} 
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      surveyData.beta_interest === option
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="beta_interest"
                      checked={surveyData.beta_interest === option}
                      onChange={() => handleSurveyChange('beta_interest', option)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSkipSurvey}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmitSurvey}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Submit & Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Welcome View Component
function WelcomeView({ user, memberCount, setShowSurvey, handleSkipSurvey }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* @ts-expect-error - React 18 typing issue with Confetti */}
      <Confetti
        recycle={false}
        numberOfPieces={200}
        gravity={0.3}
      />

      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              🎉 Welcome to PoultryCo, {user?.user_metadata?.full_name || 'Friend'}!
            </h1>
            <p className="text-xl text-gray-600">
              You&apos;re member <strong>#{memberCount}</strong> • <strong>127</strong> members joined today
            </p>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              📢 Platform Status: Pre-Launch (Building in Public)
            </h3>
            <p className="text-gray-700 mb-4">
              <strong>We&apos;re building PoultryCo with you, not for you.</strong> You&apos;ll see features activate in real-time as we ship them. Your feedback shapes what we build next.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">✅</span>
                  <h4 className="font-bold text-gray-900">Ready Now</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Profile creation</li>
                  <li>• Member directory</li>
                  <li>• Community updates</li>
                  <li>• Feedback & surveys</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🚧</span>
                  <h4 className="font-bold text-gray-900">Coming Soon</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Problem posting (Beta: Dec 2025)</li>
                  <li>• Expert answers (Beta: Dec 2025)</li>
                  <li>• Full platform (Launch: Jan 2026)</li>
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-medium text-gray-700">Platform Development</span>
                <span className="text-gray-600">65% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Expected launch: January 2026 at PTSE Third Edition</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-gray-900">What&apos;s Next?</h3>
            <p className="text-gray-600">
              Help us build the platform you need by completing a quick 2-minute survey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSkipSurvey}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={() => setShowSurvey(true)}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Start 2-Minute Survey</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
