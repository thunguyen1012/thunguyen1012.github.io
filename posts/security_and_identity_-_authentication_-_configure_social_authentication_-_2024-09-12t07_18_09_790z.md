---
title: Security and Identity - Authentication - Configure social authentication
published: true
date: 2024-09-12 07:18:09
tags: Summary, AspNetCore
description:
image:
---

## In this article


 - Facebook authentication

 - Microsoft authentication

 - Twitter authentication

 - Other providers

## Configuration

```csharp
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    });

builder.Services.AddRazorPages();
```

 - AuthenticateAsync

 - ```ChallengeAsync```

 - ForbidAsync

 - SignInAsync

 - ```SignOutAsync```

```csharp
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
```

## Apply authorization

```csharp
[Authorize]
public class PrivacyModel : PageModel
{

}
```

## Save the access token

```csharp
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
        options.SaveTokens = true;
    });
```

```csharp
public async Task OnGetAsync()
{
    var accessToken = await HttpContext.GetTokenAsync(
        GoogleDefaults.AuthenticationScheme, "access_token");

    // ...
}
```

## Sign out

```csharp
public class IndexModel : PageModel
{
    public async Task<IActionResult> OnPostLogoutAsync()
    {
        // using Microsoft.AspNetCore.Authentication;
        await HttpContext.SignOutAsync();
        return RedirectToPage();
    }
}
```

## Additional resources

 - Simple authorization in ASP.NET Core

 - Persist additional claims and tokens from external providers in ASP.NET Core

Ref: [Use social sign-in provider authentication without ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/social-without-identity?view=aspnetcore-8.0)