---
title: Security and Identity - SameSite cookies
published: true
date: 2024-09-23 04:46:49
tags: Summary, AspNetCore
description:
image:
---

## In this article

 ```SameSite``` is an IETF draft standard designed to provide some protection against cross-site request forgery (CSRF) attacks. Originally drafted in 2016, the draft standard was updated in 2019. The updated standard is not backward compatible with the previous standard, with the following being the most noticeable differences:

- Cookies without ```SameSite``` header are treated as ```SameSite=Lax``` by default.

- ```SameSite=None``` must be used to allow cross-site cookie use.

- Cookies that assert ```SameSite=None``` must also be marked as ```Secure```.

- Applications that use `<iframe>` may experience issues with ```sameSite=Lax``` or ```sameSite=Strict``` cookies because `<iframe>` is treated as cross-site scenarios.

- The value ```SameSite=None``` is not allowed by the 2016 standard and causes some implementations to treat such cookies as ```SameSite=Strict```. See Supporting older browsers in this document.

The ```SameSite=Lax``` setting works for most application cookies. Some forms of authentication like OpenID Connect (OIDC) and WS-Federation default to POST based redirects. The POST based redirects trigger the ```SameSite``` browser protections, so ```SameSite``` is disabled for these components. Most OAuth logins are not affected due to differences in how the request flows.

Each ASP.NET Core component that emits cookies needs to decide if ```SameSite``` is appropriate.

## ```SameSite``` and ```Identity```

ASP.NET Core ```Identity``` is largely unaffected by ```SameSite``` cookies except for advanced scenarios like ```IFrames``` or ```OpenIdConnect``` integration.

When using ```Identity```, do not add any cookie providers or call  `services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)`, ```Identity``` takes care of that.

## ```SameSite``` test sample code

<table><thead>
<tr>
<th>Sample</th>
<th>Document</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://github.com/blowdart/AspNetSameSiteSamples/tree/master/AspNetCore31RazorPages" data-linktype="external">.NET Core Razor Pages</a></td>
<td><a href="samesite/rp31?view=aspnetcore-8.0" data-linktype="relative-path">ASP.NET Core 3.1 Razor Pages ```SameSite``` cookie sample</a></td>
</tr>
</tbody></table>

## .NET Core support for the sameSite attribute

```csharp
var cookieOptions = new CookieOptions
    {
        // Set the secure flag, which Chrome's changes will require for SameSite none.
        // Note this will also require you to be running on HTTPS.
        Secure = true,

        // Set the cookie to HTTP only which is good practice unless you really do need
        // to access it client side in scripts.
        HttpOnly = true,

        // Add the SameSite attribute, this will emit the attribute with a value of none.
        SameSite = SameSiteMode.None

        // The client should follow its default cookie policy.
        // SameSite = SameSiteMode.Unspecified
    };

    // Add the cookie to the response cookie collection
    Response.Cookies.Append("MyCookie", "cookieValue", cookieOptions);
}
```

## API usage with ```SameSite```

```csharp
HttpContext.Response.Cookies.Append(
                     "name", "value",
                     new CookieOptions() { SameSite = SameSiteMode.Lax });
```

