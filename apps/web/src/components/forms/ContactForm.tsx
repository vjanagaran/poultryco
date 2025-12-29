"use client";

import * as React from "react";
import { Button, Input, Textarea, Alert } from "@/components/ui";
import { Form, FormRow, FormActions, FormError, Select } from "@/components/ui/Form";
import { apiClient } from "@/lib/api/client";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Submit via API
      await apiClient.post('/forms/contact', {
        fullName: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        inquiryType: 'general',
        source: 'contact-page',
        referrer: typeof window !== 'undefined' ? document.referrer : null,
      });
      
      setIsSuccess(true);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
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
      <Alert variant="success" className="max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">
            Message Sent Successfully!
          </h3>
          <p className="text-sm">
            Thank you for reaching out. We'll get back to you within 24 hours.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSuccess(false)}
          >
            Send Another Message
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow>
        <Input
          label="Your Name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
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
      </FormRow>

      <Select
        label="Subject"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        required
      >
        <option value="">Select a subject</option>
        <option value="general">General Inquiry</option>
        <option value="partnership">Partnership Opportunity</option>
        <option value="press">Press & Media</option>
        <option value="support">Technical Support</option>
        <option value="feedback">Feedback & Suggestions</option>
        <option value="other">Other</option>
      </Select>

      <Textarea
        label="Message"
        name="message"
        placeholder="Tell us how we can help..."
        value={formData.message}
        onChange={handleChange}
        required
        rows={6}
      />

      <FormError error={error} />

      <FormActions>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </FormActions>
    </Form>
  );
}