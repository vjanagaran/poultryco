import { Metadata } from 'next';
import { BusinessProfileView } from '@/components/business/BusinessProfileView';
import { getBusinessBySlug } from '@/lib/api/businesses';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const business = await getBusinessBySlug(slug);

    if (!business) {
      return {
        title: 'Business Not Found | PoultryCo',
      };
    }

    return {
      title: `${business.name} | PoultryCo`,
      description: business.tagline || `View ${business.name} on PoultryCo`,
      openGraph: {
        images: business.logoUrl ? [business.logoUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Business Not Found | PoultryCo',
    };
  }
}

export default async function BusinessProfilePage({ params }: Props) {
  const { slug } = await params;
  
  return <BusinessProfileView businessSlug={slug} />;
}

