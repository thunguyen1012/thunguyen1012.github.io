---
title: APIs - Minimal APIs - Overview
published: true
date: 2024-09-09 08:41:31
tags: Summary, AspNetCore
description: Minimal APIs are a simplified approach for building fast HTTP APIs with  ASP.NET Core.
You can build fully functioning REST endpoints with minimal code and configuration. Skip traditional scaffolding and avoid unnecessary controllers by fluently declaring API routes and actions. For example, the following code creates an API at the root of the web app that returns the text, "Hello World!".
image:
---

## In this article

Minimal APIs are a simplified approach for building fast HTTP APIs with  ASP.NET Core.
You can build fully functioning REST endpoints with minimal code and configuration. Skip traditional scaffolding and avoid unnecessary controllers by fluently declaring API routes and actions. For example, the following code creates an API at the root of the web app that returns the text, "Hello World!".

```csharp
var app = WebApplication.Create(args);

app.MapGet("/", () => "Hello World!");

app.Run();
```

Most APIs accept parameters as part of the route.

```csharp
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/users/{userId}/books/{bookId}", 
    (int userId, int bookId) => $"The user id is {userId} and book id is {bookId}");

app.Run();
```

All it takes to create an application programming interface (API) is ASP.NET Core and a few lines of code.

## Want to see some code examples?

For a full list of common scenarios with code examples, see Minimal APIs quick reference.

## Want to jump straight into your first project?

Build a minimal API app with our tutorial: Tutorial: Create a minimal API with ASP.NET Core.

Ref: [Minimal APIs overview](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/overview?view=aspnetcore-8.0)