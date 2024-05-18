function padFileSizeDefault(initialSize: number): number {
  const KIB = 1 << 10;
  // Only iterate to 53 (the maximum safe power of 2).
  for (let n = 0; n < 53; n++) {
    if (initialSize <= (1 << n) * 80 * KIB) {
      const paddingBlock = (1 << n) * 4 * KIB;
      let finalSize = initialSize;
      if (finalSize % paddingBlock !== 0) {
        finalSize = initialSize - (initialSize % paddingBlock) + paddingBlock;
      }
      return finalSize;
    }
  }
  // Prevent overflow.
  throw new Error("Could not pad file size, overflow detected.");
}

function checkPaddedBlock(size: number): boolean {
  const KIB = 1024;
  // Only iterate to 53 (the maximum safe power of 2).
  for (let n = 0; n < 53; n++) {
    if (size <= (1 << n) * 80 * KIB) {
      const paddingBlock = (1 << n) * 4 * KIB;
      return size % paddingBlock === 0;
    }
  }
  throw new Error("Could not check padded file size, overflow detected.");
}

export { padFileSizeDefault, checkPaddedBlock };
