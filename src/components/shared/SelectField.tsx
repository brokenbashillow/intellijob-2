
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onValueChange?: (value: string) => void;
  onChange?: (name: string, value: string) => void;
  disabled?: boolean;
  className?: string;
  allowCustomValue?: boolean;
}

export const SelectField = ({
  id,
  name,
  placeholder,
  options,
  value,
  onValueChange,
  onChange,
  disabled = false,
  className,
  allowCustomValue = false,
}: SelectFieldProps) => {
  const [customValue, setCustomValue] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Check if the current value is "Other" and we need to show custom input
  useEffect(() => {
    if (allowCustomValue && value === "Other") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
    }
  }, [value, allowCustomValue]);

  // When custom value changes, propagate it as if it were a selection
  useEffect(() => {
    if (showCustomInput && customValue) {
      if (onChange && name) {
        onChange(name, customValue);
      } else if (onValueChange) {
        onValueChange(customValue);
      }
    }
  }, [customValue, showCustomInput, onChange, onValueChange, name]);

  // Handle value change with either callback pattern
  const handleChange = (newValue: string) => {
    if (newValue === "Other" && allowCustomValue) {
      setShowCustomInput(true);
      // Don't update the actual value yet until custom input is provided
    } else {
      if (onChange && name) {
        onChange(name, newValue);
      } else if (onValueChange) {
        onValueChange(newValue);
      }
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={showCustomInput ? "Other" : value}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={`w-full ${className || ""}`}>
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[200px]">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
      
      {showCustomInput && (
        <Input 
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Enter custom value"
          className="mt-2"
        />
      )}
    </div>
  );
};
