import { Check } from "lucide-react";
import React, { useState, useRef } from "react";

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

export const SelectFloating: React.FC<SelectProps> = ({
  options = [],
  placeholder = "Select an option",
  label,
  value,
  onChange,
  disabled = false,
  className = "",
  onValueChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const hasValue = selectedValue !== "";
  const displayLabel = label || placeholder;
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (optionValue: string) => {
    if (optionValue === selectedValue) {
      setSelectedValue("");
      onChange?.({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      onValueChange?.("");
    } else {
      setSelectedValue(optionValue);
      onValueChange?.(optionValue);
      onChange?.({
        target: { value: optionValue },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    setIsOpen(false);
    setIsFocused(false);
  };

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        toggleOpen();
        break;
      case "Escape":
        setIsOpen(false);
        setIsFocused(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setIsFocused(true);
        }
        break;
    }
  };

  return (
    <div
      ref={selectRef}
      className={`group inline-flex flex-col relative w-full transition-background motion-reduce:transition-none duration-150 ${className}`}
    >
      <div
        aria-hidden="true"
        className="sr-only"
        style={{
          border: "0px",
          clip: "rect(0px, 0px, 0px, 0px)",
          clipPath: "inset(50%)",
          height: "1px",
          margin: "-1px",
          overflow: "hidden",
          padding: "0px",
          position: "absolute",
          width: "1px",
          whiteSpace: "nowrap",
        }}
      >
        <label>
          {displayLabel}
          <select tabIndex={-1} value={selectedValue} onChange={() => {}}>
            <option value="" />
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="w-full flex flex-col">
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby="select-label select-value"
          className={`
            relative w-full inline-flex tap-highlight-transparent rounded-xl flex-col items-start justify-center gap-0 
            hover:bg-gray-50 outline-none transition-colors duration-150
            ${isFocused ? "bg-gray-200 ring-1 ring-blue-500" : "ring-1 ring-gray-200"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            h-14 min-h-14 py-1.5 px-3
          `}
          disabled={disabled}
          type="button"
          onClick={toggleOpen}
          onKeyDown={handleKeyDown}
        >
          <label
            className={`
              block absolute z-10 flex-shrink-0 antialiased pointer-events-none cursor-pointer 
              transition-all duration-200 ease-out motion-reduce:transition-none origin-top-left
              ${
                hasValue || isFocused
                  ? "text-gray-600 scale-75 -translate-y-[calc(50%_+_0.375rem_-_11px)] text-md"
                  : "text-gray-500 text-sm"
              }
              pe-2 max-w-full text-ellipsis overflow-hidden
              ${selectedOption?.icon ? "pl-8" : ""}
            `}
            id="select-label"
          >
            {displayLabel}
          </label>

          <div
            className={`inline-flex h-fit w-[calc(100%_-_1.5rem)] min-h-4 items-center gap-1.5 box-border ${hasValue || isFocused ? "pt-4" : ""}`}
          >
            {selectedOption?.icon && (
              <div className="flex-shrink-0 w-4 h-4 text-gray-500">
                {selectedOption.icon}
              </div>
            )}
            <span
              className={`font-normal w-full text-start text-sm truncate ${
                hasValue ? "text-gray-900" : "text-gray-500"
              }`}
              id="select-value"
            >
              {selectedOption?.label || ""}
            </span>
          </div>

          <svg
            aria-hidden="true"
            className={`absolute right-3 w-4 h-4 transition-transform duration-150 ease motion-reduce:transition-none ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            width="1em"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 shadow-sm max-h-60 overflow-auto py-2 px-2 rounded-xl">
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.value}
                  aria-selected={selectedValue === option.value}
                  className="flex items-center justify-between px-5 py-2 text-black text-sm w-full text-left cursor-pointer hover:bg-gray-100 transition-colors duration-150 rounded-lg"
                  role="option"
                  tabIndex={0}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(option.value);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && (
                      <div className="flex-shrink-0 w-4 h-4 text-gray-500">
                        {option.icon}
                      </div>
                    )}
                    <span>{option.label}</span>
                  </div>
                  {selectedValue === option.value && (
                    <Check className="w-5 h-5" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options available
              </div>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <button
          aria-label="Close select dropdown"
          className="fixed inset-0 z-40"
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            margin: 0,
          }}
          tabIndex={0}
          type="button"
          onClick={() => {
            setIsOpen(false);
            setIsFocused(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
              setIsOpen(false);
              setIsFocused(false);
            }
          }}
        />
      )}
    </div>
  );
};
