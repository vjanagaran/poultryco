'use client';

import { OrganizationProfile } from '../OrganizationProfileView';

interface OrganizationResourcesSectionProps {
  organization: OrganizationProfile;
  isOwner: boolean;
}

export function OrganizationResourcesSection({ organization, isOwner }: OrganizationResourcesSectionProps) {
  const resources = organization.resources || [];
  
  if (!resources.length && !isOwner) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
        {isOwner && (
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            ➕ Add Resource
          </button>
        )}
      </div>

      {resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">{resource.title}</h3>
                {resource.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{resource.description}</p>
                )}
                {resource.resource_url && (
                  <a
                    href={resource.resource_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block"
                  >
                    View Resource →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">
          No resources available. {isOwner && 'Click "Add Resource" to share documents and files.'}
        </p>
      )}
    </div>
  );
}

