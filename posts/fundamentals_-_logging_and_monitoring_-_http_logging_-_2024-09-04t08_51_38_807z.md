---
title: Fundamentals - Logging and monitoring - HTTP logging
published: true
date: 2024-09-04 08:51:38
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - HTTP request information

 - Common properties

 - Headers

 - Body

 - HTTP response information

 - Log all requests and responses or only requests and responses that meet certain criteria.

 - Select which parts of the request and response are logged.

 - Allow you to redact sensitive information from the logs.

> Warning
HTTP logging can potentially log personally identifiable information (PII). Consider the risk and avoid logging sensitive information.

## Enable HTTP logging

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpLogging(o => { });

var app = builder.Build();

app.UseHttpLogging();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}
app.UseStaticFiles();

app.MapGet("/", () => "Hello World!");

app.Run();
```

```json
"Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware": "Information"
```

```output
info: Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware[1]
      Request:
      Protocol: HTTP/2
      Method: GET
      Scheme: https
      PathBase:
      Path: /
      Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
      Host: localhost:52941
      User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.61
      Accept-Encoding: gzip, deflate, br
      Accept-Language: en-US,en;q=0.9
      Upgrade-Insecure-Requests: [Redacted]
      sec-ch-ua: [Redacted]
      sec-ch-ua-mobile: [Redacted]
      sec-ch-ua-platform: [Redacted]
      sec-fetch-site: [Redacted]
      sec-fetch-mode: [Redacted]
      sec-fetch-user: [Redacted]
      sec-fetch-dest: [Redacted]
info: Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware[2]
      Response:
      StatusCode: 200
      Content-Type: text/plain; charset=utf-8
      Date: Tue, 24 Oct 2023 02:03:53 GMT
      Server: Kestrel
```

## HTTP logging options

```csharp
using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
    logging.RequestHeaders.Add("sec-ch-ua");
    logging.ResponseHeaders.Add("MyResponseHeader");
    logging.MediaTypeOptions.AddText("application/javascript");
    logging.RequestBodyLogLimit = 4096;
    logging.ResponseBodyLogLimit = 4096;
    logging.CombineLogs = true;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseHttpLogging(); 

app.Use(async (context, next) =>
{
    context.Response.Headers["MyResponseHeader"] =
        new string[] { "My Response Header Value" };

    await next();
});

app.MapGet("/", () => "Hello World!");

app.Run();
```

> Note
In the preceding sample and following samples, ```UseHttpLogging``` is called after ```UseStaticFiles```, so HTTP logging is not enabled for static files. To enable static file HTTP logging, call ```UseHttpLogging``` before ```UseStaticFiles```.

### ```LoggingFields```

### ```RequestHeaders``` and ```ResponseHeaders```

```csharp
using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
    logging.RequestHeaders.Add("sec-ch-ua");
    logging.ResponseHeaders.Add("MyResponseHeader");
    logging.MediaTypeOptions.AddText("application/javascript");
    logging.RequestBodyLogLimit = 4096;
    logging.ResponseBodyLogLimit = 4096;
    logging.CombineLogs = true;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseHttpLogging(); 

app.Use(async (context, next) =>
{
    context.Response.Headers["MyResponseHeader"] =
        new string[] { "My Response Header Value" };

    await next();
});

app.MapGet("/", () => "Hello World!");

app.Run();
```

### ```MediaTypeOptions```

```csharp
using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
    logging.RequestHeaders.Add("sec-ch-ua");
    logging.ResponseHeaders.Add("MyResponseHeader");
    logging.MediaTypeOptions.AddText("application/javascript");
    logging.RequestBodyLogLimit = 4096;
    logging.ResponseBodyLogLimit = 4096;
    logging.CombineLogs = true;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseHttpLogging(); 

app.Use(async (context, next) =>
{
    context.Response.Headers["MyResponseHeader"] =
        new string[] { "My Response Header Value" };

    await next();
});

app.MapGet("/", () => "Hello World!");

app.Run();
```

#### ```MediaTypeOptions``` methods

 - AddText

 - AddBinary

 - Clear

### ```RequestBodyLogLimit``` and ```ResponseBodyLogLimit```

 - ```RequestBodyLogLimit```

 - ```ResponseBodyLogLimit```

```csharp
using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
    logging.RequestHeaders.Add("sec-ch-ua");
    logging.ResponseHeaders.Add("MyResponseHeader");
    logging.MediaTypeOptions.AddText("application/javascript");
    logging.RequestBodyLogLimit = 4096;
    logging.ResponseBodyLogLimit = 4096;
    logging.CombineLogs = true;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseHttpLogging(); 

app.Use(async (context, next) =>
{
    context.Response.Headers["MyResponseHeader"] =
        new string[] { "My Response Header Value" };

    await next();
});

app.MapGet("/", () => "Hello World!");

app.Run();
```

### ```CombineLogs```

```csharp
using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
    logging.RequestHeaders.Add("sec-ch-ua");
    logging.ResponseHeaders.Add("MyResponseHeader");
    logging.MediaTypeOptions.AddText("application/javascript");
    logging.RequestBodyLogLimit = 4096;
    logging.ResponseBodyLogLimit = 4096;
    logging.CombineLogs = true;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseHttpLogging(); 

