import React from "react";

interface LoadingSpinnerProps {
  className?: string;
  variant?: "fixed" | "absolute"; // Add variant prop
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className = "",
  variant = "fixed", // Default to fixed (current behavior)
}) => {
  const animationStyles = `
    @keyframes slideWidth {
      0% {
        width: 0;
        opacity: 1;
      }
      50% {
        width: 100%;
        opacity: 1;
      }
      100% {
        width: 0;
        opacity: 1;
      }
    }
    .loading-bar-1 {
      animation: slideWidth 1.2s ease-in-out infinite;
    }
    .loading-bar-2 {
      animation: slideWidth 1.2s ease-in-out infinite 0.2s;
    }
    .loading-bar-3 {
      animation: slideWidth 1.2s ease-in-out infinite 0.4s;
    }
  `;

  const positionClass = variant === "fixed" ? "fixed" : "absolute";

  return (
    <>
      <style>{animationStyles}</style>
      <div
        className={`${positionClass} inset-0 z-50 flex items-center justify-center bg-white/50 pointer-events-none ${className}`}
      >
        <div className="flex flex-col items-center justify-center">
          {/* Rectangular container with 3 animated bars */}
          <div className="w-40 h-30 rounded-lg flex flex-col items-center justify-center gap-4 bg-white shadow-lg p-4">
            <div className="w-12 flex flex-col gap-2 mb-2">
              {/* Animated bar 1 */}
              <div className="loading-bar-1 h-1.5 bg-primary rounded"></div>

              {/* Animated bar 2 */}
              <div className="loading-bar-2 h-1.5 bg-primary rounded"></div>

              {/* Animated bar 3 */}
              <div className="loading-bar-3 h-1.5 bg-primary rounded"></div>
            </div>
            {/* Processing text */}
            <p className="text-dark-primary font-semibold text-sm">
              Processing...
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingSpinner;
