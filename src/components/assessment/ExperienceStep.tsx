
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormDescription } from "@/components/ui/form";

interface ExperienceStepProps {
  experience: string;
  setExperience: (value: string) => void;
}

const ExperienceStep = ({ experience, setExperience }: ExperienceStepProps) => {
  const [years, setYears] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [company, setCompany] = useState<string>("");

  // Parse the existing experience value into components (if any)
  useEffect(() => {
    if (!experience) return;
    
    const regex = /(\d+)\s+years?\s+as\s+a\s+(.*?)\s+at\s+(.*)/i;
    const match = experience.match(regex);
    
    if (match) {
      setYears(match[1]);
      setPosition(match[2]);
      setCompany(match[3]);
    }
  }, []);

  // Update the full experience text when individual fields change
  useEffect(() => {
    if (years || position || company) {
      const formattedExperience = `${years || "0"} ${years === "1" ? "year" : "years"} as a ${position || "position"} at ${company || "company name"}`;
      setExperience(formattedExperience);
    }
  }, [years, position, company, setExperience]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">
          Please describe your work experience
        </Label>
        <FormDescription className="text-sm text-muted-foreground mt-1 mb-4">
          Fill in the fields below to create a formatted work experience entry.
        </FormDescription>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormItem>
          <FormLabel>Years of Experience</FormLabel>
          <Input
            type="number"
            min="0"
            placeholder="5"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </FormItem>

        <FormItem>
          <FormLabel>Position</FormLabel>
          <Input
            placeholder="Software Engineer"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </FormItem>

        <FormItem>
          <FormLabel>Company</FormLabel>
          <Input
            placeholder="XYZ Inc."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </FormItem>
      </div>

      <div className="mt-4">
        <Label htmlFor="formatted-experience">Formatted Experience</Label>
        <Textarea
          id="formatted-experience"
          placeholder="5 years as a Software Engineer at XYZ Inc."
          value={experience}
          readOnly
          className="bg-muted/50 mt-2"
        />
      </div>
    </div>
  );
};

export default ExperienceStep;
