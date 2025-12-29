'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface AssignContactPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  teamMembers: any[];
  onContactAssigned: () => void;
}

const CONTACT_TYPES = [
  { value: 'sales', label: 'Sales' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'admin', label: 'Administration' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'orders', label: 'Orders & Delivery' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'support', label: 'General Support' },
];

export function AssignContactPersonModal({
  isOpen,
  onClose,
  businessId,
  teamMembers,
  onContactAssigned,
}: AssignContactPersonModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    contact_type: '',
    designation: '',
    department: '',
    is_primary: false,
    phone: '',
    email: '',
    whatsapp: '',
    available_hours: '',
    languages: '',
  });

  if (!isOpen) return null;

  const availableMembers = teamMembers.filter((member) => {
    // Check if this member is already a contact person
    return !member.is_contact_person;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setLoading(true);
    try {
      // Add contact person via API
      await apiClient.post(`/businesses/${businessId}/contact-persons`, {
        profileId: selectedMember.profile.id,
        contactType: formData.contact_type,
        designation: formData.designation || null,
        department: formData.department || null,
        isPrimary: formData.is_primary,
        phone: formData.phone || null,
        email: formData.email || null,
        whatsapp: formData.whatsapp || null,
        availableHours: formData.available_hours || null,
        languages: formData.languages ? formData.languages.split(',').map(l => l.trim()) : null,
      });

      onContactAssigned();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error assigning contact person:', error);
      alert(error.message || 'Failed to assign contact person');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Assign Contact Person</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Select Team Member */}
          {!selectedMember && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Team Member <span className="text-red-500">*</span>
              </label>
              {availableMembers.length > 0 ? (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {availableMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedMember(member)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0">
                        {member.profile.profile_photo_url ? (
                          <Image
                            src={member.profile.profile_photo_url}
                            alt={member.profile.full_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {member.profile.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{member.profile.full_name}</h4>
                        <p className="text-sm text-gray-600">{member.role_title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>All team members are already assigned as contacts.</p>
                  <p className="text-sm mt-1">Invite more team members first.</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Member & Details */}
          {selectedMember && (
            <>
              {/* Selected Member Display */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0">
                    {selectedMember.profile.profile_photo_url ? (
                      <Image
                        src={selectedMember.profile.profile_photo_url}
                        alt={selectedMember.profile.full_name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {selectedMember.profile.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{selectedMember.profile.full_name}</h4>
                    <p className="text-sm text-gray-600">{selectedMember.role_title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Contact Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.contact_type}
                  onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select contact type</option>
                  {CONTACT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation & Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g., Senior Sales Manager"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Sales"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Available Hours & Languages */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Hours</label>
                  <input
                    type="text"
                    value={formData.available_hours}
                    onChange={(e) => setFormData({ ...formData, available_hours: e.target.value })}
                    placeholder="e.g., 9 AM - 6 PM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="e.g., English, Tamil, Hindi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
                </div>
              </div>

              {/* Primary Contact */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_primary}
                    onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    <strong>Set as Primary Contact</strong> (shown first, used for auto-inquiries)
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMember || !formData.contact_type}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Assigning...' : 'Assign Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

