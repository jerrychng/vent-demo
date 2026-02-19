import { useState, useEffect, useRef } from "react";
import { Calendar } from "../components/ui/calendar";
import { Input } from "../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { validateDateByVariant } from "../utils/dateValidator";
import SvgIcon from "./SvgIcon";
import CalenderIcon from "../assets/calendar.svg";

type DateVariant = "future" | "past" | "all";
type UIVariant = "default" | "success" | "error";

interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (error?: string) => void;
  dateVariant?: DateVariant;
  uiVariant?: UIVariant;
  required?: boolean;
  label?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Format date for database storage (YYYY-MM-DD)
function formatDateValue(date: Date | undefined) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format date for display to user (DD-MM-YYYY)
function displayValue(date: Date | undefined) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

function isDateDisabled(date: Date, variant: DateVariant): boolean {
  if (variant === "all") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (variant === "future") {
    return date < today;
  }

  if (variant === "past") {
    return date > today;
  }

  return false;
}

export default function DateInput({
  value,
  onChange,
  onBlur,
  dateVariant = "all",
  uiVariant = "default",
  required = false,
  label,
  error: externalError,
  disabled = false,
  placeholder = "Select a date",
}: DateInputProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [month, setMonth] = useState<Date | undefined>(date);
  const [inputDisplayValue, setInputDisplayValue] = useState(
    displayValue(date),
  );
  const [validationError, setValidationError] = useState("");
  const inputRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState(0);

  // Update display value when prop value changes
  useEffect(() => {
    if (value) {
      // Parse the YYYY-MM-DD value from props and convert to DD-MM-YYYY for display
      const parsedDate = new Date(value);
      if (isValidDate(parsedDate)) {
        setInputDisplayValue(displayValue(parsedDate));
        setDate(parsedDate);
      }
    }
  }, [value]);

  // Measure input width
  useEffect(() => {
    const updateWidth = () => {
      if (inputRef.current) {
        setInputWidth(inputRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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

  const styles = variantStyles[uiVariant];

  // Error prop takes precedence over variant styling
  const borderColor =
    externalError || validationError
      ? "border-highlight-red"
      : styles.borderColor;
  const textColor =
    externalError || validationError ? "text-dark-red" : styles.textColor;
  const focusRing =
    externalError || validationError ? "focus:ring-dark-red" : styles.focusRing;
  const backgroundColor =
    externalError || validationError ? "bg-light-red" : styles.backgroundColor;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    // Check if date is disabled based on variant
    if (selectedDate && isDateDisabled(selectedDate, dateVariant)) {
      return; // Don't allow selecting disabled dates
    }

    setDate(selectedDate);
    setMonth(selectedDate);
    const formattedDisplayValue = displayValue(selectedDate);
    setInputDisplayValue(formattedDisplayValue);
    setOpen(false);

    if (onChange && selectedDate) {
      const dbFormattedDate = formatDateValue(selectedDate);
      onChange(dbFormattedDate);
    }

    // Validate on calendar select
    if (selectedDate) {
      const validation = validateDateByVariant(selectedDate, dateVariant);
      if (!validation.isValid) {
        setValidationError(validation.error || "Invalid date");
      } else {
        setValidationError("");
      }
    }
  };

  const handleInputBlur = () => {
    let validationErrorMsg = "";

    // Check if field is required and empty
    if (required && !inputDisplayValue.trim()) {
      validationErrorMsg = "This field is required";
      setValidationError(validationErrorMsg);
      onBlur?.(validationErrorMsg);
      return;
    }

    // If empty and not required, clear error
    if (!inputDisplayValue.trim()) {
      setValidationError("");
      onBlur?.("");
      return;
    }

    // Pass any validation error to parent
    onBlur?.(validationError || "");
  };

  const displayError = externalError || validationError;

  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-2 text-gray-500`}>
          {label}
          {required && <span className="text-dark-red ml-1">*</span>}
        </label>
      )}

      <div className="relative flex gap-2">
        <Input
          id="date"
          value={inputDisplayValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!displayError}
          className={`h-12 px-4 py-3 border rounded-lg placeholder:text-sm md:placeholder:text-md cursor-pointer ${backgroundColor} ${textColor} ${borderColor} ${focusRing} focus:outline-none focus:ring-2 transition ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          onClick={(e) => {
            setOpen(true);
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              id="date-picker"
              disabled={disabled}
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <SvgIcon svg={CalenderIcon} size={20} color="dark-primary" />
              <span className="sr-only">Select date</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0 bg-white border-primary"
            align="end"
            alignOffset={-8}
            sideOffset={10}
            style={{
              width: inputWidth ? `${inputWidth}px` : "auto",
              minWidth: inputWidth ? `${inputWidth}px` : "auto",
            }}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="label"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleDateSelect}
              disabled={(date) => isDateDisabled(date, dateVariant)}
              className="text-dark-primary [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
            />
          </PopoverContent>
        </Popover>
      </div>

      {displayError && (
        <p className="mt-1 text-xs text-dark-red">{displayError}</p>
      )}
    </div>
  );
}
