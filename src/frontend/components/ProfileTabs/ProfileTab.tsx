import { useAuth } from "@frontend/hooks";
import { Input, Button } from "@chill-ui";

const ProfileTab = () => {
  const auth = useAuth();

  return (
    <div>
      <div className="flex flex-row gap-4">
        <Input />
        <Button>Buy Credits</Button>
      </div>
      <div className="mt-5">
        <p>Name : {auth.user?.displayName || "Not Available"}</p>
        <p>Email : {auth.user?.email || ""}</p>
        <p> ID : {auth.user?.uid}</p>
      </div>
    </div>
  );
};

export default ProfileTab;
