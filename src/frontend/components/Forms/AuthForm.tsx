"use client";

import { Button, Input, GoogleIcon } from "@chill-ui";
import { useAuth } from "@frontend/hooks";

const AuthForm = () => {
  const { signinWithGoogle } = useAuth();

  return (
    <div className="flex h-[80vh] w-full justify-center items-center p-4 sm:p-8">
      <div className="flex flex-col gap-6 w-full max-w-md border border-zinc-700 rounded-lg p-8 sm:p-10">
        <h3 className="text-2xl sm:text-3xl font-semibold text-center">
          Login
        </h3>
        <p className="text-sm text-center text-zinc-600">
          Enter your credentials to start collaborating with your team
        </p>

        <Input type="email" placeholder="Email" className="w-full" />
        <Input type="password" placeholder="Password" className="w-full" />

        <Button className="w-full">Login with Email</Button>

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
