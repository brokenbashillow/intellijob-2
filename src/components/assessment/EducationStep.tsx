
import { useState } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

interface EducationStepProps {
  education: string;
  setEducation: (value: string) => void;
}

const EducationStep = ({ education, setEducation }: EducationStepProps) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
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
        <PopoverContent 
          className="w-full p-0" 
          align="start"
          side={isMobile ? "bottom" : "bottom"}
          sideOffset={5}
          alignOffset={0}
          avoidCollisions={true}
          sticky="always"
          style={{ width: isMobile ? "calc(100vw - 32px)" : undefined, maxWidth: "calc(100vw - 32px)" }}
        >
          <Command className="w-full">
            <CommandInput 
              placeholder="Search degree..." 
              value={education}
              onValueChange={setEducation}
              className="w-full"
            />
            <CommandList className="w-full">
              <CommandEmpty>No degree found.</CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-y-auto w-full">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      setEducation(option);
                      setOpen(false);
                    }}
                    className="w-full"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        education === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option}</span>
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

export default EducationStep;
