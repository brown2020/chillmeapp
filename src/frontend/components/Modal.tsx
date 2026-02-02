"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@chill-ui";

interface ModalProps {
  roomName?: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ roomName, onClose }) => {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "https://chill.me";

  const inviteLink = roomName ? `${baseUrl}/live/${roomName}` : "";

  const copyToClipboard = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-4 flex justify-between items-center">
          <h5
            id="modal-title"
            className="text-lg font-semibold text-card-foreground"
          >
            Invite to Meeting
          </h5>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Share this link to invite others:
            </p>
            {roomName ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                  {inviteLink}
                </code>
                <Button size="sm" onClick={copyToClipboard}>
                  Copy
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No room name provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
