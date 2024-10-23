"use client";

import { Button, Input, GoogleIcon } from "@chill-ui";
import { useAuth } from "@frontend/hooks";
import { useForm } from "react-hook-form";
import clsx from "clsx";

type FormVals = {
  email: string;
  password: string;
};

const AuthForm = () => {
  const { signinWithGoogle, loginWithEmail } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>();

  const onSubmit = async (data: FormVals) => {
    await loginWithEmail(data.email, data.password);
  };

  return (
    <div className="flex h-[80vh] w-full justify-center items-center p-4 sm:p-8">
      <div className="flex flex-col gap-6 w-full max-w-md border border-zinc-700 rounded-lg p-8 sm:p-10">
        <h3 className="text-2xl sm:text-3xl font-semibold text-center">
          Login
        </h3>
        <p className="text-sm text-center text-zinc-600">
          Enter your credentials to start collaborating with your team
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Input
            type="email"
            placeholder="Email"
            className={clsx("w-full")}
            {...register("email", { required: "Email is required" })}
            error={Boolean(errors.email)}
            errorMessage={errors.email?.message}
          />

          <Input
            type="password"
            placeholder="Password"
            className={clsx("w-full")}
            {...register("password", {
              required: "Password is required",
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                message:
                  "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character",
              },
            })}
            error={Boolean(errors.password)}
            errorMessage={errors.password?.message}
          />

          <Button disabled={isSubmitting} type="submit" className="w-full">
            Login with Email
          </Button>
        </form>

        <div className="text-sm text-center">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button
          className="w-full bg-white text-black hover:bg-zinc-800 hover:text-white group"
          onClick={signinWithGoogle}
        >
          <GoogleIcon className="mr-2 fill-black group-hover:fill-white" />
          Login with Google
        </Button>
      </div>
    </div>
  );
};

export default AuthForm;
