'use client';

import Link from 'next/link';
import Image from 'next/image';
import { JobResult } from '@/lib/api/discovery';
import { TrustBadge } from '../TrustBadge';

interface JobCardProps {
  job: JobResult;
}

export function JobCard({ job }: JobCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };
  
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    
    const formatAmount = (amount: number) => {
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
      return `₹${amount}`;
    };
    
    if (job.salary_min && job.salary_max) {
      return `${formatAmount(job.salary_min)} - ${formatAmount(job.salary_max)}${job.salary_period ? `/${job.salary_period}` : ''}`;
    }
    if (job.salary_min) {
      return `From ${formatAmount(job.salary_min)}${job.salary_period ? `/${job.salary_period}` : ''}`;
    }
    return `Up to ${formatAmount(job.salary_max!)}${job.salary_period ? `/${job.salary_period}` : ''}`;
  };
  
  const salary = formatSalary();
  
  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href={`/com/${job.company.business_slug}`} className="flex-shrink-0">
          <div className="relative w-12 h-12">
            <Image
              src={job.company.logo_url || '/default-business.png'}
              alt={job.company.business_name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link 
            href={`/com/${job.company.business_slug}`}
            className="hover:text-green-600 transition-colors"
          >
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-1">
              {job.title}
            </h3>
          </Link>
          
          <Link 
            href={`/com/${job.company.business_slug}`}
            className="text-sm text-gray-600 hover:text-green-600 inline-flex items-center gap-2"
          >
            {job.company.business_name}
            {job.company.is_verified && <TrustBadge type="verified" size="sm" />}
          </Link>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
            {job.location_city && (
              <span>📍 {job.location_city}</span>
            )}
            {job.employment_type && (
              <>
                <span>•</span>
                <span className="capitalize">{job.employment_type.replace('_', ' ')}</span>
              </>
            )}
            {job.experience_min !== null && (
              <>
                <span>•</span>
                <span>{job.experience_min}-{job.experience_max || job.experience_min + 5} years</span>
              </>
            )}
          </div>
        </div>
        
        <button className="flex-shrink-0 p-2 hover:bg-gray-50 rounded-lg">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
      
      {/* Description */}
      {job.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mt-4">
          {job.description}
        </p>
      )}
      
      {/* Salary & Skills */}
      <div className="mt-4 space-y-2">
        {salary && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-600">{salary}</span>
          </div>
        )}
        
        {job.required_skills && job.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.required_skills.slice(0, 4).map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 4 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{job.required_skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Trust Indicators & Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{formatDate(job.posted_at)}</span>
          {job.applicant_count !== undefined && job.applicant_count > 0 && (
            <>
              <span>•</span>
              <span>{job.applicant_count} applicants</span>
            </>
          )}
        </div>
        
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
          Apply Now
        </button>
      </div>
    </article>
  );
}

