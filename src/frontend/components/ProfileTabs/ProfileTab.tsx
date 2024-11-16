import { useAuth } from "@frontend/hooks";
import { Input, Button } from "@chill-ui";
import { createCheckoutSession } from "@backend/services/payment";
import { useState } from "react";

const ProfileTab = () => {
  const auth = useAuth();
  const [quantity, setQuantity] = useState(100);

  const handleCheckout = async () => {
    const session = await createCheckoutSession(
      auth.user?.uid as string,
      auth.profile?.stripeCustomerId || "",
      quantity,
    );
    window.open(session.url as string, "_blank");
  };

  return (
    <div>
      <div className="flex flex-row justify-between w-full">
        <div>
          <p>Available Credits: {auth.profile?.availableCredits}</p>
        </div>
        <div className="flex flex-row gap-4">
          <Input
            type="number"
            min={0}
            max={30000}
            value={quantity}
            className="w-28 no-scrollba"
            onChange={(e) => {
              setQuantity(parseInt(e.target.value) || 0);
            }}
          />
          <Button disabled={quantity < 1} onClick={handleCheckout}>
            Buy Credits
          </Button>
        </div>
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
