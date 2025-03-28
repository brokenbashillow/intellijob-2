
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Dispatch, SetStateAction } from "react";

interface InputOTPChangePasswordProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  length?: number;
  disabled?: boolean;
}

const InputOTPChangePassword = ({
  value,
  setValue,
  length = 6,
  disabled = false,
}: InputOTPChangePasswordProps) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <InputOTP
        maxLength={length}
        value={value}
        onChange={setValue}
        disabled={disabled}
        className="gap-2"
      >
        <InputOTPGroup>
          {Array.from({ length }).map((_, index) => (
            <InputOTPSlot key={index} index={index} className="rounded-md" />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <p className="text-xs text-muted-foreground">
        Enter the {length}-digit code sent to your email
      </p>
    </div>
  );
};

export default InputOTPChangePassword;
