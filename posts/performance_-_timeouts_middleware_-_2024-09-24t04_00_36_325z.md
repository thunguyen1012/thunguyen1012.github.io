---
title: Performance - Timeouts middleware
published: true
date: 2024-09-24 04:00:36
tags: Summary, AspNetCore
description:
image:
---

## In this article

## Add the middleware to the app

> Note

In apps that explicitly call ```UseRouting```, ```UseRequestTimeouts``` must be called after ```UseRouting```.

## Configure one endpoint or page

```csharp
using Microsoft.AspNetCore.Http.Timeouts;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRequestTimeouts();

var app = builder.Build();
app.UseRequestTimeouts();

app.MapGet("/", async (HttpContext context) => {
    try
    {
        await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
    }
    catch (TaskCanceledException)
    {
        return Results.Content("Timeout!", "text/plain");
    }

    return Results.Content("No timeout!", "text/plain");
}).WithRequestTimeout(TimeSpan.FromSeconds(2));
// Returns "Timeout!"

app.MapGet("/attribute",
    [RequestTimeout(milliseconds: 2000)] async (HttpContext context) => {
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
        }
        catch (TaskCanceledException)
        {
            return Results.Content("Timeout!", "text/plain");
        }

        return Results.Content("No timeout!", "text/plain");
    });
// Returns "Timeout!"

app.Run();
```

## Configure multiple endpoints or pages

```csharp
builder.Services.AddRequestTimeouts(options => {
    options.DefaultPolicy =
        new RequestTimeoutPolicy { Timeout = TimeSpan.FromMilliseconds(1500) };
    options.AddPolicy("MyPolicy", TimeSpan.FromSeconds(2));
});
```

```csharp
app.MapGet("/namedpolicy", async (HttpContext context) => {
    try
    {
        await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
    }
    catch (TaskCanceledException)
    {
        return Results.Content("Timeout!", "text/plain");
    }

    return Results.Content("No timeout!", "text/plain");
}).WithRequestTimeout("MyPolicy");
// Returns "Timeout!"
```

### Set global default timeout policy

```csharp
builder.Services.AddRequestTimeouts(options => {
    options.DefaultPolicy =
        new RequestTimeoutPolicy { Timeout = TimeSpan.FromMilliseconds(1500) };
    options.AddPolicy("MyPolicy", TimeSpan.FromSeconds(2));
});
```

```csharp
app.MapGet("/", async (HttpContext context) => {
    try
    {
        await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
    }
    catch
    {
        return Results.Content("Timeout!", "text/plain");
    }

    return Results.Content("No timeout!", "text/plain");
});
// Returns "Timeout!" due to default policy.
```

## Specify the status code in a policy

```csharp
builder.Services.AddRequestTimeouts(options => {
    options.DefaultPolicy = new RequestTimeoutPolicy {
        Timeout = TimeSpan.FromMilliseconds(1000),
        TimeoutStatusCode = 503
    };
    options.AddPolicy("MyPolicy2", new RequestTimeoutPolicy {
        Timeout = TimeSpan.FromMilliseconds(1000),
        WriteTimeoutResponse = async (HttpContext context) => {
            context.Response.ContentType = "text/plain";
            await context.Response.WriteAsync("Timeout from MyPolicy2!");
        }
    });
});
```

```csharp
app.MapGet("/", async (HttpContext context) => {
    try
    {
        await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
    }
    catch (TaskCanceledException)
    {
        throw;
    }

    return Results.Content("No timeout!", "text/plain");
});
// Returns status code 503 due to default policy.
```

## Use a delegate in a policy

```csharp
builder.Services.AddRequestTimeouts(options => {
    options.DefaultPolicy = new RequestTimeoutPolicy {
        Timeout = TimeSpan.FromMilliseconds(1000),
        TimeoutStatusCode = 503
    };
    options.AddPolicy("MyPolicy2", new RequestTimeoutPolicy {
        Timeout = TimeSpan.FromMilliseconds(1000),
        WriteTimeoutResponse = async (HttpContext context) => {
            context.Response.ContentType = "text/plain";
            await context.Response.WriteAsync("Timeout from MyPolicy2!");
        }
    });
});
```

```csharp
app.MapGet("/usepolicy2", async (HttpContext context) => {
    try
    {
        await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
    }
    catch (TaskCanceledException)
    {
        throw;
    }

    return Results.Content("No timeout!", "text/plain");
}).WithRequestTimeout("MyPolicy2");
// Returns "Timeout from MyPolicy2!" due to WriteTimeoutResponse in MyPolicy2.
```

## Disable timeouts

```csharp
app.MapGet("/disablebyattr", [DisableRequestTimeout] async (HttpContext context) => {
    try
    {
        await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
    }
    catch
    {
        return Results.Content("Timeout!", "text/plain");
    }

    return Results.Content("No timeout!", "text/plain");
});
// Returns "No timeout!", ignores default timeout.
```

```csharp
app.MapGet("/disablebyext", async (HttpContext context) => {
    try
    {
        await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
    }
    catch
    {
        return Results.Content("Timeout!", "text/plain");
    }

    return Results.Content("No timeout!", "text/plain");
}).DisableRequestTimeout();
// Returns "No timeout!", ignores default timeout.
```

## Cancel a timeout

```csharp
app.MapGet("/canceltimeout", async (HttpContext context) => {
    var timeoutFeature = context.Features.Get<IHttpRequestTimeoutFeature>();
    timeoutFeature?.DisableTimeout();

    try
    {
        await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
    } 
    catch (TaskCanceledException)
    {
        return Results.Content("Timeout!", "text/plain");
    }

    return Results.Content("No timeout!", "text/plain");
}).WithRequestTimeout(TimeSpan.FromSeconds(1));
// Returns "No timeout!" since the default timeout is not triggered.
```

## See also

 - Microsoft.AspNetCore.Http.Timeouts

 - ASP.NET Core Middleware

Ref: [Request timeouts middleware in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/timeouts?view=aspnetcore-8.0)