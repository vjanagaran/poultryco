// Temporary fix for lucide-react type compatibility with React 18
// This resolves the ForwardRefExoticComponent type issue during build
declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export type LucideProps = SVGProps<SVGSVGElement>;
  export type LucideIcon = FC<LucideProps>;
  
  export const Plus: LucideIcon;
  export const Edit2: LucideIcon;
  export const Trash2: LucideIcon;
  export const Calendar: LucideIcon;
  export const Target: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const X: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronsUpDown: LucideIcon;
  export const Search: LucideIcon;
  export const Filter: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Eye: LucideIcon;
  export const Download: LucideIcon;
  export const Upload: LucideIcon;
  export const Save: LucideIcon;
  export const Copy: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Info: LucideIcon;
  export const Settings: LucideIcon;
  export const Users: LucideIcon;
  export const FileText: LucideIcon;
  export const Image: LucideIcon;
  export const Video: LucideIcon;
  export const Link: LucideIcon;
  export const Hash: LucideIcon;
  export const Tag: LucideIcon;
  export const Folder: LucideIcon;
  export const Clock: LucideIcon;
  export const BarChart: LucideIcon;
  export const PieChart: LucideIcon;
  export const Activity: LucideIcon;
  export const Zap: LucideIcon;
  export const Bell: LucideIcon;
  export const Mail: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Share2: LucideIcon;
  export const Heart: LucideIcon;
  export const ThumbsUp: LucideIcon;
  export const Send: LucideIcon;
  export const Paperclip: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Loader: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const XCircle: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Menu: LucideIcon;
  export const Grid: LucideIcon;
  export const List: LucideIcon;
  export const Layout: LucideIcon;
  export const Maximize: LucideIcon;
  export const Minimize: LucideIcon;
  export const Columns: LucideIcon;
  export const Rows: LucideIcon;
}

