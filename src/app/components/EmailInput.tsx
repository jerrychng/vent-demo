// src/components/EmailInput.tsx
import React, { useState, useEffect } from "react";
import { validateEmail } from "../utils/emailValidator";
import { validateGeneralInput } from "../utils/generalInputValidator";
import { VALIDATION_LIMITS } from "../constants/validation";

type EmailInputVariant = "default" | "success" | "error";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  error?: string;
  label?: string;
  labelClassName?: string;
  validateEmail?: boolean;
  variant?: EmailInputVariant;
  errorMessageDisplay?: boolean;
  onValidationChange?: (error: string) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your email",
  className = "",
  disabled = false,
  required = false,
  name = "email",
  error,
  label,
  labelClassName = "text-[#646F86]",
  validateEmail: shouldValidate = true,
  variant = "default",
  errorMessageDisplay = true,
  onValidationChange,
}) => {
  const [validationError, setValidationError] = useState("");

  // Validate on mount if value exists - ensures errors persist across remounts
  useEffect(() => {
    if (shouldValidate && value && value.trim()) {
      const generalValidation = validateGeneralInput(value, {
        checkEmpty: false,
        checkXSS: true,
        checkSQL: true,
        checkCommandInjection: true,
        checkRepeatedChars: true,
      });

      if (!generalValidation.isValid) {
        const error = generalValidation.error || "";
        setValidationError(error);
        onValidationChange?.(error);
        return;
      }

      const emailValidation = validateEmail(value);
      const error = emailValidation.error || "";
      setValidationError(error);
      onValidationChange?.(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const variantStyles = {
    default: {
      labelColor: "",
      borderColor: "border-gray-300",
      backgroundColor: "bg-white",
      textColor: "text-dark-primary",
      focusRing: "focus:ring-blue-500",
    },
    success: {
      labelColor: "text-dark-green",
      borderColor: "border-dark-green",
      backgroundColor: "bg-light-green",
      textColor: "text-dark-green",
      focusRing: "focus:ring-green-500",
    },
    error: {
      labelColor: "text-dark-red",
      borderColor: "border-dark-red",
      backgroundColor: "bg-light-red",
      textColor: "text-dark-red",
      focusRing: "focus:ring-red-500",
    },
  };

  const currentVariant = error || validationError ? "error" : variant;
  const styles = variantStyles[currentVariant];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (shouldValidate && newValue) {
      const generalValidation = validateGeneralInput(newValue, {
        checkEmpty: false,
        checkXSS: true,
        checkSQL: true,
        checkCommandInjection: true,
        checkRepeatedChars: true,
      });

      if (!generalValidation.isValid) {
        const error = generalValidation.error || "";
        setValidationError(error);
        onValidationChange?.(error);
        return;
      }

      const emailValidation = validateEmail(newValue);
      const error = emailValidation.error || "";
      setValidationError(error);
      onValidationChange?.(error);
    } else {
      setValidationError("");
      onValidationChange?.("");
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block mb-1 text-sm ${labelClassName} ${styles.labelColor}`}
        >
          {label}
          {required && <span className="text-dark-red ml-1">*</span>}
        </label>
      )}
      <input
        type="email"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-invalid={!!(error || validationError)}
        className={`w-full px-4 py-3 border rounded-lg placeholder:text-sm md:placeholder:text-md ${styles.backgroundColor} ${styles.textColor} ${styles.borderColor} ${styles.focusRing} ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        } ${className}`}
        disabled={disabled}
        required={required}
        name={name}
        maxLength={VALIDATION_LIMITS.EMAIL_MAX_LENGTH}
      />
      {errorMessageDisplay && (error || validationError) && (
        <p className="mt-1 text-xs text-dark-red">{error || validationError}</p>
      )}
    </div>
  );
};

export default EmailInput;
