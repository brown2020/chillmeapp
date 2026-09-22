import { cva } from "class-variance-authority";

export const chatBubbleVariant = cva(
  "flex gap-2 max-w-[60%] items-end relative group",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  },
);

export const chatBubbleMessageVariants = cva("py-2 px-3", {
  variants: {
    variant: {
      received:
        "bg-secondary text-secondary-foreground rounded-r-lg rounded-tl-lg",
      sent: "bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg",
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});
