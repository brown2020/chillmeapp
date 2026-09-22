"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@chill-ui";

interface ModalProps {
  roomName?: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ roomName, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "https://chill.me";

  const inviteLink = roomName ? `${baseUrl}/live/${roomName}` : "";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      dialog.showModal();
    }
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [onClose]);

  const copyToClipboard = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-lg border border-border bg-card p-0 text-card-foreground shadow-lg backdrop:bg-black/50"
      aria-labelledby="modal-title"
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
    </dialog>
  );
};

export default Modal;
