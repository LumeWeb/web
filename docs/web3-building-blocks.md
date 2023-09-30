---  
title: Building Blocks of Web3
---

If you hear someone talk about Web3 today, all they are talking about are just random NFT's, Casinos or future possibilities of internet.

But that's not what Web3 really is. `The new ingredience separating Web3 from Web2 is censorship-resistance`.

You can actually translate a lot of the Web2 technologies and components to their Web3 versions, and many can be reused even as they are right now.

When you look at the marketing for the hundreds of Web3/DeFi projects, it's all full of strong claims and promises, every single project sounds like re-definition of the internet, while it actually is just begging for attention and your money.

So instead of trying to explain what Web3 involves, lets explain what we have in Web2, and what its counterparts can look like in web3.

- `Money Ledgers -> Blockchain` - Essential component of Web3. Instead of easily editable SQL database with bank account credits you have a blockchain ensured security and order of records where changes can happen only through consensus mechanism maintained and protected by all servers participating on the network. It's open-source and permission-less, you're your own bank.
  - Also since blockchain is the most mis-understood by people not deep in the `crypto`/`defi`/`web3` industry, here is a very short primer on what a blockchain is compared to a MySQL database.
    - You have a single MySQL db, this is one Bitcoin node.
    - You scale that to two nodes, and setup active-active replication (both nodes can write and read to the database, and can be seen as a `master`).
    - Now you decide the two servers cannot trust each other, so you need a consensus system. There are blockchains/p2p nets that do forms of consensus that don't directly require money too 🙃.
    - Lastly you decide that for security, some sort of economy needs to exist, per human nature/incentives, so that making changes has a cost to it.
    - You now have transformed a traditional web2 database into a blockchain.
- `Stored Procedures and Macros -> Smart Contracts` - There are many different forms of functions people use with MS Excel, MS Access or SQL. These can interact with and modify the records you have, similarly as Smart Contracts.
-  `MySQL/NoSQL -> Distributed/Hybrid Databases` - There have been several different types of databases that have evolved in web3. Some are pure P2P, some use on-chain data or otherwise settle consensus or other data on-chain.
- `REST API -> RPC` - Most of the web runs on different forms of APIs today, the most common approach being REST. With blockchain databases, access to these uses different forms of RPC systems.
- `Virtual Private Server (VPS) -> Compute Networks` - A few of these exist, but there are blockchain networks that specialize in the brokering of compute services like you may expect from AWS, which can run pretty much anything else in Web3 if needed. Both Web2 and Web3 have P2P networks, and the best known are probably BitTorrent and IPFS. These can be viewed as the content networks (not blockchains) and are extremely important for Web3.
  - `Serverless Functions and CDNs -> Edge Networks` - These are a specialization of compute networks that were born from AWS with lambada (and cloudfront) but has since rapidly evolved. There are projects that are experimenting with blockchain based edge compute and CDNs.

- `NAS Backups, Archiving, Object Storage -> Storage Networks` - If the currency of the world is currently oil, the currency of the web is data. No matter what you do, you eventually need secure, private, encrypted data storage, and a lot of it. This comes in many forms, but broadly these are where all of Web3's (and Web2) data will end up in sooner or later.

Web3 is also fundamentally built on P2P networks in many forms and designs. Every blockchain alone is a P2P network, tracking its databases changes. That's very different from Web2, that is mostly using `server -> client` model.

We will always have servers, but they need to become more resilient by becoming anonymous and serving over P2P rather than in means that are easy to identify and censor. And while history shows us how much effort is always being put into centralization and limitation of human rights, it's the laws that will eventually have to adapt to the new technologies.
