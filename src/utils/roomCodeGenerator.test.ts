import { describe, expect, it } from "vitest";
import { generateUniqueRoomCode } from "./roomCodeGenerator";

describe("generateUniqueRoomCode", () => {
  it("returns a lowercase four-segment room id", () => {
    const code = generateUniqueRoomCode();
    expect(code).toMatch(/^[a-z]{3}-[a-z]{3}-[a-z]{3}-[a-z]{3}$/);
  });
});
