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
  const { sendBroadcastMessage, messages, localPeerId } = useMeeting();
  const messagesCardRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (input.trim()) {
        sendBroadcastMessage(input);
        setInput("");
      }
    }
  };

  const scrollToBottom = () => {
    messagesCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    if (messages.length >= 1) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <Card className="w-full ml-auto bg-card flex flex-col justify-between h-[70vh] p-4">
      <CardHeader className="p-0">
        <div className="w-full rounded-lg flex flex-col gap-2">
          <h1 className="font-bold text-card-foreground">In-Meeting Chat</h1>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto flex-1">
        <ChatMessageList className="p-0">
          <small className="text-muted-foreground">
            Note: This chat is temporary
          </small>

          {messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === localPeerId ? "sent" : "received"}
              ref={index === messages.length - 1 ? messagesCardRef : null}
            >
              <ChatBubbleAvatar
                src=""
                fallback={message.senderName?.slice(0, 2).toUpperCase() || "??"}
              />
              <ChatBubbleMessage>
                <p className="text-xs text-muted-foreground mb-1">
                  {message.senderName || "Unknown"}
                </p>
                <p>{message.message}</p>
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
        </ChatMessageList>
      </CardContent>
      <CardFooter className="p-0">
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
  );
}
