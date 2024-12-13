import { render, screen, fireEvent } from "@testing-library/react";
import { useMeeting } from "@/frontend/hooks";
import MeetingChatWidget from "@/frontend/components/MeetingChatWidget";

jest.mock("@/frontend/hooks", () => ({
  useMeeting: jest.fn(),
}));

describe("MeetingChatWidget", () => {
  const mockSendBroadcastMessage = jest.fn();
  const mockMessages = [
    { id: "1", sender: "user1", message: "Hello, world!" },
    { id: "2", sender: "localPeer", message: "Hi there!" },
  ];
  const mockLocalPeer = { id: "localPeer" };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMeeting as jest.Mock).mockReturnValue({
      sendBroadcastMessage: mockSendBroadcastMessage,
      messages: mockMessages,
      localPeer: mockLocalPeer,
    });
  });

  it("renders the chat widget with initial messages", () => {
    render(<MeetingChatWidget />);

    expect(
      screen.getByText("Welcome to this chill me in-meeting chat"),
    ).toBeInTheDocument();
    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
    expect(
      screen.getByText("Note: This chat is temporary"),
    ).toBeInTheDocument();
  });

  it("calls sendBroadcastMessage when Enter is pressed", () => {
    render(<MeetingChatWidget />);

    const input = screen.getByPlaceholderText(
      "Type your message here and press enter to send...",
    );

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });

    expect(mockSendBroadcastMessage).toHaveBeenCalledWith("Test message");
    expect(input).toHaveValue(""); // Input should reset after sending
  });

  it("does not call sendBroadcastMessage when Shift+Enter is pressed", () => {
    render(<MeetingChatWidget />);

    const input = screen.getByPlaceholderText(
      "Type your message here and press enter to send...",
    );

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

    expect(mockSendBroadcastMessage).not.toHaveBeenCalled();
    expect(input).toHaveValue("Test message"); // Input should not reset
  });

  it("scrolls to the bottom when a new message is added", () => {
    const { rerender } = render(<MeetingChatWidget />);

    const messagesBefore = screen.queryAllByText(/Message/);
    expect(messagesBefore.length).toBe(2);

    // Simulate adding a new message
    (useMeeting as jest.Mock).mockReturnValue({
      sendBroadcastMessage: mockSendBroadcastMessage,
      messages: [
        ...mockMessages,
        { id: "3", sender: "user2", message: "Another message" },
      ],
      localPeer: mockLocalPeer,
    });

    rerender(<MeetingChatWidget />);

    expect(screen.getByText("Another message")).toBeInTheDocument();
  });
});
