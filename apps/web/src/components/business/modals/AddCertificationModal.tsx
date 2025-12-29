'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { uploadToStorage } from '@/lib/storageUtils';

interface AddCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onCertificationAdded: () => void;
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

export function AddCertificationModal({
  isOpen,
  onClose,
  businessId,
  onCertificationAdded,
}: AddCertificationModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
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

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let certificateFileUrl = null;

      // Upload file if selected
      if (selectedFile) {
        setUploadingFile(true);
        const result = await uploadToStorage(selectedFile, `certifications/${businessId}`, `cert_${Date.now()}`);
        if (result.success && result.url) {
          certificateFileUrl = result.url;
        }
        setUploadingFile(false);
      }

      // Add certification via API
      await apiClient.post(`/businesses/${businessId}/certifications`, {
        name: formData.certification_name,
        certificationType: formData.certification_type,
        issuingAuthority: formData.issuing_authority || null,
        certificateNumber: formData.certificate_number || null,
        issueDate: formData.issue_date || null,
        expiryDate: formData.expiry_date || null,
        description: formData.description || null,
        certificateFileUrl: certificateFileUrl,
      });

      onCertificationAdded();
      onClose();
      router.refresh();

      // Reset form
      setFormData({
        certification_name: '',
        certification_type: '',
        issuing_authority: '',
        certificate_number: '',
        issue_date: '',
        expiry_date: '',
        description: '',
      });
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error: any) {
      console.error('Error adding certification:', error);
      alert(error.message || 'Failed to add certification');
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Certification</h2>
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

          {/* Certificate File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Document
            </label>
            {filePreview ? (
              <div className="relative">
                <div className="border rounded-lg p-4 flex items-center gap-3 bg-gray-50">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{selectedFile?.name}</p>
                    <p className="text-xs text-gray-500">{selectedFile ? (selectedFile.size / 1024).toFixed(2) : '0'} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600">Upload certificate document</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploadingFile}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingFile}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {uploadingFile ? 'Uploading...' : loading ? 'Adding...' : 'Add Certification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

