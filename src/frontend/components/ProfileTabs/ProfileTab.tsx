import { useAuth } from "@frontend/hooks";
import { Input, Button, Separator, InputLabel } from "@chill-ui";
import { createCheckoutSession } from "@backend/services/payment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";

const ProfileTab = () => {
  const auth = useAuth();
  const [quantity, setQuantity] = useState(100);

  const {
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: auth.user?.displayName || "Not Available",
      email: auth.user?.email || "",
      id: auth.user?.uid || "",
    },
  });

  const handleCheckout = async () => {
    const session = await createCheckoutSession(
      auth.user?.uid as string,
      auth.profile?.stripeCustomerId || "",
      quantity,
      window.location.origin,
    );
    window.open(session.url as string, "_self");
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm">
          Update your account settings. Set your preferred language and
          timezone.
        </p>
      </div>
      <Separator />
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
            className="w-28"
            onChange={(e) => {
              setQuantity(parseInt(e.target.value) || 0);
            }}
          />
          <Button disabled={quantity < 1} onClick={handleCheckout}>
            Buy Credits
          </Button>
        </div>
      </div>
      <form className="space-y-4">
        <div>
          <InputLabel label="Name" htmlFor="name" className="mb-3" />
          <Input
            type="text"
            id="name"
            className={clsx("w-full")}
            {...register("name", { required: "Name is required" })}
            error={Boolean(errors.name)}
            errorMessage={errors.name?.message}
          />
        </div>

        <div>
          <InputLabel label="Email" htmlFor="email" className="mb-3" />
          <Input
            type="email"
            id="email"
            placeholder="Email"
            className={clsx("w-full")}
            {...register("email", { required: "Email is required" })}
            error={Boolean(errors.email)}
            errorMessage={errors.email?.message}
          />
        </div>

        <div>
          <InputLabel label="ID" htmlFor="id" className="mb-3" />
          <Input
            type="text"
            id="id"
            className={clsx("w-full")}
            {...register("id", { required: "ID is required" })}
            error={Boolean(errors.id)}
            errorMessage={errors.id?.message}
          />
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default ProfileTab;
