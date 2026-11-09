/** Vite owns the example's mock lifetime and supplies synthetic input at compilation. */
import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import { startMockServer } from "@lumeweb/sia-testing/http";
import { withSiaRun } from "@lumeweb/sia-testing/node";
import type { DemoInput } from "./demo-input.ts";

const origin = "http://127.0.0.1:4174";

export default defineConfig(({ command, isPreview }) => {
  const config: UserConfig = {
    // The example shares package.json with the fixture server; their dependency caches must not overwrite each other.
    cacheDir: "node_modules/.vite",
    resolve: { tsconfigPaths: true },
    server: { host: "127.0.0.1", port: 4174, strictPort: true },
  };
  if (command === "build" || isPreview) return config;

  let stop: () => void = () => undefined;
  const closed = new Promise<void>((resolve) => {
    stop = resolve;
  });
  return new Promise<UserConfig>((ready, failed) => {
    const finished = withSiaRun(
      {
        backend: {
          app: {
            description: "Local documentation example",
            id: "a".repeat(64),
            name: "React onboarding",
            serviceUrl: origin,
          },
          kind: "mock",
        },
      },
      async (run) => {
        const endpoint = await startMockServer(run.mock, {
          allowedOrigins: [origin],
        });
        try {
          const input: DemoInput = {
            owner: endpoint.connection({
              access: run.ownerAccess,
              as: run.mock.actor("application"),
            }),
            phrase: run.auth.fixturePhrase,
            registration: endpoint.connection({
              access: run.auth.registrationAccess,
              as: run.mock.actor("browser"),
            }),
          };
          ready({
            ...config,
            define: { __DEMO_INPUT__: JSON.stringify(input) },
            plugins: [
              {
                async closeBundle() {
                  stop();
                  await finished;
                },
                configureServer(server) {
                  server.middlewares.use((request, response, next) => {
                    const url = new URL(request.url ?? "/", origin);
                    if (url.pathname !== "/__demo/approval") {
                      next();
                      return;
                    }
                    if (
                      request.method !== "POST" ||
                      request.headers.origin !== origin
                    ) {
                      response.statusCode = 403;
                      response.end();
                      return;
                    }
                    const approvalUrl = url.searchParams.get("url");
                    const decision = url.searchParams.get("decision");
                    if (
                      !approvalUrl ||
                      (decision !== "approve" && decision !== "deny")
                    ) {
                      response.statusCode = 400;
                      response.end();
                      return;
                    }
                    void (
                      decision === "approve"
                        ? run.auth.approve(approvalUrl)
                        : run.auth.deny(approvalUrl)
                    ).then(
                      () => {
                        response.statusCode = 204;
                        response.end();
                      },
                      () => {
                        response.statusCode = 400;
                        response.end("Demo approval failed");
                      },
                    );
                  });
                },
                name: "demo-approval",
              },
            ],
          });
          // Returning from this callback would dispose of the mock before the browser uses it.
          await closed;
        } finally {
          await endpoint.close();
        }
      },
    );
    void finished.catch(failed);
  });
});
