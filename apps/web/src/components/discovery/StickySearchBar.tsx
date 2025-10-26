'use client';

import { useEffect, useState } from 'react';

interface StickySearchBarProps {
  children: React.ReactNode;
}

export function StickySearchBar({ children }: StickySearchBarProps) {
  const [isSticky, setIsSticky] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Only enable sticky on mobile/tablet
      if (window.innerWidth < 1024) {
        setIsSticky(window.scrollY > 80);
      } else {
        setIsSticky(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);
  
  return (
    <div
      className={`
        transition-all duration-200 z-30
        ${isSticky 
          ? 'fixed top-0 left-0 right-0 bg-white shadow-md py-3 px-4' 
          : 'relative'
        }
      `}
    >
      {children}
    </div>
  );
}

