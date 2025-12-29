import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PriceEditForm } from '@/components/necc/prices/PriceEditForm';
import { getPrices, getAllZones } from '@/lib/api/necc';

export default async function EditPricePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the price
  try {
    const prices = await getPrices({ limit: 1000 }); // Get all prices to find the one we need
    const price = prices.find((p: any) => p.id === id);

    if (!price) {
      redirect('/necc/prices');
    }

    // Fetch all zones for the dropdown
    const zones = await getAllZones();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Price</h1>
          <p className="mt-2 text-gray-600">
            Update NECC egg price on{' '}
            {new Date(price.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/necc/prices"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back to Prices
        </Link>
      </div>

      <PriceEditForm price={price} zones={zones || []} />
    </div>
  );
  } catch (error) {
    redirect('/necc/prices');
  }
}

