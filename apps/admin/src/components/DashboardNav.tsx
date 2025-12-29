'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { MenuGroup, Menu } from '@/lib/api/admin';
import { getCurrentAdmin } from '@/lib/api/admin';

export function DashboardNav() {
  const pathname = usePathname();
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      const { menus } = await getCurrentAdmin();
      setMenuGroups(menus);
    } catch (error) {
      console.error('Error loading menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  const renderMenu = (menu: Menu) => {
    // If menu has parent, it's a sub-menu
    if (menu.parentPath) {
      return (
        <Link
          key={menu.id}
          href={menu.path}
          className={cn(
            "flex items-center gap-3 px-4 py-2 ml-8 rounded-lg transition-colors text-sm",
            isActive(menu.path)
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <span>{menu.icon || '•'}</span>
          <span>{menu.name}</span>
        </Link>
      );
    }

    // Top-level menu - check if any sub-menu is active
    const hasActiveSubMenu = menuGroups.some(group =>
      group.menus.some(m => m.parentPath === menu.path && isActive(m.path))
    );

    return (
      <Link
        key={menu.id}
        href={menu.path}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          isActive(menu.path) || hasActiveSubMenu
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>{menu.icon || '📄'}</span>
        <span className="font-medium">{menu.name}</span>
      </Link>
    );
  };

  if (loading) {
    return (
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {menuGroups.map((group) => {
        // Filter menus for this group
        const topLevelMenus = group.menus.filter(m => !m.parentPath);
        const subMenus = group.menus.filter(m => m.parentPath);

        // Group sub-menus by parent
        const subMenusByParent = new Map<string, Menu[]>();
        subMenus.forEach(menu => {
          const parent = menu.parentPath!;
          if (!subMenusByParent.has(parent)) {
            subMenusByParent.set(parent, []);
          }
          subMenusByParent.get(parent)!.push(menu);
        });

        // Show group if it has any menus
        if (topLevelMenus.length === 0 && subMenus.length === 0) {
          return null;
        }

        return (
          <div key={group.id} className="space-y-1">
            {/* Group Header */}
            {group.name !== 'Dashboard' && (
              <div className="pt-4 pb-2 px-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.name}
                </div>
              </div>
            )}

            {/* Top-level menus */}
            {topLevelMenus.map(menu => {
              const menuSubMenus = subMenusByParent.get(menu.path) || [];
              
              return (
                <div key={menu.id} className="space-y-1">
                  {/* Top-level menu item */}
                  <Link
                    href={menu.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive(menu.path) || menuSubMenus.some(m => isActive(m.path))
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span>{menu.icon || '📄'}</span>
                    <span className="font-medium">{menu.name}</span>
                  </Link>

                  {/* Sub-menus */}
                  {menuSubMenus.length > 0 && (
                    <div className="ml-4 space-y-1">
                      {menuSubMenus
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map(subMenu => (
                          <Link
                            key={subMenu.id}
                            href={subMenu.path}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                              isActive(subMenu.path)
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            <span>{subMenu.icon || '•'}</span>
                            <span>{subMenu.name}</span>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
