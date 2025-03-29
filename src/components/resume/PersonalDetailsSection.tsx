
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonalDetails } from "@/hooks/useResumeData";
import { getAvatarColors } from "@/lib/avatarUtils";

interface PersonalDetailsSectionProps {
  personalDetails: PersonalDetails;
  setPersonalDetails: (details: PersonalDetails) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PersonalDetailsSection({
  personalDetails,
  setPersonalDetails,
  handleImageUpload,
}: PersonalDetailsSectionProps) {
  // Determine education field for avatar color
  const avatarColorClass = getAvatarColors(personalDetails.educationField || personalDetails.industry);

  return (
    <div className="space-y-4 p-2 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="relative mx-auto md:mx-0">
          <Avatar className="h-20 w-20 md:h-24 md:w-24">
            <AvatarImage src={personalDetails.profilePicture} />
            <AvatarFallback className={avatarColorClass}>
              {personalDetails.firstName?.[0]}{personalDetails.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Input
            placeholder="First Name"
            value={personalDetails.firstName}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                firstName: e.target.value,
              })
            }
          />
          <Input
            placeholder="Last Name"
            value={personalDetails.lastName}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                lastName: e.target.value,
              })
            }
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="educationField">Education Field</Label>
          <Input
            id="educationField"
            placeholder="e.g., Computer Science, Business"
            value={personalDetails.educationField || ""}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                educationField: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            placeholder="e.g., Technology, Finance"
            value={personalDetails.industry || ""}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                industry: e.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
