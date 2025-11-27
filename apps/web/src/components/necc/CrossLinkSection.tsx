import Link from 'next/link';
import { ArrowRight, TrendingUp, Calendar, MapPin } from 'lucide-react';

interface CrossLink {
  title: string;
  href: string;
  description?: string;
  icon?: 'trend' | 'calendar' | 'location';
}

interface CrossLinkSectionProps {
  title: string;
  links: CrossLink[];
  className?: string;
}

const iconMap = {
  trend: TrendingUp,
  calendar: Calendar,
  location: MapPin,
};

export function CrossLinkSection({ title, links, className = '' }: CrossLinkSectionProps) {
  if (links.length === 0) return null;

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {links.map((link, index) => {
          const Icon = link.icon ? iconMap[link.icon] : ArrowRight;
          return (
            <Link
              key={index}
              href={link.href}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors group"
            >
              <div className="flex-shrink-0">
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {link.title}
                </p>
                {link.description && (
                  <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

