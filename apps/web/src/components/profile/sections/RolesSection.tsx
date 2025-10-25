'use client';

import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

interface RolesSectionProps {
  profile: any;
  isOwner: boolean;
}

const ROLE_ICONS: Record<string, string> = {
  farmer: '🌾',
  veterinarian: '🏥',
  supplier: '🏭',
  consultant: '📊',
  researcher: '🎓',
  trader: '🤝',
  transporter: '🚛',
  processor: '🏭',
  feed_miller: '🌾',
  hatchery_operator: '🥚',
  equipment_dealer: '🔧',
  lab_technician: '🔬',
  farm_manager: '👔',
  quality_controller: '✅',
  nutritionist: '🍽️',
  breeder: '🐣',
  educator: '👨‍🏫',
  student: '🎓',
  other: '💼',
};

const ROLE_LABELS: Record<string, string> = {
  farmer: 'Poultry Farmer',
  veterinarian: 'Veterinarian',
  supplier: 'Supplier',
  consultant: 'Consultant',
  researcher: 'Researcher',
  trader: 'Trader',
  transporter: 'Transporter',
  processor: 'Processor',
  feed_miller: 'Feed Miller',
  hatchery_operator: 'Hatchery Operator',
  equipment_dealer: 'Equipment Dealer',
  lab_technician: 'Lab Technician',
  farm_manager: 'Farm Manager',
  quality_controller: 'Quality Controller',
  nutritionist: 'Nutritionist',
  breeder: 'Breeder',
  educator: 'Educator',
  student: 'Student',
  other: 'Other',
};

const AVAILABLE_ROLES = Object.keys(ROLE_LABELS);

export function RolesSection({ profile, isOwner }: RolesSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const roles = profile.roles || [];

  if (!roles.length && !isOwner) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Roles</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add role
            </button>
          )}
        </div>

        {roles.length > 0 ? (
          <div className="space-y-3">
            {roles.map((role: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-3xl">{ROLE_ICONS[role.role_type] || '💼'}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {ROLE_LABELS[role.role_type] || role.role_type}
                  </h3>
                  {role.is_primary && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Primary Role
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              + Add your roles in the poultry industry
            </button>
          )
        )}
      </div>

      {showAddModal && (
        <AddRoleModal
          existingRoles={roles.map((r: any) => r.role_type)}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}

// Add Role Modal
function AddRoleModal({ existingRoles, onClose }: { existingRoles: string[]; onClose: () => void }) {
  const { addRole } = useProfile();
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const availableRoles = AVAILABLE_ROLES.filter(role => !existingRoles.includes(role));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setSaving(true);
    try {
      await addRole(selectedRole);
      onClose();
    } catch (error) {
      console.error('Error adding role:', error);
      alert('Failed to add role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Add Role</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select your role in the poultry industry
          </label>
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
            {availableRoles.map((role) => (
              <label
                key={role}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-0"
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-2xl">{ROLE_ICONS[role]}</span>
                <span className="text-gray-900">{ROLE_LABELS[role]}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedRole}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

