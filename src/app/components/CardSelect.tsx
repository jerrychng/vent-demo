import React, { useState, useRef, useEffect } from "react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import SvgIcon from "./SvgIcon";

// Import card logos
import VisaLogo from "../assets/payment-logos/visa-logo.svg";
import MasterCardLogo from "../assets/payment-logos/mastercard-logo.svg";
import AmexLogo from "../assets/payment-logos/amex-logo.svg";
import DinersLogo from "../assets/payment-logos/diners-logo.svg";
import DiscoverLogo from "../assets/payment-logos/discover-logo.svg";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon } from "@hugeicons/core-free-icons";

interface UserCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface CardSelectProps {
  value?: string;
  onChange: (value: string) => void;
  cards: UserCard[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
}

const CardSelect: React.FC<CardSelectProps> = ({
  value,
  onChange,
  cards,
  placeholder = "Select a card",
  className = "",
  disabled = false,
  required = false,
  error,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map of card brands to logo imports
  const cardLogos: Record<string, string> = {
    visa: VisaLogo,
    mastercard: MasterCardLogo,
    "master card": MasterCardLogo,
    amex: AmexLogo,
    "american express": AmexLogo,
    diners: DinersLogo,
    "diners club": DinersLogo,
    discover: DiscoverLogo,
  };

  // Get logo for card brand
  const getCardLogo = (brand: string): string => {
    const normalizedBrand = brand.toLowerCase().trim();
    return cardLogos[normalizedBrand] || VisaLogo; // Default to Visa if brand not found
  };

  // Format card label: "Visa ending in 4242"
  const formatCardLabel = (card: UserCard): string => {
    return `···· ···· ···· ${card.last4}`;
  };

  // Update selected card when value changes
  useEffect(() => {
    const selected = cards.find((card) => card.id === value);
    setSelectedCard(selected || null);
  }, [value, cards]);

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

  const handleCardClick = (card: UserCard) => {
    onChange(card.id);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="w-full text-dark-primary">
      {label && (
        <label className="block mb-2">
          {label}
          {required && <span className="text-dark-red ml-1">*</span>}
        </label>
      )}
      <div className="relative bg-white" ref={dropdownRef}>
        {/* Trigger Button */}
        <div
          onClick={toggleDropdown}
          className={`border-gray-300 hover:border-gray-400 w-full px-4 py-3 border rounded-lg cursor-pointer flex items-center justify-between ${
            error
              ? "border-red-300 focus:ring-dark-red"
              : "border-dark-primary focus:ring-blue-500"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`}
        >
          <div className="flex items-center gap-3">
            {selectedCard && (
              <>
                <SvgIcon
                  svg={getCardLogo(selectedCard.brand)}
                  size={24}
                  className="shrink-0"
                />
                <span className="text-dark-primary">
                  {formatCardLabel(selectedCard)}
                </span>
              </>
            )}
            {!selectedCard && (
              <span className="text-gray-500 flex items-center gap-2">
                <HugeiconsIcon
                  icon={CreditCardIcon}
                  className="text-dark-primary"
                />
                {placeholder}
              </span>
            )}
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`w-8 h-8 text-gray-600 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-0 bg-white border-x border-b border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {cards.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                No cards available
              </div>
            ) : (
              cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                    value === card.id
                      ? "bg-background text-dark-primary font-bold"
                      : "text-gray-900"
                  }`}
                >
                  <SvgIcon
                    svg={getCardLogo(card.brand)}
                    size={20}
                    className="shrink-0"
                  />
                  <span className="grow">{formatCardLabel(card)}</span>
                  {/*{value === card.id && (
                    <span className="text-primary text-lg">✓</span>
                  )}*/}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-dark-red">{error}</p>}
    </div>
  );
};

export default CardSelect;
