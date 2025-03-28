
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
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "confirmation" | "error";

const ForgotPasswordDialog = ({ isOpen, onClose }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  // Reset state when dialog closes
  const handleDialogClose = () => {
    setEmail("");
    setCurrentStep("email");
    setIsLoading(false);
    setErrorMessage("");
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
      // Build a proper redirect URL with the current origin
      const redirectTo = `${window.location.origin}/dashboard`;
      
      // Request password reset (which sends a link to email)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) throw error;

      toast({
        title: "Reset link sent",
        description: `We've sent a password reset link to ${email}`,
      });
      
      setCurrentStep("confirmation");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrorMessage(error.message || "Failed to send reset link");
      setCurrentStep("error");
      
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
            <DialogDescription className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
              The link will be valid for 24 hours.
            </DialogDescription>
            
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
                Click the link in the email to reset your password. If you don't see the email, check your spam folder.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The link is valid for 24 hours.
              </p>
            </div>
            <Button onClick={handleDialogClose} className="mt-4">
              Close
            </Button>
          </div>
        );
      
      case "error":
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Error</h3>
              <p className="text-sm text-muted-foreground">
                We couldn't send the password reset link:
              </p>
              <p className="font-medium text-red-500">{errorMessage}</p>
              <p className="text-sm text-muted-foreground mt-4">
                Please try again or contact support if the problem persists.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setCurrentStep("email")}>
                Try Again
              </Button>
              <Button onClick={handleDialogClose}>
                Close
              </Button>
            </div>
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
            {currentStep === "error" && "Something Went Wrong"}
          </DialogTitle>
        </DialogHeader>
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
