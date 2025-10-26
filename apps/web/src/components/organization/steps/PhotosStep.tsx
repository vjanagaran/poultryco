'use client';

import Image from 'next/image';

interface PhotosStepProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PhotosStep({ formData, setFormData, onNext, onBack }: PhotosStepProps) {
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        logo_file: file,
        logo_preview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        cover_file: file,
        cover_preview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Photos</h2>
        <p className="text-gray-600">Add a logo and cover photo (optional but recommended)</p>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Organization Logo
        </label>
        {formData.logo_preview ? (
          <div className="relative w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden group">
            <Image
              src={formData.logo_preview}
              alt="Logo preview"
              fill
              className="object-cover"
            />
            <button
              onClick={() => setFormData({ ...formData, logo_file: null, logo_preview: null })}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <span className="px-3 py-1 bg-red-600 text-white text-sm rounded">Remove</span>
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-green-500 transition-colors">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm text-gray-600">Upload Logo</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              className="hidden"
            />
          </label>
        )}
        <p className="text-xs text-gray-500 mt-2">Square image recommended (min 200x200px)</p>
      </div>

      {/* Cover Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Cover Photo
        </label>
        {formData.cover_preview ? (
          <div className="relative w-full h-48 rounded-lg border-2 border-gray-200 overflow-hidden group">
            <Image
              src={formData.cover_preview}
              alt="Cover preview"
              fill
              className="object-cover"
            />
            <button
              onClick={() => setFormData({ ...formData, cover_file: null, cover_preview: null })}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <span className="px-3 py-1 bg-red-600 text-white text-sm rounded">Remove</span>
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-green-500 transition-colors">
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-600">Upload Cover Photo</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />
          </label>
        )}
        <p className="text-xs text-gray-500 mt-2">Wide image recommended (min 1200x400px)</p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}

