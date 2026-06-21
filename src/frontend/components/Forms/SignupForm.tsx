"use client";

import { Button, Input, PasswordInput } from "@chill-ui";
import { useForm } from "react-hook-form";
import { useAuth } from "@/frontend/hooks";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AuthShell from "./AuthShell";

type FormVals = {
  email: string;
  password: string;
};

const SignupForm = () => {
  const { createAccount } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>();

  const onSubmit = async (data: FormVals) => {
    await createAccount(data.email, data.password);
  };

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Get ready to meet"
      description="Create a Chill.me account to host rooms, invite guests, and keep track of completed sessions."
    >
      <div className="w-full max-w-md space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.email)}
              {...register("email", { required: "Email is required" })}
              error={Boolean(errors.email)}
              errorMessage={errors.email?.message}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium">
              Password
            </label>
            <PasswordInput
              id="signup-password"
              placeholder="Create a password"
              autoComplete="new-password"
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.password)}
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Use at least 8 characters with uppercase, lowercase, a number, and a special character",
                },
              })}
              errorMessage={errors.password?.message}
              error={Boolean(errors.password)}
            />
          </div>

          <Button
            disabled={isSubmitting}
            type="submit"
            className="h-11 w-full gap-2"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default SignupForm;
