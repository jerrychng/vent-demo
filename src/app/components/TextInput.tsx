import React, { useState, useEffect } from "react";
import { validateGeneralInput } from "../utils/generalInputValidator";

type TextInputVariant = "default" | "success" | "error";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (hasError: boolean) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  error?: string;
  label?: string;
  type?: string;
  variant?: TextInputVariant;
  customValidator?: (value: string) => { isValid: boolean; error?: string };
  validationOptions?: {
    checkXSS?: boolean;
    checkSQL?: boolean;
    checkCommandInjection?: boolean;
    checkRepeatedChars?: boolean;
    maxRepeatedChars?: number;
  };
  maxLength?: number;
  minLength?: number;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onValidationChange,
  placeholder = "Enter text",
  className = "",
  disabled = false,
  required = false,
  name = "text",
  error,
  label,
  type = "text",
  variant = "default",
  customValidator,
  validationOptions = {
    checkXSS: true,
    checkSQL: true,
    checkCommandInjection: true,
    checkRepeatedChars: true,
    maxRepeatedChars: 10,
  },
  maxLength = 128,
  minLength = 1,
}) => {
  const [validationError, setValidationError] = useState("");

  // Validate on mount if value exists - ensures errors persist across remounts
  useEffect(() => {
    if (value && value.trim()) {
      // Run general input validation
      const generalValidation = validateGeneralInput(value, {
        checkEmpty: false,
        checkXSS: validationOptions.checkXSS,
        checkSQL: validationOptions.checkSQL,
        checkCommandInjection: validationOptions.checkCommandInjection,
        checkRepeatedChars: validationOptions.checkRepeatedChars,
        maxRepeatedChars: validationOptions.maxRepeatedChars,
      });

      if (!generalValidation.isValid) {
        setValidationError(generalValidation.error || "");
        return;
      }

      // If custom validator is provided, use it
      if (customValidator) {
        const customValidation = customValidator(value);
        setValidationError(customValidation.error || "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

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

  // Disabled state takes highest precedence, then error, then variant
  const backgroundColor = disabled
    ? "bg-gray-100"
    : error || validationError
      ? "bg-light-red"
      : styles.backgroundColor;

  const textColor = disabled
    ? "text-gray-400"
    : error || validationError
      ? "text-dark-red"
      : styles.textColor;

  const borderColor = disabled
    ? "border-gray-300"
    : error || validationError
      ? "border-highlight-red"
      : styles.borderColor;

  const focusRing = disabled
    ? "focus:ring-gray-300"
    : error || validationError
      ? "focus:ring-dark-red"
      : styles.focusRing;

  // Notify parent of validation state changes
  useEffect(() => {
    if (onValidationChange) {
      const hasError = !!(error || validationError);
      onValidationChange(hasError);
    }
  }, [error, validationError, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Validate on every change
    let validationErrorMsg = "";

    // Check if field is required and empty
    if (required && !newValue.trim()) {
      validationErrorMsg = "This field is required";
      setValidationError(validationErrorMsg);
      return;
    }

    // If empty and not required, clear error and return
    if (!newValue.trim()) {
      setValidationError("");
      return;
    }

    // Run general input validation
    const generalValidation = validateGeneralInput(newValue, {
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
      return;
    }

    // If custom validator is provided, use it
    if (customValidator) {
      const customValidation = customValidator(newValue);
      validationErrorMsg = customValidation.error || "";
      setValidationError(validationErrorMsg);
    } else {
      setValidationError("");
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block mb-2 ${error || validationError ? "text-dark-red" : "text-gray-500"}`}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-invalid={!!(error || validationError)}
        className={`w-full px-4 py-3 border rounded-lg placeholder:text-sm md:placeholder:text-md ${backgroundColor} ${textColor} ${borderColor} ${focusRing} focus:outline-none focus:ring-2 transition ${
          disabled ? "cursor-not-allowed" : ""
        } ${className}`}
        disabled={disabled}
        required={required}
        name={name}
        maxLength={maxLength}
        minLength={minLength}
      />
      {(error || validationError) && (
        <p className="mt-1 text-xs text-dark-red">{error || validationError}</p>
      )}
    </div>
  );
};

export default TextInput;
