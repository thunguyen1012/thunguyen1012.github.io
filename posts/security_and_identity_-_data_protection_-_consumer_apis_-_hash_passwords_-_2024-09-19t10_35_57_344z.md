---
title: Security and Identity - Data protection - Consumer APIs - Hash passwords
published: true
date: 2024-09-19 10:35:57
tags: Summary, AspNetCore
description: This article shows how to call the KeyDerivation.Pbkdf2 method which allows hashing a password using the PBKDF2 algorithm.
image:
---

## In this article

This article shows how to call the ```KeyDerivation.Pbkdf2``` method which allows hashing a password using the PBKDF2 algorithm.

> Warning
The ```KeyDerivation.Pbkdf2``` API is a low-level cryptographic primitive and is intended to be used to integrate apps into an existing protocol or cryptographic system. ```KeyDerivation.Pbkdf2``` should not be used in new apps which support password based login and need to store hashed passwords in a datastore. New apps should use ```PasswordHasher```. For more information on ```PasswordHasher```, see Exploring the ASP.NET Core Identity ```PasswordHasher```.

The data protection code base includes a derivation package Microsoft.AspNetCore.Cryptography.KeyDerivation which contains cryptographic key functions.

> Warning
The following code shows how to use ```KeyDerivation.Pbkdf2``` to  generate a shared secret key. It should not be used to hash a password for storage in a datastore.

```csharp
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Cryptography;

Console.Write("Enter a password: ");
string? password = Console.ReadLine();

// Generate a 128-bit salt using a sequence of
// cryptographically strong random bytes.
byte[] salt = RandomNumberGenerator.GetBytes(128 / 8); // divide by 8 to convert bits to bytes
Console.WriteLine($"Salt: {Convert.ToBase64String(salt)}");

// derive a 256-bit subkey (use HMACSHA256 with 100,000 iterations)
string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
    password: password!,
    salt: salt,
    prf: KeyDerivationPrf.HMACSHA256,
    iterationCount: 100000,
    numBytesRequested: 256 / 8));

Console.WriteLine($"Hashed: {hashed}");

/*
 * SAMPLE OUTPUT
 *
 * Enter a password: Xtw9NMgx
 * Salt: CGYzqeN4plZekNC88Umm1Q==
 * Hashed: Gt9Yc4AiIvmsC1QQbe2RZsCIqvoYlst2xbz0Fs8aHnw=
 */
```

See the source code for ASP.NET Core Identity's ```PasswordHasher``` type for a real-world use case.

> Note
Documentation links to .NET reference source usually load the repository's default branch, which represents the current development for the next release of .NET. To select a tag for a specific release, use the Switch branches or tags dropdown list. For more information, see How to select a version tag of ASP.NET Core source code (dotnet/AspNetCore.Docs #26205).

Ref: [Hash passwords in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/consumer-apis/password-hashing?view=aspnetcore-8.0)