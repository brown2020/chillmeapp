"use client";

import { useState } from "react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatInput,
  ChatMessageList,
  Card,
  CardContent,
  CardFooter,
} from "@/frontend/components/ui";

const initialMessages = [
  {
    id: 1,
    variant: "received",
    avatar: "🤖",
    text: "Hello! How can I assist you today?",
  },
  {
    id: 2,
    variant: "sent",
    avatar: "👨🏽",
    text: "I'm just exploring this chat example!",
  },
];

export default function MeetingChatWidget() {
  const [messages] = useState(initialMessages);
  const [input, setInput] = useState("");

  return (
    <>
      <Card className="w-1/3 ml-auto max-h-screen bg-white">
        <CardContent className="p-0">
          <ChatMessageList>
            <div className="w-full rounded-lg p-2 flex flex-col gap-2">
              <h1 className="font-bold text-black">
                Welcome to this chill me in-meeting chat
              </h1>
              <p className="text-muted-foreground text-sm">
                This is a simple Next.JS example application created using{" "}
              </p>
            </div>

            {/* Render Messages from Array */}
            {messages.map((message) => (
              <ChatBubble key={message.id} variant={message.variant as "sent"}>
                <ChatBubbleAvatar src="" fallback={message.avatar} />
                <ChatBubbleMessage>
                  <p>{message.text}</p>
                </ChatBubbleMessage>
              </ChatBubble>
            ))}
          </ChatMessageList>
        </CardContent>
        <CardFooter>
          {/* Static Input Form */}
          <div className="w-full mt-2">
            <form className="relative rounded-lg bg-background">
              <ChatInput
                value={input}
                placeholder="Type your message here and press enter to send..."
                className="min-h-12 resize-none rounded-lg bg-zinc-300 p-3 shadow-none border-none text-black"
                onChange={(e) => setInput(e.target.value)}
              />
            </form>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
