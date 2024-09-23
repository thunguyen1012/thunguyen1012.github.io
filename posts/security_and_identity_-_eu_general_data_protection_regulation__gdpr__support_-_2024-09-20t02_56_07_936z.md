---
title: Security and Identity - EU General Data Protection Regulation (GDPR) support
published: true
date: 2024-09-20 02:56:07
tags: Summary, AspNetCore
description:
image:
---
  - 14 contributors

## In this article

ASP.NET Core provides APIs and templates to help meet some of the EU General Data Protection Regulation (GDPR) requirements:

 - The project templates include extension points and stubbed markup that you can replace with your privacy and cookie use policy.

 - The ```Pages/Privacy.cshtml``` page or ```Views/Home/Privacy.cshtml``` view provides a page to detail your site's privacy policy.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    // This lambda determines whether user consent for non-essential 
    // cookies is needed for a given request.
    options.CheckConsentNeeded = context => true;

    options.MinimumSameSitePolicy = SameSiteMode.None;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCookiePolicy();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

 - Add the cookie consent partial to the ```_Layout.cshtml``` file:

```cshtml
@*Previous markup removed for brevity*@
    </header>
    <div class="container">
        <partial name="_CookieConsentPartial" />
        <main role="main" class="pb-3">
            @RenderBody()
        </main>
    </div>

    <footer class="border-top footer text-muted">
        <div class="container">
            &copy; 2022 - WebGDPR - <a asp-area="" asp-page="/Privacy">Privacy</a>
        </div>
    </footer>

    <script src="~/lib/jquery/dist/jquery.min.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <script src="~/js/site.js" asp-append-version="true"></script>

    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

 - Add the ```_CookieConsentPartial.cshtml``` file to the project:

```cshtml
@using Microsoft.AspNetCore.Http.Features

@{
    var consentFeature = Context.Features.Get<ITrackingConsentFeature>();
    var showBanner = !consentFeature?.CanTrack ?? false;
    var cookieString = consentFeature?.CreateConsentCookie();
}

@if (showBanner)
{
    <div id="cookieConsent" class="alert alert-info alert-dismissible fade show" role="alert">
        Use this space to summarize your privacy and cookie use policy. <a asp-page="/Privacy">Learn More</a>.
        <button type="button" class="accept-policy close" data-bs-dismiss="alert" aria-label="Close" data-cookie-string="@cookieString">
            <span aria-hidden="true">Accept</span>
        </button>
    </div>
    <script>
        (function () {
            var button = document.querySelector("#cookieConsent button[data-cookie-string]");
            button.addEventListener("click", function (event) {
                document.cookie = button.dataset.cookieString;
            }, false);
        })();
    </script>
}
```

 - Select the ASP.NET Core 2.2 version of this article to read about the cookie consent feature.

## Customize the cookie consent value

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.CheckConsentNeeded = context => true;
    options.MinimumSameSitePolicy = SameSiteMode.None;
    options.ConsentCookieValue = "true";
});

var app = builder.Build();
```

## Encryption at rest

 - Encrypts stored data automatically.

 - Encrypts without configuration, programming, or other work for the software that accesses the data.

 - Is the easiest and safest option.

 - Allows the database to manage keys and encryption.

 - Microsoft SQL and Azure SQL provide Transparent Data Encryption (TDE).

 - SQL Azure encrypts the database by default

 - Azure Blobs, Files, Table, and Queue Storage are encrypted by default.

 - BitLocker for Windows Server

 - Linux:

   - eCryptfs

   - EncFS.

## Additional resources

 - Microsoft.com/GDPR

Ref: [EU General Data Protection Regulation (GDPR) support in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/gdpr?view=aspnetcore-8.0)