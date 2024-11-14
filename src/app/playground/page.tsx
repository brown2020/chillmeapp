import { redirect } from "next/navigation";
import MeetingChatWidget from "@frontend/components/MeetingChatWidget";

const PlaygroundPage = () => {
  const nodeenv = process.env.NODE_ENV;
  if (nodeenv === "development") {
    return <MeetingChatWidget />;
  } else {
    redirect("/");
  }
};

export default PlaygroundPage;
