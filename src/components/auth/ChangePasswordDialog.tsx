
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import InputOTPChangePassword from "./InputOTPChangePassword";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "credentials" | "verification" | "new_password";

const ChangePasswordDialog = ({ isOpen, onClose }: ChangePasswordDialogProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>("credentials");
  const { toast } = useToast();

  // Reset state when dialog closes
  const handleDialogClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setVerificationCode("");
    setCurrentStep("credentials");
    setIsLoading(false);
    onClose();
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your current password.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current user's email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        throw new Error("User email not found");
      }
      
      setEmail(user.email);
      
      // Request password reset (which sends a code to email)
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/dashboard',
      });

      if (error) throw error;

      toast({
        title: "Verification code sent",
        description: `We've sent a verification code to ${user.email}`,
      });
      
      setCurrentStep("verification");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send verification code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter the complete verification code.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify the OTP code
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'recovery'
      });

      if (error) throw error;

      toast({
        title: "Code verified",
        description: "Your verification code has been confirmed.",
      });
      
      setCurrentStep("new_password");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Invalid verification code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password should be at least 6 characters long.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your password has been updated successfully.",
      });
      
      // Reset form and close dialog
      handleDialogClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while updating your password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "credentials":
        return (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending Code..." : "Send Verification Code"}
              </Button>
            </div>
          </form>
        );
      
      case "verification":
        return (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-4">
              <Label htmlFor="verification-code" className="text-center block">
                Verification Code
              </Label>
              <InputOTPChangePassword
                value={verificationCode}
                setValue={setVerificationCode}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCurrentStep("credentials")}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading || verificationCode.length < 6}>
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </div>
          </form>
        );
      
      case "new_password":
        return (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCurrentStep("verification")}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
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
            {currentStep === "credentials" && "Change Password"}
            {currentStep === "verification" && "Enter Verification Code"}
            {currentStep === "new_password" && "Set New Password"}
          </DialogTitle>
        </DialogHeader>
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
