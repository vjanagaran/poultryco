import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MarketingDashboard() {
  let stats = {
    topicsCount: 0,
    segmentsCount: 0,
    pillarsCount: 0,
    channelsCount: 0,
    scheduledCount: 0,
  };

  try {
    stats = await getMarketingDashboardStats();
  } catch (error) {
    console.error('Error fetching marketing stats:', error);
  }

  const cards = [
    {
      title: 'NDP Topics',
      count: stats.topicsCount || 0,
      icon: '💡',
      href: '/marketing/topics',
      description: 'Content topics based on Need-Desire-Pain framework',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Customer Segments',
      count: stats.segmentsCount || 0,
      icon: '👥',
      href: '/marketing/segments',
      description: 'Target audience segments and personas',
      color: 'bg-green-50 border-green-200',
    },
    {
      title: 'Content Pillars',
      count: stats.pillarsCount || 0,
      icon: '🏛️',
      href: '/marketing/pillars',
      description: 'Core research topics for content generation',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      title: 'Marketing Channels',
      count: stats.channelsCount || 0,
      icon: '📱',
      href: '/marketing/channels',
      description: 'Social media accounts and distribution channels',
      color: 'bg-amber-50 border-amber-200',
    },
    {
      title: 'Content Calendar',
      count: stats.scheduledCount || 0,
      subtitle: 'scheduled',
      icon: '📅',
      href: '/marketing/calendar',
      description: 'Schedule and track content publishing',
      color: 'bg-pink-50 border-pink-200',
    },
    {
      title: 'KPI Tracking',
      count: 0,
      subtitle: 'metrics',
      icon: '📊',
      href: '/marketing/kpis',
      description: 'Track and analyze marketing performance',
      color: 'bg-indigo-50 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketing System</h1>
        <p className="mt-2 text-gray-600">
          Manage content strategy, track campaigns, and measure performance
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${card.color} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-105`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{card.icon}</span>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{card.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {card.count}
                  </span>
                  {card.subtitle && (
                    <span className="text-sm text-gray-500">{card.subtitle}</span>
                  )}
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/marketing/topics/new"
            className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium text-gray-900">Add NDP Topic</span>
          </Link>
          <Link
            href="/marketing/pillars/new"
            className="flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">📝</span>
            <span className="font-medium text-gray-900">Create Pillar</span>
          </Link>
          <Link
            href="/marketing/calendar"
            className="flex items-center gap-3 px-4 py-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">📅</span>
            <span className="font-medium text-gray-900">Schedule Content</span>
          </Link>
          <Link
            href="/marketing/kpis/entry"
            className="flex items-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">📊</span>
            <span className="font-medium text-gray-900">Log KPIs</span>
          </Link>
        </div>
      </div>

      {/* System Goals */}
      <div className="bg-gradient-to-r from-poultryco-green to-green-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Marketing System Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold">80%</div>
            <div className="text-green-100">Time Reduction Target</div>
            <div className="text-sm text-green-200 mt-1">
              From 15 hours/week → 3 hours/week
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">1,000</div>
            <div className="text-green-100">User Target (3 months)</div>
            <div className="text-sm text-green-200 mt-1">
              Post platform launch in March 2026
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">10+</div>
            <div className="text-green-100">Active Channels</div>
            <div className="text-sm text-green-200 mt-1">
              Multi-channel content distribution
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

