import React, { useState, useEffect, useRef } from "react";
import TextInput from "./TextInput";
import { AddressService } from "../api/services/address";
import type { AddressSuggestion } from "../api/services/address";
import type { LocationData } from "../pages/new_job/NewJobContext";

interface AddressSearchBarProps {
  onSelect: (selectedLocation: LocationData) => void;
}

const AddressSearchBar: React.FC<AddressSearchBarProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipSearchRef = useRef(false);

  useEffect(() => {
    // Skip search if we just selected an option
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await AddressService.searchAddresses(searchQuery);
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
    setShowSuggestions(false);
    skipSearchRef.current = true;
    setSearchQuery(suggestion.Text);

    if (suggestion.Next === "Retrieve") {
      try {
        const detailedAddress = await AddressService.getDetailedAddressById(
          suggestion.Id || "",
        );
        if (detailedAddress) {
          console.log(detailedAddress);
          const targetAddress = detailedAddress.Items[0];
          console.log(targetAddress);
          if (targetAddress) {
            const locationData: LocationData = {
              addressLine1: targetAddress.Line1 || "",
              addressLine2: targetAddress.Line2 || "",
              townOrcity: targetAddress.City || "",
              postcode: targetAddress.PostalCode || "",
              county: targetAddress.County || "",
            };
            onSelect(locationData);
          }
        }
        console.log("Detailed address response:", detailedAddress);
      } catch (error) {
        console.error("Error fetching detailed address:", error);
      }
    } else if (suggestion.Next === "Find") {
      try {
        setIsSearching(true);
        const results = await AddressService.searchAddresses(
          searchQuery,
          suggestion.Id,
        );
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <div className="relative h-max bg-background rounded-lg border border-subtle">
      <div className="p-4">
        <TextInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Enter your postcode. e.g.SW1A 1AA"
          name="addressSearch"
        />
      </div>
      {isSearching && (
        <p className="text-sm text-gray-500 px-4">Searching...</p>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mx-4 -translate-y-3 bg-white border border-gray-200 rounded-md max-h-56 overflow-auto z-20 shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.Id || index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-sm text-gray-900">{suggestion.Text}</span>
            </button>
          ))}
        </div>
      )}
      {showSuggestions &&
        !isSearching &&
        searchQuery.trim() &&
        suggestions.length === 0 && (
          <p className="text-sm text-gray-500 px-4 pb-4">No results found</p>
        )}
    </div>
  );
};

export default AddressSearchBar;
