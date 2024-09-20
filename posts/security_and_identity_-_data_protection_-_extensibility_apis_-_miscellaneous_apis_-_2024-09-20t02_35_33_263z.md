---
title: Security and Identity - Data protection - Extensibility APIs - Miscellaneous APIs
published: true
date: 2024-09-20 02:35:33
tags: Summary, AspNetCore
description: The ISecret interface represents a secret value, such as cryptographic key material. It contains the following API surface:
image:
---

## In this article



> Warning
Types that implement any of the following interfaces should be thread-safe for multiple callers.

## ```ISecret```

The ```ISecret``` interface represents a secret value, such as cryptographic key material. It contains the following API surface:

- ```Length: int```

- ```Dispose(): void```

- ```WriteSecretIntoBuffer(ArraySegment<byte> buffer): void```

The ```WriteSecretIntoBuffer``` method populates the supplied buffer with the raw secret value. The reason this API takes the buffer as a parameter rather than returning a `byte[]` directly is that this gives the caller the opportunity to pin the buffer object, limiting secret exposure to the managed garbage collector.

The ```Secret``` type is a concrete implementation of ```ISecret``` where the secret value is stored in in-process memory. On Windows platforms, the secret value is encrypted via CryptProtectMemory.

Ref: [Miscellaneous ASP.NET Core Data Protection APIs](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/extensibility/misc-apis?view=aspnetcore-8.0)