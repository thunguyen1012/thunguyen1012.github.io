---
title: Security and Identity - Authentication - ASP.NET Core Identity - External authentication providers - Other providers
published: true
date: 2024-09-12 07:17:55
tags: Summary, AspNetCore
description: 
image:
---

## In this article

The ASP.NET Core team supports a number of authentication providers.

- LinkedIn

- Instagram

- Reddit (Instructions)

- Github (Instructions)

- Yahoo (Instructions)

- Tumblr (Instructions)

- Pinterest (Instructions)

- Pocket (Instructions)

- Flickr (Instructions)

- Dribbble (Instructions)

- Vimeo (Instructions)

- SoundCloud (Instructions)

- VK (Instructions)

## Multiple authentication providers

When the app requires multiple providers, chain the provider extension methods behind AddAuthentication:

```csharp
services.AddAuthentication()
    .AddMicrosoftAccount(microsoftOptions => { ... })
    .AddGoogle(googleOptions => { ... })
    .AddTwitter(twitterOptions => { ... })
    .AddFacebook(facebookOptions => { ... });
```

## Forward request information with a proxy or load balancer

If the app is deployed behind a proxy server or load balancer, some of the original request information might be forwarded to the app in request headers. This information usually includes the secure request scheme (https), host, and client IP address. Apps don't automatically read these request headers to discover and use the original request information.

The scheme is used in link generation that affects the authentication flow with external providers. Losing the secure scheme (https) results in the app generating incorrect insecure redirect URLs.

Use Forwarded Headers Middleware to make the original request information available to the app for request processing.

For more information, see Configure ASP.NET Core to work with proxy servers and load balancers.

Ref: [External OAuth authentication providers](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/other-logins?view=aspnetcore-8.0)