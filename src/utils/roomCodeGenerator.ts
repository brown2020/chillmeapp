function generateRandomSegment() {
  // Create a random 3-character segment with only uppercase letters
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let segment = "";
  for (let i = 0; i < 3; i++) {
    const randomIndex =
      crypto.getRandomValues(new Uint32Array(1))[0] % chars.length;
    segment += chars[randomIndex];
  }
  return segment.toLowerCase();
}

function generateUniqueRoomCode() {
  // Combine four random segments with dashes
  const code = `${generateRandomSegment()}-${generateRandomSegment()}-${generateRandomSegment()}-${generateRandomSegment()}`;
  return code;
}

export { generateUniqueRoomCode };
