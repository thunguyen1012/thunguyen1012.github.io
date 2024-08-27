---
title: Fundamentals - Middleware - Middleware in Minimal API apps
published: true
date: 2024-08-27 07:56:25
tags: Summary, AspNetCore
description: For more information about middleware see ASP.NET Core Middleware, and the list of built-in middleware that can be added to applications.
image:
---

## In this article

 - ```UseDeveloperExceptionPage``` is added first when the ```HostingEnvironment``` is "Development".

 - ```UseRouting``` is added second if user code didn't already call ```UseRouting``` and if there are endpoints configured, for example ```app.MapGet```.

 - ```UseEndpoints``` is added at the end of the middleware pipeline if any endpoints are configured.

 - ```UseAuthentication``` is added immediately after ```UseRouting``` if user code didn't already call ```UseAuthentication``` and if ```IAuthenticationSchemeProvider``` can be detected in the service provider. ```IAuthenticationSchemeProvider``` is added by default when using ```AddAuthentication```, and services are detected using ```IServiceProviderIsService```.

 - ```UseAuthorization``` is added next if user code didn't already call ```UseAuthorization``` and if ```IAuthorizationHandlerProvider``` can be detected in the service provider. ```IAuthorizationHandlerProvider``` is added by default when using ```AddAuthorization```, and services are detected using ```IServiceProviderIsService```.

 - User configured middleware and endpoints are added between ```UseRouting``` and ```UseEndpoints```.

```csharp
if (isDevelopment)
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();

if (isAuthenticationConfigured)
{
    app.UseAuthentication();
}

if (isAuthorizationConfigured)
{
    app.UseAuthorization();
}

// user middleware/endpoints
app.CustomMiddleware(...);
app.MapGet("/", () => "hello world");
// end user middleware/endpoints

app.UseEndpoints(e => {});
```

```csharp
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
```

```csharp
app.Use((context, next) =>
{
    return next(context);
});

app.UseRouting();

// other middleware and endpoints
```

 - The middleware must be added after ```UseEndpoints```.

 - The app needs to call ```UseRouting``` and ```UseEndpoints``` so that the terminal middleware can be placed at the correct location.

```csharp
app.UseRouting();

app.MapGet("/", () => "hello world");

app.UseEndpoints(e => {});

app.Run(context =>
{
    context.Response.StatusCode = 404;
    return Task.CompletedTask;
});
```

For more information about middleware see ASP.NET Core Middleware, and the list of built-in middleware that can be added to applications.

For more information about Minimal APIs see ```Minimal APIs overview```.

Ref: [Middleware in Minimal API apps](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/middleware?view=aspnetcore-8.0)