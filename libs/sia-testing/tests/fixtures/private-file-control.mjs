/** An owned child contains filesystem reads that could block before their file-type check. */
process.send({ type: "ready" });
process.on("message", (message) => {
  const request =
    /** @type {{id: string, value: {module: string, path: string}}} */ (
      message
    );
  void (async () => {
    const { readPrivateBytes } =
      /** @type {{readPrivateBytes: (path: string, maximum: number) => Promise<Uint8Array>}} */ (
        await import(request.value.module)
      );
    let rejected = false;
    try {
      await readPrivateBytes(request.value.path, 16384);
    } catch {
      rejected = true;
    }
    process.send({ id: request.id, type: "result", value: { rejected } });
  })();
});
