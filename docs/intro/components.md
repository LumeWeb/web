---
title: How it works
---
#### It's a bridge, it's a gateway
Lume can be seen as a middleware system where you can plug anything in and access it over the relay network. This is done with a help of Hypercore/Dat (see https://docs.holepunch.to which is born from https://dat-ecosystem.org) that allows it to proxy (relay) access to other networks anonymously, and to provide some DNS services. It is also end-to-end encrypted (based on https://noiseprotocol.org).

In the future, Lume will also support WebRTC to act as a signal network and connect browser to browser.

#### It's a storage network and access portal

Lume's portal is powered by Sia (https://sia.tech), and is where all your private data gets stored. It is encrypted before uploading, and it is a paid storage you are accessing through a portal and your web account. The portal can also store public data, for example social app, by just not encrypting. If you paid attention, you remember that Sia is private storage, so how is this possible? It's about the renter (in this case Lume), since you can decide to upload data that do not use encryption and then use them as privately owned (and paid) public data.

The portal is also responsible for hosting all browser code for the end user.

#### Kernel

Next is the frontend of everything. The browser tech of Lume can be referred to as as the kernel and kernel modules, like with Linux. The frontend will load an iframe which loads a bootloader from a .js file which then will trigger a login state if a key is set. It will download the kernel from a community list of portals and once setup, the client app can then run anything they like. All modules operate as web workers inside the iframe.

#### Supported Content Networks

This is the basis of how you can run light clients, SPV nodes, DNS resolvers, content networks and much, much more. It is all based on CID's (Content Identifiers) which use the blake3 hash algo and come from `S5 Network` (https://docs.sfive.net/concepts/content-addressed-data.html).

With blake3 we can also support real time verified streaming, which means files get verified based on their hash as you download so everything is fully trustless. See https://github.com/n0-computer/abao.

#### Path forward

This browser tech can take many forms and Lume will continue evolving to be more advanced over time with its browsing abilities and more importantly, become easy and comfortable to use. That's its biggest problem today and also a reason we already started planning an extension for the most popular browser, Chrome. The end goal is a browser fork, but right now we need to get the foundations right.

So Lume is where all roads meet. It is the bridge, hub, gateway, end user access. It is what allows you to discover Web3 services in the same way you discover seeders with BitTorrent. It is what gives you private storage paired with other Sia ecosystem applications, like from S5.

Lume wants to solve the biggest issues we have left, data ownership, actual decentralization and accessibility.
