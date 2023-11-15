---  
title: Web3 Browser Web App
---

![image](/web3-browser-webapp.png)

Link: https://web3browser.io

This is an experimental tech demo to enable HNS and ENS browsing via IPFS.

This demo uses the following technologies:

* Hypercore: https://docs.holepunch.to/
* The kernel, forked from Skynet: https://git.lumeweb.com/LumeWeb/libkernel/src/branch/develop
* A MVP Sia portal (an L2 in blockchain terms): https://git.lumeweb.com/LumeWeb/portal/src/branch/develop
* Lavanet: https://www.lavanet.xyz
* ETH: https://git.lumeweb.com/LumeWeb/libethsync/src/branch/develop
* IPFS: https://github.com/ipfs/helia
* HNS: https://github.com/handshake-org/hsd

Some notes about current issues and limitations:

* IP addresses are not supported. So you cannot access "normal" servers.
* Pages may render twice, as in refresh, before loading.
* Brave is the only fully tested browser. Chrome was found to have UX issues that need investigation. Firefox has not been tested nor other Chrome-forks.
* Loading is dial-up-slow right now, so just sit and wait. This is a demo, and it is not a 100% polished application or even technology.
* If things get stuck, and you are a power user, try checking the console. Else join our discord and ask for help.
* We expect things to break, only the community can help to fix them.
