---
title: Privacy Policy
slug: privacy-policy
last_updated: 2026-05-11
layout: "@/layouts/LegalLayout.astro"
---

# Privacy Policy

**Last updated: May 11, 2026**

---

## Table of Contents

- [What You Need to Know in 60 Seconds](#what-you-need-to-know-in-60-seconds)
- [Who We Are](#who-we-are)
- [What Data We Collect and Why](#what-data-we-collect-and-why)
- [How We Protect Your Data](#how-we-protect-your-data)
- [Who We Share Data With](#who-we-share-data-with)
- [Where Your Data Lives](#where-your-data-lives)
- [How Long We Keep Your Data](#how-long-we-keep-your-data)
- [Your Rights](#your-rights)
- [Cookies and Tracking](#cookies-and-tracking)
- [Children's Privacy](#childrens-privacy)
- [Changes to This Policy](#changes-to-this-policy)
- [Contact Us](#contact-us)

---

## What You Need to Know in 60 Seconds

- **We can't read your private files — unless you share them.** Private Sia storage is encrypted on your device before it ever reaches us. Even if someone demanded we hand them over, we couldn't. We literally don't have the keys. But if you generate a share URL, that URL contains the decryption key — anyone who has it can download and decrypt the file directly from the Sia network, making the content effectively as public as an IPFS pin.
- **We collect only what we need** to run the service: your name, email, payment info, and some usage stats. We don't sell your data. We don't train AI on it. We don't mine it for ads.
- **IPFS pins are public.** When you pin to IPFS, Pinner uploads the content on your behalf — it passes through our infrastructure unencrypted. Anything pinned to IPFS is content-addressed and may be copied by other nodes. Shared Sia objects are effectively public too — anyone with the share URL can retrieve the content. Private storage is different — those deletes are real.
- **You can ask us to delete your account or request a copy of your data anytime.** Just email privacy@pinner.xyz. We'll respond within 30 days.
- **We keep payment records for 3 years** as required by IRS recordkeeping rules. Everything else we delete as soon as we reasonably can.
- **We don't profile you or sell predictions about you.** No behavioral scoring, no behavioral surveillance, no ad targeting, no secret algorithms. We do run automated fraud detection on payments (via Stripe Radar) and sanctions screening as required by US law — but we don't build personality profiles or classify users by behavior.
- **We scan public IPFS content** against databases of known illegal material (CSAM, malware signatures). We do not and cannot scan encrypted private storage — it is architecturally unreadable by our systems.
- **This service is for people 13 and older.** If we find out we collected data from a child under 13, we delete it immediately.

---

## Who We Are

**Pinner** is a privacy-focused cloud storage service operated by **Hammer Technologies LLC**, based in North Carolina, USA.

| | |
|---|---|
| **Business name** | Pinner |
| **Operator** | Hammer Technologies LLC |
| **Email** | privacy@pinner.xyz |
| **Governing law** | North Carolina, USA |

We are the "data controller" for your personal data (name, email, payment info, etc.). That means we decide how and why your data is used, and we're responsible for protecting it. We have not appointed a Data Protection Officer because we are not required to under GDPR Article 37 — our processing is neither large-scale nor involves special categories of data.

**Important distinction:** For your stored content (files, data, documents), **you are the data controller** and Pinner acts as a data processor. Your content is encrypted client-side before it reaches us. We cannot read it, modify it, or use it for any purpose beyond storing and retrieving it on your behalf. This is not a policy choice — it is enforced by the design of the system.

---

## What Data We Collect and Why

We collect data for specific purposes. We don't collect anything "just in case."

### Data Categories

| Data | What it is | Why we need it |
|---|---|---|
| **Account data** | First name, last name, email address | To create your account, send service updates, and reset your password |
| **Payment data (card)** | Confirmation token, last 4 digits of card number | To process subscription payments via Stripe |
| **Payment data (crypto)** | Wallet address, transaction hash | To confirm crypto payments and link them to your account |
| **Usage data** | Storage used, upload/download stats, API calls | To run the service, enforce limits, and bill you correctly |
| **Analytics data** | Page views, feature usage, session duration | To understand how people use Pinner so we can improve it |
| **IP address** | Your device's internet address | To prevent abuse, block attacks, and protect the service |
| **Support data** | Emails, chat logs, bug reports | To help you when something goes wrong |

### Legal Basis for Processing

We process your data based on one of three legal grounds:

| Purpose | Legal basis | Explanation |
|---|---|---|
| Providing the service (account, storage, access) | **Contract performance** | We need this data to fulfill our agreement with you |
| Processing payments | **Contract performance** | We need payment data to charge you for the service |
| Security and abuse prevention | **Legitimate interest** | We have a legitimate interest in keeping the service safe for everyone |
| Analytics and product improvement | **Legitimate interest** | We have a legitimate interest in understanding how the product is used |
| Marketing communications (if any) | **Consent** | Only with your explicit opt-in, which you can withdraw anytime |

**What "legitimate interest" means:** It means we use the data in ways you would reasonably expect, in ways that don't override your rights, and only for purposes that benefit both you and us (like keeping the service secure and making it better).

### Where We Get Your Data

We collect data directly from you when you create an account, make a payment, or use the service. We do not purchase data from data brokers, and we do not collect data from third parties about you.

### What You Must Provide vs. What's Optional

| Data | Required? | What happens if you don't provide it |
|---|---|---|
| Email address | Yes | You can't create an account |
| Payment info | Yes | You can't subscribe (we have no free tier) |
| Name | Yes | We need it for billing and account management |
| Analytics data | No | We collect it by default, but you can opt out via your browser or by contacting us |
| IP address | Yes (technical) | We log it automatically for security; you can't use the service without connecting |

---

## How We Protect Your Data

### Zero-Knowledge Encryption for Private Storage

This is the most important thing to understand about Pinner:

**Your private files are encrypted on your device before they are uploaded.** The encryption keys stay on your device. We never see them. We literally cannot read your files. Not won't — **can't**. If law enforcement serves us a warrant, we hand over encrypted gibberish. That's not defiance — it's architecture. We cannot recover your files if you lose your password, because we never had the keys to begin with.

This is called zero-knowledge encryption — we can't read your files, even if we wanted to.

### What We Literally Cannot Access

These are not promises or policies we could change. They are facts about how the software works. No legal order, internal decision, or security breach on our end can change them:

- **Your private file contents are encrypted before they leave your device.** We receive only ciphertext. We cannot reverse it, read it, or produce the plaintext under any circumstances.
- **Your encryption keys stay on your device.** We never generate, transmit, receive, or store them. If you lose them, we cannot help you recover them — because we never had them.
- **Your private file data doesn't travel through our servers.** Encrypted shards move directly between your device and Sia storage providers. Pinner's indexer maintains sealed object records — object IDs, encrypted master keys, slab layouts, and encrypted metadata — but cannot read any of it.
- **Your private file names and structures are scrambled before they reach us.** We hold the encrypted result, but it's gibberish to us. We cannot tell what you stored, what you named it, or what type of file it is.
- **We can't secretly change your private file records.** Your client software signs all metadata with keys that live on your device. If anything gets modified in transit or storage, the signature breaks and your software rejects it.
- **IPFS and shared Sia objects are different.** IPFS content is public — when you pin a file to IPFS, Pinner uploads it to the network on your behalf, so the unencrypted content passes through our infrastructure and we can see it. Shared Sia objects are different — a share URL contains both the object ID and the decryption key, allowing anyone who has it to download and decrypt the file directly from the Sia network. The file data itself never passes through Pinner. Share URLs are generated on your device and never sent to us. Without a share URL, the content remains encrypted and inaccessible — we can remove the indexer record but cannot see what the file contains. If privacy matters for certain data, don't share it — use private storage only.

### IPFS vs. Private Storage vs. Shared Sia Objects: Three Different Models

We offer three ways to store data. They have very different privacy properties:

> **What is a share URL?** A share URL is a link generated on your device that contains both the object ID and the decryption key for a Sia storage object. The key is what matters — without it, the content remains encrypted and no one (including Pinner) can see what the file contains. With it, anyone who has the link can download and decrypt the file directly from the Sia network. Share URLs are time-limited but cannot be revoked — once someone has accessed a share URL, they may have already saved or copied the content. Share URLs are never sent to or stored by Pinner.

| | **IPFS Pinning** | **Private Sia Storage** | **Shared Sia Objects** |
|---|---|---|---|
| **What we see** | CIDs, pin timestamps | Object IDs, encrypted master keys, slab layouts, encrypted metadata, timestamps | Same as private — share URLs contain the decryption key, but we never see or store them |
| **Can we read contents?** | Yes — Pinner uploads IPFS content on your behalf, so it passes through our infrastructure unencrypted | No — keys stay on your device | No — but a share URL contains the decryption key, so anyone who has one can access the content directly from the Sia network. Without a share URL, the content remains encrypted and we cannot see it |
| **Is it encrypted?** | No — content-addressed and public | Yes — client-side encryption | Yes on upload, but sharing provides the decryption key |
| **Deletion** | Unpinning removes from our nodes, other IPFS nodes may have copies | Indexer records removed immediately; encrypted fragments on hosts fully erased within hours to days | Same as private — indexer records removed immediately; encrypted fragments on hosts fully erased within hours to days |

**Shared Sia objects:** When you share a Sia object, your device generates a share URL that contains both the object ID and the decryption key. Anyone who has this URL can download and decrypt the file directly from the Sia network — the file data itself never resides on Pinner's infrastructure. Share URLs are generated client-side and never sent to or stored by Pinner. Because the share URL contains the decryption key, the content is accessible to whoever holds it — including us, if the URL is provided to us. Without a share URL, the content remains encrypted and we cannot see what the file contains — we can only remove the indexer record. Share URLs are time-limited but cannot be restricted to specific users or revoked once shared. Once shared, the privacy properties are similar to IPFS — the content is accessible to anyone with the URL. If privacy matters for certain data, do not share it — use private storage only.

**Important:** When you pin something to IPFS, it gets a permanent content address. Other nodes on the IPFS network may copy and store that data independently. Unpinning from Pinner removes it from our infrastructure, but we cannot force other nodes to delete their copies. Private storage does not have this limitation.

### Technical Security Measures

- **TLS encryption** for all data in transit (between your device and our servers)
- **Zero-knowledge encryption** for private storage files (as described above)
- **Regular security reviews** of our infrastructure and code

### What We DON'T Do

- We do NOT mine your data for advertising
- We do NOT train AI models on your content
- We do NOT sell your personal information to third parties
- We do NOT use automated decision-making or profiling to make decisions about you

---

## Who We Share Data With

We don't sell your data. We share it only with the specific service providers we need to run Pinner, and only what's necessary.

| Recipient | What they receive | Why |
|---|---|---|
| **Stripe** | Card payment tokens, billing info | To process card payments. Stripe handles the full card number; we only see a confirmation token and the last 4 digits. |
| **PostHog** | Product usage events, feature interactions, session replay | To understand how people use Pinner so we can improve it |
| **Sia network hosts** | Encrypted shards | To store your private files across a decentralized network. These hosts store encrypted fragments — they cannot read your data. |
| **Pinner's indexer (indexd)** | Sealed object records — identifiers, encrypted keys, encrypted metadata, signatures, timestamps | To track where your encrypted data lives, coordinate repairs, and manage storage contracts. The indexer never sees plaintext data or metadata. A subset of these identifiers is also linked to your account in our portal database for operational reasons. |
| **Infrastructure provider** | Account data, metadata, encrypted files | To host our application and databases. |

### About Sia Network Hosts

Your encrypted private files are split into shards and distributed across independent hosts on the Sia network. These hosts are not employees or contractors of Pinner. They are independent participants in the Sia decentralized storage network. They store encrypted fragments of your data. Because of the zero-knowledge encryption, they cannot read or reconstruct your files. Pinner does not control these hosts, but we manage the encryption and distribution process.

Pinner's indexer maintains sealed object records — identifiers, encrypted keys, encrypted metadata, signatures, and timestamps. The indexer coordinates repairs and tracks where your data lives, but it never sees plaintext.

Our portal database also keeps a copy of some of these identifiers, linked to your account. This partial duplicate exists for technical and operational reasons.

### About Crypto Payments

For cryptocurrency payments, we collect only your wallet address and the transaction hash. We do NOT collect or require identity documents, proof of address, or any identity verification information for crypto payments. We do NOT know your real-world identity from a wallet address alone.

### About Card Payments

For card payments, Stripe collects your billing information and handles the full card number. We receive only a confirmation token and the last 4 digits of your card. We never see your full card number, CVV, or expiration date.

---

## Where Your Data Lives

Our servers and databases are located in the **United States**.

### For Users in the European Union

If you are in the EU, your personal data is transferred from the EU to the US. We rely on **Standard Contractual Clauses (SCCs)** approved by the European Commission to ensure your data receives protection equivalent to EU standards. These are legal contracts that require us and any US-based service providers to protect your data to the same level as if it stayed in the EU.

We may also rely on the **EU-US Data Privacy Framework** where applicable, though our primary mechanism for international transfers is Standard Contractual Clauses.

---

## How Long We Keep Your Data

We keep data only as long as we have a legitimate reason. This works differently depending on which part of the system we're talking about.

### Private Storage (Indexer)

Private storage deletes are real. When you delete a file from private storage, the record of that file is immediately removed — the encrypted keys, metadata, and references are deleted from our database. Only a marker remains so your app knows to remove it locally. That marker contains none of your data.

When you close your account, your file records are removed and the encrypted data on Sia hosts is scheduled for cleanup. The index is cleared within minutes, but the actual data on the hosts takes longer to fully erase — hours to days, depending on when the next cleanup cycle runs. During that window, the encrypted fragments still physically exist on the host but can no longer be accessed, repaired, or reassembled through Pinner. The fragments remain encrypted; the hosts cannot read them. Your account record is then deactivated — some residual records may persist for operational reasons but are no longer associated with you in any meaningful way.

### Account and Billing Data (Portal)

When you close your account, it is deactivated and removed from active use. Some records remain in our system for operational reasons — they're no longer associated with you in any meaningful way, and your personal information can be replaced with placeholder values on request. If you need your personal information removed from these residual records, contact privacy@pinner.xyz.

### Retention Schedule

| Data type | Retention period | Why |
|---|---|---|
| **Private storage sealed objects** (indexer) | Deleted immediately on user action or account closure | You deleted it, so we remove it. There is no retention period. |
| **IPFS pin records** | Soft-deleted on unpin or account closure | The pin is deactivated but the record persists for technical reasons. Unpinning stops serving the content from our infrastructure; it may still exist on other IPFS nodes. |
| **Account data** (name, email, profile) | Duration of account; residual records persist after closure | To run the service while you're a customer. After closure, some records remain for operational reasons and are no longer associated with you in any meaningful way. Personal information can be replaced with placeholder values on request. |
| **Payment records** | 3 years after transaction | IRS period of limitations for income tax returns. Records support income and deduction reporting as required by federal tax law. |
| **Analytics data** | 7 years (event data), 3 months (session recordings) | We use PostHog for product analytics. PostHog retains event data for 7 years; session recordings for 3 months. |
| **IP addresses** | Retained in our database for the lifetime of the account; server logs are rotated every 90 days | Security, abuse prevention, and download attribution. We do not use IP addresses to track you across the web, build a profile of you, or sell them to anyone. |

**IP addresses:** We record IP addresses associated with account activity, uploads, downloads, and storage changes. We use them to prevent abuse, attribute downloads, and protect the service. We do not use IP addresses to track you across the web, build a profile of you, or sell them to anyone.

---

## Your Rights

You have rights over your personal data. Here's what they are and how to exercise them.

For all of these, contact us at **privacy@pinner.xyz**. We will respond within **30 days**. We may need to verify your identity before acting on your request.

| Right | What it means | How to exercise it |
|---|---|---|
| **Access** | You can ask us what data we have about you | Email privacy@pinner.xyz with the subject "Data Access Request" |
| **Rectification** | You can ask us to correct inaccurate data | Email privacy@pinner.xyz with the subject "Data Correction Request" and tell us what needs fixing |
| **Erasure ("right to be forgotten")** | You can ask us to delete your data | Email privacy@pinner.xyz with the subject "Delete My Account" or use the account deletion option in your settings |
| **Restriction** | You can ask us to stop processing your data in certain circumstances | Email privacy@pinner.xyz with the subject "Restrict Processing Request" and explain why |
| **Portability** | You can ask for a copy of your data in a machine-readable format | Email privacy@pinner.xyz with the subject "Data Portability Request" |
| **Objection** | You can object to our processing based on legitimate interests | Email privacy@pinner.xyz with the subject "Objection to Processing" |
| **Withdraw consent** | If you gave consent for something, you can take it back anytime | Email privacy@pinner.xyz with the subject "Withdraw Consent" |

### Limitations

We may not be able to delete data if we are legally required to keep it (for example, payment records for tax purposes). If this applies to your request, we will tell you.

### Right to Lodge a Complaint

If you believe we have mishandled your data, you have the right to complain to:

- **In the US:** The North Carolina Attorney General's Office
- **In the EU:** The data protection supervisory authority in your country of residence

We hope you'll contact us first at privacy@pinner.xyz so we can try to resolve any issue directly.

### California Residents (CCPA/CPRA)

If you are a California resident and the California Consumer Privacy Act (CCPA) or California Privacy Rights Act (CPRA) applies to Pinner, you have additional rights including:

- The right to know what personal information we collect, use, share, or sell
- The right to delete your personal information (with certain exceptions)
- The right to opt out of the sale of your personal information (note: we do not sell personal information)
- The right to non-discrimination for exercising your privacy rights

To exercise these rights, email privacy@pinner.xyz with the subject "California Privacy Rights Request."

### Opt-Out Preference Signals

We honor the Global Privacy Control (GPC) browser signal. If you have GPC enabled in your browser, we will treat it as a request to opt out of any sale or sharing of personal information. (Note: we do not sell or share personal information for advertising purposes regardless.)

---

## Cookies and Tracking

We use cookies and similar technologies for two purposes:

1. **Essential cookies** — These keep you logged in and make the service work. We can't turn these off.
2. **Analytics cookies** — These help us understand how people use Pinner. We use PostHog for this. We do NOT use advertising cookies or tracking for ads.

You can block analytics cookies through your browser settings or by using a tracking blocker. This won't break the service, but it does make it harder for us to improve.

For more details, contact us at privacy@pinner.xyz.

---

## Children's Privacy

Pinner is not directed at children under 13, and we do not knowingly collect personal information from children under 13. Our service requires a payment method, which generally means it is used by adults.

If we learn that we have collected personal information from a child under 13, we will delete that information as quickly as possible. If you believe we might have information from a child under 13, please contact us at privacy@pinner.xyz.

---

## Changes to This Policy

We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email at least 30 days before the changes take effect. We will also update the "Last updated" date at the top of this page.

Minor changes (like clarifying language or fixing typos) may be made without notice, but we will still update the date.

We encourage you to review this policy periodically. Your continued use of Pinner after changes means you accept the updated policy.

---

## Contact Us

If you have questions, concerns, or requests about this Privacy Policy or how we handle your data, contact us:

| | |
|---|---|
| **Privacy questions** | privacy@pinner.xyz |
| **Report abuse** | abuse@pinner.xyz |
| **Operator** | Hammer Technologies LLC |

We read every email. We're a small team, but we take privacy seriously and we'll get back to you as soon as we can.

### Related Documents

- [Terms of Service](/terms-of-service)
- [Transparency Report](/transparency)
- [Law Enforcement Guide](/law-enforcement)

---

*This Privacy Policy is effective as of May 11, 2026.*
