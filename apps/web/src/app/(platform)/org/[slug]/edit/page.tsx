import { OrganizationEditContent } from '@/components/organization/OrganizationEditContent';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditOrganizationPage({ params }: PageProps) {
  const { slug } = await params;
  return <OrganizationEditContent slug={slug} />;
}

