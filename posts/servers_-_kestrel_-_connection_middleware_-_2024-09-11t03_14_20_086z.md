---
title: Servers - Kestrel - Connection middleware
published: true
date: 2024-09-11 03:14:20
tags: Summary, AspNetCore
description: Kestrel supports connection middleware. Connection middleware is software that is assembled into a connection pipeline and runs when Kestrel receives a new connection. Each component:
image:
---

## In this article

Kestrel supports connection middleware. Connection middleware is software that is assembled into a connection pipeline and runs when Kestrel receives a new connection. Each component:

- Chooses whether to pass the request to the next component in the pipeline.

- Can perform work before and after the next component in the pipeline.

Connection delegates are used to build the connection pipeline. Connection delegates are configured with the ListenOptions.Use method.

Connection middleware is different from ASP.NET Core Middleware. Connection middleware runs per-connection instead of per-request.

## Connection logging

Connection logging is connection middleware that is included with ASP.NET Core. Call ```UseConnectionLogging``` to emit Debug level logs for byte-level communication on a connection.

Connection logging is helpful for troubleshooting problems in low-level communication, such as during TLS encryption and behind proxies. If ```UseConnectionLogging``` is placed before ```UseHttps```, encrypted traffic is logged. If ```UseConnectionLogging``` is placed after ```UseHttps```, decrypted traffic is logged.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    serverOptions.Listen(IPAddress.Any, 8000, listenOptions =>
    {
        listenOptions.UseConnectionLogging();
    });
});
```

## Create custom connection middleware

The following code snippet shows how to create a custom connection that can filter TLS handshakes on a per-connection basis for specific cipher suites.

No encryption is used with a CipherAlgorithmType.Null cipher algorithm.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    serverOptions.Listen(IPAddress.Any, 8000, listenOptions =>
    {
        listenOptions.UseHttps("testCert.pfx", "testPassword");

        listenOptions.Use((context, next) =>
        {
            var tlsFeature = context.Features.Get<ITlsHandshakeFeature>()!;

            if (tlsFeature.CipherAlgorithm == CipherAlgorithmType.Null)
            {
                throw new NotSupportedException(
                    $"Prohibited cipher: {tlsFeature.CipherAlgorithm}");
            }

            return next();
        });
    });
});
```

## See also

- Configure endpoints for the ASP.NET Core Kestrel web server

Ref: [Connection middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/connection-middleware?view=aspnetcore-8.0)