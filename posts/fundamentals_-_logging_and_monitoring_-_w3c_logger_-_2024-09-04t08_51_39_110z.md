---
title: Fundamentals - Logging and monitoring - W3C logger
published: true
date: 2024-09-04 08:51:39
tags: Summary, AspNetCore
description: 
image:
---
- Article

  - 07/26/2024

  - 5 contributors

## In this article

 - HTTP request information

 - Common properties

 - Headers

 - HTTP response information

 - Metadata about the request/response pair (date/time started, time taken)

 - Record information about incoming requests and responses.

 - Filter which parts of the request and response are logged.

 - Filter which headers to log.

> Warning
W3CLogger can potentially log personally identifiable information (PII). Consider the risk and avoid logging sensitive information. By default, fields that could contain PII aren't logged.

## Enable W3CLogger

```csharp
var app = builder.Build();

app.UseW3CLogging();

app.UseRouting();
```

## W3CLogger options

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddW3CLogging(logging =>
{
    // Log all W3C fields
    logging.LoggingFields = W3CLoggingFields.All;

    logging.AdditionalRequestHeaders.Add("x-forwarded-for");
    logging.AdditionalRequestHeaders.Add("x-client-ssl-protocol");
    logging.FileSizeLimit = 5 * 1024 * 1024;
    logging.RetainedFileCountLimit = 2;
    logging.FileName = "MyLogFile";
    logging.LogDirectory = @"C:\logs";
    logging.FlushInterval = TimeSpan.FromSeconds(2);
});
```

### ```LoggingFields```

Ref: [W3CLogger in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/w3c-logger/?view=aspnetcore-8.0)