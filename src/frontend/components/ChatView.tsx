import React, { useEffect, useRef, useMemo } from "react";
import { selectHMSMessages, useHMSStore } from "@100mslive/react-sdk";

// Define the type for HMSMessage based on SDK's type definition
interface HMSMessage {
  message: string;
  senderName?: string; // Allow senderName to be string or undefined
  time: Date;
}

export default function ChatView() {
  // Call useHMSStore at the top level to select messages from the store
  const messages: HMSMessage[] = useHMSStore(selectHMSMessages) || [];
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom of the chat whenever new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Memoized time formatting function for better performance
  const formatTime = useMemo(
    () =>
      (date: Date): string => {
        if (!(date instanceof Date)) return "";
        const hours = date.getHours().toString().padStart(2, "0");
        const mins = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${mins}`;
      },
    [],
  );

  return (
    <div className="flex flex-col w-full justify-end overflow-y-auto p-2 max-w-[200px]">
      {messages.map((message, index) => (
        <div key={index} className="mb-2">
          <div className="flex items-start">
            <div className="bg-black/50 p-2 rounded-lg text-white text-xs w-full break-words">
              {message.message}
            </div>
          </div>
          <div className="text-white text-[9px] mt-1">
            {message.senderName ?? "Unknown Sender"} -{" "}
            {formatTime(message.time)}
          </div>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}
