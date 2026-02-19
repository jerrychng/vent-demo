import React, { useState, useEffect } from "react";
import AddressSearchBar from "./AddressSearchBar";
import TextInput from "./TextInput";
import type { LocationData } from "../pages/new_job/NewJobContext";
import { validateGeneralInput } from "../utils/generalInputValidator";
import { isValidUKPostcode } from "../utils/postcodeValidator";
import { VALIDATION_LIMITS } from "../constants/validation";

export type AddressVariant =
  | "guest-user"
  | "loggedin-user"
  | "add-new-location"
  | "edit-location";

interface AddressSearchAndDisplayProps {
  variant: AddressVariant;
  locationData: LocationData | null;
  onAddressSelect: (location: LocationData) => void;
  onFieldChange: (field: keyof LocationData, value: string) => void;
  onValidationChange?: (errors: Record<string, string>) => void;
  showSearch?: boolean;
}

const AddressSearchAndDisplay: React.FC<AddressSearchAndDisplayProps> = ({
  variant,
  locationData,
  onAddressSelect,
  onFieldChange,
  onValidationChange,
  showSearch = true,
}) => {
  // Track validation errors for each field
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Track which fields have been touched/interacted with
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Check if location has any non-empty values
  const hasLocationData =
    locationData && Object.values(locationData).some((value) => value?.trim());

  // Determine which fields to show based on variant
  const getFieldsToShow = () => {
    switch (variant) {
      case "guest-user":
        return {
          showLocationLabel: false,
          showStreet: false,
          showAddressLine1: true,
          showAddressLine2: true,
          showTownCity: true,
          showCounty: true,
          showPostcode: true,
          readOnly: false,
        };
      case "loggedin-user":
        return {
          showLocationLabel: true,
          showStreet: true,
          showAddressLine1: false,
          showAddressLine2: false,
          showTownCity: true,
          showCounty: true,
          showPostcode: true,
          readOnly: true,
        };
      case "add-new-location":
        return {
          showLocationLabel: true,
          showStreet: false,
          showAddressLine1: true,
          showAddressLine2: true,
          showTownCity: true,
          showCounty: true,
          showPostcode: true,
          readOnly: false,
        };
      case "edit-location":
        return {
          showLocationLabel: true,
          showStreet: false,
          showAddressLine1: true,
          showAddressLine2: true,
          showTownCity: true,
          showCounty: true,
          showPostcode: true,
          readOnly: false,
        };
      default:
        return {
          showLocationLabel: false,
          showStreet: false,
          showAddressLine1: true,
          showAddressLine2: true,
          showTownCity: true,
          showCounty: true,
          showPostcode: true,
          readOnly: false,
        };
    }
  };

  const fieldsConfig = getFieldsToShow();

  // Validate text input with generalInputValidator
  const validateTextField = (
    value: string,
    isRequired: boolean = true,
  ): string => {
    const validationResult = validateGeneralInput(value, {
      checkEmpty: isRequired,
      checkXSS: true,
      checkSQL: true,
      checkCommandInjection: true,
      checkRepeatedChars: true,
      maxRepeatedChars: 10,
    });

    if (!validationResult.isValid) {
      return validationResult.error || "Invalid input";
    }

    return "";
  };

  // Validate postcode with UK postcode format
  const validatePostcode = (
    value: string,
    isRequired: boolean = true,
  ): string => {
    // Check if empty
    if (!value && isRequired) {
      return "Postcode is required";
    }

    if (!value) {
      return "";
    }

    // Check if it's a valid UK postcode format
    if (!isValidUKPostcode(value)) {
      return "Please enter a valid UK postcode (e.g., SW1A 1AA)";
    }

    return "";
  };

  // Validate a single field
  const validateField = (
    field: keyof LocationData,
    value: string | undefined,
    isRequired: boolean,
  ): string => {
    const fieldValue = value || "";

    if (field === "postcode") {
      return validatePostcode(fieldValue, isRequired);
    } else {
      return validateTextField(fieldValue, isRequired);
    }
  };

  // Validate all required fields based on the variant
  const validateAllFields = (
    data: LocationData | null,
  ): Record<string, string> => {
    if (!data) return {};

    const errors: Record<string, string> = {};

    // Define which fields are required for each shown field
    if (fieldsConfig.showLocationLabel) {
      errors.locationLabel = validateField(
        "locationLabel",
        data.locationLabel,
        true,
      );
    }
    if (fieldsConfig.showStreet) {
      errors.street = validateField("street", data.street, true);
    }
    if (fieldsConfig.showAddressLine1) {
      errors.addressLine1 = validateField(
        "addressLine1",
        data.addressLine1,
        true,
      );
    }
    if (fieldsConfig.showAddressLine2) {
      errors.addressLine2 = validateField(
        "addressLine2",
        data.addressLine2,
        false,
      );
    }
    if (fieldsConfig.showTownCity) {
      errors.townOrcity = validateField("townOrcity", data.townOrcity, true);
    }
    if (fieldsConfig.showCounty) {
      errors.county = validateField("county", data.county, false);
    }
    if (fieldsConfig.showPostcode) {
      errors.postcode = validateField("postcode", data.postcode, true);
    }

    return errors;
  };

  // Validate all fields when locationData changes
  useEffect(() => {
    if (locationData) {
      const errors = validateAllFields(locationData);

      // Only show errors for fields that have been touched
      const filteredErrors: Record<string, string> = {};
      Object.keys(errors).forEach((key) => {
        if (touchedFields.has(key) && errors[key]) {
          filteredErrors[key] = errors[key];
        }
      });

      setValidationErrors(filteredErrors);

      // Always report all errors to parent (for form-level validation)
      // but only show errors in UI for touched fields
      onValidationChange?.(errors);
    } else {
      // Clear validation errors when no location data
      setValidationErrors({});
      onValidationChange?.({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationData, variant, touchedFields]); // Re-validate when locationData, variant, or touchedFields changes

  // Handle field change with validation
  const handleFieldChangeWithValidation = (
    field: keyof LocationData,
    value: string,
    isRequired: boolean,
  ) => {
    onFieldChange(field, value);

    // Mark field as touched
    setTouchedFields((prev) => new Set(prev).add(field));

    // Validate the field
    const validationError = validateField(field, value, isRequired);

    setValidationErrors((prev) => {
      const updated = {
        ...prev,
        [field]: validationError,
      };

      // Get all errors for parent validation
      const allErrors = validateAllFields({
        ...locationData,
        [field]: value,
      } as LocationData);
      onValidationChange?.(allErrors);

      return updated;
    });
  };

  // Handle field blur to mark as touched
  const handleFieldBlur = (field: keyof LocationData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Address Search Bar */}
      {showSearch && <AddressSearchBar onSelect={onAddressSelect} />}

      {/* Location Details Display */}
      {hasLocationData && (
        <div className="p-4 rounded-lg bg-background border border-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location Label */}
            {fieldsConfig.showLocationLabel && (
              <TextInput
                value={locationData.locationLabel || ""}
                onChange={(value) =>
                  handleFieldChangeWithValidation("locationLabel", value, true)
                }
                onBlur={() => handleFieldBlur("locationLabel")}
                placeholder="Location Label"
                name="locationLabel"
                disabled={fieldsConfig.readOnly}
                required={true}
                error={validationErrors.locationLabel}
                maxLength={VALIDATION_LIMITS.LOCATION_LABEL_MAX_LENGTH}
              />
            )}

            {/* Street */}
            {fieldsConfig.showStreet && (
              <TextInput
                value={locationData.street || ""}
                onChange={(value) =>
                  handleFieldChangeWithValidation("street", value, true)
                }
                onBlur={() => handleFieldBlur("street")}
                placeholder="Street"
                name="street"
                disabled={fieldsConfig.readOnly || variant === "edit-location"}
                required={true}
                error={validationErrors.street}
                maxLength={VALIDATION_LIMITS.ADDRESS_LINE_MAX_LENGTH}
              />
            )}

            {/* Address Line 1 */}
            {fieldsConfig.showAddressLine1 && (
              <TextInput
                value={locationData?.addressLine1 || ""}
                onChange={(value) =>
                  handleFieldChangeWithValidation("addressLine1", value, true)
                }
                onBlur={() => handleFieldBlur("addressLine1")}
                placeholder="Address line 1"
                name="addressLine1"
                disabled={fieldsConfig.readOnly || variant === "edit-location"}
                required={true}
                error={validationErrors.addressLine1}
                maxLength={VALIDATION_LIMITS.ADDRESS_LINE_MAX_LENGTH}
              />
            )}

            {/* Address Line 2 */}
            {fieldsConfig.showAddressLine2 && (
              <TextInput
                value={locationData?.addressLine2 || ""}
                onChange={(value) =>
                  handleFieldChangeWithValidation("addressLine2", value, false)
                }
                onBlur={() => handleFieldBlur("addressLine2")}
                placeholder="Address line 2"
                name="addressLine2"
                disabled={fieldsConfig.readOnly || variant === "edit-location"}
                required={false}
                error={validationErrors.addressLine2}
                maxLength={VALIDATION_LIMITS.ADDRESS_LINE_MAX_LENGTH}
              />
            )}

            {/* Town/City */}
            {fieldsConfig.showTownCity && (
              <TextInput
                value={locationData.townOrcity || ""}
                onChange={(value) =>
                  handleFieldChangeWithValidation("townOrcity", value, true)
                }
                onBlur={() => handleFieldBlur("townOrcity")}
                placeholder="Town or City"
                name="townCity"
                disabled={fieldsConfig.readOnly || variant === "edit-location"}
                required={true}
                error={validationErrors.townOrcity}
                maxLength={VALIDATION_LIMITS.TOWN_MAX_LENGTH}
              />
            )}

            {/* County */}
            {fieldsConfig.showCounty && (
              <TextInput
                value={locationData.county || ""}
                onChange={(value) =>
                  handleFieldChangeWithValidation("county", value, false)
                }
                onBlur={() => handleFieldBlur("county")}
                placeholder="County"
                name="county"
                disabled={fieldsConfig.readOnly || variant === "edit-location"}
                required={false}
                error={validationErrors.county}
                maxLength={VALIDATION_LIMITS.COUNTY_MAX_LENGTH}
              />
            )}

            {/* Postcode */}
            {fieldsConfig.showPostcode && (
              <TextInput
                value={locationData.postcode || ""}
                onChange={(value) =>
                  handleFieldChangeWithValidation("postcode", value, true)
                }
                onBlur={() => handleFieldBlur("postcode")}
                placeholder="Postcode (e.g., SW1A 1AA)"
                name="postcode"
                disabled={fieldsConfig.readOnly || variant === "edit-location"}
                required={true}
                error={validationErrors.postcode}
                maxLength={VALIDATION_LIMITS.POSTCODE_MAX_LENGTH}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSearchAndDisplay;
