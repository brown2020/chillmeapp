"use client";

import { useEffect, useState, useRef } from "react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatInput,
  ChatMessageList,
  CardHeader,
  Card,
  CardContent,
  CardFooter,
} from "@/frontend/components/ui";
import { useMeeting } from "../hooks";

export default function MeetingChatWidget() {
  const [input, setInput] = useState("");
  const { sendBroadcastMessage, messages, localPeer } = useMeeting();
  const messagesCardRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendBroadcastMessage(input);
      setInput("");
    }
  };

  const scrollToBottom = () => {
    console.log(messagesCardRef.current);
    messagesCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    console.log("Scrolling to bottom");
  };

  useEffect(() => {
    if (messages.length >= 1) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <>
      <Card className="w-full ml-auto max-h-screen bg-white flex flex-col justify-between max-h-[70vh] h-[70vh] p-4">
        <CardHeader className="p-0">
          <div className="w-full rounded-lg flex flex-col gap-2">
            <h1 className="font-bold text-black">
              Welcome to this chill me in-meeting chat
            </h1>
          </div>
        </CardHeader>
        <CardContent className="p-0 scrollbar overflow-scroll">
          <ChatMessageList className="p-0">
            <small className="text-muted-foreground">
              Note: This chat is temporary
            </small>

            {/* Render Messages from Array */}
            {messages.map((message, index) => (
              <ChatBubble
                key={message.id}
                variant={message.sender === localPeer?.id ? "sent" : "received"}
                ref={index === messages.length - 1 ? messagesCardRef : null}
              >
                <ChatBubbleAvatar src="" fallback={"AN"} />
                <ChatBubbleMessage>
                  <p>{message.message}</p>
                </ChatBubbleMessage>
              </ChatBubble>
            ))}
          </ChatMessageList>
        </CardContent>
        <CardFooter className="p-0">
          {/* Static Input Form */}
          <div className="w-full mt-5">
            <form className="relative rounded-lg bg-background">
              <ChatInput
                value={input}
                placeholder="Type your message here and press enter to send..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </form>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
