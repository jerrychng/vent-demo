import React, { useState, useEffect } from "react";
import Select from "./Select";

export type SortField = string;
export type SortOrder = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface SortOption {
  value: string;
  label: string;
}

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  anchorElement: HTMLElement | null;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  sortFieldOptions: SortOption[];
  title?: string;
}

const SORT_ORDER_OPTIONS: SortOption[] = [
  { value: "asc", label: "A to Z" },
  { value: "desc", label: "Z to A" },
];

const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  onClose,
  anchorElement,
  sortConfig,
  onSortChange,
  sortFieldOptions,
  title = "Sort by",
}) => {
  const [localField, setLocalField] = useState<SortField>(sortConfig.field);
  const [localOrder, setLocalOrder] = useState<SortOrder>(sortConfig.order);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

  useEffect(() => {
    setLocalField(sortConfig.field);
    setLocalOrder(sortConfig.order);
  }, [sortConfig]);

  // Detect screen size on mount
  useEffect(() => {
    setIsSmallScreen(window.innerWidth < 640);
  }, []);

  // Apply sort immediately when field changes, but DON'T close
  const handleFieldChange = (value: string) => {
    const newField = value as SortField;
    setLocalField(newField);
    onSortChange({ field: newField, order: localOrder });
  };

  // Apply sort immediately when order changes, but DON'T close
  const handleOrderChange = (value: string) => {
    const newOrder = value as SortOrder;
    setLocalOrder(newOrder);
    onSortChange({ field: localField, order: newOrder });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  // If anchorElement provided, render anchored popover right below button
  if (anchorElement) {
    const rect = anchorElement.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8;
    const modalWidth = 280;

    let positionStyles: React.CSSProperties;

    if (isSmallScreen) {
      // Center on small screens
      positionStyles = {
        top: `${top}px`,
        left: "50%",
        transform: "translateX(-50%)",
        width: modalWidth,
      };
    } else {
      // Right-align on larger screens
      const right = window.innerWidth - (rect.right + window.scrollX);
      positionStyles = {
        top: `${top}px`,
        right: `${right}px`,
        width: modalWidth,
      };
    }

    return (
      <>
        {/* Backdrop to capture outside clicks */}
        <div
          className="fixed inset-0 z-40"
          onClick={() => onClose()}
          aria-hidden
        />
        <div
          className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 p-4 overflow-visible"
          style={positionStyles}
        >
          <div className="space-y-3">
            <Select
              value={localField}
              onChange={handleFieldChange}
              options={sortFieldOptions}
              placeholder="Select field"
              variant="dark-blue"
            />
            <Select
              value={localOrder}
              onChange={handleOrderChange}
              options={SORT_ORDER_OPTIONS}
              placeholder="Select order"
              variant="dark-blue"
            />
          </div>
        </div>
      </>
    );
  }
};

export default SortModal;
