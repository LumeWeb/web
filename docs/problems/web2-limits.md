---  
title: Limitations of Web2
---

Currently, Web2 is a combination of multiple open protocols.
- `HTTP (HyperText Transfer Protocol)` - used for transmission of information across the internet
- `FTP (File Transfer Protocol)` - used to transfer files from a server to client
- `SMTP (Simple Mail Transfer Protocol)` - used to send mail messages
- `IMAP (Internet Message Access Protocol)` and `POP (Post Office Protocol)` - used by email clients to retrieve messages
- `DNS (Domain Name System)` - used to turn domains names into IP addresses which allow browsers to access websites and other resources


Their limitations are often `single points of failure with servers and IP addresses`, where you need to load balance in order to scale and it is also very easy to identify who is hosting what, for better or worse.

You can also find a lot more limitations when you zoom out a bit and focus on network effects. You will notice that many of these protocols have been captured and modified to benefit the `Big Technology` companies. You either do it their way or you can forget about getting it done.

But most important of all is `Censorship`. With web content, nearly every single layer of the system has been captured and has the power to shut you down if scaring you with warnings is not enough.

Let's look at those:
- `ICANN` - A giant phone book hierarchy you can see as a group of database records knowns as `Domains`. This exists because people remember words better than numbers or codes and it is what makes market with domains so valuable. And while ICANN was originally founded by the government to be later made independent, it still can be corrupted and a subject to political pressure which makes it centralized and makes the criteria for getting new TLD's very difficult.
- `DNS` - Your DNS providers can easily censor you or refuse to provide service. And even if they are a good one, they can be pressured or enforced todo the same. So what can you do if this happens to you? Not much - your one and only option is to move to other provider. And if they are your domain registrar at the same time, well...
- `Hosting` - Your servers can be shut down any moment. There is a hierarchy and `ISP (Internet Service Provider)` has this right as a business partner too. If any of them or the government doesn't like what's going on, the pressure is applied and can go all the way up, shutting you down quickly or facing the consequences.
- `Web Browser` - It's been many years since browsers like Chrome added "safety" blockers to scare you off accessing any sites they wish. While in general this exists for a good reason, it can be easily abused.
- `Anti-Virus` - Your AV software, even thought it's supposed to protect you, can do the same with any form of real-time protection.
- `Computer / Operating System` - With the direction things are going it is completely rational to think that Microsoft could put this in the OS level too. Let's hope we don't get to this point.
