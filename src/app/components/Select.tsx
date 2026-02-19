// src/components/Select.tsx
import React, { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

interface SelectOption {
  value: string;
  label: string;
  additionalInfo?: string;
}

interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  variant?: "default" | "blue" | "dark-blue";
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  required = false,
  error,
  label,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update selected label when value changes
  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);
    setSelectedLabel(selectedOption ? selectedOption.label : "");
  }, [value, options]);

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

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Variant styles
  const variantStyles = {
    default: {
      container: "",
      button: `border ${
        error
          ? "border-red-300 focus:ring-red-500"
          : "border-gray-300 focus:ring-blue-500"
      } ${
        disabled
          ? "bg-gray-100 cursor-not-allowed opacity-60"
          : "hover:border-dark bg-white"
      } `,
      text: disabled
        ? "text-gray-400"
        : selectedLabel
          ? "text-dark-primary"
          : "text-gray-500",
      icon: disabled ? "text-gray-400" : "text-gray-600",
      dropdown: "bg-white border-x border-b border-gray-300",
      option: "hover:bg-background text-text-dark-gray hover:text-dark-primary",
      selectedOption: "text-dark-primary bg-background font-bold",
    },
    blue: {
      container: "bg-white",
      button: `border ${error ? "border-red-300" : "border-primary"} ${
        disabled
          ? "bg-gray-100 cursor-not-allowed opacity-60"
          : "hover:border-primary/80 bg-white"
      }`,
      text: disabled
        ? "text-gray-400"
        : selectedLabel
          ? "text-primary"
          : "text-primary/60",
      icon: disabled ? "text-gray-400" : "text-primary",
      dropdown: "bg-white border-x border-b border-primary",
      option: "hover:bg-primary/10 text-dark-primary",
      selectedOption: "bg-white text-primary font-medium",
    },
    "dark-blue": {
      container: "bg-white",
      button: `border ${error ? "border-red-300" : "border-dark-primary"} ${
        disabled
          ? "bg-gray-100 cursor-not-allowed opacity-60"
          : "hover:border-dark-primary/80 bg-white"
      }`,
      text: disabled
        ? "text-gray-400"
        : selectedLabel
          ? "text-dark-primary"
          : "text-dark-primary/60",
      icon: disabled ? "text-gray-400" : "text-dark-primary",
      dropdown: "bg-white border-x border-b border-dark-primary",
      option: "hover:bg-dark-primary/10 text-dark-primary",
      selectedOption: "bg-white text-dark-primary font-medium",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="w-full text-dark-primary">
      {label && (
        <label className="block mb-2 text-gray-500">
          {label}
          {required && <span className="text-dark-red ml-1">*</span>}
        </label>
      )}
      <div className={`relative ${styles.container}`} ref={dropdownRef}>
        <div
          onClick={toggleDropdown}
          className={`w-full px-4 py-2 rounded-md flex items-center justify-between ${styles.button} ${className} ${
            disabled ? "pointer-events-none" : "cursor-pointer"
          } `}
          aria-disabled={disabled}
        >
          <span className={`${styles.text} truncate text-sm md:text-md`}>
            {selectedLabel || placeholder}
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`w-8 h-8 ${styles.icon} transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && !disabled && (
          <div
            className={`absolute z-10 w-full mt-1 ${styles.dropdown} rounded-md shadow-lg max-h-60 overflow-auto`}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`px-4 py-1.5 cursor-pointer truncate${
                  value === option.value ? styles.selectedOption : styles.option
                }`}
              >
                {option.label}{" "}
                <span className="ml-2 text-xs text-gray-300">
                  {option.additionalInfo}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-dark-red">{error}</p>}
    </div>
  );
};

export default Select;
