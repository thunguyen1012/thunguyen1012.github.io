---
title: Servers - Kestrel - Host filtering
published: true
date: 2024-09-11 03:14:20
tags: Summary, AspNetCore
description: While Kestrel supports configuration based on prefixes such as http://example.com:5000, Kestrel largely ignores the host name. Host localhost is a special case used for binding to loopback addresses. Any host other than an explicit IP address binds to all public IP addresses. Host headers aren't validated.
image:
---

## In this article

While Kestrel supports configuration based on prefixes such as ```http://example.com:5000```, Kestrel largely ignores the host name. ```Host``` ```localhost``` is a special case used for binding to loopback addresses. Any host other than an explicit IP address binds to all public IP addresses. ```Host``` headers aren't validated.

As a workaround, use ```Host``` Filtering Middleware. The middleware is added by CreateDefaultBuilder, which calls AddHostFiltering:

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        CreateWebHostBuilder(args).Build().Run();
    }

    public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .UseStartup<Startup>();
}
```

 ```Host``` Filtering Middleware is disabled by default. To enable the middleware, define an ```AllowedHosts``` key in ```appsettings.json/appsettings.{Environment}.json```. The value is a semicolon-delimited list of host names without port numbers:

 ```appsettings.json```:

```json
{
  "AllowedHosts": "example.com;localhost"
}
```

> Note
Forwarded Headers Middleware also has an ```AllowedHosts``` option. Forwarded Headers Middleware and ```Host``` Filtering Middleware have similar functionality for different scenarios. Setting ```AllowedHosts``` with Forwarded Headers Middleware is appropriate when the ```Host``` header isn't preserved while forwarding requests with a reverse proxy server or load balancer. Setting ```AllowedHosts``` with ```Host``` Filtering Middleware is appropriate when Kestrel is used as a public-facing edge server or when the ```Host``` header is directly forwarded.
For more information on Forwarded Headers Middleware, see Configure ASP.NET Core to work with proxy servers and load balancers.

Ref: [Host filtering with ASP.NET Core Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/host-filtering?view=aspnetcore-8.0)