---
title: Servers - Kestrel - Overview
published: true
date: 2024-09-11 03:05:08
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - Cross-platform: Kestrel is a cross-platform web server that runs on Windows, Linux, and macOS.

 - High performance: Kestrel is optimized to handle a large number of concurrent connections efficiently.

 - Lightweight: Optimized for running in resource-constrained environments, such as containers and edge devices.

 - Security hardened: Kestrel supports HTTPS and is hardened against web server vulnerabilities.

 - Wide protocol support: Kestrel supports common web protocols, including:

   - HTTP/1.1, HTTP/2 and HTTP/3

   - WebSockets

 - Integration with ASP.NET Core: Seamless integration with other ASP.NET Core components, such as the middleware pipeline, dependency injection, and configuration system.

 - Flexible workloads: Kestrel supports many workloads:

   - ASP.NET app frameworks such as Minimal APIs, MVC, Razor pages, SignalR, Blazor, and gRPC.

   - Building a reverse proxy with YARP.

 - Extensibility: Customize Kestrel through configuration, middleware, and custom transports.

 - Performance diagnostics: Kestrel provides built-in performance diagnostics features, such as logging and metrics.

## Get started

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

## Optional client certificates

## Behavior with debugger attached

 - KestrelServerLimits.KeepAliveTimeout

 - KestrelServerLimits.RequestHeadersTimeout

 - KestrelServerLimits.MinRequestBodyDataRate

 - KestrelServerLimits.MinResponseDataRate

 - IConnectionTimeoutFeature

 - IHttpMinRequestBodyDataRateFeature

 - IHttpMinResponseDataRateFeature

## Additional resources

 - Configure endpoints for the ASP.NET Core Kestrel web server

 - Source for ```WebApplication.CreateBuilder``` method call to ```UseKestrel```

 - Configure options for the ASP.NET Core Kestrel web server

 - Use HTTP/2 with the ASP.NET Core Kestrel web server

 - When to use a reverse proxy with the ASP.NET Core Kestrel web server

 - Host filtering with ASP.NET Core Kestrel web server

 - Troubleshoot and debug ASP.NET Core projects

 - Enforce HTTPS in ASP.NET Core

 - Configure ASP.NET Core to work with proxy servers and load balancers

 - RFC 9110: HTTP Semantics (Section 7.2: Host and :authority)

 - When using UNIX sockets on Linux, the socket isn't automatically deleted on app shutdown. For more information, see this GitHub issue.

> Note
As of ASP.NET Core 5.0, Kestrel's libuv transport is obsolete. The libuv transport doesn't receive updates to support new OS platforms, such as Windows ARM64, and will be removed in a future release. Remove any calls to the obsolete UseLibuv method and use Kestrel's default Socket transport instead.

Ref: [Kestrel web server in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-8.0)