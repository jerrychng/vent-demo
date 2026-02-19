import React, { useState, useEffect, useMemo } from "react";
import MultiSelect from "./MultiSelect";

export interface FilterConfig {
  [key: string]: string[];
}

export interface FilterField {
  name: string;
  label: string;
  options: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  anchorElement: HTMLElement | null;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  filterFields: FilterField[];
  title?: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  anchorElement,
  filterConfig,
  onFilterChange,
  filterFields,
  title = "Filter",
}) => {
  const [localFilters, setLocalFilters] = useState<FilterConfig>(filterConfig);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: string;
    right?: string;
    left?: string;
  } | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    setLocalFilters(filterConfig);
  }, [filterConfig]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate popover position when anchorElement or isOpen changes
  useEffect(() => {
    if (isOpen && anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 8;

      if (isSmallScreen) {
        // Center on small screens
        setPopoverPosition({
          top: `${top}px`,
          left: `50%`,
        });
      } else {
        // Align to right on larger screens
        const right = window.innerWidth - (rect.right + window.scrollX);
        setPopoverPosition({
          top: `${top}px`,
          right: `${right}px`,
        });
      }
    }
  }, [isOpen, anchorElement, isSmallScreen]);

  // Handle filter change for a specific field
  const handleFilterChange = (fieldName: string, selectedValues: string[]) => {
    const newFilters = { ...localFilters, [fieldName]: selectedValues };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: FilterConfig = {};
    filterFields.forEach((field) => {
      clearedFilters[field.name] = [];
    });
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Check if any filters are selected to determine max height
  const hasSelectedFilters = Object.values(localFilters).some(
    (values) => values.length > 0,
  );

  const numberOfSelectedFilters = useMemo(() => {
    return Object.values(localFilters).flat().length;
  }, [localFilters]);

  if (!isOpen) return null;

  // If anchorElement provided, render anchored popover
  if (anchorElement && popoverPosition) {
    return (
      <>
        {/* Backdrop to capture outside clicks */}
        <div
          className="fixed inset-0 z-40"
          onClick={() => onClose()}
          aria-hidden
        />
        <div
          className={`fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 p-4 overflow-visible ${
            isSmallScreen ? "w-[90vw] max-w-sm -translate-x-1/2" : "w-80"
          } ${hasSelectedFilters ? "max-h-[600px]" : "max-h-96"}`}
          style={{
            top: popoverPosition.top,
            ...(isSmallScreen && { left: popoverPosition.left }),
            ...(!isSmallScreen && { right: popoverPosition.right }),
          }}
        >
          <div className="space-y-2">
            {filterFields.map((field) => (
              <MultiSelect
                key={field.name}
                value={localFilters[field.name] || []}
                onChange={(values) => handleFilterChange(field.name, values)}
                options={field.options.map((option) => ({
                  value: option,
                  label: option || "—",
                }))}
                variant="dark-blue"
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            ))}
          </div>
          <div
            className={`flex justify-center items-center p-4 border-t border-gray-200`}
          >
            <button
              onClick={handleClearFilters}
              className={`hover:cursor-pointer
                ${
                  numberOfSelectedFilters === 0
                    ? "text-gray-300"
                    : "text-dark-primary"
                }
              `}
            >
              Clear all filters
            </button>
          </div>
        </div>
      </>
    );
  }

  // Fallback centered modal if no anchorElement
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-primary">{title}</h3>
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          {filterFields.map((field) => (
            <MultiSelect
              key={field.name}
              label={field.label}
              value={localFilters[field.name] || []}
              onChange={(values) => handleFilterChange(field.name, values)}
              options={field.options.map((option) => ({
                value: option,
                label: option || "—",
              }))}
              placeholder={`Select ${field.label.toLowerCase()}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
