/** Approval sends a borrowed connect key only to the profile's expected connection endpoint. */
import { profileDocument } from "./profile.js";
import type { LiveProfile } from "./types.js";
export async function approveLiveConnection(
  profile: LiveProfile,
  responseUrl: string,
  approve = true,
  signal?: AbortSignal,
): Promise<void> {
  const document = profileDocument(profile);
  if (document.auth.kind !== "register") throw failure("invalid-approval");
  let target: URL;
  try {
    target = new URL(responseUrl);
    const expected = new URL("auth/connect/", document.apiBaseUrl);
    const id = target.pathname.substring(expected.pathname.length);
    if (
      target.origin !== expected.origin ||
      !target.pathname.startsWith(expected.pathname) ||
      !/^[a-zA-Z0-9_-]{1,128}$/.test(id) ||
      target.username ||
      target.password ||
      target.search ||
      target.hash
    )
      throw failure("invalid-approval");
  } catch {
    throw failure("invalid-approval");
  }
  try {
    const response = await fetch(target, {
      body: JSON.stringify({ approve }),
      headers: {
        "authorization": `Basic ${Buffer.from(":" + document.auth.connectKey).toString("base64")}`,
        "content-type": "application/json",
      },
      method: "POST",
      redirect: "error",
      ...(signal === undefined ? {} : { signal }),
    });
    await response.body?.cancel();
    if (!response.ok) throw failure("approval-denied");
  } catch {
    throw failure("approval-denied");
  }
}
function failure(code: "approval-denied" | "invalid-approval") {
  return Object.assign(new Error("Sia connection approval failed"), {
    code,
    phase: "authentication",
  });
}
