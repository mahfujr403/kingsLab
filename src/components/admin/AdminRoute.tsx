import { useEffect } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper component for admin routes that:
 * 1. Forces light theme permanently for admin panel
 * 2. Applies authentication protection
 */
export function AdminRoute({ children }: AdminRouteProps) {
  useEffect(() => {
    // Save the user's theme preference before forcing light mode
    const userTheme = localStorage.getItem('theme');
    const savedUserTheme = userTheme;
    
    // Force light theme for admin pages
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Set a flag to indicate we're in admin mode
    root.setAttribute('data-admin-mode', 'true');
    
    // Cleanup when leaving admin pages - restore user's theme
    return () => {
      root.removeAttribute('data-admin-mode');
      root.classList.remove('light');
      
      // Restore the user's actual theme preference
      if (savedUserTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    };
  }, []);
  
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
