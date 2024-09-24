---
title: Globalization and localization - Make an app's content localizable
published: true
date: 2024-09-24 04:35:38
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## ```IStringLocalizer```

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace Localization.Controllers;

[Route("api/[controller]")]
public class AboutController : Controller
{
    private readonly IStringLocalizer<AboutController> _localizer;

    public AboutController(IStringLocalizer<AboutController> localizer)
    {
        _localizer = localizer;
    }

    [HttpGet]
    public string Get()
    {
        return _localizer["About Title"];
    }
}
```

## ```IHtmlLocalizer```

```csharp
using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Localization;

namespace Localization.Controllers;

public class BookController : Controller
{
    private readonly IHtmlLocalizer<BookController> _localizer;

    public BookController(IHtmlLocalizer<BookController> localizer)
    {
        _localizer = localizer;
    }

    public IActionResult Hello(string name)
    {
        ViewData["Message"] = _localizer["<b>Hello</b><i> {0}</i>", name];

        return View();
    }
```

## ```IStringLocalizerFactory```

```csharp
public class TestController : Controller
{
    private readonly IStringLocalizer _localizer;
    private readonly IStringLocalizer _localizer2;

    public TestController(IStringLocalizerFactory factory)
    {
        var type = typeof(SharedResource);
        var assemblyName = new AssemblyName(type.GetTypeInfo().Assembly.FullName);
        _localizer = factory.Create(type);
        _localizer2 = factory.Create("SharedResource", assemblyName.Name);
    }       

    public IActionResult About()
    {
        ViewData["Message"] = _localizer["Your application description page."] 
            + " loc 2: " + _localizer2["Your application description page."];

        return View();
    }
```

## Shared resources

```csharp
// Dummy class to group shared resources

namespace Localization;

public class SharedResource
{
}
```

```csharp
public class InfoController : Controller
{
    private readonly IStringLocalizer<InfoController> _localizer;
    private readonly IStringLocalizer<SharedResource> _sharedLocalizer;

    public InfoController(IStringLocalizer<InfoController> localizer,
                   IStringLocalizer<SharedResource> sharedLocalizer)
    {
        _localizer = localizer;
        _sharedLocalizer = sharedLocalizer;
    }

    public string TestLoc()
    {
        string msg = "Shared resx: " + _sharedLocalizer["Hello!"] +
                     " Info resx " + _localizer["Hello!"];
        return msg;
    }
```

## View localization

```cshtml
@using Microsoft.AspNetCore.Mvc.Localization

@inject IViewLocalizer Localizer

@{
    ViewData["Title"] = Localizer["About"];
}
<h2>@ViewData["Title"].</h2>
<h3>@ViewData["Message"]</h3>

<p>@Localizer["Use this area to provide additional information."]</p>
```

```cshtml
@Localizer["<i>Hello</i> <b>{0}!</b>", UserManager.GetUserName(User)]
```

<table><thead>
<tr>
<th>Key</th>
<th>Value</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>&lt;i&gt;Hello&lt;/i&gt; &lt;b&gt;{0}!&lt;/b&gt;</code></td>
<td><code>&lt;i&gt;Bonjour&lt;/i&gt; &lt;b&gt;{0} !&lt;/b&gt;</code></td>
</tr>
</tbody></table>

```cshtml
@using Microsoft.AspNetCore.Mvc.Localization
@using Localization.Services

@inject IViewLocalizer Localizer
@inject IHtmlLocalizer<SharedResource> SharedLocalizer

@{
    ViewData["Title"] = Localizer["About"];
}
<h2>@ViewData["Title"].</h2>

<h1>@SharedLocalizer["Hello!"]</h1>
```

## ```DataAnnotations``` localization

 - Resources/ViewModels.Account.RegisterViewModel.fr.resx

 - Resources/ViewModels/Account/RegisterViewModel.fr.resx

```csharp
using System.ComponentModel.DataAnnotations;

namespace Localization.ViewModels.Account;

public class RegisterViewModel
{
    [Required(ErrorMessage = "The Email field is required.")]
    [EmailAddress(ErrorMessage = "The Email field is not a valid email address.")]
    [Display(Name = "Email")]
    public string Email { get; set; }

    [Required(ErrorMessage = "The Password field is required.")]
    [StringLength(8, ErrorMessage = "The {0} must be at least {2} characters long.",
                                                                 MinimumLength = 6)]
    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    public string Password { get; set; }

    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    [Compare("Password", ErrorMessage =
                            "The password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; }
}
```

### How to use one resource string for multiple classes

```csharp
services.AddMvc()
        .AddDataAnnotationsLocalization(options => {
            options.DataAnnotationLocalizerProvider = (type, factory) =>
                factory.Create(typeof(SharedResource));
        });
```

## Configure localization services

```csharp
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

builder.Services.AddMvc()
    .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
    .AddDataAnnotationsLocalization();
```

 - AddLocalization adds the localization services to the services container, including implementations for ```IStringLocalizer```<T> and ```IStringLocalizerFactory```. The preceding code also sets the resources path to "Resources".

 - AddViewLocalization adds support for localized view files. In this sample, view localization is based on the view file suffix. For example "fr" in the ```Index.fr.cshtml``` file.

 - AddDataAnnotationsLocalization adds support for localized ```DataAnnotations``` validation messages through ```IStringLocalizer``` abstractions.

> Note
You may not be able to enter decimal commas in decimal fields. To support jQuery validation for non-English locales that use a comma (",") for a decimal point, and non US-English date formats, you must take steps to globalize your app. See this GitHub comment 4076 for instructions on adding decimal comma.

## Next steps

 - Provide localized resources for the languages and cultures the app supports

 - Implement a strategy to select the language/culture for each request

## Additional resources

 - Url culture provider using middleware as filters in ASP.NET Core

 - Applying the RouteDataRequest CultureProvider globally with middleware as filters

 - Globalization and localization in ASP.NET Core

 - Provide localized resources for languages and cultures in an ASP.NET Core app

 - Strategies for selecting language and culture in a localized ASP.NET Core app

 - Troubleshoot ASP.NET Core localization

 - Globalizing and localizing .NET applications

 - Localization.StarterWeb project used in the article.

 - Resources in .resx Files

 - Microsoft Multilingual App Toolkit

 - Localization & Generics

Ref: [Make an ASP.NET Core app's content localizable](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization/make-content-localizable?view=aspnetcore-8.0)