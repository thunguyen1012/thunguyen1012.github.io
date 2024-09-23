---
title: Security and Identity - Data protection - Implementation - Context headers
published: true
date: 2024-09-20 02:55:00
tags: Summary, AspNetCore
description: In the data protection system, a "key" means an object that can provide authenticated encryption services. Each key is identified by a unique id (a GUID), and it carries with it algorithmic information and entropic material. It's intended that each key carry unique entropy, but the system cannot enforce that, and we also need to account for developers who might change the key ring manually by modifying the algorithmic information of an existing key in the key ring. To achieve our security requirements given these cases the data protection system has a concept of cryptographic agility, which allows securely using a single entropic value across multiple cryptographic algorithms.
image:
---

## In this article



## Background and theory

We have developed a data protection system that uses a "key ring" approach to encrypting data.

We wanted to make it easier for developers to provide their own implementations of the AES algorithm.

We're trying to solve a problem where we need to use two different algorithms, one for symmetric block ciphers and one for keyed hash functions.

In this paper we present a new concept of strong PRPs and PRFs based on the idea that strong PRPs and PRFs act as a stable thumbprint over the algorithms in use for any given operation, and it provides the cryptographic agility needed for the data protection system.

## CBC-mode encryption + HMAC authentication



The context header consists of the following components:

- [16 bits] The value 00 00, which is a marker meaning "CBC encryption + HMAC authentication".

- [32 bits] The key length (in bytes, big-endian) of the symmetric block cipher algorithm.

- [32 bits] The block size (in bytes, big-endian) of the symmetric block cipher algorithm.

- [32 bits] The key length (in bytes, big-endian) of the HMAC algorithm. (Currently the key size always matches the digest size.)

- [32 bits] The digest size (in bytes, big-endian) of the HMAC algorithm.

- `EncCBC(K_E, IV, "")`, which is the output of the symmetric block cipher algorithm given an empty string input and where IV is an all-zero vector. The construction of ```K_E``` is described below.

- `MAC(K_H, "")`, which is the output of the HMAC algorithm given an empty string input. The construction of ```K_H``` is described below.

Ideally, we could pass all-zero vectors for ```K_E``` and ```K_H```. However, we want to avoid the situation where the underlying algorithm checks for the existence of weak keys before performing any operations (notably DES and 3DES), which precludes using a simple or repeatable pattern like an all-zero vector.

Instead, we use the NIST SP800-108 KDF in Counter Mode (see NIST SP800-108, Sec. 5.1) with a zero-length key, label, and context and HMACSHA512 as the underlying PRF. We derive | ```K_E``` | + | ```K_H``` | bytes of output, then decompose the result into ```K_E``` and ```K_H``` themselves. Mathematically, this is represented as follows.

```( K_E || K_H ) = SP800_108_CTR(prf = HMACSHA512, key = "", label = "", context = "")```

### Example: AES-192-CBC + HMACSHA256

In this article, I will show you how to generate a context header for a validation algorithm.

First, let ```( K_E || K_H ) = SP800_108_CTR(prf = HMACSHA512, key = "", label = "", context = "")```, where ```| K_E | = 192 bits``` and ```| K_H | = 256 bits``` per the specified algorithms. This leads to ```K_E = 5BB6..21DD``` and ```K_H = A04A..00A9``` in the example below:

Next, compute Enc_CBC (K_E, IV, "") for AES-192-CBC given IV = 0* and ```K_E``` as above.

 ```result := F474B1872B3B53E4721DE19C0841DB6F```

Next, compute MAC(K_H, "") for HMACSHA256 given ```K_H``` as above.

 ```result := D4791184B996092EE1202F36E8608FA8FBD98ABDFF5402F264B1D7211536220C```

This produces the full context header below:

This context header is the thumbprint of the authenticated encryption algorithm pair (AES-192-CBC encryption + HMACSHA256 validation). The components, as described above are:

- the marker (00 00)

- the block cipher key length (00 00 00 18)

- the block cipher block size (00 00 00 10)

- the HMAC key length (00 00 00 20)

