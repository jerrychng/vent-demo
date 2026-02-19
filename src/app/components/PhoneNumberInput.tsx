import React, { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { PHONE_LIST, type Country, getCountryByCode } from "../utils/phoneList";
import {
  validatePhoneNumber,
  type PhoneNumberValidationResult,
} from "../utils/phoneNumberValidator";
import { VALIDATION_LIMITS } from "../constants/validation";

type PhoneNumberInputVariant = "default" | "success" | "error";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (validationResult: PhoneNumberValidationResult) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
  name?: string;
  validateOnChange?: boolean;
  labelClassName?: string;
  variant?: PhoneNumberInputVariant;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  onValidationChange,
  label,
  placeholder = "Enter phone number",
  className = "",
  required = false,
  error,
  name = "phone",
  validateOnChange = true,
  labelClassName = "text-[#646F86]",
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [internalValidationError, setInternalValidationError] = useState<
    string | undefined
  >(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse existing value on mount and trigger validation
  useEffect(() => {
    if (value) {
      const found = PHONE_LIST.find((c) => value.startsWith(c.dialCode));
      if (found) {
        setSelectedCountry(found);
        const number = value.replace(found.dialCode, "").trim();
        setPhoneNumber(number);

        // Validate on mount
        if (validateOnChange) {
          const validationResult = validatePhoneNumber(value);
          setInternalValidationError(validationResult.error);
          if (onValidationChange) {
            onValidationChange(validationResult);
          }
        }
      } else {
        setPhoneNumber(value);
      }
    } else {
      // Set GB as default if no value provided
      const gbCountry = getCountryByCode("GB");
      if (gbCountry) {
        setSelectedCountry(gbCountry);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Define variant styles
  const variantStyles = {
    default: {
      labelColor: "",
      containerBorderColor: "border-gray-300",
      containerBackgroundColor: "bg-white",
      buttonTextColor: "text-gray-600",
      buttonBorderColor: "border-gray-300",
      inputBorderColor: "border-none",
      inputBackgroundColor: "bg-white",
      inputTextColor: "text-dark-primary",
      focusRing: "focus:ring-primary",
    },
    success: {
      labelColor: "text-dark-green",
      containerBorderColor: "border-dark-green",
      containerBackgroundColor: "bg-light-green",
      buttonTextColor: "text-dark-green",
      buttonBorderColor: "border-dark-green",
      inputBorderColor: "border-dark-green",
      inputBackgroundColor: "bg-light-green",
      inputTextColor: "text-dark-green",
      focusRing: "focus:ring-green-500",
    },
    error: {
      labelColor: "text-dark-red",
      containerBorderColor: "border-dark-red",
      containerBackgroundColor: "bg-light-red",
      buttonTextColor: "text-dark-red",
      buttonBorderColor: "border-dark-red",
      inputBorderColor: "border-none",
      inputBackgroundColor: "bg-light-red",
      inputTextColor: "text-dark-red",
      focusRing: "focus:ring-red-500",
    },
  };

  // Determine current variant based on error state
  const currentVariant = error || internalValidationError ? "error" : variant;
  const styles = variantStyles[currentVariant];

  // Parse existing value (format: "+44 1234567890" or "1234567890")
  // Or set GB as default on first mount
  useEffect(() => {
    if (value) {
      const found = PHONE_LIST.find((c) => value.startsWith(c.dialCode));
      if (found) {
        setSelectedCountry(found);
        const number = value.replace(found.dialCode, "").trim();
        setPhoneNumber(number);
      } else {
        setPhoneNumber(value);
      }
    } else {
      // Set GB as default if no value provided
      const gbCountry = getCountryByCode("GB");
      if (gbCountry) {
        setSelectedCountry(gbCountry);
      }
    }
  }, []);

  // Validate phone number whenever it changes
  useEffect(() => {
    if (validateOnChange && selectedCountry && phoneNumber) {
      const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
      const validationResult = validatePhoneNumber(fullPhoneNumber);

      setInternalValidationError(validationResult.error);

      // Notify parent component of validation result
      if (onValidationChange) {
        onValidationChange(validationResult);
      }
    } else if (!phoneNumber) {
      setInternalValidationError(undefined);
      if (onValidationChange) {
        onValidationChange({
          isValid: false,
          error: "Phone number is required",
        });
      }
    }
  }, [phoneNumber, selectedCountry, validateOnChange, onValidationChange]);

  // Update parent when country or phone number changes
  // Use useCallback to prevent onChange from being recreated on every render
  useEffect(() => {
    if (selectedCountry && phoneNumber) {
      onChange(`${selectedCountry.dialCode} ${phoneNumber}`);
    } else if (phoneNumber) {
      onChange(phoneNumber);
    }
  }, [selectedCountry, phoneNumber]);

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

  // Filter countries by search query
  const filteredCountries = PHONE_LIST.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery),
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Determine which error to display (passed error takes precedence)
  const displayError = error || internalValidationError;

  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-2  ${labelClassName} ${styles.labelColor}`}>
          {label}
        </label>
      )}

      <div
        className={`relative rounded-lg py-1 border ${styles.containerBorderColor} ${styles.containerBackgroundColor}`}
        ref={dropdownRef}
      >
        {/* Country selector + Phone input */}
        <div className="flex gap-2 min-w-0">
          {/* Country Selector Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-2 md:px-3 py-1 rounded-md flex items-center gap-2 min-w-[70px] max-w-[110px] shrink-0 hover:opacity-80 transition-opacity ${styles.buttonTextColor} ${className}`}
          >
            {selectedCountry ? (
              <>
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm">({selectedCountry.dialCode})</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Select</span>
            )}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Phone Number Input */}
          <input
            type="tel"
            name={name}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={`flex-1 min-w-0 px-3 py-2 rounded-lg placeholder:text-sm md:placeholder:text-md ${styles.inputBackgroundColor} ${styles.inputTextColor} border ${styles.inputBorderColor} ${styles.focusRing} outline-none transition-colors ${className}`}
            maxLength={VALIDATION_LIMITS.PHONE_MAX_LENGTH}
            minLength={VALIDATION_LIMITS.PHONE_MIN_LENGTH}
          />
        </div>

        {/* Country Dropdown */}
        {isOpen && (
          <div className="absolute z-10 left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search your country"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Countries list */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${
                      selectedCountry?.code === country.code
                        ? "bg-primary/10 border-l-2 border-primary"
                        : ""
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {country.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {country.dialCode}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-gray-500 text-center">
                  No countries found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <p className="mt-1 text-xs text-dark-red">{displayError}</p>
      )}
    </div>
  );
};

export default PhoneNumberInput;
