
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name?: string; // Add name prop to interface
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  onChange?: (name: string, value: string) => void; // Add onChange as an alternative to onValueChange
  disabled?: boolean;
  className?: string; // Add className prop to interface
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
}: SelectFieldProps) => {
  // Handle value change with either callback pattern
  const handleChange = (newValue: string) => {
    if (onChange && name) {
      onChange(name, newValue);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <Select
      value={value}
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
  );
};