app.Use(async (context, next) =>
{
    context.Response.Headers["MyResponseHeader"] =
        new string[] { "My Response Header Value" };

    await next();
});

app.MapGet("/", () => "Hello World!");

app.Run();
```

## Endpoint-specific configuration

```csharp
app.MapGet("/response", () => "Hello World! (logging response)")
    .WithHttpLogging(HttpLoggingFields.ResponsePropertiesAndHeaders);
```

```csharp
app.MapGet("/duration", [HttpLogging(loggingFields: HttpLoggingFields.Duration)]
    () => "Hello World! (logging duration)");
```

## ```IHttpLoggingInterceptor```

 - Inspect a request or response.

 - Enable or disable any HttpLoggingFields.

 - Adjust how much of the request or response body is logged.

 - Add custom fields to the logs.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.Duration;
});
builder.Services.AddHttpLoggingInterceptor<SampleHttpLoggingInterceptor>();
```

 - Inspects the request method and disables logging for POST requests.

 - For non-POST requests:

   - Redacts request path, request headers, and response headers.

   - Adds custom fields and field values to the request and response logs.

```csharp
using Microsoft.AspNetCore.HttpLogging;

namespace HttpLoggingSample;

internal sealed class SampleHttpLoggingInterceptor : IHttpLoggingInterceptor
{
    public ValueTask OnRequestAsync(HttpLoggingInterceptorContext logContext)
    {
        if (logContext.HttpContext.Request.Method == "POST")
        {
            // Don't log anything if the request is a POST.
            logContext.LoggingFields = HttpLoggingFields.None;
        }

        // Don't enrich if we're not going to log any part of the request.
        if (!logContext.IsAnyEnabled(HttpLoggingFields.Request))
        {
            return default;
        }

        if (logContext.TryDisable(HttpLoggingFields.RequestPath))
        {
            RedactPath(logContext);
        }

        if (logContext.TryDisable(HttpLoggingFields.RequestHeaders))
        {
            RedactRequestHeaders(logContext);
        }

        EnrichRequest(logContext);

        return default;
    }

    public ValueTask OnResponseAsync(HttpLoggingInterceptorContext logContext)
    {
        // Don't enrich if we're not going to log any part of the response
        if (!logContext.IsAnyEnabled(HttpLoggingFields.Response))
        {
            return default;
        }

        if (logContext.TryDisable(HttpLoggingFields.ResponseHeaders))
        {
            RedactResponseHeaders(logContext);
        }

        EnrichResponse(logContext);

        return default;
    }

    private void RedactPath(HttpLoggingInterceptorContext logContext)
    {
        logContext.AddParameter(nameof(logContext.HttpContext.Request.Path), "RedactedPath");
    }

    private void RedactRequestHeaders(HttpLoggingInterceptorContext logContext)
    {
        foreach (var header in logContext.HttpContext.Request.Headers)
        {
            logContext.AddParameter(header.Key, "RedactedHeader");
        }
    }

    private void EnrichRequest(HttpLoggingInterceptorContext logContext)
    {
        logContext.AddParameter("RequestEnrichment", "Stuff");
    }

    private void RedactResponseHeaders(HttpLoggingInterceptorContext logContext)
    {
        foreach (var header in logContext.HttpContext.Response.Headers)
        {
            logContext.AddParameter(header.Key, "RedactedHeader");
        }
    }

    private void EnrichResponse(HttpLoggingInterceptorContext logContext)
    {
        logContext.AddParameter("ResponseEnrichment", "Stuff");
    }
}
```

```output
info: Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware[1]
      Request:
      Path: RedactedPath
      Accept: RedactedHeader
      Host: RedactedHeader
      User-Agent: RedactedHeader
      Accept-Encoding: RedactedHeader
      Accept-Language: RedactedHeader
      Upgrade-Insecure-Requests: RedactedHeader
      sec-ch-ua: RedactedHeader
      sec-ch-ua-mobile: RedactedHeader
      sec-ch-ua-platform: RedactedHeader
      sec-fetch-site: RedactedHeader
      sec-fetch-mode: RedactedHeader
      sec-fetch-user: RedactedHeader
      sec-fetch-dest: RedactedHeader
      RequestEnrichment: Stuff
      Protocol: HTTP/2
      Method: GET
      Scheme: https
info: Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware[2]
      Response:
      Content-Type: RedactedHeader
      MyResponseHeader: RedactedHeader
      ResponseEnrichment: Stuff
      StatusCode: 200
info: Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware[4]
      ResponseBody: Hello World!
info: Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware[8]
      Duration: 2.2778ms
```

## Logging configuration order of precedence

 - Global configuration from HttpLoggingOptions, set by calling ```AddHttpLogging```.

 - Endpoint-specific configuration from the `[HttpLogging]` attribute or the WithHttpLogging extension method overrides global configuration.

 - ```IHttpLoggingInterceptor``` is called with the results and can further modify the configuration per request.

Ref: [HTTP logging in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-logging/?view=aspnetcore-8.0)