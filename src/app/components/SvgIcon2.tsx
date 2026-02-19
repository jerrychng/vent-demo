import React from "react";
import { getColorFilter, type ThemeColor } from "../utils/svgColorMapping";

export interface SvgIcon2Props {
  svg: string;
  size?: number;
  color?: ThemeColor | string;
  className?: string;
  alt?: string;
}

/**
 * SvgIcon2 component for rendering SVG icons with customizable color and size
 * Uses CSS filter to apply colors to SVG images
 *
 * @param svg - SVG file path
 * @param size - Width and height in pixels (default: 24)
 * @param color - Theme color name or hex color (default: no color change)
 * @param className - Additional CSS classes to apply to the img tag
 * @param alt - Alt text for accessibility
 */
const SvgIcon2: React.FC<SvgIcon2Props> = ({
  svg,
  size = 24,
  color,
  className = "",
  alt = "Icon",
}) => {
  const filterStyle = color ? getColorFilter(color) : "none";

  return (
    <img
      src={svg}
      alt={alt}
      className={className}
      style={{
        filter: filterStyle,
        width: size,
        height: size,
      }}
    />
  );
};

export default SvgIcon2;
