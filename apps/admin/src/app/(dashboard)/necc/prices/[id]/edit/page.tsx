import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PriceEditForm } from '@/components/necc/prices/PriceEditForm';

export default async function EditPricePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the price
  const { data: price, error } = await supabase
    .from('necc_prices')
    .select(`
      *,
      necc_zones (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .single();

  if (error || !price) {
    redirect('/necc/prices');
  }

  // Fetch all zones for the dropdown
  const { data: zones } = await supabase
    .from('necc_zones')
    .select('id, name')
    .eq('status', true)
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Price</h1>
          <p className="mt-2 text-gray-600">
            Update NECC egg price for {price.necc_zones?.name} on{' '}
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
}

