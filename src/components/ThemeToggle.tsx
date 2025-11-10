import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [actualTheme, setActualTheme] = useState(theme);

  // Sync with actual DOM state to prevent desync
  useEffect(() => {
    // Initial sync
    const root = document.documentElement;
    const hasLight = root.classList.contains('light');
    const hasDark = root.classList.contains('dark');
    
    if (hasLight && !hasDark) {
      setActualTheme('light');
    } else if (hasDark && !hasLight) {
      setActualTheme('dark');
    }

    // Create observer to watch for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasLight = root.classList.contains('light');
          const hasDark = root.classList.contains('dark');
          
          if (hasLight && !hasDark) {
            setActualTheme('light');
          } else if (hasDark && !hasLight) {
            setActualTheme('dark');
          }
        }
      });
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Also update when theme prop changes
  useEffect(() => {
    setActualTheme(theme);
  }, [theme]);

  // Don't show toggle in admin mode
  useEffect(() => {
    const root = document.documentElement;
    if (root.hasAttribute('data-admin-mode')) {
      return; // Component will be hidden in admin mode
    }
  }, []);

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
      aria-pressed={actualTheme === 'dark'}
      role="switch"
      aria-checked={actualTheme === 'dark'}
    >
      <span className="sr-only">
        {actualTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </span>
      <motion.div
        className="w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: actualTheme === 'dark' ? 24 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        aria-hidden="true"
      >
        {actualTheme === 'light' ? (
          <Sun className="w-3 h-3 text-yellow-500" aria-hidden="true" />
        ) : (
          <Moon className="w-3 h-3 text-blue-400" aria-hidden="true" />
        )}
      </motion.div>
    </motion.button>
  );
}
