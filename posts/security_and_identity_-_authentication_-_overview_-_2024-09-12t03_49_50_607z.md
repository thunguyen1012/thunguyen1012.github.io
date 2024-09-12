---
title: Security and Identity - Authentication - Overview
published: true
date: 2024-09-12 03:49:50
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Authenticating a user.

 - Responding when an unauthenticated user tries to access a restricted resource.

 - By calling a scheme-specific extension method after a call to ```AddAuthentication```, such as AddJwtBearer or ```AddCookie```. These extension methods use ```AuthenticationBuilder.AddScheme``` to register schemes with appropriate settings.

 - Less commonly, by calling ```AuthenticationBuilder.AddScheme``` directly.

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme,
        options => builder.Configuration.Bind("JwtSettings", options))
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme,
        options => builder.Configuration.Bind("CookieSettings", options));
```

## Authentication concepts

 - Authentication scheme

 - The default authentication scheme, discussed in the next two sections.

 - Directly set HttpContext.User.

### ```DefaultScheme```

 - Is automatically used as the ```DefaultScheme```.

 - Eliminates the need to specify the ```DefaultScheme``` in ```AddAuthentication(IServiceCollection) or AddAuthenticationCore(IServiceCollection)```.

### Authentication scheme

 - An authentication handler.

 - Options for configuring that specific instance of the handler.

 - Specify different default schemes to use for authenticate, challenge, and forbid actions.

 - Combine multiple schemes into one using policy schemes.

### Authentication handler

 - Is a type that implements the behavior of a scheme.

 - Is derived from `IAuthenticationHandler` or `AuthenticationHandler<TOptions>`.

 - Has the primary responsibility to authenticate users.

 - Construct AuthenticationTicket objects representing the user's identity if authentication is successful.

 - Return 'no result' or 'failure' if authentication is unsuccessful.

 - Have methods for challenge and forbid actions for when users attempt to access resources:

   - They're unauthorized to access (forbid).

   - When they're unauthenticated (challenge).

### `RemoteAuthenticationHandler<TOptions>` vs `AuthenticationHandler<TOptions>`

 - Is the authentication provider.

 - Examples include Facebook, Twitter, Google, Microsoft, and any other OIDC provider that handles authenticating users using the handlers mechanism.

### Authenticate

 - A cookie authentication scheme constructing the user's identity from cookies.

 - A JWT bearer scheme deserializing and validating a JWT bearer token to construct the user's identity.

### Challenge

 - A cookie authentication scheme redirecting the user to a login page.

 - A JWT bearer scheme returning a 401 result with a ```www-authenticate: bearer``` header.

### Forbid

 - A cookie authentication scheme redirecting the user to a page indicating access was forbidden.

 - A JWT bearer scheme returning a 403 result.

 - A custom authentication scheme redirecting to a page where the user can request access to the resource.

 - They're authenticated.

 - They're not permitted to access the requested resource.

 - Challenge and forbid with an operational resource handler.

 - Differences between challenge and forbid.

## Authentication providers per tenant

 - An open-source, modular, and multi-tenant app framework built with ASP.NET Core.

 - A content management system (CMS) built on top of that app framework.

 - Open source

 - Provides tenant resolution

 - Lightweight

 - Provides data isolation

 - Configure app behavior uniquely for each tenant

## Additional resources

 - Authorize with a specific scheme in ASP.NET Core

 - Policy schemes in ASP.NET Core

 - Create an ASP.NET Core app with user data protected by authorization

 - Globally require authenticated users

 - GitHub issue on using multiple authentication schemes

Ref: [Overview of ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-8.0)