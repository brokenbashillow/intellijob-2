
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { EducationItem } from "@/types/resume";

interface EducationSectionProps {
  education: EducationItem[];
  setEducation: (education: EducationItem[]) => void;
}

export function EducationSection({ education, setEducation }: EducationSectionProps) {
  return (
    <div className="space-y-4 p-4">
      {education.map((edu, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <Input
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => {
              const newEducation = [...education];
              newEducation[index].degree = e.target.value;
              setEducation(newEducation);
            }}
          />
          <Input
            placeholder="School Name"
            value={edu.school}
            onChange={(e) => {
              const newEducation = [...education];
              newEducation[index].school = e.target.value;
              setEducation(newEducation);
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={edu.startDate}
              onChange={(e) => {
                const newEducation = [...education];
                newEducation[index].startDate = e.target.value;
                setEducation(newEducation);
              }}
            />
            <Input
              type="date"
              value={edu.endDate}
              onChange={(e) => {
                const newEducation = [...education];
                newEducation[index].endDate = e.target.value;
                setEducation(newEducation);
              }}
            />
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              const newEducation = education.filter((_, i) => i !== index);
              setEducation(newEducation);
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
          setEducation([
            ...education,
            { degree: "", school: "", startDate: "", endDate: "" },
          ]);
        }}
      >
        Add Education
      </Button>
    </div>
  );
}
