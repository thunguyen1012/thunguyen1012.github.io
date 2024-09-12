---
title: Security and Identity - Authentication - ASP.NET Core Identity - Configure Identity
published: true
date: 2024-09-12 06:24:13
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Identity options

### Claims Identity

<table><thead>
<tr>
<th>Property</th>
<th>Description</th>
<th style="text-align: center;">Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.claimsidentityoptions.roleclaimtype" class="no-loc" data-linktype="absolute-path">RoleClaimType</a></td>
<td>Gets or sets the claim type used for a role claim.</td>
<td style="text-align: center;"><a href="/en-us/dotnet/api/system.security.claims.claimtypes.role#system-security-claims-claimtypes-role" class="no-loc" data-linktype="absolute-path">ClaimTypes.Role</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.claimsidentityoptions.securitystampclaimtype" class="no-loc" data-linktype="absolute-path">SecurityStampClaimType</a></td>
<td>Gets or sets the claim type used for the security stamp claim.</td>
<td style="text-align: center;"><code>AspNet.Identity.SecurityStamp</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.claimsidentityoptions.useridclaimtype" class="no-loc" data-linktype="absolute-path">UserIdClaimType</a></td>
<td>Gets or sets the claim type used for the user identifier claim.</td>
<td style="text-align: center;"><a href="/en-us/dotnet/api/system.security.claims.claimtypes.nameidentifier#system-security-claims-claimtypes-nameidentifier" class="no-loc" data-linktype="absolute-path">ClaimTypes.NameIdentifier</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.claimsidentityoptions.usernameclaimtype" class="no-loc" data-linktype="absolute-path">UserNameClaimType</a></td>
<td>Gets or sets the claim type used for the user name claim.</td>
<td style="text-align: center;"><a href="/en-us/dotnet/api/system.security.claims.claimtypes.name#system-security-claims-claimtypes-name" class="no-loc" data-linktype="absolute-path">ClaimTypes.Name</a></td>
</tr>
</tbody></table>

### Lockout

```csharp
public async Task<IActionResult> OnPostAsync(string returnUrl = null)
{
    returnUrl ??= Url.Content("~/");

    ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();

    if (ModelState.IsValid)
    {
        // This doesn't count login failures towards account lockout
        // To enable password failures to trigger account lockout, set lockoutOnFailure: true
        var result = await _signInManager.PasswordSignInAsync(Input.Email,
             Input.Password, Input.RememberMe,
             lockoutOnFailure: false);
        if (result.Succeeded)
        {
            _logger.LogInformation("User logged in.");
            return LocalRedirect(returnUrl);
        }
        if (result.RequiresTwoFactor)
        {
            return RedirectToPage("./LoginWith2fa", new { ReturnUrl = returnUrl, RememberMe = Input.RememberMe });
        }
        if (result.IsLockedOut)
        {
            _logger.LogWarning("User account locked out.");
            return RedirectToPage("./Lockout");
        }
        else
        {
            ModelState.AddModelError(string.Empty, "Invalid login attempt.");
            return Page();
        }
    }

    // If we got this far, something failed, redisplay form
    return Page();
}
```

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RPauth.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options =>
                                       options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddRazorPages();

