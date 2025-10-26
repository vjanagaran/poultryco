/**
 * Profile Strength Calculator
 * Calculates profile completion percentage based on filled fields
 */

export interface ProfileStrengthResult {
  percentage: number;
  completedFields: string[];
  missingFields: Array<{
    field: string;
    label: string;
    points: number;
    tip: string;
  }>;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  nextMilestone: number;
}

interface ProfileFieldConfig {
  points: number;
  label: string;
  tip: string;
  isArray?: boolean;
}

const PROFILE_FIELDS: Record<string, ProfileFieldConfig> = {
  // Basic Info - 30 points total
  full_name: { points: 5, label: 'Full Name', tip: 'Your name helps people recognize you' },
  headline: { points: 10, label: 'Professional Headline', tip: 'A clear headline helps others understand what you do' },
  profile_photo_url: { points: 10, label: 'Profile Photo', tip: 'Profiles with photos get 5x more views' },
  cover_photo_url: { points: 5, label: 'Cover Photo', tip: 'A cover photo makes your profile stand out' },
  
  // Contact & Location - 15 points total
  email: { points: 5, label: 'Email', tip: 'Essential for networking' },
  phone_number: { points: 5, label: 'Phone Number', tip: 'Makes it easier for people to reach you' },
  location_state: { points: 3, label: 'State', tip: 'Helps connect you with local professionals' },
  location_city: { points: 2, label: 'City', tip: 'Useful for local networking' },
  
  // About & Bio - 15 points total
  bio: { points: 15, label: 'About Section', tip: 'Share your story and expertise' },
  
  // Professional Info - 40 points total
  roles: { points: 10, label: 'Roles', tip: 'Define your position in the industry', isArray: true },
  skills: { points: 10, label: 'Skills', tip: 'Showcase your expertise', isArray: true },
  experiences: { points: 10, label: 'Work Experience', tip: 'Build credibility with your experience', isArray: true },
  education: { points: 10, label: 'Education', tip: 'Add your qualifications', isArray: true },
};

/**
 * Calculate profile strength based on completed fields
 */
export function calculateProfileStrength(profile: any): ProfileStrengthResult {
  let totalPoints = 0;
  let earnedPoints = 0;
  const completedFields: string[] = [];
  const missingFields: Array<{
    field: string;
    label: string;
    points: number;
    tip: string;
  }> = [];

  // Calculate points for each field
  Object.entries(PROFILE_FIELDS).forEach(([field, config]) => {
    totalPoints += config.points;
    
    const value = profile[field];
    let isComplete = false;

    if (config.isArray) {
      // Check if array field has at least one item
      isComplete = Array.isArray(value) && value.length > 0;
    } else {
      // Check if value exists and is not empty
      isComplete = value !== null && value !== undefined && value !== '';
    }

    if (isComplete) {
      earnedPoints += config.points;
      completedFields.push(field);
    } else {
      missingFields.push({
        field,
        label: config.label,
        points: config.points,
        tip: config.tip,
      });
    }
  });

  // Sort missing fields by points (highest first)
  missingFields.sort((a, b) => b.points - a.points);

  // Calculate percentage
  const percentage = Math.round((earnedPoints / totalPoints) * 100);

  // Determine level
  let level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  if (percentage < 25) level = 'beginner';
  else if (percentage < 50) level = 'intermediate';
  else if (percentage < 75) level = 'advanced';
  else level = 'expert';

  // Find next milestone
  const milestones = [25, 50, 75, 100];
  const nextMilestone = milestones.find(m => m > percentage) || 100;

  return {
    percentage,
    completedFields,
    missingFields,
    level,
    nextMilestone,
  };
}

/**
 * Get profile strength message based on percentage
 */
export function getStrengthMessage(percentage: number): string {
  if (percentage < 25) {
    return 'Just getting started! Complete your profile to make a strong first impression.';
  } else if (percentage < 50) {
    return 'Good progress! Add more details to help others discover your expertise.';
  } else if (percentage < 75) {
    return 'Looking great! A few more details and you\'ll have an expert profile.';
  } else if (percentage < 100) {
    return 'Almost there! Complete the remaining sections to maximize your visibility.';
  } else {
    return '🎉 Excellent! Your profile is complete. You\'re ready to make meaningful connections.';
  }
}

/**
 * Get color based on profile strength level
 */
export function getStrengthColor(percentage: number): {
  bg: string;
  border: string;
  text: string;
  progress: string;
} {
  if (percentage < 25) {
    return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      progress: 'bg-red-500',
    };
  } else if (percentage < 50) {
    return {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      progress: 'bg-orange-500',
    };
  } else if (percentage < 75) {
    return {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      progress: 'bg-yellow-500',
    };
  } else {
    return {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      progress: 'bg-green-500',
    };
  }
}

