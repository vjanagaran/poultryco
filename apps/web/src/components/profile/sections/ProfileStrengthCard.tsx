'use client';

interface ProfileStrengthCardProps {
  profile: any;
}

export function ProfileStrengthCard({ profile }: ProfileStrengthCardProps) {
  const strength = profile.profile_strength || 0;

  // Calculate what's missing
  const suggestions = [];
  
  if (!profile.profile_photo_url) {
    suggestions.push({
      title: 'Add a profile photo',
      description: 'Profiles with photos get 21x more views',
      points: 15,
      action: 'Add photo',
    });
  }

  if (!profile.headline) {
    suggestions.push({
      title: 'Write a headline',
      description: 'Tell people what you do in one line',
      points: 10,
      action: 'Add headline',
    });
  }

  if (!profile.bio) {
    suggestions.push({
      title: 'Add an about section',
      description: 'Help others understand your expertise',
      points: 15,
      action: 'Add about',
    });
  }

  if (!profile.roles || profile.roles.length === 0) {
    suggestions.push({
      title: 'Add your roles',
      description: 'Show what you do in the poultry industry',
      points: 20,
      action: 'Add roles',
    });
  }

  // Get strength level and color
  let strengthLevel = 'Beginner';
  let strengthColor = 'bg-red-500';
  
  if (strength >= 80) {
    strengthLevel = 'All-star';
    strengthColor = 'bg-green-600';
  } else if (strength >= 60) {
    strengthLevel = 'Advanced';
    strengthColor = 'bg-blue-500';
  } else if (strength >= 40) {
    strengthLevel = 'Intermediate';
    strengthColor = 'bg-yellow-500';
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
      {/* Profile Strength */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Profile Strength</h3>
          <span className="text-sm font-medium text-gray-600">{strengthLevel}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${strengthColor} transition-all duration-500`}
            style={{ width: `${strength}%` }}
          ></div>
        </div>
        
        <p className="text-xs text-gray-500 mt-1">{strength}% complete</p>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Complete your profile
          </h4>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-green-600">
                    +{suggestion.points}%
                  </span>
                </div>
                <button className="mt-2 text-xs font-medium text-green-600 hover:text-green-700">
                  {suggestion.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Star Message */}
      {strength >= 80 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <h4 className="font-semibold text-gray-900">All-star profile!</h4>
          </div>
          <p className="text-sm text-gray-700">
            Your profile is among the top profiles on PoultryCo. Keep it updated!
          </p>
        </div>
      )}

      {/* Profile Views (Coming Soon) */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Profile Analytics</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Profile views</span>
            <span className="font-medium text-gray-400">Coming soon</span>
          </div>
          <div className="flex justify-between">
            <span>Search appearances</span>
            <span className="font-medium text-gray-400">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

