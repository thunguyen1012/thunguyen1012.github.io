---
title: Security and Identity - Share cookies among apps
published: true
date: 2024-09-23 04:46:49
tags: Summary, AspNetCore
description:
image:
---

## In this article

The ASP.NET Core cookie protection stack allows web apps to share cookie authentication tickets.

 - The authentication cookie name is set to a common value of ```.AspNet.SharedCookie```.

 - The ```AuthenticationType``` is set to ```Identity.Application``` either explicitly or by default.

 - A common app name, ```SharedCookieApp```, is used to enable the data protection system to share data protection keys.

 - ```Identity.Application``` is used as the authentication scheme. Whatever scheme is used, it must be used consistently within and across the shared cookie apps either as the default scheme or by explicitly setting it. The scheme is used when encrypting and decrypting cookies, so a consistent scheme must be used across apps.

 - A common data protection key storage location is used.

   - In ASP.NET Core apps, PersistKeysToFileSystem is used to set the key storage location.

   - In .NET Framework apps, Cookie Authentication Middleware uses an implementation of ```DataProtectionProvider```. ```DataProtectionProvider``` provides data protection services for the encryption and decryption of authentication cookie payload data. The ```DataProtectionProvider``` instance is isolated from the data protection system used by other parts of the app. ```DataProtectionProvider.Create(System.IO.DirectoryInfo, Action<IDataProtectionBuilder>)``` accepts a DirectoryInfo to specify the location for data protection key storage.

 - ```DataProtectionProvider``` requires the Microsoft.AspNetCore.DataProtection.Extensions NuGet package:

   - In .NET Framework apps, add a package reference to Microsoft.AspNetCore.DataProtection.Extensions.

 - SetApplicationName sets the common app name.

## Share authentication cookies with ASP.NET Core Identity

 - Data protection keys and the app name must be shared among apps. A common key storage location is provided to the PersistKeysToFileSystem method in the following examples. Use SetApplicationName to configure a common shared app name (SharedCookieApp in the following examples). For more information, see Configure ASP.NET Core Data Protection.

 - Use the ConfigureApplicationCookie extension method to set up the data protection service for cookies.

 - The default authentication type is ```Identity.Application```.

```csharp
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(@"c:\PATH TO COMMON KEY RING FOLDER"))
    .SetApplicationName("SharedCookieApp");

builder.Services.ConfigureApplicationCookie(options => {
    options.Cookie.Name = ".AspNet.SharedCookie";
});

var app = builder.Build();
```

## Share authentication cookies without ASP.NET Core Identity

```csharp
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(@"c:\PATH TO COMMON KEY RING FOLDER"))
    .SetApplicationName("SharedCookieApp");

builder.Services.AddAuthentication("Identity.Application")
    .AddCookie("Identity.Application", options =>
    {
        options.Cookie.Name = ".AspNet.SharedCookie";
    });

var app = builder.Build();
```

## Share cookies across different base paths

```csharp
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(@"c:\PATH TO COMMON KEY RING FOLDER"))
    .SetApplicationName("SharedCookieApp");

builder.Services.ConfigureApplicationCookie(options => {
    options.Cookie.Name = ".AspNet.SharedCookie";
    options.Cookie.Path = "/";
});

var app = builder.Build();
```

## Share cookies across subdomains

```csharp
options.Cookie.Domain = ".contoso.com";
```

## Encrypt data protection keys at rest

```csharp
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddDataProtection()
    .ProtectKeysWithCertificate("{CERTIFICATE THUMBPRINT}");
```

## Use a common user database

## Application name change

## Share authentication cookies between ASP.NET 4.x and ASP.NET Core apps

 - Using the System.Web adapters' remote authentication feature, which uses the ASP.NET app to sign users in.

 - Configuring the ASP.NET app to use Microsoft.Owin Cookie Authentication Middleware so that authentication cookies are shared with the ASP.NET Core app.

```csharp
app.UseCookieAuthentication(new CookieAuthenticationOptions
{
    LoginPath = new PathString("/Account/Login"),
    Provider = new CookieAuthenticationProvider
    { 
        OnValidateIdentity = SecurityStampValidator.OnValidateIdentity<ApplicationUserManager, ApplicationUser>(
            validateInterval: TimeSpan.FromMinutes(30),
            regenerateIdentity: (manager, user) => user.GenerateUserIdentityAsync(manager))
    },

    // Settings to configure shared cookie with ASP.NET Core app
    CookieName = ".AspNet.ApplicationCookie",
    AuthenticationType = "Identity.Application",                
    TicketDataFormat = new AspNetTicketDataFormat(
        new DataProtectorShim(
            DataProtectionProvider.Create(new DirectoryInfo(@"c:\PATH TO COMMON KEY RING FOLDER"),
            builder => builder.SetApplicationName("SharedCookieApp"))
            .CreateProtector(
                "Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationMiddleware",
                // Must match the Scheme name used in the ASP.NET Core app, i.e. IdentityConstants.ApplicationScheme
                "Identity.Application",
                "v2"))),
    CookieManager = new ChunkingCookieManager()
});
```

 - The cookie name is set to the same name as in the ASP.NET Core app.

 - A data protection provider is created using the same key ring path. Note that in these examples, data protection keys are stored on disk but other data protection providers can be used. For example, Redis or Azure Blob Storage can be used for data protection providers as long as the configuration matches between the apps. See Configure ASP.NET Core Data Protection for more information on persisting data protection keys.

 - The app name is set to be the same as the app name used in the ASP.NET Core app.

 - The authentication type is set to the name of the authentication scheme in the ASP.NET Core app.

 - ```System.Web.Helpers.AntiForgeryConfig.UniqueClaimTypeIdentifier``` is set to a claim from the ASP.NET Core identity that will be unique to a user.

```csharp
public class ApplicationUser : IdentityUser
{
    public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
    {
        // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
        var userIdentity = await manager.CreateIdentityAsync(this, "Identity.Application");
        
        // Add custom user claims here
        return userIdentity;
    }
}
```

## Additional resources

 - Host ASP.NET Core in a web farm

 - A primer on OWIN cookie authentication middleware for the ASP.NET developer by Brock Allen

 - OWIN Authentication Middleware Architecture by Brock Allen

 - Posts from the ‘OWIN / Katana’ Category by Brock Allen

Ref: [Share authentication cookies among ASP.NET apps](https://learn.microsoft.com/en-us/aspnet/core/security/cookie-sharing?view=aspnetcore-8.0)