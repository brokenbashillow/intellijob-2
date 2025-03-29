
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { CertificateItem } from "@/hooks/useResumeData";

interface CertificatesSectionProps {
  certificates: CertificateItem[];
  setCertificates: (certificates: CertificateItem[]) => void;
}

export function CertificatesSection({
  certificates,
  setCertificates,
}: CertificatesSectionProps) {
  return (
    <div className="space-y-4 p-2 md:p-4">
      {certificates.map((cert, index) => (
        <div key={index} className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-lg">
          <Input
            placeholder="Certificate Name"
            value={cert.name}
            onChange={(e) => {
              const newCertificates = [...certificates];
              newCertificates[index].name = e.target.value;
              setCertificates(newCertificates);
            }}
          />
          <Input
            placeholder="Issuing Organization"
            value={cert.organization}
            onChange={(e) => {
              const newCertificates = [...certificates];
              newCertificates[index].organization = e.target.value;
              setCertificates(newCertificates);
            }}
          />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date Obtained</label>
            <Input
              type="date"
              value={cert.dateObtained}
              onChange={(e) => {
                const newCertificates = [...certificates];
                newCertificates[index].dateObtained = e.target.value;
                setCertificates(newCertificates);
              }}
            />
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              const newCertificates = certificates.filter((_, i) => i !== index);
              setCertificates(newCertificates);
            }}
            className="w-full md:w-auto"
            size="sm"
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setCertificates([
            ...certificates,
            { name: "", organization: "", dateObtained: "" },
          ]);
        }}
      >
        Add Certificate
      </Button>
    </div>
  );
}