<table><thead>
<tr>
<th>Component</th>
<th>cookie</th>
<th>Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.cookiebuilder" class="no-loc" data-linktype="absolute-path">CookieBuilder</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.cookiebuilder.samesite#microsoft-aspnetcore-http-cookiebuilder-samesite" class="no-loc" data-linktype="absolute-path">SameSite</a></td>
<td><code>Unspecified</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httpcontext.session#microsoft-aspnetcore-http-httpcontext-session" class="no-loc" data-linktype="absolute-path">Session</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.sessionoptions.cookie#microsoft-aspnetcore-builder-sessionoptions-cookie" data-linktype="absolute-path">SessionOptions.Cookie</a></td>
<td><code>Lax</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.viewfeatures.cookietempdataprovider" class="no-loc" data-linktype="absolute-path">CookieTempDataProvider</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.cookietempdataprovideroptions.cookie#microsoft-aspnetcore-mvc-cookietempdataprovideroptions-cookie" data-linktype="absolute-path">CookieTempDataProviderOptions.Cookie</a></td>
<td><code>Lax</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.iantiforgery" class="no-loc" data-linktype="absolute-path">IAntiforgery</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.antiforgeryoptions.cookie#microsoft-aspnetcore-antiforgery-antiforgeryoptions-cookie" data-linktype="absolute-path">AntiforgeryOptions.Cookie</a></td>
<td><code>Strict</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.dependencyinjection.cookieextensions.addcookie" data-linktype="absolute-path">Cookie Authentication</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.cookieauthenticationoptions.cookiename#microsoft-aspnetcore-builder-cookieauthenticationoptions-cookiename" data-linktype="absolute-path">CookieAuthenticationOptions.Cookie</a></td>
<td><code>Lax</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.dependencyinjection.twitterextensions.addtwitter" class="no-loc" data-linktype="absolute-path">AddTwitter</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.authentication.twitter.twitteroptions.statecookie#microsoft-aspnetcore-authentication-twitter-twitteroptions-statecookie" data-linktype="absolute-path">TwitterOptions.StateCookie</a></td>
<td><code>Lax</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.authentication.remoteauthenticationhandler-1" class="no-loc" data-linktype="absolute-path">RemoteAuthenticationHandler&lt;TOptions&gt;</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.authentication.remoteauthenticationoptions.correlationcookie#microsoft-aspnetcore-authentication-remoteauthenticationoptions-correlationcookie" data-linktype="absolute-path">RemoteAuthenticationOptions.CorrelationCookie</a></td>
<td><code>None</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.dependencyinjection.openidconnectextensions.addopenidconnect" class="no-loc" data-linktype="absolute-path">AddOpenIdConnect</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.authentication.openidconnect.openidconnectoptions.noncecookie#microsoft-aspnetcore-authentication-openidconnect-openidconnectoptions-noncecookie" data-linktype="absolute-path">OpenIdConnectOptions.NonceCookie</a></td>
<td><code>None</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.iresponsecookies.append" data-linktype="absolute-path">HttpContext.Response.Cookies.Append</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.cookieoptions" class="no-loc" data-linktype="absolute-path">CookieOptions</a></td>
<td><code>Unspecified</code></td>
</tr>
</tbody></table>

 - Redefines the behavior of ```SameSiteMode.None``` to emit ```SameSite=None```

 - Adds a new value ```SameSiteMode.Unspecified``` to omit the ```SameSite``` attribute.

 - All cookies APIs default to ```Unspecified```. Some components that use cookies set values more specific to their scenarios. See the table above for examples.

 - ```CookieOptions``` used with HttpContext.Response.Cookies.Append

 - CookieBuilder  used as a factory for ```CookieOptions```

 - CookiePolicyOptions.MinimumSameSitePolicy

## History and changes

 - Is not backwards compatible with the 2016 draft. For more information, see Supporting older browsers in this document.

 - Specifies cookies are treated as ```SameSite=Lax``` by default.

 - Specifies cookies that explicitly assert ```SameSite=None``` in order to enable cross-site delivery should be marked as ```Secure```. ```None``` is a new entry to opt out.

 - Is supported by patches issued for ASP.NET Core 2.1, 2.2, and 3.0. ASP.NET Core 3.1 and later has additional ```SameSite``` support.

 - Is scheduled to be enabled by Chrome by default in Feb 2020. Browsers started moving to this standard in 2019.

## APIs impacted by the change from the 2016 ```SameSite``` draft standard to the 2019 draft standard

 - Http.SameSiteMode

 - CookieOptions.SameSite

 - CookieBuilder.SameSite

 - CookiePolicyOptions.MinimumSameSitePolicy

 - Microsoft.Net.Http.Headers.SameSiteMode

 - Microsoft.Net.Http.Headers.SetCookieHeaderValue.SameSite

## Supporting older browsers

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.Unspecified;
    options.OnAppendCookie = cookieContext =>
        CheckSameSite(cookieContext.Context, cookieContext.CookieOptions);
    options.OnDeleteCookie = cookieContext =>
        CheckSameSite(cookieContext.Context, cookieContext.CookieOptions);
});

