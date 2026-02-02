"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/hooks";
import { Button, Input } from "@chill-ui";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

type FormVals = {
  email: string;
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const { completeEmailLinkSignIn, checkIsEmailSignInLink } = useAuth();
  const [status, setStatus] = useState<
    "checking" | "needsEmail" | "success" | "error"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>();

  useEffect(() => {
    const verifyEmail = async () => {
      const url = window.location.href;

      // Check if this is a valid sign-in link
      if (!checkIsEmailSignInLink(url)) {
        setStatus("error");
        setErrorMessage("This link is invalid or has expired.");
        return;
      }

      // Try to complete sign-in (will succeed if email is in localStorage)
      const success = await completeEmailLinkSignIn(url);

      if (success) {
        setStatus("success");
        // Redirect to home after brief delay
        setTimeout(() => {
          router.push("/live");
        }, 1500);
      } else {
        // Need to ask for email
        setStatus("needsEmail");
      }
    };

    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: FormVals) => {
    // Store email and retry
    window.localStorage.setItem("emailForSignIn", data.email);
    const url = window.location.href;
    const success = await completeEmailLinkSignIn(url);

    if (success) {
      setStatus("success");
      setTimeout(() => {
        router.push("/live");
      }, 1500);
    } else {
      setStatus("error");
      setErrorMessage("Unable to verify your email. Please try again.");
    }
  };

  if (status === "checking") {
    return (
      <div className="flex h-[80vh] w-full justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex h-[80vh] w-full justify-center items-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Email verified!</h3>
          <p className="text-muted-foreground">Redirecting you to the app...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-[80vh] w-full justify-center items-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Verification failed</h3>
          <p className="text-muted-foreground">{errorMessage}</p>
          <Button onClick={() => router.push("/auth/signin")}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  // needsEmail - prompt for email
  return (
    <div className="flex h-[80vh] w-full justify-center items-center p-4 sm:p-8">
      <div className="flex flex-col gap-6 w-full max-w-md border border-zinc-700 rounded-lg p-8 sm:p-10">
        <h3 className="text-2xl font-semibold text-center">
          Confirm your email
        </h3>
        <p className="text-sm text-center text-muted-foreground">
          Please enter the email address you used to request this sign-in link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Input
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
            error={Boolean(errors.email)}
            errorMessage={errors.email?.message}
          />

          <Button disabled={isSubmitting} type="submit" className="w-full">
            {isSubmitting ? "Verifying..." : "Verify email"}
          </Button>
        </form>
      </div>
    </div>
  );
}
