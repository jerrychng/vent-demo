import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  variant?:
    | "primary"
    | "primaryOutline"
    | "secondary"
    | "outline"
    | "green"
    | "transparent";
  size?: "sm" | "md" | "lg";
  id?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  variant = "primary",
  size = "md",
  id,
}) => {
  const baseClasses =
    "rounded-lg hover:cursor-pointer flex flex-nowrap flex flex-row justify-center items-center min-w-fit";

  const variantClasses = {
    // explicit border-primary ensures the border uses the primary color (was just `border` before)
    primary: "border border-primary bg-primary text-accent",
    primaryOutline:
      "border border-primary text-dark-primary hover:bg-primary hover:text-accent",
    secondary: "bg-gray-600 text-white",
    outline: "border border-gray-300 text-gray-700",
    green: "bg-light-green text-dark-green border border-highlight-green",
    transparent: "bg-transparent text-dark-primary",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm font-semibold",
    md: "px-5 py-3 font-semibold",
    lg: "px-8 py-3 rounded-xl font-bold",
  };

  // Use Tailwind's disabled: utilities so styles apply when the button has the disabled attribute.
  const disabledStateClasses =
    "disabled:bg-background disabled:text-text-dark-gray disabled:opacity-70 disabled:cursor-not-allowed disabled:border-gray";

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledStateClasses} ${className} `}
    >
      {children}
    </button>
  );
};

export default Button;
