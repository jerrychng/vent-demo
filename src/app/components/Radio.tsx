import React from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioProps {
  value?: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  error?: string;
  label?: string;
}

const Radio: React.FC<RadioProps> = ({
  value,
  onChange,
  options,
  className = "",
  disabled = false,
  required = false,
  name = "radio",
  error,
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2">
          {label}
          {required && <span className="text-dark-red ml-1">*</span>}
        </label>
      )}
      <div
        className={`flex flex-col md:flex-row gap-3 px-3 py-4 rounded-md ${className}`}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex items-center cursor-pointer ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <div className="relative flex items-center justify-center w-5 h-5 mr-2">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={handleChange}
                  disabled={disabled}
                  required={required}
                  className={`absolute w-5 h-5 opacity-0 cursor-pointer ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                />
                <div
                  className={`absolute w-5 h-5 rounded-full transition-colors border ${isSelected ? "border-primary" : "border-secondary"} hover:border-dark-primary bg-white ${disabled ? "opacity-50" : ""}`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-primary hover:bg-dark-primary"></div>
                    </div>
                  )}
                </div>
              </div>
              <span className={`text-sm text-dark-primary`}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1 text-sm text-dark-red">{error}</p>}
    </div>
  );
};

export default Radio;
