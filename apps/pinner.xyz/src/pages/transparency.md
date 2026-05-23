---
title: Transparency Report
slug: transparency
last_updated: 2026-05-11
layout: "@/layouts/LegalLayout.astro"
---

# Transparency Report

**Last updated:** May 11, 2026

---

## Limits Built Into the System

Our service is designed so that certain things are impossible — not forbidden by policy, but prevented by architecture. No legal order, internal decision, or security breach can change these facts because they are consequences of how the software works:

- **Files are encrypted before they leave your device.** We never receive plaintext private storage content. We couldn't read it even if we wanted to.
- **Encryption keys never leave your device.** We don't generate, transmit, store, or have access to the keys that protect your private storage.
- **Encrypted shards go directly to Sia storage providers, not through Pinner's indexer.** The indexer only sees the sealed object: the object ID, encrypted fields, and slab layout. It never sees the actual shard content.
- **Private storage metadata is scrambled before it reaches us.** The names, types, and structures of your private files are encrypted on your device. We hold the resulting ciphertext, but cannot make sense of it.
- **Private storage metadata cannot be silently altered.** Your client signs metadata using keys that live on your device. If anything changes in transit or at rest, the signature check fails and your client rejects it.
- **Shared Sia objects change the privacy equation.** When a user generates a share URL, the URL contains the object ID and the decryption key. Anyone who has this URL can download and decrypt the file directly from the Sia network — the file data itself never passes through or resides on Pinner's infrastructure. Because the share URL contains the decryption key, the content is accessible to whoever holds it — including us, if the URL is provided to us. Without a share URL, the content remains encrypted and we cannot see what the file contains — we can only remove the indexer record. Share URLs are time-limited, but anyone who accessed one could have already pinned the object to their own account. There is no way to restrict sharing to specific users or revoke it once shared.
- **IPFS pins are public by design.** IPFS content gets a content address (CID) that anyone can use to fetch it. We can see CIDs and we can see that you pinned them. Shared Sia objects have similar properties. If you need privacy for data, use private storage and do not generate share URLs.

---

## What Our Infrastructure Actually Has

For full transparency, here is every category of user information our systems store or can access:

**For all users:**
- **Account details** — email address, name, billing information (card details are handled by Stripe; we see only a token and last 4 digits)

**For private Sia storage (not shared):**
- **Object IDs** — 32-byte content-derived hashes that identify sealed objects
- **Encrypted master keys** — we maintain them, but cannot decrypt them without your app key
- **Slab layouts** — which shards live on which storage providers (this is routing data, not content)
- **Encrypted metadata blobs** — ciphertext we cannot interpret
- **Signatures** — integrity checks over object IDs and encrypted fields
- **Timestamps** — when objects were created or modified
- **Storage consumption numbers** — how many bytes an account is using (needed for billing)

All of the above is ciphertext or hashes we cannot interpret. We have no way to recover plaintext data or metadata from it.

**For shared Sia objects:**
- Everything listed under private Sia storage above
- **Share URLs** — share URLs are generated client-side and never sent to or stored by Pinner. A share URL contains the object ID plus the decryption key, allowing anyone who has it to download and decrypt the file directly from the Sia network. Because the share URL contains the decryption key, the content is accessible to whoever holds it — including us, if the URL is provided to us. Without a share URL, the content remains encrypted and we cannot see what the file contains — we can only remove the indexer record.
- Once shared, the privacy properties are similar to IPFS — anyone with the URL can access the content — though share URLs are time-limited and not broadcast to the network. Content can be verified if a share URL is provided (whoever holds the URL holds the access), and we can take it down (unpin = remove from indexer state, encrypted fragments scheduled for cleanup). Without a share URL, we can remove the indexer record but cannot see what the file contains.

**For IPFS pins:**
- **CIDs** — content identifiers for pinned IPFS data. This is the correct IPFS term.
- **Pin timestamps** — when a CID was pinned or unpinned

IPFS content is public by design. Anyone with the CID can retrieve it independently of Pinner. We can verify and unpin IPFS content.

**We do not store:** plaintext file contents from private storage, readable file names or types from private storage, or encryption keys.

---

## Track Record

The following statements are accurate as of the date on this page. We update this section quarterly. If we remove a statement in a future update, assume it is no longer true. If this page goes more than 90 days without an update, treat it as potentially out of date.

As of May 11, 2026, Pinner has **never**:

- Been served with a National Security Letter
- Been served with a FISA order or directive
- Received any government demand that came with a gag order
- Been ordered or asked to add logging, data collection, or surveillance that isn't already described in our Privacy Policy
- Turned over user data to any government body
- Received any request to monitor a user's activity in real time
- Been contacted by law enforcement about a user

---

*Next scheduled update: August 2026. We commit to updating this report at least every 90 days.*

**Report abuse:** abuse@pinner.xyz | **Legal inquiries:** legal@pinner.xyz

### Related Documents

- [Privacy Policy](/privacy-policy)
- [Terms of Service](/terms-of-service)
- [Law Enforcement Guide](/law-enforcement)
