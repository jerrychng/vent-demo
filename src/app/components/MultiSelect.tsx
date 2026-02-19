import React, { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  variant?: "default" | "blue" | "dark-blue";
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select options",
  className = "",
  disabled = false,
  required = false,
  error,
  label,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Display selected count or placeholder
  const displayText =
    value.length > 0 ? `${value.length} selected` : placeholder;

  // Variant styles
  const variantStyles = {
    default: {
      container: "bg-white",
      button: `border ${
        error
          ? "border-red-300 focus:ring-red-500"
          : "border-gray-300 focus:ring-blue-500"
      } ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:bg-background"}`,
      text: value.length > 0 ? "text-gray-900" : "text-gray-500",
      icon: "text-gray-600",
      dropdown: "bg-white border-x border-b border-gray-300",
      optionRow: "hover:bg-background",
      optionText: "text-gray-900",
      checkbox: "text-blue-600",
      noOptions: "text-gray-500",
    },
    blue: {
      container: "bg-white",
      button: `border ${
        error ? "border-red-300" : "border-primary"
      } ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:bg-background bg-white"}`,
      text: value.length > 0 ? "text-primary" : "text-primary/60",
      icon: "text-primary",
      dropdown: "bg-white border-x border-b border-primary",
      optionRow: "hover:bg-background",
      optionText: "text-dark-primary",
      checkbox: "text-primary",
      noOptions: "text-primary",
    },
    "dark-blue": {
      container: "bg-white",
      button: `border ${
        error ? "border-red-300" : "border-dark-primary"
      } ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:bg-background bg-white"}`,
      text: "text-dark-primary",
      icon: "text-dark-primary",
      dropdown: "bg-white border-x border-b border-dark-primary",
      optionRow: "hover:bg-background",
      optionText: "text-dark-primary",
      checkbox: "text-dark-primary",
      noOptions: "text-dark-primary",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2">
          {label}
          {required && <span className="text-dark-red ml-1">*</span>}
        </label>
      )}
      <div className={`relative ${styles.container}`} ref={dropdownRef}>
        <div
          onClick={toggleDropdown}
          className={`w-full px-4 py-2 rounded-md cursor-pointer flex items-center justify-between ${styles.button} ${className}`}
        >
          <span className={styles.text}>{displayText}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`w-8 h-8 ${styles.icon} transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div
            className={`absolute z-10 w-full mt-0 ${styles.dropdown} rounded-md shadow-lg max-h-[400px] overflow-y-auto`}
          >
            {options.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 px-4 py-2 ${styles.optionRow} cursor-pointer transition-colors`}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => handleCheckboxChange(option.value)}
                  style={{ accentColor: "var(--color-primary)" }}
                  className={`w-4 h-4 ${styles.checkbox} rounded cursor-pointer bg-dark-primary`}
                />
                <span className={`text-sm ${styles.optionText}`}>
                  {option.label}
                </span>
              </label>
            ))}
            {options.length === 0 && (
              <div className={`px-4 py-3 text-sm ${styles.noOptions}`}>
                No options available
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-dark-red">{error}</p>}
    </div>
  );
};

export default MultiSelect;
