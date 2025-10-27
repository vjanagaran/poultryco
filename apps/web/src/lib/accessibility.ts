/**
 * Accessibility utilities for PoultryCo platform
 */

// Screen reader only styles
export const srOnly = "absolute -top-px left-0 w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0";

// Focus visible styles for keyboard navigation
export const focusRing = {
  base: "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  primary: "focus-visible:ring-primary",
  secondary: "focus-visible:ring-secondary",
  destructive: "focus-visible:ring-destructive",
};

// Skip to main content link
export function SkipToContent() {
  return `
    <a
      href="#main-content"
      class="${srOnly} focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      Skip to main content
    </a>
  `;
}

// Announce changes to screen readers
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', srOnly);
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Generate unique IDs for form fields
let idCounter = 0;
export function useId(prefix = 'field') {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

// Trap focus within a container (useful for modals)
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  );
  const firstFocusableElement = focusableElements[0] as HTMLElement;
  const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  function handleKeyDown(e: KeyboardEvent) {
    const isTabPressed = e.key === 'Tab';

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// ARIA labels for common actions
export const ariaLabels = {
  close: 'Close',
  menu: 'Open menu',
  search: 'Search',
  loading: 'Loading',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Information',
};
