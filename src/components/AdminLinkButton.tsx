import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AdminLinkButtonProps {
  className?: string;
  variant?: "footer" | "standalone";
  showText?: boolean;
}

export function AdminLinkButton({ 
  className = "", 
  variant = "footer",
  showText = true 
}: AdminLinkButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setIsNavigating(true);
    // Use setTimeout to ensure state updates before navigation
    setTimeout(() => navigate('/admin/login'), 0);
  };

  if (variant === "footer") {
    return (
      <>
        {/* Minimal loading overlay */}
        {isNavigating && (
          <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={isNavigating}
          className={`flex items-center gap-1.5 hover:text-blue-400 transition-colors disabled:opacity-70 ${className}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {showText && <span>{isNavigating ? "Loading..." : "Admin"}</span>}
        </button>
      </>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isNavigating}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 ${className}`}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      {showText && <span>{isNavigating ? "Loading..." : "Admin Panel"}</span>}
    </button>
  );
}
