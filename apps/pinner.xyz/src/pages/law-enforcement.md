---
title: Law Enforcement Guide
slug: law-enforcement
last_updated: 2026-05-11
layout: "@/layouts/LegalLayout.astro"
---

# Law Enforcement Guide

**Last updated:** May 11, 2026

---

This page explains what Pinner can and cannot provide in response to lawful legal process. We recommend reading this in full before submitting a request.

## What Pinner Is

Pinner is a cloud storage service that offers three distinct products:

1. **IPFS Pinning** — We keep public, content-addressed files available on the InterPlanetary File System. IPFS content is public: anyone with a CID (content identifier) can retrieve it independently of Pinner.
2. **Private Sia Storage** — We provide encrypted file storage built on the Sia decentralized network. Files are encrypted on the user's own device before upload. The keys needed to decrypt those files are never on our infrastructure. Our indexer (indexd) maintains sealed objects — object IDs, encrypted master keys, slab layouts, encrypted metadata, and signatures — but cannot read any of it.
3. **Shared Sia Objects** — Users can generate share URLs for their Sia storage objects. A share URL contains the object ID and the decryption key, allowing anyone who has it to download and decrypt the file directly from the Sia network — the file data itself never passes through or resides on Pinner's infrastructure. Once a share URL exists, anyone with the URL can access the content. Unlike IPFS CIDs, share URLs are time-limited, but anyone who accessed the URL could have already copied or pinned the content. Pinner does not generate, store, or retain share URLs.

## What Data We Have

Pinner's systems hold the following categories of user information:

| Category | What It Includes | Where It Lives |
|---|---|---|
| Account info | Name, email address, billing records | Pinner's database; payment details processed by Stripe |
| IPFS pin records | Which CIDs an account has pinned, timestamps | Pinner's database |
| Private Sia storage records (sealed objects) | Object IDs, encrypted master keys, slab layouts, encrypted metadata blobs, signatures, timestamps | Pinner's indexer (indexd) — all metadata is ciphertext we cannot decode |
| Shared Sia object records | Same as private. Note: share URLs contain the object ID and the decryption key, and are never stored by Pinner. Because the share URL contains the decryption key, anyone who has it can access the content from the Sia network — including us, if the URL is provided to us. Without a share URL, the content remains encrypted and we cannot see what the file contains — we can only remove the indexer record. | Pinner's indexer (indexd) |
| Storage sizes | Byte counts per account (derived from slab layouts) | Pinner's indexer — needed for billing |
| IP addresses | Device addresses recorded with account activity, uploads, downloads, and storage changes | Retained for security, abuse prevention, and download attribution |

## What Data We Do Not Have

Because of how our service is built, the following information never passes through or is stored on our infrastructure:

- **File contents from private Sia storage that has NOT been shared** — encrypted files travel directly between the user's device and Sia network hosts; Pinner is not in the data path. For shared Sia objects, the share URL contains the decryption key — anyone who has it can access the content from the Sia network. The file data itself never resides on our infrastructure.
- **Readable file names, types, or directory structures from private Sia storage** — these are encrypted on the user's device before reaching our indexer. Shared objects can be accessed if a share URL is provided (which contains the decryption key).
- **Encryption keys** — generated and held only on the user's device; we never have access

## What We Can and Cannot Produce

### We Can Produce (with Valid Legal Process)

| What | Details |
|---|---|
| Account registration details | Name, email address, account creation date |
| Billing records | Transaction history, payment amounts, payment method type (card via Stripe or crypto) |
| Shared Sia object contents | If a share URL is provided to us (e.g., by law enforcement or a third party), the content becomes accessible — the share URL contains the decryption key. The file data resides on the Sia network, not on our infrastructure. Pinner does not generate, store, or retain share URLs. Without a share URL, the content remains encrypted and we cannot see what the file contains — we can only remove the indexer record. |
| Sia storage object records | Object IDs, encrypted metadata blobs, slab layouts, timestamps associated with an account — but we cannot interpret encrypted metadata or content without a share URL (which contains the decryption key and is never stored by Pinner) |
| IPFS pin associations | Which CIDs a specific account has pinned or unpinned, and when |
| Storage consumption | How much storage an account is using |
| Encrypted metadata blobs | The raw ciphertext held by our indexer (we cannot interpret it) |
| IP address logs | IP addresses associated with account activity, uploads, downloads, and storage operations |

### We Cannot Produce — Not Withheld, Literally Unavailable

| What | Why |
|---|---|
| Decrypted file contents from private Sia storage that has not been shared | Files are encrypted on the user's device. The keys are on the user's device. We do not have the keys and cannot decrypt the data. A court order compelling production of plaintext private storage files would fail because the plaintext does not exist on our systems. For shared Sia objects, a share URL makes the content accessible to whoever holds it — but Pinner does not generate, store, or retain share URLs. Without a share URL, the content remains encrypted and we cannot see what the file contains — we can only remove the indexer record. |
| Encryption keys | Never stored on our infrastructure. They exist only on the user's device. |
| Readable private storage file names, types, or structures | Encrypted on the user's device before reaching our indexer. We hold the resulting ciphertext but cannot reverse it. |
| Real-time monitoring of user activity | Our architecture does not support it. Encrypted data does not flow through our servers. We have no visibility into what users are uploading, downloading, or transferring in private storage. |
| Altered or fabricated metadata | Private storage metadata is signed on the user's device. If anyone modifies it in transit or at rest, the signature fails and the client rejects it. We cannot forge valid metadata. |

## Public and Shared Content and Law Enforcement

IPFS pins are public content. If you have a CID, you can independently retrieve the content from the IPFS network without Pinner's involvement.

Shared Sia objects can be accessed by anyone who has the share URL. A share URL contains the decryption key, so anyone with it can download and decrypt the file directly from the Sia network. Unlike IPFS CIDs, share URLs are time-limited, but anyone who accessed the URL could have copied or pinned the content.

For both IPFS pins and shared Sia objects, Pinner CAN remove content from our infrastructure (unpin/delete from our indexer). For shared Sia objects, a share URL makes the content accessible to whoever holds it — without the decryption key it contains, we can remove the indexer record but cannot see what the file contains. When content is removed, the object is deleted from the indexer state and the underlying encrypted fragments on storage hosts are fully erased within hours to days by background cleanup.

## How to Submit a Request

1. **Send requests to:** legal@pinner.xyz from an official government or law enforcement email address

**Note:** abuse@pinner.xyz is for public abuse reports (CSAM, malware, copyright). Law enforcement requests must go to legal@pinner.xyz.
2. **Include:** requesting agency name, contact information, nature of the investigation, and the specific data requested
3. **Attach:** any legal process that has been issued (subpoena, warrant, court order)
4. **Identify the account:** provide the email address or account ID you are asking about

We review every request for legal validity before responding. We will challenge or reject requests that lack proper legal process, are overbroad, or are not permitted under applicable law.

Pinner only responds to legal process issued by US governmental entities or courts, or through applicable international cooperation mechanisms (MLAT requests, letters rogatory, etc.).

## User Notification

We notify users of legal requests when we are legally permitted to do so. If a gag order or other legal restriction prohibits notification, we comply with that restriction.

## Reimbursement

We may seek reimbursement for costs incurred in responding to legal process, as permitted by applicable law.

## Questions

Contact legal@pinner.xyz with any questions about this guide or our legal compliance processes.

### Related Documents

- [Privacy Policy](/privacy-policy)
- [Terms of Service](/terms-of-service)
- [Transparency Report](/transparency)
