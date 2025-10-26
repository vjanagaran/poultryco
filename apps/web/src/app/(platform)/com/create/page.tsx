import { Metadata } from 'next';
import { BusinessCreationWizard } from '@/components/business/BusinessCreationWizard';

export const metadata: Metadata = {
  title: 'Create Business Profile | PoultryCo',
  description: 'Create a business profile for your poultry company on PoultryCo.',
};

export const dynamic = 'force-dynamic';

export default function CreateBusinessPage() {
  return <BusinessCreationWizard />;
}

