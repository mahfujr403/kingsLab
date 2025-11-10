import React from 'react';
import { motion } from 'motion/react';

interface AdminLoadingSpinnerProps {
  message?: string;
}

export const AdminLoadingSpinner: React.FC<AdminLoadingSpinnerProps> = ({ 
  message = 'Loading...' 
}) => {
  // Create orbital animation with multiple circles
  const orbitalVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex items-center justify-center py-16 md:py-24">
      <div className="text-center">
        {/* Orbital Loading Animation */}
        <div className="relative mx-auto mb-6 w-20 h-20 md:w-24 md:h-24">
          {/* Center pulse */}
          <motion.div 
            variants={pulseVariants}
            animate="animate"
            className="absolute inset-0 m-auto w-4 h-4 bg-blue-500 rounded-full"
          />
          
          {/* Outer ring */}
          <motion.div
            variants={orbitalVariants}
            animate="animate"
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full -ml-1.5" />
          </motion.div>
          
          {/* Middle ring */}
          <motion.div
            variants={orbitalVariants}
            animate="animate"
            style={{ rotate: 120 }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full -ml-1.5" />
          </motion.div>
          
          {/* Inner ring */}
          <motion.div
            variants={orbitalVariants}
            animate="animate"
            style={{ rotate: 240 }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-gradient-to-br from-pink-500 to-blue-600 rounded-full -ml-1.5" />
          </motion.div>
        </div>

        <motion.p 
          className="text-gray-600 text-sm md:text-base"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

// Alternative compact loading spinner for inline use
export const CompactLoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <div className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">Loading...</span>
    </div>
  );
};
