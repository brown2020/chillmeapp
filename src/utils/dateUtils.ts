type MeetingCreatedAt =
  | string
  | number
  | Date
  | { seconds: number }
  | { toDate: () => Date }
  | null
  | undefined;

function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return formatTimeUnit(seconds, "second");
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${formatTimeUnit(minutes, "minute")} ${formatTimeUnit(
      remainingSeconds,
      "second",
    )}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const finalSeconds = remainingSeconds % 60;
    return `${formatTimeUnit(hours, "hour")} ${formatTimeUnit(
      minutes,
      "minute",
    )} ${formatTimeUnit(finalSeconds, "second")}`;
  }
}

function formatTimeUnit(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function formatMeetingCreatedAt(createdAt: MeetingCreatedAt): string {
  const date = parseMeetingCreatedAt(createdAt);
  return date ? date.toDateString() : "Unknown date";
}

function parseMeetingCreatedAt(createdAt: MeetingCreatedAt): Date | null {
  if (!createdAt) {
    return null;
  }

  if (createdAt instanceof Date) {
    return isValidDate(createdAt) ? createdAt : null;
  }

  if (typeof createdAt === "string" || typeof createdAt === "number") {
    const date = new Date(createdAt);
    return isValidDate(date) ? date : null;
  }

  if ("toDate" in createdAt) {
    const date = createdAt.toDate();
    return isValidDate(date) ? date : null;
  }

  if (typeof createdAt.seconds === "number") {
    const date = new Date(createdAt.seconds * 1000);
    return isValidDate(date) ? date : null;
  }

  return null;
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export { formatMeetingCreatedAt, formatSeconds };
