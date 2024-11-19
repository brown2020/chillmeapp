import { useAuth } from "@frontend/hooks";
import { Input, Button, Separator, InputLabel } from "@chill-ui";
import { createCheckoutSession } from "@backend/services/payment";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import clsx from "clsx";

interface FormVals {
  email: string;
  displayName: string;
}

const ProfileTab = () => {
  const auth = useAuth();
  const [quantity, setQuantity] = useState(100);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormVals>({
    defaultValues: {
      displayName: auth.user?.displayName || "Not Available",
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

  const onSubmit: SubmitHandler<FormVals> = (data) => {
    auth.updateUser(data);
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
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <InputLabel label="Name" htmlFor="name" className="mb-3" />
            <Input
              type="text"
              id="name"
              className={clsx("w-full")}
              {...register("displayName", { required: "Name is required" })}
              error={Boolean(errors.displayName)}
              errorMessage={errors.displayName?.message}
            />
          </div>

          <div>
            <InputLabel label="Email" htmlFor="email" className="mb-3" />
            <Input
              type="email"
              id="email"
              placeholder="Email"
              className={clsx("w-full")}
              value={auth.user?.email as string}
              disabled
            />
          </div>

          <div>
            <InputLabel
              label="Payment ID"
              htmlFor="paymentId"
              className="mb-3"
            />
            <Input
              type="text"
              id="id"
              className={clsx("w-full")}
              disabled
              value={auth.profile?.stripeCustomerId}
            />
          </div>
        </div>
        <div className="ml-auto text-right">
          <Button type="submit">Update Profile</Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
