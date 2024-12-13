// tests/unit/components/CreateMeetingForm.test.tsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateMeetingForm from "@/frontend/components/Forms/CreateMeetingForm";
import { createRoom } from "@/backend/services/broadcasting";
import { saveMeeting } from "@/frontend/services/meeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import { useMeeting } from "@/frontend/hooks";

jest.mock("@/backend/services/broadcasting", () => ({
  createRoom: jest.fn(),
}));

jest.mock("@/frontend/services/meeting", () => ({
  saveMeeting: jest.fn(),
}));

jest.mock("@/frontend/zustand/useAuthStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("@frontend/hooks", () => ({
  useMeeting: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("CreateMeetingForm", () => {
  const mockSetMediaStatus = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMeeting as jest.Mock).mockReturnValue({
      mediaStatus: { audio: true, video: true },
      setMediaStatus: mockSetMediaStatus,
    });

    (useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
      user: { uid: "test-user" },
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("renders the form and controls", () => {
    render(<CreateMeetingForm />);

    expect(screen.getByText("Record Session")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("toggles media status on control button clicks", () => {
    render(<CreateMeetingForm />);

    const micButton = screen.getByRole("button", { name: /toggle audio/i });
    const videoButton = screen.getByRole("button", { name: /toggle video/i });

    fireEvent.click(micButton);
    expect(mockSetMediaStatus).toHaveBeenCalledWith({ audio: false });

    fireEvent.click(videoButton);
    expect(mockSetMediaStatus).toHaveBeenCalledWith({ video: false });
  });

  it("shows an error when room creation fails", async () => {
    (createRoom as jest.Mock).mockResolvedValue({
      error: "Failed to create room",
    });

    render(<CreateMeetingForm />);

    const joinButton = screen.getByRole("button", { name: /join/i });
    fireEvent.click(joinButton);

    await waitFor(() =>
      expect(screen.getByText(/problem creating room/i)).toBeInTheDocument(),
    );
  });

  it("saves the meeting and redirects when room creation succeeds", async () => {
    const mockRoomResponse = { room: { id: "room-id" } };
    (createRoom as jest.Mock).mockResolvedValue(mockRoomResponse);
    (saveMeeting as jest.Mock).mockResolvedValue(true);

    render(<CreateMeetingForm />);

    const joinButton = screen.getByRole("button", { name: /join/i });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(saveMeeting).toHaveBeenCalledWith(
        "test-user",
        mockRoomResponse.room,
      );
      expect(mockPush).toHaveBeenCalledWith("/live/room-id");
    });
  });

  it("toggles the recording session switch", () => {
    render(<CreateMeetingForm />);

    const recordSwitch = screen.getByRole("switch");
    fireEvent.click(recordSwitch);

    expect(recordSwitch).toBeChecked();
  });

  it("renders an error message in case of submission error", async () => {
    (createRoom as jest.Mock).mockResolvedValue({
      error: "Failed to create room",
    });

    render(<CreateMeetingForm />);

    const joinButton = screen.getByRole("button", { name: /join/i });
    fireEvent.click(joinButton);

    await waitFor(() =>
      expect(screen.getByText(/problem creating room/i)).toBeInTheDocument(),
    );
  });

  it("disables the join button when loading", async () => {
    (createRoom as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ room: { id: "room-id" } }), 500),
        ),
    );

    render(<CreateMeetingForm />);

    const joinButton = screen.getByRole("button", { name: /join/i });
    fireEvent.click(joinButton);

    expect(joinButton).toBeDisabled();
  });
});
