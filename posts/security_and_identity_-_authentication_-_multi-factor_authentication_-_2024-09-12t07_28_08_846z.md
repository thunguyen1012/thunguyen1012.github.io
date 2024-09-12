---
title: Security and Identity - Authentication - Multi-factor authentication
published: true
date: 2024-09-12 07:28:08
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - What is MFA and what MFA flows are recommended

 - Configure MFA for administration pages using ASP.NET Core Identity

 - Send MFA sign-in requirement to OpenID Connect server

 - Force ASP.NET Core OpenID Connect client to require MFA

## MFA, 2FA

### MFA TOTP (Time-based One-time Password Algorithm)

 - Microsoft Authenticator

 - Google Authenticator

### MFA passkeys/FIDO2 or passwordless

 - The most secure way of achieving MFA.

 - MFA that protects against phishing attacks. (As well as certificate authentication and Windows for business)

### MFA SMS

## Configure MFA for administration pages using ASP.NET Core Identity

### Extend the login with an MFA claim

```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(
        Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
		options.SignIn.RequireConfirmedAccount = false)
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddSingleton<IEmailSender, EmailSender>();
builder.Services.AddScoped<IUserClaimsPrincipalFactory<IdentityUser>, 
    AdditionalUserClaimsPrincipalFactory>();

builder.Services.AddAuthorization(options =>
    options.AddPolicy("TwoFactorEnabled", x => x.RequireClaim("amr", "mfa")));

builder.Services.AddRazorPages();
```

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace IdentityStandaloneMfa
{
    public class AdditionalUserClaimsPrincipalFactory : 
        UserClaimsPrincipalFactory<IdentityUser, IdentityRole>
    {
        public AdditionalUserClaimsPrincipalFactory( 
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager, 
            IOptions<IdentityOptions> optionsAccessor) 
            : base(userManager, roleManager, optionsAccessor)
        {
        }

        public async override Task<ClaimsPrincipal> CreateAsync(IdentityUser user)
        {
            var principal = await base.CreateAsync(user);
            var identity = (ClaimsIdentity)principal.Identity;

            var claims = new List<Claim>();

            if (user.TwoFactorEnabled)
            {
                claims.Add(new Claim("amr", "mfa"));
            }
            else
            {
                claims.Add(new Claim("amr", "pwd"));
            }

            identity.AddClaims(claims);
            return principal;
        }
    }
}
```

```cshtml
@{
    Layout = "/Pages/Shared/_Layout.cshtml";
}
```

```cshtml
@{
    Layout = "_Layout.cshtml";
}
```

### Validate the MFA requirement in the administration page

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace IdentityStandaloneMfa
{
    public class AdminModel : PageModel
    {
        public IActionResult OnGet()
        {
            var claimTwoFactorEnabled = 
                User.Claims.FirstOrDefault(t => t.Type == "amr");

            if (claimTwoFactorEnabled != null && 
                "mfa".Equals(claimTwoFactorEnabled.Value))
            {
                // You logged in with MFA, do the administrative stuff
            }
            else
            {
                return Redirect(
                    "/Identity/Account/Manage/TwoFactorAuthentication");
            }

            return Page();
        }
    }
}
```

### UI logic to toggle user login information

```csharp
services.AddAuthorization(options =>
    options.AddPolicy("TwoFactorEnabled",
        x => x.RequireClaim("amr", "mfa")));
```

```cshtml
@using Microsoft.AspNetCore.Authorization
@using Microsoft.AspNetCore.Identity
@inject SignInManager<IdentityUser> SignInManager
@inject UserManager<IdentityUser> UserManager
@inject IAuthorizationService AuthorizationService
```

