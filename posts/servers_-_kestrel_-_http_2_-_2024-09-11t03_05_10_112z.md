---
title: Servers - Kestrel - HTTP/2
published: true
date: 2024-09-11 03:05:10
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Operating system

   - Windows Server 2016/Windows 10 or later‡

   - Linux with OpenSSL 1.0.2 or later (for example, Ubuntu 16.04 or later)

   - macOS 10.15 or later

 - Target framework: .NET Core 2.2 or later

 - Application-Layer Protocol Negotiation (ALPN) connection

 - TLS 1.2 or later connection

## Advanced ```HTTP/2``` features

### Trailers

```csharp
if (httpContext.Response.SupportsTrailers())
{
    httpContext.Response.DeclareTrailer("trailername");	

    // Write body
    httpContext.Response.WriteAsync("Hello world");

    httpContext.Response.AppendTrailer("trailername", "TrailerValue");
}
```

 - ```SupportsTrailers``` ensures that trailers are supported for the response.

 - ```DeclareTrailer``` adds the given trailer name to the ```Trailer``` response header. Declaring a response's trailers is optional, but recommended. If ```DeclareTrailer``` is called, it must be before the response headers are sent.

 - ```AppendTrailer``` appends the trailer.

### ```Reset```

```csharp
var resetFeature = httpContext.Features.Get<IHttpResetFeature>();
resetFeature.Reset(errorCode: 2);
```

Ref: [Use ```HTTP/2``` with the ASP.NET Core Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/http2?view=aspnetcore-8.0)