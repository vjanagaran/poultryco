"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={cn(
        "sticky top-0 z-[100] w-full transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-sm shadow-sm"
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="font-heading font-bold text-xl md:text-2xl text-foreground">
              PoultryCo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {siteConfig.mainNav.map((item) => (
              <div
                key={item.title}
                className="relative group"
              >
                {item.dropdown ? (
                  <>
                    <button
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                        openDropdown === item.title ? "text-primary" : "text-foreground/80"
                      )}
                      onMouseEnter={() => setOpenDropdown(item.title)}
                    >
                      {item.title}
                      <svg
                        className={cn(
                          "w-4 h-4 transition-transform",
                          openDropdown === item.title && "rotate-180"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {/* Mega Menu Dropdowns - Whom, Why, How, Impact */}
                    {openDropdown === item.title && (item.title === "Whom" || item.title === "Why" || item.title === "How" || item.title === "Impact") && (
                      <div 
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[800px] bg-white border border-border rounded-lg shadow-2xl p-6 animate-in fade-in slide-in-from-top-2 z-[110]"
                        onMouseEnter={() => setOpenDropdown(item.title)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        <div className={`grid ${item.dropdown && item.dropdown.length > 6 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                          {item.dropdown?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block p-3 rounded-lg hover:bg-muted/50 transition-all group/item"
                            >
                              <div className="font-semibold text-sm text-foreground mb-1 group-hover/item:text-primary transition-colors">
                                {subItem.title}
                              </div>
                              <div className="text-xs text-muted-foreground leading-relaxed">
                                {subItem.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Regular Dropdown - Resources & Others */}
                    {openDropdown === item.title && item.title !== "Whom" && item.title !== "Why" && item.title !== "How" && item.title !== "Impact" && item.dropdown && (
                      <div 
                        className="absolute left-0 top-full mt-2 w-64 bg-white border border-border rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-2 z-[110]"
                        onMouseEnter={() => setOpenDropdown(item.title)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        {item.dropdown?.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block px-4 py-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="font-medium text-sm text-foreground">
                              {subItem.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {subItem.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive(item.href) ? "text-primary" : "text-foreground/80"
                    )}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/register">Join now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            {siteConfig.mainNav.map((item) => (
              <div key={item.title}>
                {item.dropdown ? (
                  <>
                    <div className="font-semibold text-sm text-foreground mb-2">{item.title}</div>
                    <div className="pl-4 space-y-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block py-2 text-sm text-foreground/80 hover:text-primary transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "block py-2 text-base font-medium transition-colors",
                      isActive(item.href) ? "text-primary" : "text-foreground/80 hover:text-primary"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="outline" size="md" className="w-full" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="primary" size="md" className="w-full" asChild>
                <Link href="/register">Join now</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

