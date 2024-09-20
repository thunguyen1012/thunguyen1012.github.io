---
title: Security and Identity - Data protection - Consumer APIs - Limit the lifetime of protected payloads
published: true
date: 2024-09-19 10:36:00
tags: Summary, AspNetCore
description: There are scenarios where the application developer wants to create a protected payload that expires after a set period of time. For instance, the protected payload might represent a password reset token that should only be valid for one hour. It's certainly possible for the developer to create their own payload format that contains an embedded expiration date, and advanced developers may wish to do this anyway, but for the majority of developers managing these expirations can grow tedious.
image:
---

## In this article

In this article I'm going to show you how to create a protected payload that expires after a set period of time.

To make this easier for our developer audience, the package Microsoft.AspNetCore.DataProtection.Extensions contains utility APIs for creating payloads that automatically expire after a set period of time. These APIs implement the ```ITimeLimitedDataProtector``` interface.

## API usage

The ```ITimeLimitedDataProtector``` interface is the core interface for protecting and unprotecting time-limited / self-expiring payloads. To create an instance of an ```ITimeLimitedDataProtector```, you'll first need an instance of a regular ```IDataProtector``` constructed with a specific purpose. Once the ```IDataProtector``` instance is available, call the ```IDataProtector.ToTimeLimitedDataProtector``` extension method to get back a protector with built-in expiration capabilities.

 ```ITimeLimitedDataProtector``` exposes the following API surface and extension methods:

- CreateProtector(string purpose) : ```ITimeLimitedDataProtector``` - This API is similar to the existing ```IDataProtectionProvider.CreateProtector``` in that it can be used to create purpose chains from a root time-limited protector.

- ```Protect(byte[] plaintext, DateTimeOffset expiration) : byte[]```

- ```Protect(byte[] plaintext, TimeSpan lifetime) : byte[]```

- ```Protect(byte[] plaintext) : byte[]```

- ```Protect(string plaintext, DateTimeOffset expiration) : string```

- ```Protect(string plaintext, TimeSpan lifetime) : string```

- ```Protect(string plaintext) : string```

In addition to the core ```Protect``` methods which take only the plaintext, there are new overloads which allow specifying the payload's expiration date. The expiration date can be specified as an absolute date (via a ```DateTimeOffset```) or as a relative time (from the current system time, via a ```TimeSpan```). If an overload which doesn't take an expiration is called, the payload is assumed never to expire.

- ```Unprotect(byte[] protectedData, out DateTimeOffset expiration) : byte[]```

- ```Unprotect(byte[] protectedData) : byte[]```

- ```Unprotect(string protectedData, out DateTimeOffset expiration) : string```

- ```Unprotect(string protectedData) : string```

The ```Unprotect``` methods return the original unprotected data. If the payload hasn't yet expired, the absolute expiration is returned as an optional out parameter along with the original unprotected data. If the payload is expired, all overloads of the ```Unprotect``` method will throw CryptographicException.

> Warning
It's not advised to use these APIs to protect payloads which require long-term or indefinite persistence. "Can I afford for the protected payloads to be permanently unrecoverable after a month?" can serve as a good rule of thumb; if the answer is no then developers should consider alternative APIs.

The sample below uses the non-DI code paths for instantiating the data protection system. To run this sample, ensure that you have first added a reference to the Microsoft.AspNetCore.DataProtection.Extensions package.

```csharp
using System;
using System.IO;
using System.Threading;
using Microsoft.AspNetCore.DataProtection;
 
public class Program
{
    public static void Main(string[] args)
    {
        // create a protector for my application
 
        var provider = DataProtectionProvider.Create(new DirectoryInfo(@"c:\myapp-keys\"));
        var baseProtector = provider.CreateProtector("Contoso.TimeLimitedSample");
 
        // convert the normal protector into a time-limited protector
        var timeLimitedProtector = baseProtector.ToTimeLimitedDataProtector();
 
        // get some input and protect it for five seconds
        Console.Write("Enter input: ");
        string input = Console.ReadLine();
        string protectedData = timeLimitedProtector.Protect(input, lifetime: TimeSpan.FromSeconds(5));
        Console.WriteLine($"Protected data: {protectedData}");
 
        // unprotect it to demonstrate that round-tripping works properly
        string roundtripped = timeLimitedProtector.Unprotect(protectedData);
        Console.WriteLine($"Round-tripped data: {roundtripped}");
 
        // wait 6 seconds and perform another unprotect, demonstrating that the payload self-expires
        Console.WriteLine("Waiting 6 seconds...");
        Thread.Sleep(6000);
        timeLimitedProtector.Unprotect(protectedData);
    }
}
 
/*
 * SAMPLE OUTPUT
 *
 * Enter input: Hello!
 * Protected data: CfDJ8Hu5z0zwxn...nLk7Ok
 * Round-tripped data: Hello!
 * Waiting 6 seconds...
 * <<throws CryptographicException with message 'The payload expired at ...'>>

 */
```

Ref: [Limit the lifetime of protected payloads in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/consumer-apis/limited-lifetime-payloads?view=aspnetcore-8.0)