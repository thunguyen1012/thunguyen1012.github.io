---
title: Servers - Kestrel - Options
published: true
date: 2024-09-11 03:05:09
tags: Summary, AspNetCore
description: 
image:
---

## In this article

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    // ...
});
```

## General limits

### Keep-alive timeout

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
});
```

### Maximum client connections

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxConcurrentConnections = 100;
});
```

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxConcurrentUpgradedConnections = 100;
});
```

### Maximum request body size

```csharp
[RequestSizeLimit(100_000_000)]
public IActionResult Get()
```

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 100_000_000;
});
```

```csharp
app.Use(async (context, next) =>
{
    var httpMaxRequestBodySizeFeature = context.Features.Get<IHttpMaxRequestBodySizeFeature>();

    if (httpMaxRequestBodySizeFeature is not null)
        httpMaxRequestBodySizeFeature.MaxRequestBodySize = 10 * 1024;

    // ...

    await next(context);
});
```

### Minimum request body data rate

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MinRequestBodyDataRate = new MinDataRate(
        bytesPerSecond: 100, gracePeriod: TimeSpan.FromSeconds(10));
    serverOptions.Limits.MinResponseDataRate = new MinDataRate(
        bytesPerSecond: 100, gracePeriod: TimeSpan.FromSeconds(10));
});
```

```csharp
app.Use(async (context, next) =>
{
    var httpMinRequestBodyDataRateFeature = context.Features
        .Get<IHttpMinRequestBodyDataRateFeature>();

    if (httpMinRequestBodyDataRateFeature is not null)
    {
        httpMinRequestBodyDataRateFeature.MinDataRate = new MinDataRate(
            bytesPerSecond: 100, gracePeriod: TimeSpan.FromSeconds(10));
    }

    var httpMinResponseDataRateFeature = context.Features
        .Get<IHttpMinResponseDataRateFeature>();

    if (httpMinResponseDataRateFeature is not null)
    {
        httpMinResponseDataRateFeature.MinDataRate = new MinDataRate(
            bytesPerSecond: 100, gracePeriod: TimeSpan.FromSeconds(10));
    }

    // ...

    await next(context);
});
```

### Request headers timeout

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(1);
});
```

## HTTP/2 limits

### Maximum streams per connection

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.Http2.MaxStreamsPerConnection = 100;
});
```

### Header table size

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.Http2.HeaderTableSize = 4096;
});
```

### Maximum frame size

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.Http2.MaxFrameSize = 16_384;
});
```

### Maximum request header size

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.Http2.MaxRequestHeaderFieldSize = 8192;
});
```

### Initial connection window size

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.Http2.InitialConnectionWindowSize = 131_072;
});
```

### Initial stream window size

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.Http2.InitialStreamWindowSize = 98_304;
});
```

### HTTP/2 keep alive ping configuration

 - Keep idle connections alive. Some clients and proxy servers close connections that are idle. HTTP/2 pings are considered as activity on a connection and prevent the connection from being closed as idle.

 - Close unhealthy connections. Connections where the client doesn't respond to the keep alive ping in the configured time are closed by the server.

 - ```KeepAlivePingDelay``` is a TimeSpan that configures the ping interval. The server sends a keep alive ping to the client if it doesn't receive any frames for this period of time. Keep alive pings are disabled when this option is set to TimeSpan.MaxValue.

 - ```KeepAlivePingTimeout``` is a TimeSpan that configures the ping timeout. If the server doesn't receive any frames, such as a response ping, during this timeout then the connection is closed. Keep alive timeout is disabled when this option is set to TimeSpan.MaxValue.

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.Http2.KeepAlivePingDelay = TimeSpan.FromSeconds(30);
    serverOptions.Limits.Http2.KeepAlivePingTimeout = TimeSpan.FromMinutes(1);
});
```

## Other options

### Synchronous I/O

> Warning
A large number of blocking synchronous I/O operations can lead to thread pool starvation, which makes the app unresponsive. Only enable ```AllowSynchronousIO``` when using a library that doesn't support asynchronous I/O.

```csharp
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.AllowSynchronousIO = true;
});
```

 - KestrelServerOptions

 - KestrelServerLimits

 - ListenOptions

## Behavior with debugger attached

Ref: [Configure options for the ASP.NET Core Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/options?view=aspnetcore-8.0)