```cshtml
@if (SignInManager.IsSignedIn(User))
{
    @if ((AuthorizationService.AuthorizeAsync(User, "TwoFactorEnabled")).Result.Succeeded)
    {
        <li class="nav-item">
            <a class="nav-link text-dark" asp-area="" asp-page="/Admin">Admin</a>
        </li>
    }
    else
    {
        <li class="nav-item">
            <a class="nav-link text-dark" asp-area="" asp-page="/Admin" 
               id="tooltip-demo"  
               data-toggle="tooltip" 
               data-placement="bottom" 
               title="MFA is NOT enabled. This is required for the Admin Page. If you have activated MFA, then logout, login again.">
                Admin (Not Enabled)
            </a>
        </li>
    }
}
```

![Administrator MFA authentication!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/mfa/_static/identitystandalonemfa_01.png?view=aspnetcore-8.0 "Administrator MFA authentication")

![Administrator activates MFA authentication!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/mfa/_static/identitystandalonemfa_02.png?view=aspnetcore-8.0 "Administrator activates MFA authentication")

## Send MFA sign-in requirement to OpenID Connect server

> Note
The ```acr_values``` parameter needs to be handled on the OpenID Connect server for this to work.

### OpenID Connect ASP.NET Core client

```csharp
build.Services.AddAuthentication(options =>
{
	options.DefaultScheme =
		CookieAuthenticationDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme =
		OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie()
.AddOpenIdConnect(options =>
{
	options.SignInScheme =
		CookieAuthenticationDefaults.AuthenticationScheme;
	options.Authority = "<OpenID Connect server URL>";
	options.RequireHttpsMetadata = true;
	options.ClientId = "<OpenID Connect client ID>";
	options.ClientSecret = "<>";
	options.ResponseType = "code";
	options.UsePkce = true;	
	options.Scope.Add("profile");
	options.Scope.Add("offline_access");
	options.SaveTokens = true;
	options.Events = new OpenIdConnectEvents
	{
		OnRedirectToIdentityProvider = context =>
		{
			context.ProtocolMessage.SetParameter("acr_values", "mfa");
			return Task.FromResult(0);
		}
	};
});
```

### Example OpenID Connect Duende IdentityServer server with ASP.NET Core Identity

 - Displays if the Identity comes from an app that requires MFA but the user hasn't activated this in Identity.

 - Informs the user and adds a link to activate this.

```cshtml
@{
    ViewData["Title"] = "ErrorEnable2FA";
}

<h1>The client application requires you to have MFA enabled. Enable this, try login again.</h1>

<br />

You can enable MFA to login here:

<br />

<a href="~/Identity/Account/Manage/TwoFactorAuthentication">Enable MFA</a>
```

```csharp
public async Task<IActionResult> OnPost()
{
	// check if we are in the context of an authorization request
	var context = await _interaction.GetAuthorizationContextAsync(Input.ReturnUrl);

	var requires2Fa = context?.AcrValues.Count(t => t.Contains("mfa")) >= 1;

	var user = await _userManager.FindByNameAsync(Input.Username);
	if (user != null && !user.TwoFactorEnabled && requires2Fa)
	{
		return RedirectToPage("/Home/ErrorEnable2FA/Index");
	}

	// code omitted for brevity

	if (ModelState.IsValid)
	{
		var result = await _signInManager.PasswordSignInAsync(Input.Username, Input.Password, Input.RememberLogin, lockoutOnFailure: true);
		if (result.Succeeded)
		{
			// code omitted for brevity
		}
		if (result.RequiresTwoFactor)
		{
			var fido2ItemExistsForUser = await _fido2Store.GetCredentialsByUserNameAsync(user.UserName);
			if (fido2ItemExistsForUser.Count > 0)
			{
				return RedirectToPage("/Account/LoginFido2Mfa", new { area = "Identity", Input.ReturnUrl, Input.RememberLogin });
			}

			return RedirectToPage("/Account/LoginWith2fa", new { area = "Identity", Input.ReturnUrl, RememberMe = Input.RememberLogin });
		}

		await _events.RaiseAsync(new UserLoginFailureEvent(Input.Username, "invalid credentials", clientId: context?.Client.ClientId));
		ModelState.AddModelError(string.Empty, LoginOptions.InvalidCredentialsErrorMessage);
	}

	// something went wrong, show form with error
	await BuildModelAsync(Input.ReturnUrl);
	return Page();
}
```

 - Still validates the ```amr``` claim.

 - Can set up the MFA with a link to the ASP.NET Core Identity view.