void CheckSameSite(HttpContext httpContext, CookieOptions options)
{
    if (options.SameSite == SameSiteMode.None)
    {
        var userAgent = httpContext.Request.Headers["User-Agent"].ToString();
        if (MyUserAgentDetectionLib.DisallowsSameSiteNone(userAgent))
        {
            options.SameSite = SameSiteMode.Unspecified;
        }
    }
}

    builder.Services.AddRazorPages();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCookiePolicy();
app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.Unspecified;
    options.OnAppendCookie = cookieContext =>
        CheckSameSite(cookieContext.Context, cookieContext.CookieOptions);
    options.OnDeleteCookie = cookieContext =>
        CheckSameSite(cookieContext.Context, cookieContext.CookieOptions);
});

void CheckSameSite(HttpContext httpContext, CookieOptions options)
{
    if (options.SameSite == SameSiteMode.None)
    {
        var userAgent = httpContext.Request.Headers["User-Agent"].ToString();
        if (MyUserAgentDetectionLib.DisallowsSameSiteNone(userAgent))
        {
            options.SameSite = SameSiteMode.Unspecified;
        }
    }
}

    builder.Services.AddRazorPages();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCookiePolicy();
app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

```csharp
if (MyUserAgentDetectionLib.DisallowsSameSiteNone(userAgent))
{
    options.SameSite = SameSiteMode.Unspecified;
}
```

> Warning
The following code is for demonstration only:

It should not be considered complete.
It is not maintained or supported.

  - It should not be considered complete.

  - It is not maintained or supported.

```csharp
public static bool DisallowsSameSiteNone(string userAgent)
{
    // Check if a null or empty string has been passed in, since this
    // will cause further interrogation of the useragent to fail.
     if (String.IsNullOrWhiteSpace(userAgent))
        return false;
    
    // Cover all iOS based browsers here. This includes:
    // - Safari on iOS 12 for iPhone, iPod Touch, iPad
    // - WkWebview on iOS 12 for iPhone, iPod Touch, iPad
    // - Chrome on iOS 12 for iPhone, iPod Touch, iPad
    // All of which are broken by SameSite=None, because they use the iOS networking
    // stack.
    if (userAgent.Contains("CPU iPhone OS 12") ||
        userAgent.Contains("iPad; CPU OS 12"))
    {
        return true;
    }

    // Cover Mac OS X based browsers that use the Mac OS networking stack. 
    // This includes:
    // - Safari on Mac OS X.
    // This does not include:
    // - Chrome on Mac OS X
    // Because they do not use the Mac OS networking stack.
    if (userAgent.Contains("Macintosh; Intel Mac OS X 10_14") &&
        userAgent.Contains("Version/") && userAgent.Contains("Safari"))
    {
        return true;
    }

    // Cover Chrome 50-69, because some versions are broken by SameSite=None, 
    // and none in this range require it.
    // Note: this covers some pre-Chromium Edge versions, 
    // but pre-Chromium Edge does not require SameSite=None.
    if (userAgent.Contains("Chrome/5") || userAgent.Contains("Chrome/6"))
    {
        return true;
    }

    return false;
}
```

## Test apps for ```SameSite``` problems

 - Test the interaction on multiple browsers.

 - Apply the CookiePolicy browser detection and mitigation discussed in this document.

### Test with Chrome

 - Chromium 76 Win64

 - Chromium 74 Win64

### Test with Safari

### Test with Firefox

### Test with Edge browser

### Test with Edge (Chromium)

### Test with Electron

## Additional resources

 - Chromium Blog:Developers: Get Ready for New ```SameSite=None```; ```Secure``` Cookie Settings

 - ```SameSite``` cookies explained

 - November 2019 Patches

<table><thead>
<tr>
<th>Sample</th>
<th>Document</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://github.com/blowdart/AspNetSameSiteSamples/tree/master/AspNetCore31RazorPages" data-linktype="external">.NET Core Razor Pages</a></td>
<td><a href="samesite/rp31?view=aspnetcore-8.0" data-linktype="relative-path">ASP.NET Core 3.1 Razor Pages ```SameSite``` cookie sample</a></td>
</tr>
</tbody></table>

Ref: [Work with ```SameSite``` cookies in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/samesite?view=aspnetcore-8.0)