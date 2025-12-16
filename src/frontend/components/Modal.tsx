import React, { useEffect, useState } from "react";

interface ModalProps {
  roomName?: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ roomName, onClose }) => {
  const [baseUrl, setBaseUrl] = useState<string>("https://chill.me");

  useEffect(() => {
    // Fetch the base URL from environment variables or use a default
    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (envBaseUrl) {
      setBaseUrl(envBaseUrl);
    }
  }, []);

  // Function to handle closing the modal
  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      id="exampleModal"
      tabIndex={-1}
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
      aria-modal="true"
      role="dialog"
    >
      {/* Modal content area */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="border-b p-4 flex justify-between items-center">
          <h5
            className="text-lg font-semibold text-black"
            id="exampleModalLabel"
          >
            Livestream: {roomName}
          </h5>
          {/* Close button that triggers the onClose function */}
          <button
            type="button"
            className="text-black"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 text-black">
          <p>Invitation Link</p>
          {roomName ? (
            <p>{`${baseUrl}/live/${roomName}`}</p>
          ) : (
            <p>No room name provided.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize the component
const MemoizedModal = React.memo(Modal);

// Set the display name for debugging purposes
MemoizedModal.displayName = "Modal";

export default MemoizedModal;