![acr_values-1 image!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/mfa/_static/acr_values-1.png?view=aspnetcore-8.0 "acr_values-1 image")

## Force ASP.NET Core OpenID Connect client to require MFA

```csharp
using Microsoft.AspNetCore.Authorization;

namespace AspNetCoreRequireMfaOidc;

public class RequireMfa : IAuthorizationRequirement{}
```

```csharp
public class RequireMfaHandler : AuthorizationHandler<RequireMfa>
{
	protected override Task HandleRequirementAsync(
		AuthorizationHandlerContext context, 
		RequireMfa requirement)
	{
		if (context == null)
			throw new ArgumentNullException(nameof(context));
		if (requirement == null)
			throw new ArgumentNullException(nameof(requirement));

		var amrClaim =
			context.User.Claims.FirstOrDefault(t => t.Type == "amr");

		if (amrClaim != null && amrClaim.Value == Amr.Mfa)
		{
			context.Succeed(requirement);
		}

		return Task.CompletedTask;
	}
}
```

```csharp
builder.Services.ConfigureApplicationCookie(options =>
        options.Cookie.SecurePolicy =
            CookieSecurePolicy.Always);

builder.Services.AddSingleton<IAuthorizationHandler, RequireMfaHandler>();

builder.Services.AddAuthentication(options =>
{
	options.DefaultScheme =
		CookieAuthenticationDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme =
		OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie()
.AddOpenIdConnect(options =>
{
	options.SignInScheme =
		CookieAuthenticationDefaults.AuthenticationScheme;
	options.Authority = "https://localhost:44352";
	options.RequireHttpsMetadata = true;
	options.ClientId = "AspNetCoreRequireMfaOidc";
	options.ClientSecret = "AspNetCoreRequireMfaOidcSecret";
	options.ResponseType = "code";
	options.UsePkce = true;	
	options.Scope.Add("profile");
	options.Scope.Add("offline_access");
	options.SaveTokens = true;
});

builder.Services.AddAuthorization(options =>
{
	options.AddPolicy("RequireMfa", policyIsAdminRequirement =>
	{
		policyIsAdminRequirement.Requirements.Add(new RequireMfa());
	});
});

builder.Services.AddRazorPages();
```

```csharp
[Authorize(Policy= "RequireMfa")]
public class IndexModel : PageModel
{
    public void OnGet()
    {
    }
}
```

```cshtml
@page
@model AspNetCoreRequireMfaOidc.AccessDeniedModel
@{
    ViewData["Title"] = "AccessDenied";
    Layout = "~/Pages/Shared/_Layout.cshtml";
}

<h1>AccessDenied</h1>

You require MFA to login here

<a href="https://localhost:44352/Manage/TwoFactorAuthentication">Enable MFA</a>
```

 - The ```amr``` has the ```pwd``` value:

![amr has the pwd value!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/mfa/_static/require_mfa_oidc_02.png?view=aspnetcore-8.0 "amr has the pwd value")

 - Access is denied:

![Access is denied!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/mfa/_static/require_mfa_oidc_03.png?view=aspnetcore-8.0 "Access is denied")

![Logging in using OTP with Identity!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/mfa/_static/require_mfa_oidc_01.png?view=aspnetcore-8.0 "Logging in using OTP with Identity")

## Additional resources

 - Enable QR Code generation for TOTP authenticator apps in ASP.NET Core

 - Passwordless authentication options for Azure Active Directory

 - FIDO2 .NET library for FIDO2 / WebAuthn Attestation and Assertion using .NET

 - WebAuthn Awesome

Ref: [Multi-factor authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/mfa?view=aspnetcore-8.0)