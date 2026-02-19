import React from "react";
import SvgIcon from "./SvgIcon";
import NavHeader from "../pages/navigation/NavHeader";

interface HeroBannerProps {
  title: string;
  icon: React.ComponentType<any> | string;
  background?: string;
  showNavHeader?: boolean;
  className?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  icon,
  background,
  showNavHeader = true,
  className = "",
}) => {
  return (
    <div
      className={`relative w-full h-[130px] z-10 grid grid-cols-2 bg-cover bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: background ? `url(${background})` : undefined }}
      role="img"
      aria-label={`${title} header`}
    >
      <div className="absolute inset-0 pointer-events-none bg-[#27549D]/50" />
      <div className="p-8 flex items-end">
        <p className="text-accent text-xl leading-none z-50 flex gap-2 items-center">
          <SvgIcon svg={icon} size={20} className="inline-block" />
          {title}
        </p>
      </div>

      {showNavHeader && (
        <div className="pt-4 pointer-events-auto relative z-[120]">
          <NavHeader />
        </div>
      )}
    </div>
  );
};

export default HeroBanner;