import { Button, Input, GoogleIcon } from "@chill-ui";

const AuthForm = () => {
  return (
    <div className="flex h-[70vh] w-full justify-center items-center">
      <div className="flex flex-col gap-4 w-1/3 gap-3 border-solid border border-zinc-700 rounded-lg p-10">
        <h3 className="text-3xl">Login</h3>
        <h1 className="text-sm">
          Enter your credentials to start collaborating with your team
        </h1>
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Button className="w-full">Login with Email</Button>

        <div className="text-sm text-center">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button className="w-full bg-white hover:bg-zinc-800 hover:text-white text-black hover:fill-white group">
          <GoogleIcon className="mr-2 fill-black group-hover:fill-white" />
          Login with Google
        </Button>
      </div>
    </div>
  );
};

export default AuthForm;
