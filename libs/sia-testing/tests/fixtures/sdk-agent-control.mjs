/** A local child exercises process ownership without loading an SDK or contacting a service. */
process.on("SIGTERM", () => undefined);
process.on("message", (message) => {
  const request =
    /** @type {{ id: string; operation: string; value: unknown }} */ (message);
  if (request.operation === "disconnect") {
    process.disconnect();
    setInterval(() => undefined, 1000);
  } else if (request.operation === "exit") process.exit(23);
  else if (request.operation === "malformed")
    process.send?.({ id: 4, type: "result", value: "bad frame" });
  else if (request.operation === "fail")
    process.send?.({
      code: "sdk-error",
      id: request.id,
      message: "synthetic secret",
      type: "error",
    });
  else if (request.operation === "stall")
    process.send?.({
      name: "started",
      requestId: request.id,
      type: "event",
      value: null,
    });
  else if (request.operation === "environment")
    process.send?.({
      id: request.id,
      type: "result",
      value: {
        argv: process.argv,
        execArgv: process.execArgv,
        nativeOverride: process.env.NAPI_RS_NATIVE_LIBRARY_PATH,
        nodeOptions: process.env.NODE_OPTIONS,
        nodePath: process.env.NODE_PATH,
      },
    });
  else process.send?.({ id: request.id, type: "result", value: request.value });
});
process.send?.({ type: "ready" });
