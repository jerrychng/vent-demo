"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type PasswordFieldProps = React.ComponentProps<typeof Input> & {
  initiallyVisible?: boolean;
};

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, initiallyVisible = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(initiallyVisible);

    return (
      <div className="password-field-wrapper">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          className="password-toggle-button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";

export { PasswordField };
