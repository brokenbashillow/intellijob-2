
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { ReferenceItem } from "@/types/resume";

interface ReferencesSectionProps {
  references: ReferenceItem[];
  setReferences: (references: ReferenceItem[]) => void;
}

export function ReferencesSection({
  references,
  setReferences,
}: ReferencesSectionProps) {
  return (
    <div className="space-y-4 p-4">
      {references.map((ref, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <Input
            placeholder="Reference Name"
            value={ref.name}
            onChange={(e) => {
              const newReferences = [...references];
              newReferences[index].name = e.target.value;
              setReferences(newReferences);
            }}
          />
          <Input
            placeholder="Job Title"
            value={ref.title}
            onChange={(e) => {
              const newReferences = [...references];
              newReferences[index].title = e.target.value;
              setReferences(newReferences);
            }}
          />
          <Input
            placeholder="Company"
            value={ref.company}
            onChange={(e) => {
              const newReferences = [...references];
              newReferences[index].company = e.target.value;
              setReferences(newReferences);
            }}
          />
          <Input
            placeholder="Email"
            type="email"
            value={ref.email}
            onChange={(e) => {
              const newReferences = [...references];
              newReferences[index].email = e.target.value;
              setReferences(newReferences);
            }}
          />
          <Input
            placeholder="Phone Number"
            type="tel"
            value={ref.phone}
            onChange={(e) => {
              const newReferences = [...references];
              newReferences[index].phone = e.target.value;
              setReferences(newReferences);
            }}
          />
          <Button
            variant="destructive"
            onClick={() => {
              const newReferences = references.filter((_, i) => i !== index);
              setReferences(newReferences);
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
          setReferences([
            ...references,
            { name: "", title: "", company: "", email: "", phone: "" },
          ]);
        }}
      >
        Add Reference
      </Button>
    </div>
  );
}
