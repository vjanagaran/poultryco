'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { MenuGroup, Menu } from '@/lib/api/admin';
import { getCurrentAdmin } from '@/lib/api/admin';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ModuleSection {
  id: string;
  name: string;
  icon: string;
  order: number;
  menus: Menu[];
}

interface SubmoduleGroup {
  id: string;
  name: string;
  path: string;
  menus: Menu[];
  subSubGroups?: Map<string, Menu[]>;
}

export function DashboardNav() {
  const pathname = usePathname();
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedSubmodules, setExpandedSubmodules] = useState<Set<string>>(new Set());
  const [expandedSubSubs, setExpandedSubSubs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMenus();
  }, []);

  // Auto-expand sections that contain active menu (all 3 levels)
  useEffect(() => {
    if (menuGroups.length > 0) {
      const activeModules = new Set<string>();
      const activeSubmodules = new Set<string>();
      const activeSubSubs = new Set<string>();

      menuGroups.forEach(group => {
        if (group.slug === 'marketing') {
          group.menus.forEach(menu => {
            if (isActive(menu.path)) {
              const pathParts = menu.path.split('/').filter(Boolean);
              
              // Identify module
              const moduleInfo = identifyModuleFromPath(menu.path);
              if (moduleInfo) {
                activeModules.add(moduleInfo.id);
              }

              // Identify submodule (level 2)
              if (pathParts.length >= 3) {
                const submoduleId = `${moduleInfo?.id || 'unknown'}-${pathParts[1]}-${pathParts[2]}`;
                activeSubmodules.add(submoduleId);
              }

              // Identify sub-sub level (level 3)
              if (pathParts.length >= 4) {
                const subSubId = `${moduleInfo?.id || 'unknown'}-${pathParts[1]}-${pathParts[2]}-${pathParts[3]}`;
                activeSubSubs.add(subSubId);
              }
            }
          });
        }
      });

      setExpandedModules(activeModules);
      setExpandedSubmodules(activeSubmodules);
      setExpandedSubSubs(activeSubSubs);
    }
  }, [pathname, menuGroups]);

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

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleSubmodule = (submoduleId: string) => {
    const newExpanded = new Set(expandedSubmodules);
    if (newExpanded.has(submoduleId)) {
      newExpanded.delete(submoduleId);
    } else {
      newExpanded.add(submoduleId);
    }
    setExpandedSubmodules(newExpanded);
  };

  const toggleSubSub = (subSubId: string) => {
    const newExpanded = new Set(expandedSubSubs);
    if (newExpanded.has(subSubId)) {
      newExpanded.delete(subSubId);
    } else {
      newExpanded.add(subSubId);
    }
    setExpandedSubSubs(newExpanded);
  };

  /**
   * Identify module from path
   */
  const identifyModuleFromPath = (path: string): { id: string; name: string; icon: string } | null => {
    if (path.startsWith('/marketing/campaigns') || 
        path.startsWith('/marketing/segments') || 
        path.startsWith('/marketing/ndp-research') || 
        path.startsWith('/marketing/personas')) {
      return { id: 'core', name: 'Core Marketing', icon: '🎯' };
    }
    if (path.startsWith('/marketing/content')) {
      return { id: 'content', name: 'Content System', icon: '📝' };
    }
    if (path.startsWith('/marketing/whatsapp')) {
      return { id: 'whatsapp', name: 'WhatsApp', icon: '💬' };
    }
    if (path.startsWith('/marketing/social')) {
      return { id: 'social', name: 'Social Media', icon: '📱' };
    }
    if (path.startsWith('/marketing/email')) {
      return { id: 'email', name: 'Email', icon: '📧' };
    }
    if (path.startsWith('/marketing/analytics')) {
      return { id: 'analytics', name: 'Analytics & KPIs', icon: '📊' };
    }
    return null;
  };

  /**
   * Identify module sections based on path patterns
   */
  const identifyModules = (menus: Menu[]): ModuleSection[] => {
    const moduleMap = new Map<string, ModuleSection>();

    const modulePatterns = [
      { id: 'core', name: 'Core Marketing', icon: '🎯', order: 10, pathMatch: (path: string) => 
        path.startsWith('/marketing/campaigns') || 
        path.startsWith('/marketing/segments') || 
        path.startsWith('/marketing/ndp-research') || 
        path.startsWith('/marketing/personas') },
      { id: 'content', name: 'Content System', icon: '📝', order: 20, pathMatch: (path: string) => 
        path.startsWith('/marketing/content') },
      { id: 'whatsapp', name: 'WhatsApp', icon: '💬', order: 30, pathMatch: (path: string) => 
        path.startsWith('/marketing/whatsapp') },
      { id: 'social', name: 'Social Media', icon: '📱', order: 40, pathMatch: (path: string) => 
        path.startsWith('/marketing/social') },
      { id: 'email', name: 'Email', icon: '📧', order: 50, pathMatch: (path: string) => 
        path.startsWith('/marketing/email') },
      { id: 'analytics', name: 'Analytics & KPIs', icon: '📊', order: 60, pathMatch: (path: string) => 
        path.startsWith('/marketing/analytics') },
    ];

    menus.forEach(menu => {
      if (menu.path === '/marketing' && !menu.parentPath) {
        return;
      }

      for (const pattern of modulePatterns) {
        if (pattern.pathMatch(menu.path)) {
          if (!moduleMap.has(pattern.id)) {
            moduleMap.set(pattern.id, {
              id: pattern.id,
              name: pattern.name,
              icon: pattern.icon,
              order: pattern.order,
              menus: [],
            });
          }
          moduleMap.get(pattern.id)!.menus.push(menu);
          break;
        }
      }
    });

    moduleMap.forEach(module => {
      module.menus.sort((a, b) => a.displayOrder - b.displayOrder);
    });

    return Array.from(moduleMap.values()).sort((a, b) => a.order - b.order);
  };

  /**
   * Group menus by submodule (level 2) and sub-sub (level 3)
   */
  const groupMenusHierarchically = (menus: Menu[]): Map<string, SubmoduleGroup> => {
    const groups = new Map<string, SubmoduleGroup>();

    menus.forEach(menu => {
      const pathParts = menu.path.split('/').filter(Boolean);
      
      // Determine grouping key
      let groupKey = 'root';
      let groupName = 'Root';
      let groupPath = '';

      if (pathParts.length >= 3) {
        // Level 2: e.g., /marketing/whatsapp/accounts
        groupKey = `${pathParts[1]}/${pathParts[2]}`;
        groupName = pathParts[2]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        groupPath = `/${pathParts[0]}/${pathParts[1]}/${pathParts[2]}`;
      } else if (pathParts.length === 2) {
        // Direct menu item under module
        groupKey = 'root';
        groupName = 'Root';
        groupPath = '';
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey,
          name: groupName,
          path: groupPath,
          menus: [],
          subSubGroups: new Map(),
        });
      }

      const group = groups.get(groupKey)!;

      // Check for sub-sub level (level 3)
      if (pathParts.length >= 4) {
        // e.g., /marketing/whatsapp/accounts/settings
        const subSubKey = pathParts[3];
        if (!group.subSubGroups!.has(subSubKey)) {
          group.subSubGroups!.set(subSubKey, []);
        }
        group.subSubGroups!.get(subSubKey)!.push(menu);
      } else {
        // Direct menu item in submodule
        group.menus.push(menu);
      }
    });

    return groups;
  };

  /**
   * Remove redundant prefix from menu name based on context
   */
  const cleanMenuName = (menuName: string, moduleId?: string, submoduleName?: string): string => {
    // For Content System module, remove "Content " prefix
    if (moduleId === 'content' && menuName.startsWith('Content ')) {
      return menuName.replace(/^Content /, '');
    }
    
    // For WhatsApp module, remove "WhatsApp " prefix
    if (moduleId === 'whatsapp' && menuName.startsWith('WhatsApp ')) {
      return menuName.replace(/^WhatsApp /, '');
    }
    
    // For Social Media module, remove "Social " prefix
    if (moduleId === 'social' && menuName.startsWith('Social ')) {
      return menuName.replace(/^Social /, '');
    }
    
    // For Email module, remove "Email " prefix
    if (moduleId === 'email' && menuName.startsWith('Email ')) {
      return menuName.replace(/^Email /, '');
    }
    
    // For Analytics module, remove "Marketing " prefix if present
    if (moduleId === 'analytics' && menuName.startsWith('Marketing ')) {
      return menuName.replace(/^Marketing /, '');
    }
    
    // If submodule name matches the start of menu name, remove it
    if (submoduleName && menuName.toLowerCase().startsWith(submoduleName.toLowerCase() + ' ')) {
      return menuName.substring(submoduleName.length + 1);
    }
    
    return menuName;
  };

  /**
   * Render menu item with proper styling
   */
  const renderMenuItem = (menu: Menu, level: number = 0, moduleId?: string, submoduleName?: string) => {
    const active = isActive(menu.path);
    const indentClass = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : level === 2 ? 'pl-12' : 'pl-16';
    const textSize = 'text-sm';
    const iconSize = level === 0 ? 'text-base' : 'text-sm';
    const displayName = cleanMenuName(menu.name, moduleId, submoduleName);

    return (
      <Link
        key={menu.id}
        href={menu.path}
        className={cn(
          "flex items-center gap-2.5 py-1.5 rounded transition-colors",
          indentClass,
          textSize,
          active
            ? "bg-blue-50 text-blue-700 font-medium"
            : "text-gray-700 hover:bg-gray-50"
        )}
      >
        <span className={cn(iconSize, "flex-shrink-0")}>{menu.icon || '•'}</span>
        <span className="truncate">{displayName}</span>
      </Link>
    );
  };

  /**
   * Render marketing module with 3-level hierarchy
   */
  const renderMarketingModule = (group: MenuGroup) => {
    const dashboardMenu = group.menus.find(m => m.path === '/marketing' && !m.parentPath);
    const marketingMenus = group.menus.filter(m => m.path !== '/marketing' || m.parentPath);
    const modules = identifyModules(marketingMenus);

    return (
      <div className="space-y-0.5">
        {/* Marketing Dashboard */}
        {dashboardMenu && (
          <Link
            href={dashboardMenu.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors mb-1",
              isActive(dashboardMenu.path)
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-gray-900 hover:bg-gray-50 font-medium"
            )}
          >
            <span className="text-lg flex-shrink-0">{dashboardMenu.icon || '📊'}</span>
            <span>{dashboardMenu.name}</span>
          </Link>
        )}

        {/* Module Sections */}
        {modules.length > 0 && (
          <div className="space-y-0.5">
            {modules.map(module => {
              const isExpanded = expandedModules.has(module.id);
              const hasActiveMenu = module.menus.some(m => isActive(m.path));
              const shouldHighlight = hasActiveMenu;

              // Group menus hierarchically
              const submoduleGroups = groupMenusHierarchically(module.menus);

              return (
                <div key={module.id} className="space-y-0.5">
                  {/* Module Header - Level 1 */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left",
                      shouldHighlight && !isExpanded
                        ? "bg-gray-50 text-gray-900"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-base flex-shrink-0">{module.icon}</span>
                      <span className="font-medium text-sm truncate">{module.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>

                  {/* Module Content - Levels 2 & 3 */}
                  {isExpanded && (
                    <div className="space-y-0.5 pl-2">
                      {Array.from(submoduleGroups.entries())
                        .sort(([keyA], [keyB]) => {
                          if (keyA === 'root') return -1;
                          if (keyB === 'root') return 1;
                          return keyA.localeCompare(keyB);
                        })
                        .map(([submoduleKey, submoduleGroup]) => {
                          // Check if this submodule has sub-sub groups
                          const hasSubSubGroups = submoduleGroup.subSubGroups && submoduleGroup.subSubGroups.size > 0;
                          const submoduleId = `${module.id}-${submoduleKey}`;
                          const isSubmoduleExpanded = expandedSubmodules.has(submoduleId);
                          const submoduleHasActive = submoduleGroup.menus.some(m => isActive(m.path)) ||
                            (hasSubSubGroups && Array.from(submoduleGroup.subSubGroups!.values()).some(menus => 
                              menus.some(m => isActive(m.path))
                            ));

                          // If root level (direct menu items)
                          if (submoduleKey === 'root') {
                            return (
                              <div key={submoduleKey} className="space-y-0.5">
                                {submoduleGroup.menus.map(menu => renderMenuItem(menu, 1, module.id))}
                              </div>
                            );
                          }

                          // Submodule with potential sub-sub items
                          // Check if we should skip the submodule header (when menu name matches submodule name after cleaning)
                          const shouldSkipSubmoduleHeader = !hasSubSubGroups && 
                            submoduleGroup.menus.length === 1 &&
                            cleanMenuName(submoduleGroup.menus[0].name, module.id, submoduleGroup.name).toLowerCase() === 
                            submoduleGroup.name.toLowerCase();

                          return (
                            <div key={submoduleKey} className="space-y-0.5">
                              {/* Submodule Header - Level 2 (skip if redundant) */}
                              {!shouldSkipSubmoduleHeader && (
                                <>
                                  {hasSubSubGroups ? (
                                    <button
                                      onClick={() => toggleSubmodule(submoduleId)}
                                      className={cn(
                                        "w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-colors text-left",
                                        submoduleHasActive && !isSubmoduleExpanded
                                          ? "bg-gray-50 text-gray-800"
                                          : "text-gray-600 hover:bg-gray-50"
                                      )}
                                    >
                                      <span className="font-medium text-sm truncate">{submoduleGroup.name}</span>
                                      {isSubmoduleExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                      )}
                                    </button>
                                  ) : (
                                    // If no sub-sub groups, make it a link
                                    <Link
                                      href={submoduleGroup.path}
                                      className={cn(
                                        "flex items-center px-3 py-1.5 rounded-md transition-colors text-sm",
                                        isActive(submoduleGroup.path)
                                          ? "bg-blue-50 text-blue-700 font-medium"
                                          : "text-gray-600 hover:bg-gray-50"
                                      )}
                                    >
                                      <span>{submoduleGroup.name}</span>
                                    </Link>
                                  )}
                                </>
                              )}

                              {/* Submodule Content */}
                              {hasSubSubGroups && (
                                <div className="space-y-0.5">
                                  {/* Direct menu items in submodule */}
                                  {submoduleGroup.menus.length > 0 && (
                                    <div className="space-y-0.5 pl-2">
                                      {submoduleGroup.menus.map(menu => renderMenuItem(menu, 2, module.id, submoduleGroup.name))}
                                    </div>
                                  )}

                                  {/* Sub-sub groups - Level 3 */}
                                  {isSubmoduleExpanded && submoduleGroup.subSubGroups && (
                                    <div className="space-y-0.5 pl-2">
                                      {Array.from(submoduleGroup.subSubGroups.entries()).map(([subSubKey, subSubMenus]) => {
                                        const subSubId = `${submoduleId}-${subSubKey}`;
                                        const isSubSubExpanded = expandedSubSubs.has(subSubId);
                                        const subSubHasActive = subSubMenus.some(m => isActive(m.path));
                                        const subSubName = subSubKey
                                          .split('-')
                                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                          .join(' ');

                                        return (
                                          <div key={subSubKey} className="space-y-0.5">
                                            <button
                                              onClick={() => toggleSubSub(subSubId)}
                                              className={cn(
                                                "w-full flex items-center justify-between px-3 py-1 rounded-md transition-colors text-left",
                                                subSubHasActive && !isSubSubExpanded
                                                  ? "bg-gray-50 text-gray-700"
                                                  : "text-gray-600 hover:bg-gray-50"
                                              )}
                                            >
                                              <span className="text-xs font-medium truncate">{subSubName}</span>
                                              {isSubSubExpanded ? (
                                                <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                              ) : (
                                                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                              )}
                                            </button>
                                            {isSubSubExpanded && (
                                              <div className="space-y-0.5 pl-2">
                                                {subSubMenus.map(menu => renderMenuItem(menu, 3, module.id, subSubName))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* If no sub-sub groups, show direct menu items */}
                              {!hasSubSubGroups && submoduleGroup.menus.length > 0 && (
                                <div className={cn("space-y-0.5", shouldSkipSubmoduleHeader ? "" : "pl-2")}>
                                  {submoduleGroup.menus.map(menu => renderMenuItem(menu, shouldSkipSubmoduleHeader ? 1 : 2, module.id, submoduleGroup.name))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render regular menu group (non-marketing)
   */
  const renderRegularGroup = (group: MenuGroup) => {
    const topLevelMenus = group.menus.filter(m => !m.parentPath);
    const subMenus = group.menus.filter(m => m.parentPath);

    const subMenusByParent = new Map<string, Menu[]>();
    subMenus.forEach(menu => {
      const parent = menu.parentPath!;
      if (!subMenusByParent.has(parent)) {
        subMenusByParent.set(parent, []);
      }
      subMenusByParent.get(parent)!.push(menu);
    });

    if (topLevelMenus.length === 0 && subMenus.length === 0) {
      return null;
    }

    return (
      <div key={group.id} className="space-y-0.5">
        {group.name !== 'Dashboard' && (
          <div className="pt-3 pb-1.5 px-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {group.name}
            </div>
          </div>
        )}

        {topLevelMenus.map(menu => {
          const menuSubMenus = subMenusByParent.get(menu.path) || [];
          const hasActive = isActive(menu.path) || menuSubMenus.some(m => isActive(m.path));

          return (
            <div key={menu.id} className="space-y-0.5">
              <Link
                href={menu.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  hasActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-900 hover:bg-gray-50 font-medium"
                )}
              >
                <span className="text-base flex-shrink-0">{menu.icon || '📄'}</span>
                <span>{menu.name}</span>
              </Link>

              {menuSubMenus.length > 0 && (
                <div className="space-y-0.5 pl-4">
                  {menuSubMenus
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map(subMenu => (
                      <Link
                        key={subMenu.id}
                        href={subMenu.path}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors text-sm",
                          isActive(subMenu.path)
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-sm flex-shrink-0">{subMenu.icon || '•'}</span>
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
  };

  if (loading) {
    return (
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {menuGroups.map((group) => {
        if (group.slug === 'marketing') {
          return (
            <div key={group.id}>
              {group.name !== 'Dashboard' && (
                <div className="pt-3 pb-1.5 px-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.name}
                  </div>
                </div>
              )}
              {renderMarketingModule(group)}
            </div>
          );
        }

        return renderRegularGroup(group);
      })}
    </nav>
  );
}
