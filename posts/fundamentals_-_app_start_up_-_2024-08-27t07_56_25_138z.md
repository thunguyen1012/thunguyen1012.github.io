---
title: Fundamentals - App start up
published: true
date: 2024-08-27 07:56:25
tags: Summary, AspNetCore
description: 
image:
---

 - Razor Pages

 - MVC controllers with views

 - Web API with controllers

 - Minimal APIs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthorization();

app.MapGet("/hi", () => "Hello!");

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

## Extend Startup with startup filters

 - To configure middleware at the beginning or end of an app's middleware pipeline without an explicit call to `Use{Middleware}`. Use ```IStartupFilter``` to add defaults to the beginning of the pipeline without explicitly registering the default middleware. ```IStartupFilter``` allows a different component to call `Use{Middleware}` on behalf of the app author.

 - To create a pipeline of ```Configure``` methods. ```IStartupFilter```.Configure can set a middleware to run before or after middleware added by libraries.

```csharp
public class RequestSetOptionsMiddleware
{
    private readonly RequestDelegate _next;

    public RequestSetOptionsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    // Test with https://localhost:5001/Privacy/?option=Hello
    public async Task Invoke(HttpContext httpContext)
    {
        var option = httpContext.Request.Query["option"];

        if (!string.IsNullOrWhiteSpace(option))
        {
            httpContext.Items["option"] = WebUtility.HtmlEncode(option);
        }

        await _next(httpContext);
    }
}
```

```csharp
namespace WebStartup.Middleware;
// <snippet1>
public class RequestSetOptionsStartupFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return builder =>
        {
            builder.UseMiddleware<RequestSetOptionsMiddleware>();
            next(builder);
        };
    }
}
// </snippet1>
```

```csharp
using WebStartup.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddTransient<IStartupFilter,
                      RequestSetOptionsStartupFilter>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
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

```cshtml
@page
@model PrivacyModel
@{
    ViewData["Title"] = "Privacy Policy";
}
<h1>@ViewData["Title"]</h1>

<p> Append query string ?option=hello</p>
Option String: @HttpContext.Items["option"];
```

 - Multiple ```IStartupFilter``` implementations may interact with the same objects. If ordering is important, order their ```IStartupFilter``` service registrations to match the order that their middlewares should run.

 - Libraries may add middleware with one or more ```IStartupFilter``` implementations that run before or after other app middleware registered with ```IStartupFilter```. To invoke an ```IStartupFilter``` middleware before a middleware added by a library's ```IStartupFilter```:

   - Position the service registration before the library is added to the service container.

   - To invoke afterward, position the service registration after the library is added.

## Add configuration at startup from an external assembly

## Startup, ConfigureServices, and ```Configure```

 - Use Startup with the minimal hosting model

 - The ASP.NET Core 5.0 version of this article:

   - The ConfigureServices method

   - The ```Configure``` method

Ref: [App startup in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/startup?view=aspnetcore-8.0)