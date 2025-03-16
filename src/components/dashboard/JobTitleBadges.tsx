
import { Badge } from "@/components/ui/badge"

interface JobTitleBadgesProps {
  jobTitles: string[]
}

const JobTitleBadges = ({ jobTitles }: JobTitleBadgesProps) => {
  if (jobTitles.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {jobTitles.map((title, index) => (
          <Badge key={index} variant="secondary">
            {title}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default JobTitleBadges;
