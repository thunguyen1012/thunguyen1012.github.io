---
title: Globalization and localization - Select language/culture
published: true
date: 2024-09-24 04:35:38
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Configure Localization middleware

```csharp
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[] { "en-US", "fr" };
    options.SetDefaultCulture(supportedCultures[0])
        .AddSupportedCultures(supportedCultures)
        .AddSupportedUICultures(supportedCultures);
});
```

 - ```QueryStringRequestCultureProvider```

 - ```CookieRequestCultureProvider```

 - AcceptLanguageHeaderRequestCultureProvider

## ```QueryStringRequestCultureProvider```

## ```CookieRequestCultureProvider```

## The Accept-Language HTTP header

## Set the Accept-Language HTTP header in Edge

 - Search Settings for Preferred languages.

 - The preferred languages are listed in the Preferred languages box.

 - Select Add languages to add to the list.

 - Select More actions … next to a language to change the order of preference.

## The ```Content-Language``` HTTP header

 - Is used to describe the language(s) intended for the audience.

 - Allows a user to differentiate according to the users' own preferred language.

 - Allows the ```RequestLocalizationMiddleware``` to set the ```Content-Language``` header with the ```CurrentUICulture```.

 - Eliminates the need to set the response header ```Content-Language``` explicitly.

```csharp
app.UseRequestLocalization(new RequestLocalizationOptions
{
    ApplyCurrentCultureToResponseHeaders = true
});
```

## Apply the RouteDataRequest CultureProvider

 - Using the middleware as filters feature of ASP.NET Core.

 - How to use ```RouteDataRequestCultureProvider``` to set the ```culture``` of an app from the url.

## Use a custom provider

```csharp
private const string enUSCulture = "en-US";

services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]
    {
        new CultureInfo(enUSCulture),
        new CultureInfo("fr")
    };

    options.DefaultRequestCulture = new RequestCulture(culture: enUSCulture, uiCulture: enUSCulture);
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;

    options.AddInitialRequestCultureProvider(new CustomRequestCultureProvider(async context =>
    {
        // My custom request culture logic
        return await Task.FromResult(new ProviderCultureResult("en"));
    }));
});
```

## Change request ```culture``` providers order

```csharp
app.UseRequestLocalization(options =>
    {
        var questStringCultureProvider = options.RequestCultureProviders[0];    
        options.RequestCultureProviders.RemoveAt(0);
        options.RequestCultureProviders.Insert(1, questStringCultureProvider);
    });
```

## User override ```culture```

```csharp
app.UseRequestLocalization(options =>
    {
        options.CultureInfoUseUserOverride = false;
    });
```

## Set the ```culture``` programmatically

```cshtml
@using Microsoft.AspNetCore.Builder
@using Microsoft.AspNetCore.Http.Features
@using Microsoft.AspNetCore.Localization
@using Microsoft.AspNetCore.Mvc.Localization
@using Microsoft.Extensions.Options

@inject IViewLocalizer Localizer
@inject IOptions<RequestLocalizationOptions> LocOptions

@{
    var requestCulture = Context.Features.Get<IRequestCultureFeature>();
    var cultureItems = LocOptions.Value.SupportedUICultures
        .Select(c => new SelectListItem { Value = c.Name, Text = c.DisplayName })
        .ToList();
    var returnUrl = string.IsNullOrEmpty(Context.Request.Path) ? "~/" : $"~{Context.Request.Path.Value}";
}

<div title="@Localizer["Request culture provider:"] @requestCulture?.Provider?.GetType().Name">
    <form id="selectLanguage" asp-controller="Home" 
          asp-action="SetLanguage" asp-route-returnUrl="@returnUrl" 
          method="post" class="form-horizontal" role="form">
        <label asp-for="@requestCulture.RequestCulture.UICulture.Name">@Localizer["Language:"]</label> <select name="culture"
          onchange="this.form.submit();"
          asp-for="@requestCulture.RequestCulture.UICulture.Name" asp-items="cultureItems">
        </select>
    </form>
</div>
```

```cshtml
<div class="container body-content" style="margin-top:60px">
    @RenderBody()
    <hr>
    <footer>
        <div class="row">
            <div class="col-md-6">
                <p>&copy; @System.DateTime.Now.Year - Localization</p>
            </div>
            <div class="col-md-6 text-right">
                @await Html.PartialAsync("_SelectLanguagePartial")
            </div>
        </div>
    </footer>
</div>
```

```csharp
[HttpPost]
public IActionResult SetLanguage(string culture, string returnUrl)
{
    Response.Cookies.Append(
        CookieRequestCultureProvider.DefaultCookieName,
        CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
        new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
    );

    return LocalRedirect(returnUrl);
}
```

## Model binding route data and query strings

## Next steps

 - Make the app's content localizable.

 - Provide localized resources for the languages and cultures the app supports

## Additional resources

 - Url ```culture``` provider using middleware as filters in ASP.NET Core

 - Applying the RouteDataRequest CultureProvider globally with middleware as filters

 - Globalization and localization in ASP.NET Core

 - Make an ASP.NET Core app's content localizable

 - Provide localized resources for languages and cultures in an ASP.NET Core app

 - Troubleshoot ASP.NET Core localization

 - Globalizing and localizing .NET applications

 - Localization.StarterWeb project used in the article.

 - Resources in .resx Files

 - Microsoft Multilingual App Toolkit

 - Localization & Generics

Ref: [Implement a strategy to select the language/culture for each request in a localized ASP.NET Core app](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization/select-language-culture?view=aspnetcore-8.0)