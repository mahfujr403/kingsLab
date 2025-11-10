import { motion } from "motion/react";

export function SkipToContent() {
  return (
    <motion.a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-violet-300 dark:focus:ring-violet-800"
      tabIndex={0}
    >
      Skip to main content
    </motion.a>
  );
}