builder.Services.Configure<IdentityOptions>(options =>
{
    // Default Lockout settings.
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

<table><thead>
<tr>
<th>Property</th>
<th>Description</th>
<th style="text-align: center;">Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.lockoutoptions.allowedfornewusers" class="no-loc" data-linktype="absolute-path">AllowedForNewUsers</a></td>
<td>Determines if a new user can be locked out.</td>
<td style="text-align: center;"><code>true</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.lockoutoptions.defaultlockouttimespan" class="no-loc" data-linktype="absolute-path">DefaultLockoutTimeSpan</a></td>
<td>The amount of time a user is locked out when a lockout occurs.</td>
<td style="text-align: center;">5 minutes</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.lockoutoptions.maxfailedaccessattempts" class="no-loc" data-linktype="absolute-path">MaxFailedAccessAttempts</a></td>
<td>The number of failed access attempts until a user is locked out, if lockout is enabled.</td>
<td style="text-align: center;">5</td>
</tr>
</tbody></table>

### ```Password```

 - PasswordOptions in ```Program.cs```.

 - [StringLength] attributes of ```Password``` properties if Identity is scaffolded into the app. ```InputModel``` ```Password``` properties are found in the following files:

   - ```Areas/Identity/Pages/Account/Register.cshtml.cs```

   - ```Areas/Identity/Pages/Account/ResetPassword.cshtml.cs```

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RPauth.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options =>
                                options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddRazorPages();

builder.Services.Configure<IdentityOptions>(options =>
{
    // Default Password settings.
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;
});

var app = builder.Build();

// Remaining code removed for brevity.
```

<table><thead>
<tr>
<th>Property</th>
<th>Description</th>
<th style="text-align: center;">Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordoptions.requiredigit" class="no-loc" data-linktype="absolute-path">RequireDigit</a></td>
<td>Requires a number between 0-9 in the password.</td>
<td style="text-align: center;"><code>true</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordoptions.requiredlength" class="no-loc" data-linktype="absolute-path">RequiredLength</a></td>
<td>The minimum length of the password.</td>
<td style="text-align: center;">6</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordoptions.requirelowercase" class="no-loc" data-linktype="absolute-path">RequireLowercase</a></td>
<td>Requires a lowercase character in the password.</td>
<td style="text-align: center;"><code>true</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordoptions.requirenonalphanumeric" class="no-loc" data-linktype="absolute-path">RequireNonAlphanumeric</a></td>
<td>Requires a non-alphanumeric character in the password.</td>
<td style="text-align: center;"><code>true</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordoptions.requireduniquechars" class="no-loc" data-linktype="absolute-path">RequiredUniqueChars</a></td>
<td>Only applies to ASP.NET Core 2.0 or later.<br><br> Requires the number of distinct characters in the password.</td>
<td style="text-align: center;">1</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordoptions.requireuppercase" class="no-loc" data-linktype="absolute-path">RequireUppercase</a></td>
<td>Requires an uppercase character in the password.</td>
<td style="text-align: center;"><code>true</code></td>
</tr>
</tbody></table>

### Sign-in

```csharp
builder.Services.Configure<IdentityOptions>(options =>
{
    // Default SignIn settings.
    options.SignIn.RequireConfirmedEmail = false;
    options.SignIn.RequireConfirmedPhoneNumber = false;
});
```

<table><thead>
<tr>
<th>Property</th>
<th>Description</th>
<th style="text-align: center;">Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.signinoptions.requireconfirmedemail" class="no-loc" data-linktype="absolute-path">RequireConfirmedEmail</a></td>
<td>Requires a confirmed email to sign in.</td>
<td style="text-align: center;"><code>false</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.signinoptions.requireconfirmedphonenumber" class="no-loc" data-linktype="absolute-path">RequireConfirmedPhoneNumber</a></td>
<td>Requires a confirmed phone number to sign in.</td>
<td style="text-align: center;"><code>false</code></td>
</tr>
</tbody></table>

### Tokens

<table><thead>
<tr>
<th>Property</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.tokenoptions.authenticatortokenprovider" class="no-loc" data-linktype="absolute-path">AuthenticatorTokenProvider</a></td>
<td>Gets or sets the <code>AuthenticatorTokenProvider</code> used to validate two-factor sign-ins with an authenticator.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.tokenoptions.changeemailtokenprovider" class="no-loc" data-linktype="absolute-path">ChangeEmailTokenProvider</a></td>
<td>Gets or sets the <code>ChangeEmailTokenProvider</code> used to generate tokens used in email change confirmation emails.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.tokenoptions.changephonenumbertokenprovider" class="no-loc" data-linktype="absolute-path">ChangePhoneNumberTokenProvider</a></td>
<td>Gets or sets the <code>ChangePhoneNumberTokenProvider</code> used to generate tokens used when changing phone numbers.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.tokenoptions.emailconfirmationtokenprovider" class="no-loc" data-linktype="absolute-path">EmailConfirmationTokenProvider</a></td>
<td>Gets or sets the token provider used to generate tokens used in account confirmation emails.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.tokenoptions.passwordresettokenprovider" class="no-loc" data-linktype="absolute-path">PasswordResetTokenProvider</a></td>
<td>Gets or sets the <a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.iusertwofactortokenprovider-1" class="no-loc" data-linktype="absolute-path">IUserTwoFactorTokenProvider&lt;TUser&gt;</a> used to generate tokens used in password reset emails.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.tokenoptions.providermap" class="no-loc" data-linktype="absolute-path">ProviderMap</a></td>
<td>Used to construct a <a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.tokenproviderdescriptor" data-linktype="absolute-path">User Token Provider</a> with the key used as the provider's name.</td>
</tr>
</tbody></table>

### User

```csharp
builder.Services.Configure<IdentityOptions>(options =>
{
    // Default User settings.
    options.User.AllowedUserNameCharacters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = false;

});
```

<table><thead>
<tr>
<th>Property</th>
<th>Description</th>
<th style="text-align: center;">Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.useroptions.allowedusernamecharacters" class="no-loc" data-linktype="absolute-path">AllowedUserNameCharacters</a></td>
<td>Allowed characters in the username.</td>
<td style="text-align: center;">abcdefghijklmnopqrstuvwxyz<br>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>0123456789<br>-._@+</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.useroptions.requireuniqueemail" class="no-loc" data-linktype="absolute-path">RequireUniqueEmail</a></td>
<td>Requires each user to have a unique email.</td>
<td style="text-align: center;"><code>false</code></td>
</tr>
</tbody></table>

### Cookie settings

```csharp
builder.Services.ConfigureApplicationCookie(options =>
{
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
    options.Cookie.Name = "YourAppCookieName";
    options.Cookie.HttpOnly = true;
    options.ExpireTimeSpan = TimeSpan.FromMinutes(60);
    options.LoginPath = "/Identity/Account/Login";
    // ReturnUrlParameter requires 
    //using Microsoft.AspNetCore.Authentication.Cookies;
    options.ReturnUrlParameter = CookieAuthenticationDefaults.ReturnUrlParameter;
    options.SlidingExpiration = true;
});
```

## ```Password``` Hasher options

<table><thead>
<tr>
<th>Option</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordhasheroptions.compatibilitymode#microsoft-aspnetcore-identity-passwordhasheroptions-compatibilitymode" class="no-loc" data-linktype="absolute-path">CompatibilityMode</a></td>
<td>The compatibility mode used when hashing new passwords. Defaults to <a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordhashercompatibilitymode#microsoft-aspnetcore-identity-passwordhashercompatibilitymode-identityv3" class="no-loc" data-linktype="absolute-path">IdentityV3</a>. The first byte of a hashed password, called a <em>format marker</em>, specifies the version of the hashing algorithm used to hash the password. When verifying a password against a hash, the <a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordhasher-1.verifyhashedpassword" class="no-loc" data-linktype="absolute-path">VerifyHashedPassword</a> method selects the correct algorithm based on the first byte. A client is able to authenticate regardless of which version of the algorithm was used to hash the password. Setting the compatibility mode affects the hashing of <em>new passwords</em>.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordhasheroptions.iterationcount#microsoft-aspnetcore-identity-passwordhasheroptions-iterationcount" class="no-loc" data-linktype="absolute-path">IterationCount</a></td>
<td>The number of iterations used when hashing passwords using PBKDF2. This value is only used when the <a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordhasheroptions.compatibilitymode#microsoft-aspnetcore-identity-passwordhasheroptions-compatibilitymode" class="no-loc" data-linktype="absolute-path">CompatibilityMode</a> is set to <a href="/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordhashercompatibilitymode#microsoft-aspnetcore-identity-passwordhashercompatibilitymode-identityv3" class="no-loc" data-linktype="absolute-path">IdentityV3</a>. The value must be a positive integer and defaults to <code>100000</code>.</td>
</tr>
</tbody></table>

```csharp
// using Microsoft.AspNetCore.Identity;

builder.Services.Configure<PasswordHasherOptions>(option =>
{
    option.IterationCount = 12000;
});
```

## Globally require all users to be authenticated

## ISecurityStampValidator and SignOut everywhere

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebClaimsPrincipal.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => 
options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Force Identity's security stamp to be validated every minute.
builder.Services.Configure<SecurityStampValidatorOptions>(o => 
                   o.ValidationInterval = TimeSpan.FromMinutes(1));

builder.Services.AddRazorPages();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

Ref: [Configure ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration?view=aspnetcore-8.0)