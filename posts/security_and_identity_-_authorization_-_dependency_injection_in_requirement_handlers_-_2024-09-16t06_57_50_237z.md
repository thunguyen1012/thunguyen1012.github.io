---
title: Security and Identity - Authorization - Dependency injection in requirement handlers
published: true
date: 2024-09-16 06:57:50
tags: Summary, AspNetCore
description: 
image:
---

## In this article

```csharp
public class SampleAuthorizationHandler : AuthorizationHandler<SampleRequirement>
{
    private readonly ILogger _logger;

    public SampleAuthorizationHandler(ILoggerFactory loggerFactory)
        => _logger = loggerFactory.CreateLogger(GetType().FullName);

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, SampleRequirement requirement)
    {
        _logger.LogInformation("Inside my handler");

        // ...

        return Task.CompletedTask;
    }
}
```

```csharp
builder.Services.AddSingleton<IAuthorizationHandler, SampleAuthorizationHandler>();
```

> Note
Don't register authorization handlers that use Entity Framework (EF) as singletons.

Ref: [Dependency injection in requirement handlers in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/dependencyinjection?view=aspnetcore-8.0)