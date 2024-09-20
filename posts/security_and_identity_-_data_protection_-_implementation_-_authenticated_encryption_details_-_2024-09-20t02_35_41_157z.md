---
title: Security and Identity - Data protection - Implementation - Authenticated encryption details
published: true
date: 2024-09-20 02:35:41
tags: Summary, AspNetCore
description: Calls to IDataProtector.Protect are authenticated encryption operations. The Protect method offers both confidentiality and authenticity, and it's tied to the purpose chain that was used to derive this particular IDataProtector instance from its root IDataProtectionProvider.
image:
---

## In this article



`IDataProtector.Protect` is a method of `IDataProtectionProvider`.

`IDataProtector.Protect` is an extension to `IDataProtector` which produces a protected payload.

## Protected payload format

The protected payload format consists of three primary components:

- A 32-bit magic header that identifies the version of the data protection system.

- A 128-bit key id that identifies the key used to protect this particular payload.

- The remainder of the protected payload is specific to the encryptor encapsulated by this key. In the example below, the key represents an AES-256-CBC + HMACSHA256 encryptor, and the payload is further subdivided as follows:

  - A 128-bit key modifier.

  - A 128-bit initialization vector.

  - 48 bytes of AES-256-CBC output.

  - An HMACSHA256 authentication tag.

A sample protected payload is illustrated below.

From the payload format above the first 32 bits, or 4 bytes are the magic header identifying the version (09 F0 C9 F0)

The next 128 bits, or 16 bytes is the key identifier (80 9C 81 0C 19 66 19 40 95 36 53 F8 AA FF EE 57)

The remainder contains the payload and is specific to the format used.

> Warning
All payloads protected to a given key will begin with the same 20-byte (magic value, key id) header. Administrators can use this fact for diagnostic purposes to approximate when a payload was generated. For example, the payload above corresponds to key {0c819c80-6619-4019-9536-53f8aaffee57}. If after checking the key repository you find that this specific key's activation date was 2015-01-01 and its expiration date was 2015-03-01, then it's reasonable to assume that the payload (if not tampered with) was generated within that window, give or take a small fudge factor on either side.

Ref: [Authenticated encryption details in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/authenticated-encryption-details?view=aspnetcore-8.0)