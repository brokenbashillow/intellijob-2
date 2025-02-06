import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface SignUpFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignUpForm = ({ isOpen, onClose }: SignUpFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"employee" | "employer">("employee");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            user_type: userType,
            company_name: userType === "employer" ? name : null,
          },
        },
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Success!",
          description: "Your account has been created successfully.",
        });
        navigate(userType === "employee" ? "/assessment" : "/employer-assessment");
        onClose();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during sign up.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Your Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>I am signing up as:</Label>
            <RadioGroup
              defaultValue="employee"
              onValueChange={(value) => setUserType(value as "employee" | "employer")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee" id="employee" />
                <Label htmlFor="employee">Employee</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employer" id="employer" />
                <Label htmlFor="employer">Employer</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">
              {userType === "employer" ? "Company Name" : "Full Name"}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={
                userType === "employer"
                  ? "Enter your company name"
                  : "Enter your full name"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpForm;