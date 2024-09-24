---
title: Advanced - Write middleware
published: true
date: 2024-09-24 04:35:53
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Middleware class

```csharp
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    var cultureQuery = context.Request.Query["culture"];
    if (!string.IsNullOrWhiteSpace(cultureQuery))
    {
        var culture = new CultureInfo(cultureQuery);

        CultureInfo.CurrentCulture = culture;
        CultureInfo.CurrentUICulture = culture;
    }

    // Call the next delegate/middleware in the pipeline.
    await next(context);
});

app.Run(async (context) =>
{
    await context.Response.WriteAsync(
        $"CurrentCulture.DisplayName: {CultureInfo.CurrentCulture.DisplayName}");
});

app.Run();
```

 - One takes a ```HttpContext``` and a Func<Task>. ```Invoke``` the Func<Task> without any parameters.

 - The other takes a ```HttpContext``` and a ```RequestDelegate```. ```Invoke``` the ```RequestDelegate``` by passing the ```HttpContext```.

```csharp
using System.Globalization;

namespace Middleware.Example;

public class RequestCultureMiddleware
{
    private readonly RequestDelegate _next;

    public RequestCultureMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var cultureQuery = context.Request.Query["culture"];
        if (!string.IsNullOrWhiteSpace(cultureQuery))
        {
            var culture = new CultureInfo(cultureQuery);

            CultureInfo.CurrentCulture = culture;
            CultureInfo.CurrentUICulture = culture;
        }

        // Call the next delegate/middleware in the pipeline.
        await _next(context);
    }
}
```

 - A public constructor with a parameter of type ```RequestDelegate```.

 - A public method named ```Invoke``` or ```InvokeAsync```. This method must:

   - Return a ```Task```.

   - Accept a first parameter of type ```HttpContext```.

```csharp
using System.Globalization;

namespace Middleware.Example;

public class RequestCultureMiddleware
{
    private readonly RequestDelegate _next;

    public RequestCultureMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var cultureQuery = context.Request.Query["culture"];
        if (!string.IsNullOrWhiteSpace(cultureQuery))
        {
            var culture = new CultureInfo(cultureQuery);

            CultureInfo.CurrentCulture = culture;
            CultureInfo.CurrentUICulture = culture;
        }

        // Call the next delegate/middleware in the pipeline.
        await _next(context);
    }
}

public static class RequestCultureMiddlewareExtensions
{
    public static IApplicationBuilder UseRequestCulture(
        this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RequestCultureMiddleware>();
    }
}
```

```csharp
using Middleware.Example;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseHttpsRedirection();

app.UseRequestCulture();

app.Run(async (context) =>
{
    await context.Response.WriteAsync(
        $"CurrentCulture.DisplayName: {CultureInfo.CurrentCulture.DisplayName}");
});

app.Run();
```

## Middleware dependencies

## Per-request middleware dependencies

```csharp
namespace Middleware.Example;

public class MyCustomMiddleware
{
    private readonly RequestDelegate _next;

    public MyCustomMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    // IMessageWriter is injected into InvokeAsync
    public async Task InvokeAsync(HttpContext httpContext, IMessageWriter svc)
    {
        svc.Write(DateTime.Now.Ticks.ToString());
        await _next(httpContext);
    }
}

public static class MyCustomMiddlewareExtensions
{
    public static IApplicationBuilder UseMyCustomMiddleware(
        this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<MyCustomMiddleware>();
    }
}
```

```csharp
using Middleware.Example;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IMessageWriter, LoggingMessageWriter>();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseMyCustomMiddleware();

app.MapGet("/", () => "Hello World!");

app.Run();
```

```csharp
namespace Middleware.Example;

public interface IMessageWriter
{
    void Write(string message);
}

public class LoggingMessageWriter : IMessageWriter
{

    private readonly ILogger<LoggingMessageWriter> _logger;

    public LoggingMessageWriter(ILogger<LoggingMessageWriter> logger) =>
        _logger = logger;

    public void Write(string message) =>
        _logger.LogInformation(message);
}
```

## Additional resources

 - Sample code used in this article

 - UseExtensions source on GitHub

 - Lifetime and registration options contains a complete sample of middleware with scoped, transient, and singleton lifetime services.

 - DEEP DIVE: HOW IS THE ASP.NET CORE MIDDLEWARE PIPELINE BUILT

 - ASP.NET Core Middleware

 - Test ASP.NET Core middleware

 - Migrate HTTP handlers and modules to ASP.NET Core middleware

 - App startup in ASP.NET Core

 - Request Features in ASP.NET Core

 - Factory-based middleware activation in ASP.NET Core

 - Middleware activation with a third-party container in ASP.NET Core

Ref: [Write custom ASP.NET Core middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-8.0)