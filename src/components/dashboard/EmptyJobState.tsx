
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyJobStateProps {
  onRefresh: () => void;
}

const EmptyJobState = ({ onRefresh }: EmptyJobStateProps) => {
  return (
    <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
      <p className="text-muted-foreground mb-3">No job recommendations found.</p>
      <p className="text-sm text-muted-foreground mb-4">Try refreshing or update your profile with more details.</p>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Recommendations
      </Button>
    </div>
  );
};

export default EmptyJobState;
