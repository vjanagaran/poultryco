import Link from 'next/link';
import { getWhatsAppStats } from '@/lib/api/whatsapp';

export const dynamic = 'force-dynamic';

export default async function WhatsAppDashboard() {
  let stats = {
    accounts: { total: 0, active: 0 },
    groups: { total: 0, active: 0 },
    contacts: { total: 0 },
    messages: { total: 0, sent: 0, delivered: 0, failed: 0 },
  };

  try {
    stats = await getWhatsAppStats();
  } catch (error) {
    console.error('Error fetching WhatsApp stats:', error);
  }

  const cards = [
    {
      title: 'WhatsApp Accounts',
      count: stats.accounts.total,
      subtitle: `${stats.accounts.active} active`,
      icon: '📱',
      href: '/marketing/whatsapp/accounts',
      description: 'Manage WhatsApp account connections',
      color: 'bg-green-50 border-green-200',
    },
    {
      title: 'Groups',
      count: stats.groups.total,
      subtitle: `${stats.groups.active} active`,
      icon: '👥',
      href: '/marketing/whatsapp/groups',
      description: 'Discover and manage WhatsApp groups',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Contacts',
      count: stats.contacts.total,
      icon: '📇',
      href: '/marketing/whatsapp/contacts',
      description: 'Manage WhatsApp contacts and personas',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      title: 'Messages',
      count: stats.messages.total,
      subtitle: `${stats.messages.sent} sent, ${stats.messages.delivered} delivered`,
      icon: '💬',
      href: '/marketing/whatsapp/messages',
      description: 'View and manage WhatsApp messages',
      color: 'bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Marketing</h1>
        <p className="mt-2 text-gray-600">
          Manage WhatsApp accounts, groups, contacts, and campaigns
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            href="/marketing/whatsapp/accounts/new"
            className="flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium text-gray-900">Add Account</span>
          </Link>
          <Link
            href="/marketing/whatsapp/groups"
            className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">🔍</span>
            <span className="font-medium text-gray-900">Discover Groups</span>
          </Link>
          <Link
            href="/marketing/whatsapp/messages/new"
            className="flex items-center gap-3 px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">📤</span>
            <span className="font-medium text-gray-900">Send Message</span>
          </Link>
          <Link
            href="/marketing/campaigns"
            className="flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">🚀</span>
            <span className="font-medium text-gray-900">Create Campaign</span>
          </Link>
        </div>
      </div>

      {/* Integration Info */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">WhatsApp Integration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold">5</div>
            <div className="text-green-100">Max Accounts</div>
            <div className="text-sm text-green-200 mt-1">
              Multi-account support for scale
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">200</div>
            <div className="text-green-100">Messages/Day/Account</div>
            <div className="text-sm text-green-200 mt-1">
              Rate limit to prevent bans
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">100%</div>
            <div className="text-green-100">Campaign Integration</div>
            <div className="text-sm text-green-200 mt-1">
              Linked to marketing campaigns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

