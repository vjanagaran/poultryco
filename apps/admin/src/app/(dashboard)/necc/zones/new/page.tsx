import { ZoneForm } from "@/components/necc/zones/ZoneForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewZonePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">➕ Add New Zone</h1>
          <p className="text-gray-600 mt-2">Create a new NECC zone</p>
        </div>
        <Link href="/necc/zones">
          <Button variant="outline">← Back to Zones</Button>
        </Link>
      </div>

      {/* Form */}
      <ZoneForm />
    </div>
  );
}

