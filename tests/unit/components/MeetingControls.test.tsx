import { render, screen, fireEvent } from "@testing-library/react";
import { useMeeting } from "@/frontend/hooks";
import MeetingControls from "@/frontend/components/MeetingControls";

jest.mock("@/frontend/hooks", () => ({
  useMeeting: jest.fn(),
}));

describe("MeetingControls", () => {
  const mockSetMediaStatus = jest.fn();
  const mockEndMeeting = jest.fn();
  const mockLeaveMeeting = jest.fn();
  const mockSetShowChatWidget = jest.fn();
  const mockWriteText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMeeting as jest.Mock).mockReturnValue({
      mediaStatus: { audio: true, video: true },
      setMediaStatus: mockSetMediaStatus,
      isConnected: true,
      endMeeting: mockEndMeeting,
      localPeerRole: { name: "host" },
      leaveMeeting: mockLeaveMeeting,
      setShowChatWidget: mockSetShowChatWidget,
      showChatWidget: false,
    });
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });
  });

  it("toggles audio on button click", () => {
    render(<MeetingControls />);

    const micButton = screen.getByRole("button", {
      name: /toggle audio/i,
    });

    fireEvent.click(micButton);

    expect(mockSetMediaStatus).toHaveBeenCalledWith({ audio: false });
  });

  it("toggles video on button click", () => {
    render(<MeetingControls />);

    const videoButton = screen.getByRole("button", {
      name: /toggle video/i,
    });

    fireEvent.click(videoButton);

    expect(mockSetMediaStatus).toHaveBeenCalledWith({ video: false });
  });

  it("shows 'Hide Chat' when chat is visible", () => {
    (useMeeting as jest.Mock).mockReturnValueOnce({
      mediaStatus: { audio: true, video: true },
      setMediaStatus: mockSetMediaStatus,
      isConnected: true,
      endMeeting: mockEndMeeting,
      localPeerRole: { name: "host" },
      leaveMeeting: mockLeaveMeeting,
      setShowChatWidget: mockSetShowChatWidget,
      showChatWidget: true,
    });

    render(<MeetingControls />);

    expect(screen.getByText("Hide Chat")).toBeInTheDocument();
  });

  it("copies the meeting URL to clipboard", async () => {
    render(<MeetingControls />);

    const copyButton = screen.getByText(/copy meeting url/i);

    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
  });

  it("renders 'End Meeting and Leave' button for the host", () => {
    render(<MeetingControls />);

    expect(screen.getByText(/end meeting and leave/i)).toBeInTheDocument();
  });

  it("renders 'Leave Meeting' button for non-host users", () => {
    (useMeeting as jest.Mock).mockReturnValueOnce({
      mediaStatus: { audio: true, video: true },
      setMediaStatus: mockSetMediaStatus,
      isConnected: true,
      endMeeting: mockEndMeeting,
      localPeerRole: { name: "participant" },
      leaveMeeting: mockLeaveMeeting,
      setShowChatWidget: mockSetShowChatWidget,
      showChatWidget: false,
    });

    render(<MeetingControls />);

    expect(screen.getByText(/leave meeting/i)).toBeInTheDocument();
  });

  it("handles ending the meeting", () => {
    render(<MeetingControls />);

    const endMeetingButton = screen.getByText(/end meeting and leave/i);

    fireEvent.click(endMeetingButton);

    expect(mockEndMeeting).toHaveBeenCalled();
  });

  it("handles leaving the meeting", () => {
    (useMeeting as jest.Mock).mockReturnValueOnce({
      mediaStatus: { audio: true, video: true },
      setMediaStatus: mockSetMediaStatus,
      isConnected: true,
      endMeeting: mockEndMeeting,
      localPeerRole: { name: "participant" },
      leaveMeeting: mockLeaveMeeting,
      setShowChatWidget: mockSetShowChatWidget,
      showChatWidget: false,
    });

    render(<MeetingControls />);

    const leaveMeetingButton = screen.getByText(/leave meeting/i);

    fireEvent.click(leaveMeetingButton);

    expect(mockLeaveMeeting).toHaveBeenCalled();
  });
});
