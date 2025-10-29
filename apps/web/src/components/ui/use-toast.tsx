import { useCallback, useState } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = `toast-${toastId++}`;
    
    // For now, just console log the toast
    console.log(`Toast [${variant}]: ${title} - ${description}`);
    
    // In a real implementation, you'd add to state and show UI
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);
  
  return { toast, toasts };
}
