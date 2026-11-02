/** An owned process contains profile opens that could wait for a named-pipe writer. */
process.send({ type: "ready" });
process.on("message", (message) => {
  const request =
    /** @type {{id: string, value: {module: string, path: string, consent: object}}} */ (
      message
    );
  void (async () => {
    const { loadLiveProfile } =
      /** @type {{loadLiveProfile: (path: string, consent: object) => Promise<unknown>}} */ (
        await import(request.value.module)
      );
    let code = "accepted";
    try {
      await loadLiveProfile(request.value.path, request.value.consent);
    } catch (error) {
      code = /** @type {{code: string}} */ (error).code;
    }
    process.send({ id: request.id, type: "result", value: { code } });
  })();
});
