import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JobTitleStepProps {
  JobTitle: string;
  setJobTitle: (value: string) => void;
}

const jobTitleStep = ({ JobTitle, setJobTitle }: JobTitleStepProps) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="jobTitle">
        What job title do you want to be hired for?
      </Label>
      <Input
        id="jobTitle"
        placeholder="Junior Software Engineer"
        value={JobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />
    </div>
  );
};

export default jobTitleStep;