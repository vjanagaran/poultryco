import { OrganizationProfileView } from '@/components/organization/OrganizationProfileView';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function OrganizationPage({ params }: PageProps) {
  const { slug } = await params;
  return <OrganizationProfileView slug={slug} />;
}

