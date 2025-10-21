"use client";

import * as React from "react";
import { Button, Input } from "@/components/ui";
import { supabase } from "@/lib/supabase";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
  country: string;
}

export function EarlyAccessForm() {
  const [formData, setFormData] = React.useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    organization: "",
    country: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const { error: insertError } = await supabase
        .from('early_access_signups')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          company_name: formData.organization || null,
          country: formData.country,
          source: 'early-access-page',
          referrer: typeof window !== 'undefined' ? document.referrer : null,
        }])

      if (insertError) throw insertError;
      
      setIsSuccess(true);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        role: "",
        organization: "",
        country: "",
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">
          Welcome to PoultryCo! 🎉
        </h3>
        <p className="text-green-800 mb-6">
          You&apos;re on the list! We&apos;ll send you an invite before the official launch.
        </p>
        <Button
          variant="primary"
          onClick={() => setIsSuccess(false)}
        >
          Submit Another Response
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          name="fullName"
          type="text"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={handleChange}
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Role <span className="text-destructive ml-1">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select your role</option>
            <option value="farmer">Farmer / Farm Owner</option>
            <option value="manager">Farm Manager</option>
            <option value="veterinarian">Veterinarian</option>
            <option value="feed">Feed Manufacturer / Nutritionist</option>
            <option value="equipment">Equipment Supplier</option>
            <option value="consultant">Consultant</option>
            <option value="student">Student / Researcher</option>
            <option value="association">Association / Organization</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Organization / Company"
          name="organization"
          type="text"
          placeholder="Your company name"
          value={formData.organization}
          onChange={handleChange}
        />
        <Input
          label="Country"
          name="country"
          type="text"
          placeholder="India"
          value={formData.country}
          onChange={handleChange}
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Get Early Access"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        By submitting, you agree to our{" "}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}

