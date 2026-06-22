// Test script to debug the pinner-deploy-action key exchange failure.
// Run: npx tsx scripts/test-key-exchange.ts
//
// Usage: set PINNER_API_KEY env var to the API key JWT, then run.
// Optionally set PINNER_ENDPOINT (default: https://ipfs.pinner.xyz)

import { jwtDecode } from "jwt-decode";

const apiKey = process.env.PINNER_API_KEY ?? "";
const endpoint = process.env.PINNER_ENDPOINT ?? "https://ipfs.pinner.xyz";

if (!apiKey) {
  console.error("PINNER_API_KEY env var is required");
  process.exit(1);
}

console.log("=== Key Exchange Debug Script ===\n");
console.log(`Endpoint: ${endpoint}`);

// Step 1: Decode the JWT and check audience
console.log("\n--- Step 1: Decode JWT ---");
try {
  const decoded = jwtDecode(apiKey);
  console.log(`Audience: ${JSON.stringify(decoded.aud)}`);
  console.log(`Issuer: ${decoded.iss}`);
  console.log(`Subject: ${decoded.sub}`);
  console.log(`Expires: ${new Date((decoded.exp ?? 0) * 1000).toISOString()}`);

  const aud = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
  console.log(`Audience (resolved): ${aud}`);

  if (aud !== "api") {
    console.log(`\n⚠️  Audience is NOT "api" — token is already a login JWT, no exchange needed.`);
    console.log("The KeyExchangeAuthManager would use this token as-is.");
  } else {
    console.log(`\n✅ Audience is "api" — token needs key exchange.`);
  }
} catch (e) {
  console.error("Failed to decode JWT:", e);
}

// Step 2: Show what URL AccountApi would construct
console.log("\n--- Step 2: AccountApi URL Construction ---");
const endpointUrl = new URL(endpoint);
const accountHostname = `account.${endpointUrl.hostname}`;
console.log(`Pinner endpoint:    ${endpoint}`);
console.log(`AccountApi would call: https://${accountHostname}/api/auth/key`);

if (endpointUrl.hostname === "ipfs.pinner.xyz") {
  console.log(`\n❌ BUG: account.ipfs.pinner.xyz does NOT exist!`);
  console.log(`   The correct endpoint should be: https://account.pinner.xyz/api/auth/key`);
  console.log(`   Go SDK uses hardcoded DefaultEndpoint = "account.pinner.xyz"`);
}

// Step 3: Try the key exchange against both URLs
console.log("\n--- Step 3: Test Key Exchange ---");

const wrongUrl = `https://${accountHostname}/api/auth/key`;
const correctUrl = "https://account.pinner.xyz/api/auth/key";

async function tryExchange(url: string, label: string) {
  console.log(`\nTrying ${label}: ${url}`);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`  Status: ${resp.status} ${resp.statusText}`);
    const body = await resp.text();
    if (resp.ok) {
      const data = JSON.parse(body);
      console.log(`  ✅ Success! Got login JWT (${data.token?.length ?? 0} chars)`);
    } else {
      console.log(`  ❌ Failed: ${body.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`  ❌ Network error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

await tryExchange(wrongUrl, "derived URL (account.<endpoint-host>)");
await tryExchange(correctUrl, "correct URL (account.pinner.xyz)");

// Step 4: Test the fixed KeyExchangeAuthManager
console.log("\n--- Step 4: Test KeyExchangeAuthManager (fixed) ---");
import { KeyExchangeAuthManager } from "../src/auth/key-exchange";
const auth = new KeyExchangeAuthManager(apiKey, endpoint);
try {
  const token = await auth.getAuthToken();
  console.log(`  ✅ Got login JWT (${token.length} chars)`);
  console.log(`  Token preview: ${token.slice(0, 20)}...`);
} catch (e) {
  console.log(`  ❌ Failed: ${e instanceof Error ? e.message : String(e)}`);
}

console.log("\n=== Done ===");
