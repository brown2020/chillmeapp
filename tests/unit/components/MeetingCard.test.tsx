import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { getUserById } from "@/backend/services/auth";
import { fetchRecording } from "@/frontend/services/meeting";
import MeetingCard from "@/frontend/components/MeetingCard";

jest.mock("@/backend/services/auth", () => ({
  getUserById: jest.fn(),
}));

jest.mock("@/frontend/services/meeting", () => ({
  fetchRecording: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("MeetingCard", () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  const mockMeetingData = {
    name: "Team Meeting",
    broadcaster: "host123",
    created_at: { seconds: 1690000000 },
    session_duration: 3600,
    recording_info: {
      enabled: true,
      is_recording_ready: true,
      recording_storage_path: "path/to/recording",
    },
  };

  it("displays meeting information correctly", async () => {
    (getUserById as jest.Mock).mockResolvedValue({ displayName: "John Doe" });
    (fetchRecording as jest.Mock).mockResolvedValue("http://recording.url");

    render(<MeetingCard data={mockMeetingData} />);

    expect(screen.getByText("Team Meeting")).toBeInTheDocument();
    expect(screen.getByText("Host: John Doe")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Meeting Duration")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("Watch Recording")).toBeInTheDocument(),
    );
  });

  it("handles unavailable recording status", async () => {
    const mockData = {
      ...mockMeetingData,
      recording_info: { enabled: false },
    };
    (getUserById as jest.Mock).mockResolvedValue({ displayName: "John Doe" });

    render(<MeetingCard data={mockData} />);

    expect(screen.getByText("Team Meeting")).toBeInTheDocument();
    expect(screen.queryByText("Watch Recording")).toBeNull();
  });

  it("navigates to recording page when 'Watch Recording' is clicked", async () => {
    (getUserById as jest.Mock).mockResolvedValue({ displayName: "John Doe" });
    (fetchRecording as jest.Mock).mockResolvedValue("http://recording.url");

    render(<MeetingCard data={mockMeetingData} />);

    await waitFor(() => screen.getByText("Watch Recording"));

    fireEvent.click(screen.getByText("Watch Recording"));

    expect(mockRouterPush).toHaveBeenCalledWith(
      `/recording?source=${btoa("http://recording.url")}`,
    );
  });

  it("displays 'Processing Recording' status if recording is not ready", async () => {
    const mockData = {
      ...mockMeetingData,
      recording_info: { enabled: true, is_recording_ready: false },
    };

    (getUserById as jest.Mock).mockResolvedValue({ displayName: "John Doe" });

    render(<MeetingCard data={mockData} />);

    expect(screen.getByText("Processing Recording")).toBeInTheDocument();
  });
});
