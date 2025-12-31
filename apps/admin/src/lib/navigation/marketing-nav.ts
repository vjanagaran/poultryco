/**
 * Marketing Module Navigation Structure
 * 
 * This file defines the complete navigation structure for the Marketing module.
 * It can be used to generate menu items for the admin dashboard navigation.
 */

export interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  description?: string;
  badge?: number | string;
  children?: NavItem[];
}

export const marketingNavigation: NavItem[] = [
  {
    id: 'marketing-dashboard',
    name: 'Marketing Dashboard',
    path: '/marketing',
    icon: '📊',
    description: 'Overview of all marketing activities',
  },
  {
    id: 'core-marketing',
    name: 'Core Marketing',
    path: '/marketing/core',
    icon: '🎯',
    description: 'Campaigns, segments, and research',
    children: [
      {
        id: 'campaigns',
        name: 'Campaigns',
        path: '/marketing/campaigns',
        icon: '🚀',
        description: 'Top-level marketing campaigns',
      },
      {
        id: 'segments',
        name: 'Segments',
        path: '/marketing/segments',
        icon: '👥',
        description: 'Target audience segments',
      },
      {
        id: 'ndp-research',
        name: 'NDP Research',
        path: '/marketing/ndp-research',
        icon: '💡',
        description: 'Need-Desire-Pain framework research',
        children: [
          {
            id: 'ndp-categories',
            name: 'Categories',
            path: '/marketing/ndp-research/categories',
            icon: '📂',
          },
          {
            id: 'ndp-topics',
            name: 'Topics',
            path: '/marketing/ndp-research/topics',
            icon: '💡',
          },
        ],
      },
      {
        id: 'personas',
        name: 'Personas',
        path: '/marketing/personas',
        icon: '🎭',
        description: 'ICP definition and mapping',
      },
    ],
  },
  {
    id: 'content-system',
    name: 'Content System',
    path: '/marketing/content',
    icon: '📝',
    description: 'Content creation and management',
    children: [
      {
        id: 'content-pillars',
        name: 'Content Pillars',
        path: '/marketing/content/pillars',
        icon: '🏛️',
        description: 'Core research topics',
      },
      {
        id: 'content',
        name: 'Content',
        path: '/marketing/content',
        icon: '📄',
        description: 'Master and repurposed content',
      },
      {
        id: 'content-ideas',
        name: 'Content Ideas',
        path: '/marketing/content/ideas',
        icon: '💭',
        description: 'Quick capture of ideas',
      },
      {
        id: 'content-calendar',
        name: 'Content Calendar',
        path: '/marketing/content/calendar',
        icon: '📅',
        description: 'Schedule and track publishing',
      },
      {
        id: 'content-tags',
        name: 'Content Tags',
        path: '/marketing/content/tags',
        icon: '🏷️',
        description: 'Content taxonomy',
      },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    path: '/marketing/whatsapp',
    icon: '💬',
    description: 'WhatsApp marketing integration',
    children: [
      {
        id: 'whatsapp-accounts',
        name: 'Accounts',
        path: '/marketing/whatsapp/accounts',
        icon: '📱',
        description: 'Account management',
      },
      {
        id: 'whatsapp-groups',
        name: 'Groups',
        path: '/marketing/whatsapp/groups',
        icon: '👥',
        description: 'Group discovery and management',
      },
      {
        id: 'whatsapp-contacts',
        name: 'Contacts',
        path: '/marketing/whatsapp/contacts',
        icon: '📇',
        description: 'Contact and persona mapping',
      },
      {
        id: 'whatsapp-messages',
        name: 'Messages',
        path: '/marketing/whatsapp/messages',
        icon: '💬',
        description: 'Message tracking',
      },
      {
        id: 'whatsapp-analytics',
        name: 'Analytics',
        path: '/marketing/whatsapp/analytics',
        icon: '📊',
        description: 'WhatsApp performance metrics',
      },
    ],
  },
  {
    id: 'social-media',
    name: 'Social Media',
    path: '/marketing/social',
    icon: '📱',
    description: 'Social media channel management',
    children: [
      {
        id: 'social-channels',
        name: 'Channels',
        path: '/marketing/social/channels',
        icon: '📺',
        description: 'LinkedIn, Facebook, Instagram, etc.',
      },
      {
        id: 'social-posts',
        name: 'Posts',
        path: '/marketing/social/posts',
        icon: '📝',
        description: 'Social media posts',
      },
      {
        id: 'social-schedule',
        name: 'Schedule',
        path: '/marketing/social/schedule',
        icon: '📅',
        description: 'Social media scheduling',
      },
      {
        id: 'social-analytics',
        name: 'Analytics',
        path: '/marketing/social/analytics',
        icon: '📊',
        description: 'Social media performance',
      },
    ],
  },
  {
    id: 'email',
    name: 'Email',
    path: '/marketing/email',
    icon: '📧',
    description: 'Email marketing campaigns',
    children: [
      {
        id: 'email-campaigns',
        name: 'Campaigns',
        path: '/marketing/email/campaigns',
        icon: '📬',
        description: 'Email campaigns',
      },
      {
        id: 'email-templates',
        name: 'Templates',
        path: '/marketing/email/templates',
        icon: '📝',
        description: 'Email templates',
      },
      {
        id: 'email-lists',
        name: 'Lists',
        path: '/marketing/email/lists',
        icon: '📋',
        description: 'Subscriber lists',
      },
      {
        id: 'email-schedule',
        name: 'Schedule',
        path: '/marketing/email/schedule',
        icon: '📅',
        description: 'Email scheduling',
      },
      {
        id: 'email-analytics',
        name: 'Analytics',
        path: '/marketing/email/analytics',
        icon: '📊',
        description: 'Email performance',
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics & KPIs',
    path: '/marketing/analytics',
    icon: '📊',
    description: 'Marketing performance and insights',
    children: [
      {
        id: 'analytics-kpis',
        name: 'Marketing KPIs',
        path: '/marketing/analytics/kpis',
        icon: '📈',
        description: 'Overall marketing metrics',
      },
      {
        id: 'analytics-performance',
        name: 'Performance',
        path: '/marketing/analytics/performance',
        icon: '📉',
        description: 'Campaign and content performance',
      },
      {
        id: 'analytics-reports',
        name: 'Reports',
        path: '/marketing/analytics/reports',
        icon: '📊',
        description: 'Marketing reports',
      },
      {
        id: 'analytics-goals',
        name: 'Goals',
        path: '/marketing/analytics/goals',
        icon: '🎯',
        description: 'Marketing goals and targets',
      },
    ],
  },
];

/**
 * Flatten navigation structure for easy lookup
 */
export function flattenNavigation(items: NavItem[]): NavItem[] {
  const result: NavItem[] = [];
  
  function traverse(item: NavItem) {
    result.push(item);
    if (item.children) {
      item.children.forEach(traverse);
    }
  }
  
  items.forEach(traverse);
  return result;
}

/**
 * Find navigation item by path
 */
export function findNavItemByPath(path: string): NavItem | null {
  const flat = flattenNavigation(marketingNavigation);
  return flat.find(item => item.path === path) || null;
}

/**
 * Get breadcrumb path for a given route
 */
export function getBreadcrumbPath(path: string): NavItem[] {
  const flat = flattenNavigation(marketingNavigation);
  const item = flat.find(i => path.startsWith(i.path));
  
  if (!item) return [];
  
  const breadcrumb: NavItem[] = [];
  let current: NavItem | undefined = item;
  
  while (current) {
    breadcrumb.unshift(current);
    // Find parent
    current = flat.find(i => 
      i.children?.some(c => c.id === current?.id)
    );
  }
  
  return breadcrumb;
}

