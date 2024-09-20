---
title: Security and Identity - Data protection - Configuration - Default settings
published: true
date: 2024-09-19 10:36:02
tags: Summary, AspNetCore
description:
image:
---

## In this article

## Key management

 - If the app is hosted in Azure Apps, keys are persisted to the `%HOME%\ASP.NET\DataProtection-Keys` folder. This folder is backed by network storage and is synchronized across all machines hosting the app.

   - Keys aren't protected at rest.

   - The DataProtection-Keys folder supplies the key ring to all instances of an app in a single deployment slot.

   - Separate deployment slots, such as Staging and Production, don't share a key ring. When you swap between deployment slots, for example swapping Staging to Production or using A/B testing, any app using Data Protection won't be able to decrypt stored data using the key ring inside the previous slot. This leads to users being logged out of an app that uses the standard ASP.NET Core cookie authentication, as it uses Data Protection to protect its cookies. If you desire slot-independent key rings, use an external key ring provider, such as Azure Blob Storage, Azure Key Vault, a SQL store, or Redis cache.

 - If the user profile is available, keys are persisted to the `%LOCALAPPDATA%\ASP.NET\DataProtection-Keys` folder. If the operating system is Windows, the keys are encrypted at rest using DPAPI.
The app pool's ```setProfileEnvironment``` attribute must also be enabled. The default value of ```setProfileEnvironment``` is ```true```. In some scenarios (for example, Windows OS), ```setProfileEnvironment``` is set to ```false```. If keys aren't stored in the user profile directory as expected:

   - Navigate to the `%windir%/system32/inetsrv/config` folder.

   - Open the applicationHost.config file.

   - Locate the `<system.applicationHost><applicationPools><applicationPoolDefaults><processModel>` element.

   - Confirm that the ```setProfileEnvironment``` attribute isn't present, which defaults the value to ```true```, or explicitly set the attribute's value to ```true```.

 - If the app is hosted in IIS, keys are persisted to the HKLM registry in a special registry key that's ACLed only to the worker process account. Keys are encrypted at rest using DPAPI.

 - If none of these conditions match, keys aren't persisted outside of the current process. When the process shuts down, all generated keys are lost.

> Warning
If the developer overrides the rules outlined above and points the Data Protection system at a specific key repository, automatic encryption of keys at rest is disabled. At-rest protection can be re-enabled via configuration.

## Key lifetime

## Default algorithms

## Additional resources

 - Key management extensibility in ASP.NET Core

 - Host ASP.NET Core in a web farm

Ref: [Data Protection key management and lifetime in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/default-settings?view=aspnetcore-8.0)