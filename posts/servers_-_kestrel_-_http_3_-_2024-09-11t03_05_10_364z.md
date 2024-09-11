---
title: Servers - Kestrel - HTTP/3
published: true
date: 2024-09-11 03:05:10
tags: Summary, AspNetCore
description: 
image:
---

## In this article

> Important
Apps configured to take advantage of HTTP/3 should be designed to also support HTTP/1.1 and HTTP/2.

## HTTP/3 requirements

### Windows

 - Windows 11 Build 22000 or later OR Windows Server 2022.

 - TLS 1.3 or later connection.

### Linux

 - ```libmsquic``` package installed.

 - Add the ```packages.microsoft.com``` repository. See Linux Software Repository for Microsoft Products for instructions.

 - Install the ```libmsquic``` package using the distro's package manager. For example, apt install ```libmsquic```=1.9* on Ubuntu.

### macOS

## Getting started

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, options) =>
{
    options.ListenAnyIP(5001, listenOptions =>
    {
        listenOptions.Protocols = HttpProtocols.Http1AndHttp2AndHttp3;
        listenOptions.UseHttps();
    });
});
```

 - Use HTTP/3 alongside HTTP/1.1 and HTTP/2 by specifying ```HttpProtocols.Http1AndHttp2AndHttp3```.

 - Enable HTTPS with ```UseHttps```. HTTP/3 requires HTTPS.

## Alt-svc

## Localhost testing

 - Browsers don't allow self-signed certificates on HTTP/3, such as the Kestrel development certificate.

 - ```HttpClient``` can be used for localhost/loopback testing in .NET 6 or later. Extra configuration is required when using ```HttpClient``` to make an HTTP/3 request:

   - Set ```HttpRequestMessage.Version``` to 3.0, or

   - Set ```HttpRequestMessage.VersionPolicy``` to ```HttpVersionPolicy.RequestVersionOrHigher```.

## HTTP/3 benefits

 - Faster response time of the first request. QUIC and HTTP/3 negotiates the connection in fewer round-trips between the client and the server. The first request reaches the server faster.

 - Improved experience when there is connection packet loss. HTTP/2 multiplexes multiple requests via one TCP connection. Packet loss on the connection affects all requests. This problem is called "head-of-line blocking". Because QUIC provides native multiplexing, lost packets only impact the requests where data has been lost.

 - Supports transitioning between networks. This feature is useful for mobile devices where it is common to switch between WIFI and cellular networks as a mobile device changes location. Currently, HTTP/1.1 and HTTP/2 connections fail with an error when switching networks. An app or web browsers must retry any failed HTTP requests. HTTP/3 allows the app or web browser to seamlessly continue when a network changes. Kestrel doesn't support network transitions in .NET 8. It may be available in a future release.

Ref: [Use HTTP/3 with the ASP.NET Core Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/http3?view=aspnetcore-8.0)