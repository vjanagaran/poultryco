import { create } from 'zustand';

export type DiscoveryType = 'all' | 'members' | 'businesses' | 'products' | 'organizations' | 'events' | 'jobs';
export type ViewMode = 'grid' | 'list' | 'map';
export type SortOption = 'relevant' | 'recent' | 'rating' | 'nearby' | 'price_low' | 'price_high';

export interface FilterChip {
  key: string;
  label: string;
  value: any;
}

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

interface DiscoveryFilters {
  // Location
  location?: string;
  city?: string;
  state?: string;
  radius?: number;
  
  // Member filters
  role?: string;
  skills?: string[];
  verified?: boolean;
  hasPhoto?: boolean;
  connectionDegree?: string[];
  
  // Business filters
  businessType?: string;
  specializations?: string[];
  certifications?: string[];
  hasProducts?: boolean;
  
  // Product filters
  category?: string;
  subCategory?: string;
  productType?: string;
  birdTypes?: string[];
  ageGroups?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  
  // Organization filters
  organizationType?: string;
  memberCountMin?: number;
  memberCountMax?: number;
  hasEvents?: boolean;
  
  // Event filters
  eventType?: string;
  format?: string;
  dateFrom?: string;
  dateTo?: string;
  isFree?: boolean;
  
  // Job filters
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
}

interface DiscoveryState {
  // Filters
  filters: DiscoveryFilters;
  activeFilters: FilterChip[];
  
  // Search
  searchQuery: string;
  searchType: DiscoveryType;
  
  // Location
  userLocation: UserLocation | null;
  
  // Results
  results: any[];
  totalCount: number;
  currentPage: number;
  hasMore: boolean;
  
  // UI State
  viewMode: ViewMode;
  sortBy: SortOption;
  isLoading: boolean;
  isSidebarOpen: boolean;
  
  // Actions
  setFilter: (key: keyof DiscoveryFilters, value: any) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSearchType: (type: DiscoveryType) => void;
  setUserLocation: (location: UserLocation | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortOption) => void;
  setResults: (results: any[], totalCount: number, hasMore: boolean) => void;
  appendResults: (results: any[], hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  nextPage: () => void;
  resetPagination: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  // Initial state
  filters: {},
  activeFilters: [],
  searchQuery: '',
  searchType: 'all',
  userLocation: null,
  results: [],
  totalCount: 0,
  currentPage: 0,
  hasMore: false,
  viewMode: 'grid',
  sortBy: 'relevant',
  isLoading: false,
  isSidebarOpen: true,
  
  // Actions
  setFilter: (key, value) => {
    set((state) => {
      const newFilters = { ...state.filters, [key]: value };
      const newActiveFilters = Object.entries(newFilters)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => ({
          key: k,
          label: formatFilterLabel(k, v),
          value: v,
        }));
      
      return {
        filters: newFilters,
        activeFilters: newActiveFilters,
        currentPage: 0,
      };
    });
  },
  
  removeFilter: (key) => {
    set((state) => {
      const newFilters = { ...state.filters };
      delete newFilters[key as keyof DiscoveryFilters];
      const newActiveFilters = state.activeFilters.filter(f => f.key !== key);
      
      return {
        filters: newFilters,
        activeFilters: newActiveFilters,
        currentPage: 0,
      };
    });
  },
  
  clearFilters: () => {
    set({
      filters: {},
      activeFilters: [],
      currentPage: 0,
    });
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 0 });
  },
  
  setSearchType: (type) => {
    set({ searchType: type, currentPage: 0 });
  },
  
  setUserLocation: (location) => {
    set({ userLocation: location });
  },
  
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },
  
  setSortBy: (sort) => {
    set({ sortBy: sort, currentPage: 0 });
  },
  
  setResults: (results, totalCount, hasMore) => {
    set({ results, totalCount, hasMore, currentPage: 0 });
  },
  
  appendResults: (results, hasMore) => {
    set((state) => ({
      results: [...state.results, ...results],
      hasMore,
    }));
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },
  
  setSidebarOpen: (open) => {
    set({ isSidebarOpen: open });
  },
  
  nextPage: () => {
    set((state) => ({ currentPage: state.currentPage + 1 }));
  },
  
  resetPagination: () => {
    set({ currentPage: 0, results: [], hasMore: false });
  },
}));

// Helper function to format filter labels
function formatFilterLabel(key: string, value: any): string {
  if (Array.isArray(value)) {
    return `${formatKey(key)}: ${value.join(', ')}`;
  }
  
  if (typeof value === 'boolean') {
    return formatKey(key);
  }
  
  if (key.includes('Min') || key.includes('Max')) {
    return `${formatKey(key)}: ${value}`;
  }
  
  return `${formatKey(key)}: ${value}`;
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

