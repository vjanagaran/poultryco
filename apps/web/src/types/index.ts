/**
 * Type Definitions for PoultryCo Marketing Website
 */

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  disabled?: boolean;
}

export interface FooterLinkGroup {
  title: string;
  links: NavItem[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  featured?: boolean;
  image?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
  href?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface Stat {
  value: string;
  label: string;
  description?: string;
}

export interface FormData {
  [key: string]: string | boolean | number;
}

