import React, { useState } from "react";
import { validateGeneralInput } from "../utils/generalInputValidator";

type TextAreaVariant = "default" | "success" | "error";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (error?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  error?: string;
  label?: string;
  rows?: number;
  limit?: number;
  variant?: TextAreaVariant;
  customValidator?: (value: string) => { isValid: boolean; error?: string }; // Custom validator function
  validationOptions?: {
    checkXSS?: boolean;
    checkSQL?: boolean;
    checkCommandInjection?: boolean;
    checkRepeatedChars?: boolean;
    maxRepeatedChars?: number;
  };
  showCharCount?: boolean; // New prop to show/hide character counter
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = "Enter your text here",
  className = "",
  disabled = false,
  required = false,
  name = "textarea",
  limit = 2000,
  error,
  label,
  rows = 6,
  variant = "default",
  customValidator,
  showCharCount = true, // Enabled by default
  validationOptions = {
    checkXSS: true,
    checkSQL: true,
    checkCommandInjection: false,
    checkRepeatedChars: true,
    maxRepeatedChars: 10,
  },
}) => {
  const [validationError, setValidationError] = useState("");

  // Define variant styles
  const variantStyles = {
    default: {
      borderColor: "border-gray-300",
      backgroundColor: "bg-white",
      textColor: "text-dark-primary",
      focusRing: "focus:ring-primary",
    },
    success: {
      borderColor: "border-dark-green",
      backgroundColor: "bg-light-green",
      textColor: "text-dark-green",
      focusRing: "focus:ring-dark-green",
    },
    error: {
      borderColor: "border-dark-red",
      backgroundColor: "bg-light-red",
      textColor: "text-dark-red",
      focusRing: "focus:ring-dark-red",
    },
  };

  const styles = variantStyles[variant];

  // Error prop takes precedence over variant styling
  const borderColor =
    error || validationError ? "border-highlight-red" : styles.borderColor;
  const textColor =
    error || validationError ? "text-dark-red" : styles.textColor;
  const focusRing =
    error || validationError ? "focus:ring-dark-red" : styles.focusRing;
  const backgroundColor =
    error || validationError ? "bg-light-red" : styles.backgroundColor;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleBlur = () => {
    let validationErrorMsg = "";

    // Check if field is required and empty
    if (required && !value.trim()) {
      validationErrorMsg = "This field is required";
      setValidationError(validationErrorMsg);
      onBlur?.(validationErrorMsg);
      return;
    }

    // If empty and not required, clear error and return
    if (!value.trim()) {
      setValidationError("");
      onBlur?.("");
      return;
    }

    // Run general input validation
    const generalValidation = validateGeneralInput(value, {
      checkEmpty: false, // Already checked above
      checkXSS: validationOptions.checkXSS,
      checkSQL: validationOptions.checkSQL,
      checkCommandInjection: validationOptions.checkCommandInjection,
      checkRepeatedChars: validationOptions.checkRepeatedChars,
      maxRepeatedChars: validationOptions.maxRepeatedChars,
    });

    if (!generalValidation.isValid) {
      validationErrorMsg = generalValidation.error || "";
      setValidationError(validationErrorMsg);
      onBlur?.(validationErrorMsg);
      return;
    }

    // If custom validator is provided, use it
    if (customValidator) {
      const customValidation = customValidator(value);
      validationErrorMsg = customValidation.error || "";
      setValidationError(validationErrorMsg);
      onBlur?.(validationErrorMsg);
    } else {
      setValidationError("");
      onBlur?.("");
    }
  };

  // Calculate remaining characters
  const remainingChars = limit - value.length;
  const isNearLimit = remainingChars <= 50;
  const isAtLimit = remainingChars <= 0;

  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-2 text-gray-500`}>
          {label}
          {required && <span className="text-dark-red ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={!!(error || validationError)}
        className={`w-full px-4 py-3 border rounded-lg placeholder:text-sm md:placeholder:text-md ${backgroundColor} ${textColor} ${borderColor} ${focusRing} focus:outline-none focus:ring-2 transition resize-vertical ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        } ${className}`}
        disabled={disabled}
        required={required}
        name={name}
        maxLength={limit}
      />

      {/* Character counter display */}
      {showCharCount && (
        <div className="mt-2 flex justify-between items-center">
          <div>
            {(error || validationError) && (
              <p className="text-xs text-dark-red">
                {error || validationError}
              </p>
            )}
          </div>
          <p
            className={`text-xs ${
              isAtLimit
                ? "text-dark-red font-semibold"
                : isNearLimit
                  ? "text-dark-red"
                  : "text-text-dark-gray"
            }`}
          >
            {value.length} / {limit}
          </p>
        </div>
      )}
    </div>
  );
};

export default TextArea;
