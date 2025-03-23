
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { educationOptions } from "@/data/education-options";
import { Textarea } from "@/components/ui/textarea";

interface EducationStepProps {
  education: string;
  setEducation: (value: string) => void;
}

const EducationStep = ({ education, setEducation }: EducationStepProps) => {
  const [open, setOpen] = useState(false);
  
  const filterOptions = (value: string) => {
    if (!value) return educationOptions;
    
    const lowercasedValue = value.toLowerCase();
    return educationOptions.filter(option => 
      option.toLowerCase().includes(lowercasedValue)
    );
  };
  
  const filteredOptions = filterOptions(education);

  return (
    <div className="space-y-4">
      <Label htmlFor="education">
        What is your highest educational attainment?
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            {education || "Select your degree..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search degree..." 
              value={education}
              onValueChange={setEducation}
            />
            <CommandList>
              <CommandEmpty>No degree found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      setEducation(option);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        education === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Textarea
        id="education"
        placeholder="Or describe your education in detail"
        value={education}
        onChange={(e) => setEducation(e.target.value)}
        className="mt-2 min-h-[100px]"
        rows={4}
      />
    </div>
  );
};

import { useState } from "react";

export default EducationStep;
