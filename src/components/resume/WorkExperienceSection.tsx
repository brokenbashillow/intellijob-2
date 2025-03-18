
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase } from "lucide-react";
import { WorkExperienceItem } from "@/hooks/useResumeData";

interface WorkExperienceSectionProps {
  workExperience: WorkExperienceItem[];
  setWorkExperience: (workExperience: WorkExperienceItem[]) => void;
}

export function WorkExperienceSection({
  workExperience,
  setWorkExperience,
}: WorkExperienceSectionProps) {
  return (
    <div className="space-y-4 p-4">
      {workExperience.map((exp, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <Input
            placeholder="Company Name"
            value={exp.company}
            onChange={(e) => {
              const newExperience = [...workExperience];
              newExperience[index].company = e.target.value;
              setWorkExperience(newExperience);
            }}
          />
          <Input
            placeholder="Job Title"
            value={exp.title}
            onChange={(e) => {
              const newExperience = [...workExperience];
              newExperience[index].title = e.target.value;
              setWorkExperience(newExperience);
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={exp.startDate}
              onChange={(e) => {
                const newExperience = [...workExperience];
                newExperience[index].startDate = e.target.value;
                setWorkExperience(newExperience);
              }}
            />
            <Input
              type="date"
              value={exp.endDate}
              onChange={(e) => {
                const newExperience = [...workExperience];
                newExperience[index].endDate = e.target.value;
                setWorkExperience(newExperience);
              }}
            />
          </div>
          <Textarea
            placeholder="Job Description"
            value={exp.description}
            onChange={(e) => {
              const newExperience = [...workExperience];
              newExperience[index].description = e.target.value;
              setWorkExperience(newExperience);
            }}
          />
          <Button
            variant="destructive"
            onClick={() => {
              const newExperience = workExperience.filter((_, i) => i !== index);
              setWorkExperience(newExperience);
            }}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setWorkExperience([
            ...workExperience,
            {
              company: "",
              title: "",
              startDate: "",
              endDate: "",
              description: "",
            },
          ]);
        }}
      >
        Add Work Experience
      </Button>
    </div>
  );
}
