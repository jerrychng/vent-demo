import React from "react";
import aspectLogo from "../assets/aspect-logo-primary.svg";
import { ASPECT_WEB_URL } from "../environment";

interface MobileRateDisplayProps {
  halfHourlyRate: number;
  showRate?: boolean;
}

const MobileRateDisplay: React.FC<MobileRateDisplayProps> = ({
  halfHourlyRate,
  showRate = false,
}) => {
  const shouldShowRate = showRate && halfHourlyRate > 0;
  if (!shouldShowRate) {
    return (
      <a
        href={ASPECT_WEB_URL}
        target=""
        rel="noopener noreferrer"
        className="transition hover:opacity-80"
      >
        <img src={aspectLogo} alt="Aspect Logo" className="h-8 w-auto" />
      </a>
    );
  }

  return (
    <>
      {/* Show rate on mobile (< sm), hide on sm and above */}
      <div className="flex sm:hidden flex-col items-start justify-center">
        <p className="text-dark-primary">Your best rate:</p>
        <p className="text-2xl font-bold text-primary">
          £{halfHourlyRate.toFixed(2)}
        </p>
      </div>
      {/* Show logo on sm and above, hide on mobile */}
      <a
        href={ASPECT_WEB_URL}
        target=""
        rel="noopener noreferrer"
        className="transition hover:opacity-80"
      >
        <img
          src={aspectLogo}
          alt="Aspect Logo"
          className="hidden sm:block h-10 w-auto"
        />
      </a>
    </>
  );
};

export default MobileRateDisplay;
