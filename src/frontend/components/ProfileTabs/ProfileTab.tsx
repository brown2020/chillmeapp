import { useAuth } from "@frontend/hooks";
import { Input, Button } from "@chill-ui";
import { createCheckoutSession } from "@backend/services/payment";
import { useState } from "react";

const ProfileTab = () => {
  const auth = useAuth();
  const [quantity, setQuantity] = useState(0);

  const handleCheckout = async () => {
    const session = await createCheckoutSession(
      auth.profile?.stripeCustomerId || "",
      2,
    );
    window.open(session.url as string, "_blank");
  };

  return (
    <div>
      <div className="mb-4">
        <p>Available Credits: 2000</p>
      </div>
      <div className="flex flex-row gap-4">
        <Input
          type="number"
          min={0}
          max={30}
          value={quantity}
          className="w-20"
          onChange={(e) => {
            setQuantity(parseInt(e.target.value));
          }}
        />
        <Button disabled={quantity < 1} onClick={handleCheckout}>
          Buy Credits
        </Button>
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
