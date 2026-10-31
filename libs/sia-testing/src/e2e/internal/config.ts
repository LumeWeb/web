type Environment = Record<string, string | undefined>;

const required = (env: Environment, name: string): string => {
  const value = env[name]?.trim();
  if (!value)
    throw new Error(
      `Real-service tests require ${name}. See docs/e2e.md; no fallback service is used.`,
    );
  return value;
};

/** Local provisioning must not carry test-browser certificate exceptions to remote services. */
export function readHostServiceConfig(env: Environment = process.env) {
  if (env.SIA_TEST_ALLOW_MUTATION !== "1")
    throw new Error(
      "SIA_TEST_ALLOW_MUTATION=1 is required before provisioning",
    );
  const address = (name: string): URL => {
    const url = new URL(required(env, name));
    if (!["http:", "https:"].includes(url.protocol))
      throw new Error(`${name} must use HTTP(S)`);
    if (url.username || url.password)
      throw new Error(`${name} must not contain credentials`);
    if (!["127.0.0.1", "localhost"].includes(url.hostname))
      throw new Error(`${name} must use a loopback service`);
    return url;
  };
  return {
    adminURL: address("SIA_TEST_ADMIN_URL"),
    indexdURL: address("SIA_TEST_INDEXD_URL"),
    password: required(env, "SIA_TEST_ADMIN_PASSWORD"),
  };
}

export function redactSensitive(value: string): string {
  const redactText = () =>
    value.replace(
      /(token|secret|password|credential|authorization)["']?\s*[:=]\s*(?:(?:Basic|Bearer)\s+)?(?:"[^"]*"|'[^']*'|[^\s,;}\]]+)/gi,
      "$1=[REDACTED]",
    );
  try {
    const url = new URL(value);
    // Resource diagnostics contain colons and parse as opaque URLs.
    if (!["http:", "https:"].includes(url.protocol)) return redactText();
    if (url.username) url.username = "[REDACTED]";
    if (url.password) url.password = "[REDACTED]";
    for (const key of [...url.searchParams.keys()])
      if (/token|secret|password|credential|key|auth/i.test(key))
        url.searchParams.set(key, "[REDACTED]");
    return url.toString();
  } catch {
    return redactText();
  }
}
