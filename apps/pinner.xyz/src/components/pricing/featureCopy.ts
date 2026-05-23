// Map raw feature strings from the API to benefit-driven copy.
// If a feature isn't in the map, it's returned as-is.
// Pattern: "[Feature]" → "[Feature] — [benefit outcome]"
// TODO: Verify these match actual API feature strings before launch.
const featureMap: Record<string, string> = {
  // IPFS / Public storage
  "IPFS Pinning": "IPFS Pinning — your content stays online as long as it's pinned",
  "IPFS Hosting": "IPFS Hosting — serve static sites from a decentralized network",
  "Website Hosting": "Website Hosting — deploy static sites without a server",

  // Private storage
  "S3 Compatible Storage": "S3-Compatible Storage — use any S3 tool you already know",
  "Zero-Knowledge Encryption": "Zero-Knowledge Encryption — even we can't read your files",
  "Encrypted at Rest": "Encrypted at Rest — your data is encrypted before it leaves your device",
  "Self-Hosted Server": "Self-Hosted Server — you control the hardware and access",

  // General features
  "Custom storage allocation": "Custom storage allocation — as much as you need, priced per TB",
  "Dedicated support": "Dedicated support — direct line to the founder",
  "Volume pricing": "Volume pricing — lower rates as you scale",
  "Decentralized Storage": "Decentralized Storage — no single point of failure",
  "Crypto Payments": "Crypto Payments — pay with crypto, no ID required",
  "Card Payments": "Card Payments — standard checkout, no crypto needed",
  "Open Source": "Open Source — audit the code yourself on GitHub",
  "CLI Tool": "CLI Tool — pin and manage files from the terminal",
  "Developer SDK": "Developer SDK — integrate storage into your own app",
  "Dashboard": "Dashboard — manage pins, billing, and access from one place",
  "API Access": "API Access — automate everything programmatically",
};

export function translateFeature(feature: string): string {
  return featureMap[feature] || feature;
}
