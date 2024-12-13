// tests/unit/components/MeetingMemberStream.test.tsx

import { render, screen } from "@testing-library/react";
import {
  useVideo,
  useHMSStore,
  selectLocalPeer,
  selectDominantSpeaker,
} from "@100mslive/react-sdk";
import MeetingMemberStream from "@/frontend/components/MeetingMemberStream";

jest.mock("@100mslive/react-sdk", () => ({
  useHMSStore: jest.fn(),
  useVideo: jest.fn(),
  selectLocalPeer: jest.fn(),
  selectDominantSpeaker: jest.fn(),
  selectIsPeerVideoEnabled: jest.fn(),
}));

jest.mock("@frontend/components/ui", () => ({
  Icons: {
    CircleUser: (props: any) => (
      <div data-testid="circle-user-icon" {...props} />
    ),
  },
}));

describe("MeetingMemberStream", () => {
  const mockPeer = {
    id: "peer-1",
    videoTrack: "track-1",
    isLocal: false,
    name: "John Doe",
  };
  const mockLocalPeer = { id: "local-peer", isLocal: true };
  const mockDominantSpeaker = { id: "dominant-speaker" };
  const mockVideoRef = { current: null };

  beforeEach(() => {
    jest.clearAllMocks();

    (useHMSStore as jest.Mock).mockImplementation((selector) => {
      if (selector === selectLocalPeer) return mockLocalPeer;
      if (selector === selectDominantSpeaker) return mockDominantSpeaker;
      if (selector(mockPeer.id)) return true; // Peer video is enabled
    });

    (useVideo as jest.Mock).mockReturnValue({
      videoRef: mockVideoRef,
    });
  });

  it("renders the video element for the peer", () => {
    render(
      <MeetingMemberStream peer={mockPeer} height="300px" totalPeers={2} />,
    );

    const videoElement = screen.getByRole("video");
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveStyle("transform: scaleX(-1)");
  });

  it("renders the CircleUser icon and peer name when video is disabled", () => {
    (useHMSStore as jest.Mock).mockImplementation((selector) => {
      if (selector(mockPeer.id)) return false; // Peer video is disabled
    });

    render(
      <MeetingMemberStream peer={mockPeer} height="300px" totalPeers={2} />,
    );

    expect(screen.getByTestId("circle-user-icon")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders 'You' for the local peer", () => {
    const localMockPeer = { ...mockPeer, isLocal: true };
    render(
      <MeetingMemberStream
        peer={localMockPeer}
        height="300px"
        totalPeers={2}
      />,
    );

    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("applies the active speaker ring for the dominant speaker", () => {
    (useHMSStore as jest.Mock).mockImplementation((selector) => {
      if (selector === selectDominantSpeaker) return mockPeer; // Peer is the dominant speaker
    });

    const { container } = render(
      <MeetingMemberStream peer={mockPeer} height="300px" totalPeers={2} />,
    );

    expect(container.firstChild).toHaveClass("ring-4 ring-blue-500");
  });

  it("adjusts layout for a single peer", () => {
    const { container } = render(
      <MeetingMemberStream peer={mockPeer} height="300px" totalPeers={1} />,
    );

    expect(container.firstChild).toHaveClass("w-6/12 m-auto");
  });

  it("uses full width layout for multiple peers", () => {
    const { container } = render(
      <MeetingMemberStream peer={mockPeer} height="300px" totalPeers={3} />,
    );

    expect(container.firstChild).toHaveClass("w-full");
  });
});
