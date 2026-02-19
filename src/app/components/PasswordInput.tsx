import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { validatePassword } from "../utils/passwordValidator";
import { validateGeneralInput } from "../utils/generalInputValidator";
import { VALIDATION_LIMITS } from "../constants/validation";

type PasswordInputVariant = "default" | "success" | "error";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // forwarded to <input>
  disabled?: boolean;
  required?: boolean;
  name?: string;
  error?: string;
  label?: string;
  validatePassword?: boolean;
  labelClassName?: string;
  variant?: PasswordInputVariant;
  onValidationChange?: (error: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your password",
  className = "",
  disabled = false,
  required = false,
  name = "password",
  error,
  label,
  validatePassword: shouldValidate = false,
  labelClassName = "text-[#646F86]",
  variant = "default",
  onValidationChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Define variant styles
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
      // First, run general input validation for security checks
      const generalValidation = validateGeneralInput(newValue, {
        checkEmpty: false, // Password field handles empty separately
        checkXSS: true,
        checkSQL: true,
        checkCommandInjection: true,
        checkRepeatedChars: true,
      });

      if (!generalValidation.isValid) {
        const error = generalValidation.error || "";
        setValidationError(error);
        onValidationChange?.(error); // Notify parent
        return;
      }

      // Then, run password-specific validation based on type
      const passwordValidation = validatePassword(newValue);

      const error = passwordValidation.error || "";
      setValidationError(error);
      onValidationChange?.(error); // Notify parent
    } else {
      setValidationError("");
      onValidationChange?.(""); // Notify parent
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
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={!!(error || validationError)}
          className={`w-full px-4 py-3 border rounded-lg ${styles.backgroundColor} ${styles.textColor} ${styles.borderColor} ${styles.focusRing} ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          } ${className}`}
          disabled={disabled}
          required={required}
          name={name}
          maxLength={VALIDATION_LIMITS.PASSWORD_MAX_LENGTH}
          minLength={VALIDATION_LIMITS.PASSWORD_MIN_LENGTH}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <HugeiconsIcon icon={ViewIcon} />
          ) : (
            <HugeiconsIcon icon={ViewOffSlashIcon} />
          )}
        </button>
      </div>
      {(error || validationError) && (
        <p className="mt-1 text-xs text-dark-red">{error || validationError}</p>
      )}
    </div>
  );
};

export default PasswordInput;
