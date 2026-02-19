import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertSquareIcon,
  CheckmarkSquare02Icon,
} from "@hugeicons/core-free-icons";

type MessageBoxVariant = "default" | "caution" | "error" | "success";

interface MessageBoxProps {
  variant?: MessageBoxVariant;
  title: string;
  text?: string;
  className?: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  variant = "default",
  title,
  text,
  className = "",
}) => {
  // Define variant styles
  const variantStyles = {
    default: {
      borderColor: "border-primary",
      backgroundColor: "bg-background",
      textColor: "text-dark-primary",
      iconColor: "text-dark-primary",
      icon: AlertSquareIcon,
    },
    caution: {
      borderColor: "border-highlight-orange",
      backgroundColor: "bg-light-orange",
      textColor: "text-orange",
      iconColor: "text-highlight-orange",
      icon: AlertSquareIcon,
    },
    error: {
      borderColor: "border-highlight-red",
      backgroundColor: "bg-light-red",
      textColor: "text-dark-red",
      iconColor: "text-highlight-red",
      icon: AlertSquareIcon,
    },
    success: {
      borderColor: "border-highlight-green",
      backgroundColor: "bg-light-green",
      textColor: "text-dark-green",
      iconColor: "text-highlight-green",
      icon: CheckmarkSquare02Icon,
    },
  };

  const styles = variantStyles[variant];
  const IconComponent = styles.icon;
  const alignmentClass = text ? "items-start" : "items-center";
  return (
    <div
      className={`${styles.borderColor} border-l-4 border rounded-lg overflow-hidden ${className}`}
    >
      <div
        className={`${styles.backgroundColor} rounded-lg flex ${alignmentClass} gap-3 p-2`}
      >
        <HugeiconsIcon
          icon={IconComponent}
          className={`w-8 h-8 ${styles.iconColor} shrink-0`}
        />
        <div
          className={`flex flex-col items-start justify-center ${styles.textColor}`}
        >
          <p className="font-bold text-sm">{title}</p>
          {text && <p className="text-sm">{text}</p>}
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
