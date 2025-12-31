'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { marketingNavigation, type NavItem } from '@/lib/navigation/marketing-nav';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function MarketingNav() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['core-marketing', 'content-system', 'whatsapp'])
  );

  const isActive = (path: string) => {
    if (path === '/marketing') {
      return pathname === '/marketing';
    }
    return pathname.startsWith(path);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some(child => 
      isActive(child.path) || hasActiveChild(child)
    );
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const itemIsActive = isActive(item.path);
    const hasActive = hasActiveChild(item);
    const shouldHighlight = itemIsActive || hasActive;

    // Top-level section header
    if (hasChildren && level === 0) {
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleSection(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-left",
              shouldHighlight
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="font-semibold">{item.name}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {isExpanded && (
            <div className="ml-4 space-y-1">
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Regular menu item
    return (
      <Link
        key={item.id}
        href={item.path}
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
          level === 1 ? "ml-4" : level === 2 ? "ml-8" : "",
          isActive(item.path)
            ? "bg-gray-100 text-gray-900 font-medium"
            : "text-gray-600 hover:bg-gray-50"
        )}
      >
        <span>{item.icon}</span>
        <span>{item.name}</span>
        {item.badge && (
          <span className="ml-auto px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      <div className="space-y-1">
        {/* Marketing Dashboard - Always visible */}
        <Link
          href="/marketing"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            isActive('/marketing')
              ? "bg-gray-100 text-gray-900"
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <span className="text-lg">📊</span>
          <span className="font-semibold">Marketing Dashboard</span>
        </Link>

        {/* Section Header */}
        <div className="pt-4 pb-2 px-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Marketing Modules
          </div>
        </div>

        {/* Navigation Items */}
        {marketingNavigation
          .filter(item => item.id !== 'marketing-dashboard')
          .map(item => renderNavItem(item))}
      </div>
    </nav>
  );
}

