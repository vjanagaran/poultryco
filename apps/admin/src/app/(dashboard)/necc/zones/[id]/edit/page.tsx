import { ZoneForm } from "@/components/necc/zones/ZoneForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { getZoneById } from "@/lib/api/necc";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditZonePage({ params }: Props) {
  const { id } = await params;
  const zone = await getZoneById(id);

  if (!zone) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">✏️ Edit Zone</h1>
          <p className="text-gray-600 mt-2">Update zone: {zone.name}</p>
        </div>
        <Link href="/necc/zones">
          <Button variant="outline">← Back to Zones</Button>
        </Link>
      </div>

      {/* Form */}
      <ZoneForm zone={zone} />
    </div>
  );
}

