---
title: Security and Identity - Data protection - Overview
published: true
date: 2024-09-16 06:57:51
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Provide a built in solution for most Web scenarios.

 - Address many of the deficiencies of the previous encryption system.

 - Serve as the replacement for the <machineKey> element in ASP.NET 1.x - 4.x.

## Problem statement

 - A file path.

 - A permission.

 - A handle or other indirect reference.

 - Some server-specific data.

 - All services operating within the cryptosystem are equally trusted.

 - The data doesn't need to be generated or consumed outside of the services under our direct control.

 - Operations must be fast since each request to the web service might go through the cryptosystem one or more times. The speed requirement makes symmetric cryptography ideal. Asymmetric cryptography isn't used until it's required.

## Design philosophy

 - Ease of configuration. The system strives for zero configuration. In situations where developers need to configure a specific aspect, such as the key repository, those specific configurations aren't difficult.

 - Offer a basic consumer-facing API. The APIs are straight forward to use correctly and difficult to use incorrectly.

 - Developers don't have to learn key management principles. The system handles algorithm selection and key lifetime on behalf of the developer. The developer doesn't have access to the raw key material.

 - Keys are protected at rest as much as possible. The system figures out an appropriate default protection mechanism and applies it automatically.

## Audience

 - The consumer APIs target application and framework developers.
I don't want to learn about how the stack operates or about how it's configured. I just want to perform some operation with high probability of using the APIs successfully.

 - The configuration APIs target app developers and system administrators.
I need to tell the data protection system that my environment requires non-default paths or settings.

 - The extensibility APIs target developers in charge of implementing custom policy. Usage of these APIs is limited to rare situations and developers with security experience.
I need to replace an entire component within the system because I have truly unique behavioral requirements. I'm willing to learn uncommonly used parts of the API surface in order to build a plugin that fulfills my requirements.

## Package layout

 - ```Microsoft.AspNetCore.DataProtection.Abstractions``` contains:

If the data protection system is instantiated elsewhere and you're consuming the API, reference ```Microsoft.AspNetCore.DataProtection.Abstractions```.

   - IDataProtectionProvider and IDataProtector interfaces to create data protection services.

   - Useful extension methods for working with these types. for example, IDataProtector.Protect

 - ```Microsoft.AspNetCore.DataProtection``` contains the core implementation of the data protection system, including:

To instantiate the data protection system, reference ```Microsoft.AspNetCore.DataProtection```. You might need to reference the data protection system when:

   - Core cryptographic operations.

   - Key management.

   - Configuration and extensibility.

   - Adding it to an IServiceCollection.

   - Modifying or extending its behavior.

 - ```Microsoft.AspNetCore.DataProtection```.Extensions contains additional APIs which developers might find useful but which don't belong in the core package. For instance, this package contains:

   - Factory methods to instantiate the data protection system to store keys at a location on the file system without dependency injection. See DataProtectionProvider.

   - Extension methods for limiting the lifetime of protected payloads. See ITimeLimitedDataProtector.

 - ```Microsoft.AspNetCore.DataProtection```.SystemWeb can be installed into an existing ASP.NET 4.x app to redirect its `<machineKey>` operations to use the new ASP.NET Core data protection stack. For more information, see Replace the ASP.NET machineKey in ASP.NET Core.

 - Microsoft.AspNetCore.Cryptography.KeyDerivation provides an implementation of the PBKDF2 password hashing routine and can be used by systems that must handle user passwords securely. For more information, see Hash passwords in ASP.NET Core.

## Additional resources

 - Get started with the Data Protection APIs in ASP.NET Core

 - Host ASP.NET Core in a web farm

Ref: [ASP.NET Core Data Protection Overview](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/introduction?view=aspnetcore-8.0)