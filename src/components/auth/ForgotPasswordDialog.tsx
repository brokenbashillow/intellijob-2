
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "confirmation";

const ForgotPasswordDialog = ({ isOpen, onClose }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const { toast } = useToast();

  // Reset state when dialog closes
  const handleDialogClose = () => {
    setEmail("");
    setCurrentStep("email");
    setIsLoading(false);
    onClose();
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Request password reset (which sends a link to email)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/dashboard',
      });

      if (error) throw error;

      toast({
        title: "Reset link sent",
        description: `We've sent a password reset link to ${email}`,
      });
      
      setCurrentStep("confirmation");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset link",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "email":
        return (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        );
      
      case "confirmation":
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to:
              </p>
              <p className="font-medium">{email}</p>
              <p className="text-sm text-muted-foreground mt-4">
                Click the link in the email to reset your password.
              </p>
            </div>
            <Button onClick={handleDialogClose} className="mt-4">
              Close
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "email" && "Reset Password"}
            {currentStep === "confirmation" && "Reset Link Sent"}
          </DialogTitle>
        </DialogHeader>
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
