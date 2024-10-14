import { Button, ChillIcon } from "@chill-ui";

const AuthForm = () => {
  return (
    <div>
      <h1>This is Login Page</h1>
      <Button>
        <ChillIcon.Mail className="mr-2 h-4 w-4" /> Login with Email
      </Button>
    </div>
  );
};

export default AuthForm;
