'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { uploadToStorage } from '@/lib/storageUtils';

interface EditCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: any;
  businessId: string;
  onCertificationUpdated: () => void;
}

const CERTIFICATION_TYPES = [
  { value: 'iso', label: 'ISO Certification' },
  { value: 'quality', label: 'Quality Certification' },
  { value: 'organic', label: 'Organic Certification' },
  { value: 'halal', label: 'Halal Certification' },
  { value: 'gmp', label: 'GMP (Good Manufacturing Practice)' },
  { value: 'haccp', label: 'HACCP' },
  { value: 'fssai', label: 'FSSAI License' },
  { value: 'export', label: 'Export License' },
  { value: 'veterinary', label: 'Veterinary Certification' },
  { value: 'other', label: 'Other' },
];

export function EditCertificationModal({
  isOpen,
  onClose,
  certification,
  businessId,
  onCertificationUpdated,
}: EditCertificationModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    certification_name: '',
    certification_type: '',
    issuing_authority: '',
    certificate_number: '',
    issue_date: '',
    expiry_date: '',
    description: '',
  });

  useEffect(() => {
    if (certification && isOpen) {
      setFormData({
        certification_name: certification.certification_name || '',
        certification_type: certification.certification_type || '',
        issuing_authority: certification.issuing_authority || '',
        certificate_number: certification.certificate_number || '',
        issue_date: certification.issue_date || '',
        expiry_date: certification.expiry_date || '',
        description: certification.description || '',
      });
    }
  }, [certification, isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this certification?')) {
      return;
    }

    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('business_certifications')
        .delete()
        .eq('id', certification.id);

      if (error) throw error;

      onCertificationUpdated();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting certification:', error);
      alert(error.message || 'Failed to delete certification');
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      let certificateFileUrl = certification.certificate_file_url;

      // Upload new file if selected
      if (selectedFile) {
        setUploadingFile(true);
        const result = await uploadToStorage(selectedFile, `certifications/${businessId}`, `cert_${Date.now()}`);
        if (result.success && result.url) {
          certificateFileUrl = result.url;
        }
        setUploadingFile(false);
      }

      // Update certification
      const { error } = await supabase
        .from('business_certifications')
        .update({
          certification_name: formData.certification_name,
          certification_type: formData.certification_type,
          issuing_authority: formData.issuing_authority || null,
          certificate_number: formData.certificate_number || null,
          issue_date: formData.issue_date || null,
          expiry_date: formData.expiry_date || null,
          description: formData.description || null,
          certificate_file_url: certificateFileUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', certification.id);

      if (error) throw error;

      onCertificationUpdated();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error updating certification:', error);
      alert(error.message || 'Failed to update certification');
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Certification</h2>
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
          {/* Certification Name & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.certification_name}
                onChange={(e) => setFormData({ ...formData, certification_name: e.target.value })}
                placeholder="e.g., ISO 9001:2015"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.certification_type}
                onChange={(e) => setFormData({ ...formData, certification_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select type</option>
                {CERTIFICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Issuing Authority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuing Authority
            </label>
            <input
              type="text"
              value={formData.issuing_authority}
              onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
              placeholder="e.g., Bureau of Indian Standards"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Certificate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Number
            </label>
            <input
              type="text"
              value={formData.certificate_number}
              onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
              placeholder="e.g., CERT-2024-12345"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Issue & Expiry Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the certification..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Certificate File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Document
            </label>
            {certification.certificate_file_url && !selectedFile && (
              <div className="mb-2">
                <a
                  href={certification.certificate_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  📄 View current certificate
                </a>
              </div>
            )}
            {selectedFile && (
              <div className="mb-2 border rounded-lg p-3 bg-gray-50 flex items-center gap-2">
                <p className="text-sm text-gray-700 flex-1">{selectedFile.name}</p>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
            <label className="cursor-pointer block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                <p className="text-sm text-gray-600">
                  {selectedFile ? 'Change file' : certification.certificate_file_url ? 'Replace certificate' : 'Upload certificate'}
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || deleting || uploadingFile}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <div className="flex-1"></div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading || deleting || uploadingFile}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || deleting || uploadingFile}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {uploadingFile ? 'Uploading...' : loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

