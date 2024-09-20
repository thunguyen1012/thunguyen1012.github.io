---
title: Security and Identity - Data protection - Consumer APIs - Purpose hierarchy and multi-tenancy
published: true
date: 2024-09-19 10:35:51
tags: Summary, AspNetCore
description: Since an IDataProtector is also implicitly an IDataProtectionProvider, purposes can be chained together. In this sense, provider.CreateProtector([ "purpose1", "purpose2" ]) is equivalent to provider.CreateProtector("purpose1").CreateProtector("purpose2").
image:
---

## In this article

Since an ```IDataProtector``` is also implicitly an ```IDataProtectionProvider```, purposes can be chained together. In this sense, `provider.CreateProtector([ "purpose1", "purpose2" ])` is equivalent to `provider.CreateProtector("purpose1").CreateProtector("purpose2")`.

This allows for some interesting hierarchical relationships through the data protection system. In the earlier example of Contoso.Messaging.SecureMessage, the SecureMessage component can call `provider.CreateProtector("Contoso.Messaging.SecureMessage")` once up-front and cache the result into a private ```_myProvider``` field. Future protectors can then be created via calls to ```_myProvider.CreateProtector("User: username")```, and these protectors would be used for securing the individual messages.

This can also be flipped. Consider a single logical application which hosts multiple tenants (a CMS seems reasonable), and each tenant can be configured with its own authentication and state management system. The umbrella application has a single master provider, and it calls `provider.CreateProtector("Tenant 1")` and `provider.CreateProtector("Tenant 2")` to give each tenant its own isolated slice of the data protection system. The tenants could then derive their own individual protectors based on their own needs, but no matter how hard they try they cannot create protectors which collide with any other tenant in the system. Graphically, this is represented as below.



![Multi tenancy purposes!](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/consumer-apis/purpose-strings-multitenancy/_static/purposes-multi-tenancy.png?view=aspnetcore-8.0 "Multi tenancy purposes")

> Warning
This assumes the umbrella application controls which APIs are available to individual tenants and that tenants cannot execute arbitrary code on the server. If a tenant can execute arbitrary code, they could perform private reflection to break the isolation guarantees, or they could just read the master keying material directly and derive whatever subkeys they desire.

We've been hearing a lot lately about how Microsoft's data protection system handles master keying material.

Ref: [Purpose hierarchy and multi-tenancy in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/consumer-apis/purpose-strings-multitenancy?view=aspnetcore-8.0)