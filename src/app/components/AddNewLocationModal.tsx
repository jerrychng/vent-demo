import React, { useState, useEffect, useCallback } from "react";
import Button from "./Button";
import AddressSearchAndDisplay from "./AddressSearchAndDisplay";
import type { LocationData } from "../pages/new_job/NewJobContext";
import MessageBox from "../components/MessageBox";
import { useQueryClient } from "@tanstack/react-query";

// New interface for the saved location data
export interface SavedLocationData {
  street?: string;
  addressLine1?: string;
  addressLine2?: string;
  postcode: string;
  locationLabel: string;
  townOrcity: string;
  county: string;
}

interface AddNewLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: SavedLocationData) => Promise<void>;
  // Edit mode props
  editMode?: boolean;
  initialLocation?: LocationData;
  locationId?: string;
}

const AddNewLocationModal: React.FC<AddNewLocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editMode = false,
  initialLocation,
  locationId,
}) => {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasDuplicatePostcode, setHasDuplicatePostcode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for duplicate postcode - memoized with useCallback
  const checkDuplicatePostcode = useCallback(
    (postcode: string): boolean => {
      // Skip duplicate check in edit mode
      if (editMode) {
        setHasDuplicatePostcode(false);
        return false;
      }

      if (!postcode.trim()) {
        setHasDuplicatePostcode(false);
        return false;
      }

      const cachedLocations = queryClient.getQueryData(["locations"]) as any;

      if (cachedLocations && Array.isArray(cachedLocations)) {
        const normalizedPostcode = postcode.trim().toLowerCase();

        const isDuplicate = cachedLocations.some((location: any) => {
          const locationPostcode =
            location.Site_PostalCode__c?.trim().toLowerCase();
          return locationPostcode === normalizedPostcode;
        });

        if (isDuplicate) {
          setSaveError(
            `Please note that there is another address associated with postcode ${postcode}.`,
          );
          setHasDuplicatePostcode(true);
          return true;
        }
      }

      setHasDuplicatePostcode(false);
      return false;
    },
    [queryClient, editMode],
  );

  // Check if location data has changed from initial state
  const checkForChanges = useCallback(
    (currentLocation: LocationData | null): boolean => {
      if (!editMode || !initialLocation || !currentLocation) {
        return false;
      }

      // Compare relevant fields
      const hasChanged =
        currentLocation.locationLabel !== initialLocation.locationLabel ||
        currentLocation.addressLine1 !== initialLocation.addressLine1 ||
        currentLocation.addressLine2 !== initialLocation.addressLine2 ||
        currentLocation.townOrcity !== initialLocation.townOrcity ||
        currentLocation.county !== initialLocation.county ||
        currentLocation.postcode !== initialLocation.postcode;

      return hasChanged;
    },
    [editMode, initialLocation],
  );

  // Initialize with initial location in edit mode
  useEffect(() => {
    if (!isOpen) {
      if (!editMode) {
        setSelectedLocation(null);
      }
      setSaveError(null);
      setHasDuplicatePostcode(false);
      setValidationErrors({});
      setHasUserInteracted(false);
      setHasChanges(false);
      return;
    }

    // In edit mode, populate with initial location data
    if (editMode && initialLocation) {
      setSelectedLocation(initialLocation);
      setHasUserInteracted(true); // In edit mode, consider form as already interacted
      setHasChanges(false); // No changes initially
    }
  }, [isOpen, editMode, initialLocation]);

  // Check for duplicate postcode whenever selectedLocation changes
  // Only runs in add mode (not edit mode)
  useEffect(() => {
    if (editMode) {
      return;
    }

    if (selectedLocation?.postcode) {
      const hasDuplicate = checkDuplicatePostcode(selectedLocation.postcode);

      // If no duplicate found and there's currently a saveError about postcode, clear it
      if (
        !hasDuplicate &&
        saveError?.includes("another address associated with postcode")
      ) {
        setSaveError(null);
      }
    } else {
      // Clear postcode-related errors if no postcode
      if (saveError?.includes("another address associated with postcode")) {
        setSaveError(null);
      }
      setHasDuplicatePostcode(false);
    }
  }, [selectedLocation?.postcode, checkDuplicatePostcode, saveError, editMode]);

  // Check for changes whenever selectedLocation updates in edit mode
  useEffect(() => {
    if (editMode) {
      const changed = checkForChanges(selectedLocation);
      setHasChanges(changed);
    }
  }, [selectedLocation, checkForChanges, editMode]);

  const handleAddressSelect = (location: LocationData) => {
    // Don't mark as interacted here - only when user manually edits a field
    // This prevents validation errors from showing immediately after address selection
    setSelectedLocation(location);
  };

  const handleFieldChange = (field: keyof LocationData, value: string) => {
    // Mark that user has interacted with the form
    setHasUserInteracted(true);

    if (selectedLocation) {
      const updatedLocation = {
        ...selectedLocation,
        [field]: value,
      };
      setSelectedLocation(updatedLocation);
    }
  };

  const handleValidationChange = (errors: Record<string, string>) => {
    setValidationErrors(errors);
  };

  // Check if any field has validation errors
  const hasValidationErrors = Object.values(validationErrors).some(
    (error) => error !== "",
  );

  // Determine if save button should be disabled
  const isSaveDisabled = () => {
    // Always disable if saving or has validation errors
    if (isSaving || hasValidationErrors) {
      return true;
    }

    // In edit mode, disable if no changes have been made
    if (editMode && !hasChanges) {
      return true;
    }

    return false;
  };

  const handleSave = async () => {
    if (!selectedLocation) return;

    // Validate required fields
    if (
      !selectedLocation.locationLabel?.trim() ||
      !selectedLocation.addressLine1?.trim() ||
      !selectedLocation.townOrcity?.trim() ||
      !selectedLocation.postcode?.trim()
    ) {
      setSaveError("Please fill in all required fields");
      return;
    }

    // Combine addressLine1 and addressLine2 to create street
    const street = [
      selectedLocation.addressLine1?.trim(),
      selectedLocation.addressLine2?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    // Transform to the required format
    const savedLocation: SavedLocationData = {
      street,
      postcode: selectedLocation.postcode.trim(),
      locationLabel: selectedLocation.locationLabel.trim(),
      townOrcity: selectedLocation.townOrcity.trim(),
      county: selectedLocation.county?.trim() || "",
    };

    // Save to backend
    setIsSaving(true);
    setSaveError(null);

    try {
      // Call parent's save handler (will handle backend call)
      await onSave(savedLocation);
      // If no error thrown, close modal
      onClose();
    } catch (err: any) {
      console.error("Error saving location:", err);
      setSaveError(err?.message || "Failed to save location");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute min-h-screen inset-0 flex items-start justify-center z-50 bg-black/40"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-primary">
            {editMode ? "Edit location" : "Add new location"}
          </h3>
        </div>

        {/* Body */}
        <div className="space-y-4">
          {/* Address Search and Display Component */}
          <AddressSearchAndDisplay
            variant={editMode ? "edit-location" : "add-new-location"}
            locationData={selectedLocation}
            onAddressSelect={handleAddressSelect}
            onFieldChange={handleFieldChange}
            onValidationChange={handleValidationChange}
            showSearch={!editMode}
          />

          {/* Show save error or info message */}
          {selectedLocation && (
            <MessageBox
              variant={
                saveError || (hasUserInteracted && hasValidationErrors)
                  ? "error"
                  : "default"
              }
              title={
                saveError
                  ? saveError
                  : hasUserInteracted && hasValidationErrors
                    ? "Please fix input errors"
                    : editMode && !hasChanges
                      ? "No changes detected. Update any field to enable save."
                      : "Please add a label to this location, it will make managing multiple properties easier."
              }
            />
          )}
        </div>

        {/* Footer - Save and Cancel Buttons */}
        <div className="flex justify-start gap-3 pt-4">
          {/* Show Save button when a location is selected */}
          {selectedLocation && (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaveDisabled()}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddNewLocationModal;
