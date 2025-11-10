import { motion } from "motion/react";

export function LoadingSpinner() {
  // Create bouncing dots animation
  const bounceTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut"
  };

  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
            initial={{ y: 0 }}
            animate={{ y: [-15, 0] }}
            transition={{
              ...bounceTransition,
              delay: index * 0.1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
