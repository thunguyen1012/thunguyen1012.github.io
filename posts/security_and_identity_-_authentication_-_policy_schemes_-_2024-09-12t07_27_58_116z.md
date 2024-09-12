---
title: Security and Identity - Authentication - Policy schemes
published: true
date: 2024-09-12 07:27:58
tags: Summary, AspNetCore
description: Authentication policy schemes make it easier to have a single logical authentication scheme potentially use multiple approaches. For example, a policy scheme might use Google authentication for challenges, and cookie authentication for everything else. Authentication policy schemes make it:
image:
---

## In this article

Google has announced a new policy scheme for its Android operating system.

- Easy to forward any authentication action to another scheme.

- Forward dynamically based on the request.

All authentication schemes that use derived AuthenticationSchemeOptions and the associated AuthenticationHandler<TOptions>:

- Are automatically policy schemes in ASP.NET Core 2.1 and later.

- Can be enabled via configuring the scheme's options.

```csharp
public class AuthenticationSchemeOptions
{
    /// <summary>
    /// If set, this specifies a default scheme that authentication handlers should 
    /// forward all authentication operations to, by default. The default forwarding 
    /// logic checks in this order:
    /// 1. The most specific ForwardAuthenticate/Challenge/Forbid/SignIn/SignOut 
    /// 2. The ForwardDefaultSelector
    /// 3. ForwardDefault
    /// The first non null result is used as the target scheme to forward to.
    /// </summary>
    public string ForwardDefault { get; set; }

    /// <summary>
    /// If set, this specifies the target scheme that this scheme should forward 
    /// AuthenticateAsync calls to. For example:
    /// Context.AuthenticateAsync("ThisScheme") => 
    ///                Context.AuthenticateAsync("ForwardAuthenticateValue");
    /// Set the target to the current scheme to disable forwarding and allow 
    /// normal processing.
    /// </summary>
    public string ForwardAuthenticate { get; set; }

    /// <summary>
    /// If set, this specifies the target scheme that this scheme should forward 
    /// ChallengeAsync calls to. For example:
    /// Context.ChallengeAsync("ThisScheme") =>
    ///                         Context.ChallengeAsync("ForwardChallengeValue");
    /// Set the target to the current scheme to disable forwarding and allow normal
    /// processing.
    /// </summary>
    public string ForwardChallenge { get; set; }

    /// <summary>
    /// If set, this specifies the target scheme that this scheme should forward 
    /// ForbidAsync calls to.For example:
    /// Context.ForbidAsync("ThisScheme") 
    ///                               => Context.ForbidAsync("ForwardForbidValue");
    /// Set the target to the current scheme to disable forwarding and allow normal 
    /// processing.
    /// </summary>
    public string ForwardForbid { get; set; }

    /// <summary>
    /// If set, this specifies the target scheme that this scheme should forward 
    /// SignInAsync calls to. For example:
    /// Context.SignInAsync("ThisScheme") => 
    ///                                Context.SignInAsync("ForwardSignInValue");
    /// Set the target to the current scheme to disable forwarding and allow normal 
    /// processing.
    /// </summary>
    public string ForwardSignIn { get; set; }

    /// <summary>
    /// If set, this specifies the target scheme that this scheme should forward 
    /// SignOutAsync calls to. For example:
    /// Context.SignOutAsync("ThisScheme") => 
    ///                              Context.SignOutAsync("ForwardSignOutValue");
    /// Set the target to the current scheme to disable forwarding and allow normal 
    /// processing.
    /// </summary>
    public string ForwardSignOut { get; set; }

    /// <summary>
    /// Used to select a default scheme for the current request that authentication
    /// handlers should forward all authentication operations to by default. The 
    /// default forwarding checks in this order:
    /// 1. The most specific ForwardAuthenticate/Challenge/Forbid/SignIn/SignOut
    /// 2. The ForwardDefaultSelector
    /// 3. ForwardDefault. 
    /// The first non null result will be used as the target scheme to forward to.
    /// </summary>
    public Func<HttpContext, string> ForwardDefaultSelector { get; set; }
}
```

## Examples

The following example shows a higher level scheme that combines lower level schemes. Google authentication is used for challenges, and cookie authentication is used for everything else:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
       .AddCookie(options => options.ForwardChallenge = "Google")
       .AddGoogle(options => { });
}
```

The following example enables dynamic selection of schemes on a per request basis. That is, how to mix cookies and API authentication:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
        .AddCookie(options =>
        {
            // For example, can foward any requests that start with /api 
            // to the api scheme.
            options.ForwardDefaultSelector = ctx => 
               ctx.Request.Path.StartsWithSegments("/api") ? "Api" : null;
        })
        .AddYourApiAuth("Api");
}
```

Ref: [Policy schemes in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/policyschemes?view=aspnetcore-8.0)