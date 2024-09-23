---
title: Security and Identity - Data protection - Implementation - Key management
published: true
date: 2024-09-20 02:55:20
tags: Summary, AspNetCore
description: The data protection system automatically manages the lifetime of master keys used to protect and unprotect payloads. Each key can exist in one of four stages:
image:
---

## In this article



The data protection system automatically manages the lifetime of master keys used to protect and unprotect payloads. Each key can exist in one of four stages:

- Created - the key exists in the key ring but has not yet been activated. The key shouldn't be used for new ```Protect``` operations until sufficient time has elapsed that the key has had a chance to propagate to all machines that are consuming this key ring.

- Active - the key exists in the key ring and should be used for all new ```Protect``` operations.

- Expired - the key has run its natural lifetime and should no longer be used for new ```Protect``` operations.

- Revoked - the key is compromised and must not be used for new ```Protect``` operations.

Encryption keys can be used to protect payloads.

> Warning
The developer might be tempted to delete a key from the key ring (e.g., by deleting the corresponding file from the file system). At that point, all data protected by the key is permanently undecipherable, and there's no emergency override like there's with revoked keys. Deleting a key is truly destructive behavior.

## Default key selection

When the data protection system reads the key ring from the backing repository, it will attempt to locate a "default" key from the key ring. The default key is used for new ```Protect``` operations.

Here's how it works:

A data protection system generates a new key immediately rather than falling back to a different key, and the system should prefer the current configuration over falling back.

The default data protection key is always the default key.



## Key expiration and rolling

I'm working on a way to make it easier to create and propagate key rings.

The data protection system will roll back the default key to the key ring when the default key expires.

When creating a key for an application, you might want to consider how quickly it will be activated.

The default key lifetime is 90 days, though this is configurable as in the following example.

```csharp
services.AddDataProtection()
       // use 14-day lifetime instead of 90-day lifetime
       .SetDefaultKeyLifetime(TimeSpan.FromDays(14));
```

An administrator can also change the default system-wide, though an explicit call to ```SetDefaultKeyLifetime``` will override any system-wide policy. The default key lifetime cannot be shorter than 7 days.

## Automatic key ring refresh

When the data protection system initializes, it reads the key ring from the underlying repository and caches it in memory. This cache allows ```Protect``` and ```Unprotect``` operations to proceed without hitting the backing store. The system will automatically check the backing store for changes approximately every 24 hours or when the current default key expires, whichever comes first.

> Warning
Developers should very rarely (if ever) need to use the key management APIs directly. The data protection system will perform automatic key management as described above.

The data protection system exposes an interface ```IKeyManager``` that can be used to inspect and make changes to the key ring. The DI system that provided the instance of ```IDataProtectionProvider``` can also provide an instance of ```IKeyManager``` for your consumption. Alternatively, you can pull the ```IKeyManager``` straight from the ```IServiceProvider``` as in the example below.

Any operation which modifies the key ring (creating a new key explicitly or performing a revocation) will invalidate the in-memory cache. The next call to ```Protect``` or ```Unprotect``` will cause the data protection system to reread the key ring and recreate the cache.

The sample below demonstrates using the ```IKeyManager``` interface to inspect and manipulate the key ring, including revoking existing keys and generating a new key manually.

```csharp
using System;
using System.IO;
using System.Threading;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.Extensions.DependencyInjection;

public class Program
{
    public static void Main(string[] args)
    {
        var serviceCollection = new ServiceCollection();
        serviceCollection.AddDataProtection()
            // point at a specific folder and use DPAPI to encrypt keys
            .PersistKeysToFileSystem(new DirectoryInfo(@"c:\temp-keys"))
            .ProtectKeysWithDpapi();
        var services = serviceCollection.BuildServiceProvider();

        // perform a protect operation to force the system to put at least
        // one key in the key ring
        services.GetDataProtector("Sample.KeyManager.v1").Protect("payload");
        Console.WriteLine("Performed a protect operation.");
        Thread.Sleep(2000);

        // get a reference to the key manager
        var keyManager = services.GetService<IKeyManager>();

        // list all keys in the key ring
        var allKeys = keyManager.GetAllKeys();
        Console.WriteLine($"The key ring contains {allKeys.Count} key(s).");
        foreach (var key in allKeys)
        {
            Console.WriteLine($"Key {key.KeyId:B}: Created = {key.CreationDate:u}, IsRevoked = {key.IsRevoked}");
        }

        // revoke all keys in the key ring
        keyManager.RevokeAllKeys(DateTimeOffset.Now, reason: "Revocation reason here.");
        Console.WriteLine("Revoked all existing keys.");

        // add a new key to the key ring with immediate activation and a 1-month expiration
        keyManager.CreateNewKey(
            activationDate: DateTimeOffset.Now,
            expirationDate: DateTimeOffset.Now.AddMonths(1));
        Console.WriteLine("Added a new key.");

        // list all keys in the key ring
        allKeys = keyManager.GetAllKeys();
        Console.WriteLine($"The key ring contains {allKeys.Count} key(s).");
        foreach (var key in allKeys)
        {
            Console.WriteLine($"Key {key.KeyId:B}: Created = {key.CreationDate:u}, IsRevoked = {key.IsRevoked}");
        }
    }
}

/*
 * SAMPLE OUTPUT
 *
 * Performed a protect operation.
 * The key ring contains 1 key(s).
 * Key {1b948618-be1f-440b-b204-64ff5a152552}: Created = 2015-03-18 22:20:49Z, IsRevoked = False
 * Revoked all existing keys.
 * Added a new key.
 * The key ring contains 2 key(s).
 * Key {1b948618-be1f-440b-b204-64ff5a152552}: Created = 2015-03-18 22:20:49Z, IsRevoked = True
 * Key {2266fc40-e2fb-48c6-8ce2-5fde6b1493f7}: Created = 2015-03-18 22:20:51Z, IsRevoked = False
 */
```

If you would like to see code comments translated to languages other than English, let us know in this GitHub discussion issue.

## Key storage

A data protection system and a key persistence mechanism have been developed for the Android operating system.

- Key storage providers in ASP.NET Core

- Key encryption at rest in Windows and Azure using ASP.NET Core

Ref: [Key management in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-management?view=aspnetcore-8.0)