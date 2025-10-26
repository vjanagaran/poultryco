'use client';

import { useEffect, useRef, useState } from 'react';

interface FilterChipsScrollableProps {
  chips: Array<{ id: string; label: string; onRemove: () => void }>;
}

export function FilterChipsScrollable({ chips }: FilterChipsScrollableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };
  
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [chips]);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  
  if (chips.length === 0) return null;
  
  return (
    <div className="relative">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 lg:hidden"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory lg:flex-wrap"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {chips.map((chip) => (
          <div
            key={chip.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm whitespace-nowrap snap-start shrink-0"
          >
            <span>{chip.label}</span>
            <button
              onClick={chip.onRemove}
              className="hover:bg-green-100 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${chip.label} filter`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        
        <button
          onClick={() => chips.forEach(chip => chip.onRemove())}
          className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm whitespace-nowrap snap-start shrink-0"
        >
          Clear all
        </button>
      </div>
      
      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 lg:hidden"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          </button>
      )}
    </div>
  );
}

