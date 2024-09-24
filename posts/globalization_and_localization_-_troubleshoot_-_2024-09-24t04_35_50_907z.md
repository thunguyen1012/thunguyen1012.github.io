---
title: Globalization and localization - Troubleshoot
published: true
date: 2024-09-24 04:35:50
tags: Summary, AspNetCore
description:
image:
---

## In this article

This article provides instructions on how to diagnose ASP.NET Core app localization issues.

## Localization configuration issues

Localization middleware order
The app may not localize because the localization middleware isn't ordered as expected.

To resolve this issue, ensure that localization middleware is registered before MVC middleware. Otherwise, the localization middleware isn't applied.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddLocalization(options => options.ResourcesPath = "Resources");

    services.AddMvc();
}
```

Localization resources path not found

Supported Cultures in RequestCultureProvider don't match with registered once

## Resource file naming issues

ASP.NET Core has predefined rules and guidelines for localization resources file naming, which are described in Globalization and localization in ASP.NET Core.

## Missing resources

Common causes of resources not being found include:

- Resource names are misspelled in either the .NET XML resource file (.resx) or the localizer request.

- The resource is missing from the resource file for some languages, but exists in others.

- If you're still having trouble, check the localization log messages (logged at the ```Debug``` log level) for more details about the missing resources.

> Tip
When using CookieRequestCultureProvider, verify single quotes aren't used with the cultures inside the localization cookie value. For example, c='en-UK'|uic='en-US' is an invalid cookie value, while ```c=en-UK|uic=en-US``` is valid.

## Resources and class libraries issues

ASP.NET Core by default provides a way to allow the class libraries to find their resource files via ResourceLocationAttribute.

Common issues with class libraries include:

- Missing the ResourceLocationAttribute in a class library prevents ResourceManagerStringLocalizerFactory from discovering the resources.

- Resource file naming. For more information, see the Resource file naming issues section.

- Changing the root namespace of the class library. For more information, see the Root namespace issues section.

## ```CustomRequestCultureProvider``` doesn't work as expected

The RequestLocalizationOptions class has three default providers:

- QueryStringRequestCultureProvider

- CookieRequestCultureProvider

- AcceptLanguageHeaderRequestCultureProvider

The ```CustomRequestCultureProvider``` allows you to customize how the localization culture is provided. The ```CustomRequestCultureProvider``` is used when the default providers don't meet your requirements.

A common reason for a custom provider not working properly is that it isn't the first provider in the RequestCultureProviders list. To resolve this issue:

 - Insert the custom provider at position zero in the RequestCultureProviders list:


```csharp
options.AddInitialRequestCultureProvider(
    new CustomRequestCultureProvider(async context =>
    {
        // My custom request culture logic
        return new ProviderCultureResult("en");
    }));
```

- Use the AddInitialRequestCultureProvider extension method to set the custom provider as the initial provider.

## Root namespace issues

When the root namespace of an assembly is different than the assembly name, localization doesn't work by default. To avoid this issue use the ```RootNamespace``` attribute, which is described in Globalization and localization in ASP.NET Core.

> Warning
A root namespace issue can occur when a project's name isn't a valid .NET identifier. For instance, ```my-project-name.csproj``` uses the root namespace ```my_project_name``` and the assembly name ```my-project-name```, which results in this error.

## Resources and build action

If you use resource files for localization, it's important that they have an appropriate build action. Use Embedded Resource; otherwise, the ```ResourceStringLocalizer``` isn't able to find these resources.

## Location override using "Sensors" pane in developer tools

When using the location override using the Sensors pane in Google Chrome or Microsoft Edge developer tools, the fallback language is reset after prerendering.

For more information, see Blazor Localization does not work with InteractiveServer (dotnet/aspnetcore #53707).

## GitHub issues with helpful problem solving tips

- Please add more info about shared files (dotnet/AspNetCore.Docs #28674

- Blazor Localization does not work with InteractiveServer (dotnet/aspnetcore #53707) (Location override using "Sensors" pane)

Ref: [Troubleshoot ASP.NET Core localization](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/troubleshoot-aspnet-core-localization?view=aspnetcore-8.0)