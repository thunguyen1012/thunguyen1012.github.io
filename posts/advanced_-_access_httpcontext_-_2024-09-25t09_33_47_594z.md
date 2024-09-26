---
title: Advanced - Access HttpContext
published: true
date: 2024-09-25 09:33:47
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Access ```HttpContext``` from Razor Pages

```csharp
public class IndexModel : PageModel
{
    public void OnGet()
    {
        var message = HttpContext.Request.PathBase;

        // ...
    }
}
```

```cshtml
@page
@model IndexModel

@{
    var message = HttpContext.Request.PathBase;

    // ...
}
```

## Access ```HttpContext``` from a Razor view in MVC

```cshtml
@{
    var username = Context.User.Identity.Name;

    // ...
}
```

## Access ```HttpContext``` from a controller

```csharp
public class HomeController : Controller
{
    public IActionResult About()
    {
        var pathBase = HttpContext.Request.PathBase;

        // ...

        return View();
    }
}
```

## Access ```HttpContext``` from minimal APIs

```csharp
app.MapGet("/", (HttpContext context) => context.Response.WriteAsync("Hello World"));
```

## Access ```HttpContext``` from middleware

```csharp
public class MyCustomMiddleware
{
    // ...

    public async Task InvokeAsync(HttpContext context)
    {
        // ...
    }
}
```

## Access ```HttpContext``` from SignalR

```csharp
public class MyHub : Hub
{
    public async Task SendMessage()
    {
        var httpContext = Context.GetHttpContext();

        // ...
    }
}
```

## Access ```HttpContext``` from gRPC methods

## Access ```HttpContext``` from custom components

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddHttpContextAccessor();
builder.Services.AddTransient<IUserRepository, UserRepository>();
```

 - ```UserRepository``` declares its dependency on ```IHttpContextAccessor```.

 - The dependency is supplied when DI resolves the dependency chain and creates an instance of ```UserRepository```.

```csharp
public class UserRepository : IUserRepository
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserRepository(IHttpContextAccessor httpContextAccessor) =>
        _httpContextAccessor = httpContextAccessor;

    public void LogCurrentUser()
    {
        var username = _httpContextAccessor.HttpContext.User.Identity.Name;

        // ...
    }
}
```

## ```HttpContext``` access from a background thread

> Note
If your app generates sporadic ```NullReferenceException``` errors, review parts of the code that start background processing or that continue processing after a request completes. Look for mistakes, such as defining a controller method as ```async void```.

 - Copy the required data during request processing.

 - Pass the copied data to a background task.

 - Do not reference ```HttpContext``` data in parallel tasks. Extract the data needed from the context before starting the parallel tasks.

```csharp
public class EmailController : Controller
{
    public IActionResult SendEmail(string email)
    {
        var correlationId = HttpContext.Request.Headers["X-Correlation-Id"].ToString();

        _ = SendEmailCoreAsync(correlationId);

        return View();
    }

    private async Task SendEmailCoreAsync(string correlationId)
    {
        // ...
    }
}
```

## ```IHttpContextAccessor```/HttpContext in Razor components (Blazor)

```csharp
[CascadingParameter]
public HttpContext? HttpContext { get; set; }
```

Ref: [Access ```HttpContext``` in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-context?view=aspnetcore-8.0)