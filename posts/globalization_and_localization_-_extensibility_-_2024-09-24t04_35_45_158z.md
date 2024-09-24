---
title: Globalization and localization - Extensibility
published: true
date: 2024-09-24 04:35:45
tags: Summary, AspNetCore
description:
image:
---

## In this article

This article:

- Lists the extensibility points on the localization APIs.

- Provides instructions on how to extend ASP.NET Core app localization.

## Extensible Points in Localization APIs

ASP.NET Core localization APIs are built to be extensible. Extensibility allows developers to customize the localization according to their needs. For instance, OrchardCore has a ```POStringLocalizer```. ```POStringLocalizer``` describes in detail using Portable Object localization to use ```PO``` files to store localization resources.

This article lists the two main extensibility points that localization APIs provide:

- RequestCultureProvider

- ```IStringLocalizer```

## Localization Culture Providers

ASP.NET Core localization APIs have four default providers that can determine the current culture of an executing request:

- QueryStringRequestCultureProvider

- CookieRequestCultureProvider

- AcceptLanguageHeaderRequestCultureProvider

- CustomRequestCultureProvider

The following providers are supported by JBoss Middleware.

### Use CustomRequestCultureProvider

CustomRequestCultureProvider provides a custom RequestCultureProvider that uses a simple delegate to determine the current localization culture:

```csharp
options.AddInitialRequestCultureProvider(new CustomRequestCultureProvider(async context =>
{
    var currentCulture = "en";
    var segments = context.Request.Path.Value.Split(new char[] { '/' }, 
        StringSplitOptions.RemoveEmptyEntries);

    if (segments.Length > 1 && segments[0].Length == 2)
    {
        currentCulture = segments[0];
    }

    var requestCulture = new ProviderCultureResult(currentCulture);

    return Task.FromResult(requestCulture);
}));
```

### Use a new implementation of RequestCultureProvider

A new implementation of RequestCultureProvider can be created that determines the request culture information from a custom source.

The following example shows ```AppSettingsRequestCultureProvider```, which extends the RequestCultureProvider to determine the request culture information from ```appsettings.json```:

```csharp
public class AppSettingsRequestCultureProvider : RequestCultureProvider
{
    public string CultureKey { get; set; } = "culture";

    public string UICultureKey { get; set; } = "ui-culture";

    public override Task<ProviderCultureResult> DetermineProviderCultureResult(HttpContext httpContext)
    {
        if (httpContext == null)
        {
            throw new ArgumentNullException();
        }

        var configuration = httpContext.RequestServices.GetService<IConfigurationRoot>();
        var culture = configuration[CultureKey];
        var uiCulture = configuration[UICultureKey];

        if (culture == null && uiCulture == null)
        {
            return Task.FromResult((ProviderCultureResult)null);
        }

        if (culture != null && uiCulture == null)
        {
            uiCulture = culture;
        }

        if (culture == null && uiCulture != null)
        {
            culture = uiCulture;
        }
        
        var providerResultCulture = new ProviderCultureResult(culture, uiCulture);

        return Task.FromResult(providerResultCulture);
    }
}
```

## Localization resources

ASP.NET Core localization provides ResourceManagerStringLocalizer. ResourceManagerStringLocalizer is an implementation of ```IStringLocalizer``` that uses ```resx``` to store localization resources.

You aren't limited to using ```resx``` files. By implementing ```IStringLocalizer```, any data source can be used.

The following example projects implement ```IStringLocalizer```:

- EFStringLocalizer

- JsonStringLocalizer

- SqlLocalizer

Ref: [Localization Extensibility](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization-extensibility?view=aspnetcore-8.0)