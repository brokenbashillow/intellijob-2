
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobErrorMessageProps {
  message: string;
  onRefresh: () => void;
}

const JobErrorMessage = ({ message, onRefresh }: JobErrorMessageProps) => {
  if (!message) return null;
  
  return (
    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          className="ml-2 text-amber-700 hover:text-amber-800 hover:bg-amber-100"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    </div>
  );
};

export default JobErrorMessage;