- the HMAC digest size (00 00 00 20)

- the block cipher PRP output (F4 74 - DB 6F) and

- the HMAC PRF output (D4 79 - end).

> Note
The CBC-mode encryption + HMAC authentication context header is built the same way regardless of whether the algorithms implementations are provided by Windows CNG or by managed SymmetricAlgorithm and KeyedHashAlgorithm types. This allows applications running on different operating systems to reliably produce the same context header even though the implementations of the algorithms differ between OSes. (In practice, the KeyedHashAlgorithm doesn't have to be a proper HMAC. It can be any keyed hash algorithm type.)

### Example: 3DES-192-CBC + HMACSHA1

First, let ```( K_E || K_H ) = SP800_108_CTR(prf = HMACSHA512, key = "", label = "", context = "")```, where ```| K_E | = 192 bits and | K_H | = 160 bits``` per the specified algorithms. This leads to ```K_E = A219..E2BB``` and ```K_H = DC4A..B464``` in the example below:

Next, compute Enc_CBC (K_E, IV, "") for 3DES-192-CBC given IV = 0* and ```K_E``` as above.

 ```result := ABB100F81E53E10E```

Next, compute MAC(K_H, "") for HMACSHA1 given ```K_H``` as above.

 ```result := 76EB189B35CF03461DDF877CD9F4B1B4D63A7555```

This produces the full context header which is a thumbprint of the authenticated encryption algorithm pair (3DES-192-CBC encryption + HMACSHA1 validation), shown below:

The components break down as follows:

- the marker (00 00)

- the block cipher key length (00 00 00 18)

- the block cipher block size (00 00 00 08)

- the HMAC key length (00 00 00 14)

- the HMAC digest size (00 00 00 14)

- the block cipher PRP output (AB B1 - E1 0E) and

- the HMAC PRF output (76 EB - end).

## Galois/Counter Mode encryption + authentication

The context header consists of the following components:

- [16 bits] The value 00 01, which is a marker meaning "GCM encryption + authentication".

- [32 bits] The key length (in bytes, big-endian) of the symmetric block cipher algorithm.

- [32 bits] The nonce size (in bytes, big-endian) used during authenticated encryption operations. (For our system, this is fixed at nonce size = 96 bits.)

- [32 bits] The block size (in bytes, big-endian) of the symmetric block cipher algorithm. (For GCM, this is fixed at block size = 128 bits.)

- [32 bits] The authentication tag size (in bytes, big-endian) produced by the authenticated encryption function. (For our system, this is fixed at tag size = 128 bits.)

- [128 bits] The tag of Enc_GCM (K_E, nonce, ""), which is the output of the symmetric block cipher algorithm given an empty string input and where nonce is a 96-bit all-zero vector.

 ```K_E``` is derived using the same mechanism as in the CBC encryption + HMAC authentication scenario. However, since there's no ```K_H``` in play here, we essentially have ```| K_H | = 0```, and the algorithm collapses to the below form.

 ```K_E = SP800_108_CTR(prf = HMACSHA512, key = "", label = "", context = "")```

### Example: AES-256-GCM

First, let ```K_E = SP800_108_CTR(prf = HMACSHA512, key = "", label = "", context = "")```, where ```| K_E | = 256 bits```.

 ```K_E := 22BC6F1B171C08C4AE2F27444AF8FC8B3087A90006CAEA91FDCFB47C1B8733B8```

Next, compute the authentication tag of Enc_GCM (K_E, nonce, "") for AES-256-GCM given ```nonce = 096``` and ```K_E``` as above.

 ```result := E7DCCE66DF855A323A6BB7BD7A59BE45```

This produces the full context header below:

The components break down as follows:

- the marker (00 01)

- the block cipher key length (00 00 00 20)

- the nonce size (00 00 00 0C)

- the block cipher block size (00 00 00 10)

- the authentication tag size (00 00 00 10) and

- the authentication tag from running the block cipher (E7 DC - end).

Ref: [Context headers in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/context-headers?view=aspnetcore-8.0)