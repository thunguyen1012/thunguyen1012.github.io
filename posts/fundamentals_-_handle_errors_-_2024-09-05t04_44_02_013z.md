---
title: Fundamentals - Handle errors
published: true
date: 2024-09-05 04:44:02
tags: Summary, AspNetCore
description: 
image:
---
## In this article

## Developer exception page

 - Running in the Development environment.

 - App created with the current templates, that is, using WebApplication.CreateBuilder.  Apps created using the ```WebHost.CreateDefaultBuilder``` must enable the developer exception page by calling ```app.UseDeveloperExceptionPage``` in ```Configure```.

 - Stack trace

 - Query string parameters, if any

 - Cookies, if any

 - Headers

## Exception handler page

 - Catches and logs unhandled exceptions.

 - Re-executes the request in an alternate pipeline using the path indicated. The request isn't re-executed if the response has started. The template-generated code re-executes the request using the ```/Error``` path.

> Warning
If the alternate pipeline throws an exception of its own, Exception Handling Middleware rethrows the original exception.

 - Middlewares need to handle reentrancy with the same request. This normally means either cleaning up their state after calling ```_next``` or caching their processing on the ```HttpContext``` to avoid redoing it. When dealing with the request body, this either means buffering or caching the results like the Form reader.

 - For the ```UseExceptionHandler(IApplicationBuilder, String)``` overload that is used in templates, only the request path is modified, and the route data is cleared. Request data such as headers, method, and items are all reused as-is.

 - Scoped services remain the same.

```csharp
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}
```

 - For Razor Pages, create multiple handler methods. For example, use ```OnGet``` to handle GET exceptions and use ```OnPost``` to handle POST exceptions.

 - For MVC, apply HTTP verb attributes to multiple actions. For example, use ```[HttpGet]``` to handle GET exceptions and use ```[HttpPost]``` to handle POST exceptions.

### Access the exception

```csharp
[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
[IgnoreAntiforgeryToken]
public class ErrorModel : PageModel
{
    public string? RequestId { get; set; }

    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);

    public string? ExceptionMessage { get; set; }

    public void OnGet()
    {
        RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;

        var exceptionHandlerPathFeature =
            HttpContext.Features.Get<IExceptionHandlerPathFeature>();

        if (exceptionHandlerPathFeature?.Error is FileNotFoundException)
        {
            ExceptionMessage = "The file was not found.";
        }

        if (exceptionHandlerPathFeature?.Path == "/")
        {
            ExceptionMessage ??= string.Empty;
            ExceptionMessage += " Page: Home.";
        }
    }
}
```

> Warning
Do not serve sensitive error information to clients. Serving errors is a security risk.

## Exception handler lambda

```csharp
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(exceptionHandlerApp =>
    {
        exceptionHandlerApp.Run(async context =>
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            // using static System.Net.Mime.MediaTypeNames;
            context.Response.ContentType = Text.Plain;

            await context.Response.WriteAsync("An exception was thrown.");

            var exceptionHandlerPathFeature =
                context.Features.Get<IExceptionHandlerPathFeature>();

            if (exceptionHandlerPathFeature?.Error is FileNotFoundException)
            {
                await context.Response.WriteAsync(" The file was not found.");
            }

            if (exceptionHandlerPathFeature?.Path == "/")
            {
                await context.Response.WriteAsync(" Page: Home.");
            }
        });
    });

    app.UseHsts();
}
```

> Warning
Do not serve sensitive error information to clients. Serving errors is a security risk.

## ```IExceptionHandler```

```csharp
using Microsoft.AspNetCore.Diagnostics;

namespace ErrorHandlingSample
{
    public class CustomExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<CustomExceptionHandler> logger;
        public CustomExceptionHandler(ILogger<CustomExceptionHandler> logger)
        {
            this.logger = logger;
        }
        public ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            var exceptionMessage = exception.Message;
            logger.LogError(
                "Error Message: {exceptionMessage}, Time of occurrence {time}",
                exceptionMessage, DateTime.UtcNow);
            // Return false to continue with the default behavior
            // - or - return true to signal that this exception is handled
            return ValueTask.FromResult(false);
        }
    }
}
```

```csharp
using ErrorHandlingSample;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddRazorPages();
builder.Services.AddExceptionHandler<CustomExceptionHandler>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Remaining Program.cs code omitted for brevity
```

 - The ```CustomExceptionHandler``` is called first to handle an exception.

 - After logging the exception, the ```TryHandleException``` method returns ```false```, so the developer exception page is shown.

 - The ```CustomExceptionHandler``` is called first to handle an exception.

 - After logging the exception, the ```TryHandleException``` method returns ```false```, so the ```/Error``` page is shown.

## ```UseStatusCodePages```

```csharp
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStatusCodePages();
```

```console
Status Code: 404; Not Found
```

> Note
The status code pages middleware does not catch exceptions. To provide a custom error handling page, use the exception handler page.

### ```UseStatusCodePages``` with format string

```csharp
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// using static System.Net.Mime.MediaTypeNames;
app.UseStatusCodePages(Text.Plain, "Status Code Page: {0}");
```

### ```UseStatusCodePages``` with lambda

```csharp
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStatusCodePages(async statusCodeContext =>
{
    // using static System.Net.Mime.MediaTypeNames;
    statusCodeContext.HttpContext.Response.ContentType = Text.Plain;

    await statusCodeContext.HttpContext.Response.WriteAsync(
        $"Status Code Page: {statusCodeContext.HttpContext.Response.StatusCode}");
});
```

### UseStatusCodePagesWithRedirects

 - Sends a 302 - Found status code to the client.

 - Redirects the client to the error handling endpoint provided in the URL template. The error handling endpoint typically displays error information and returns HTTP 200.

```csharp
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStatusCodePagesWithRedirects("/StatusCode/{0}");
```

 - Should redirect the client to a different endpoint, usually in cases where a different app processes the error. For web apps, the client's browser address bar reflects the redirected endpoint.

 - Shouldn't preserve and return the original status code with the initial redirect response.

### ```UseStatusCodePagesWithReExecute```

 - Generates the response body by re-executing the request pipeline using an alternate path.

 - Does not alter the status code before or after re-executing the pipeline.

```csharp
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStatusCodePagesWithReExecute("/StatusCode/{0}");
```

 - Process the request without redirecting to a different endpoint. For web apps, the client's browser address bar reflects the originally requested endpoint.

 - Preserve and return the original status code with the response.

```csharp
var app = builder.Build();  
app.UseStatusCodePagesWithReExecute("/StatusCode", "?statusCode={0}");
```

```csharp
[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
public class StatusCodeModel : PageModel
{
    public int OriginalStatusCode { get; set; }

    public string? OriginalPathAndQuery { get; set; }

    public void OnGet(int statusCode)
    {
        OriginalStatusCode = statusCode;

        var statusCodeReExecuteFeature =
            HttpContext.Features.Get<IStatusCodeReExecuteFeature>();

        if (statusCodeReExecuteFeature is not null)
        {
            OriginalPathAndQuery = $"{statusCodeReExecuteFeature.OriginalPathBase}"
                                    + $"{statusCodeReExecuteFeature.OriginalPath}"
                                    + $"{statusCodeReExecuteFeature.OriginalQueryString}";

        }
    }
}
```

 - Middlewares need to handle reentrancy with the same request. This normally means either cleaning up their state after calling ```_next``` or caching their processing on the ```HttpContext``` to avoid redoing it. When dealing with the request body, this either means buffering or caching the results like the Form reader.

 - Scoped services remain the same.

## Disable status code pages

```csharp
public void OnGet()
{
    var statusCodePagesFeature =
        HttpContext.Features.Get<IStatusCodePagesFeature>();

    if (statusCodePagesFeature is not null)
    {
        statusCodePagesFeature.Enabled = false;
    }
}
```

## Exception-handling code

### Response headers

 - The app can't change the response's status code.

 - Any exception pages or handlers can't run. The response must be completed or the connection aborted.

## Server exception handling

## Startup exception handling

 - The hosting layer logs a critical exception.

 - The dotnet process crashes.

 - No error page is displayed when the HTTP server is Kestrel.

## Database error page

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddRazorPages();
```

## Exception filters

## Model state errors

## Problem details

 - ```ExceptionHandlerMiddleware```: Generates a problem details response when a custom handler is not defined.

 - ```StatusCodePagesMiddleware```: Generates a problem details response by default.

 - ```DeveloperExceptionPageMiddleware```: Generates a problem details response in development when the ```Accept``` request HTTP header doesn't include ```text/html```.

```csharp
builder.Services.AddProblemDetails();

var app = builder.Build();        

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHsts();
}

app.UseStatusCodePages();
```

### Customize problem details

 - Use ```ProblemDetailsOptions.CustomizeProblemDetails```

 - Use a custom ```IProblemDetailsWriter```

 - Call the ```IProblemDetailsService``` in a middleware

#### ```CustomizeProblemDetails``` operation

```csharp
builder.Services.AddProblemDetails(options =>
    options.CustomizeProblemDetails = ctx =>
            ctx.ProblemDetails.Extensions.Add("nodeId", Environment.MachineName));

var app = builder.Build();        

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHsts();
}

app.UseStatusCodePages();
```

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "Bad Request",
  "status": 400,
  "nodeId": "my-machine-name"
}
```

#### Custom ```IProblemDetailsWriter```

```csharp
public class SampleProblemDetailsWriter : IProblemDetailsWriter
{
    // Indicates that only responses with StatusCode == 400
    // are handled by this writer. All others are
    // handled by different registered writers if available.
    public bool CanWrite(ProblemDetailsContext context)
        => context.HttpContext.Response.StatusCode == 400;

    public ValueTask WriteAsync(ProblemDetailsContext context)
    {
        // Additional customizations.

        // Write to the response.
        var response = context.HttpContext.Response;
        return new ValueTask(response.WriteAsJsonAsync(context.ProblemDetails));
    }
}
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddTransient<IProblemDetailsWriter, SampleProblemDetailsWriter>();

var app = builder.Build();

// Middleware to handle writing problem details to the response.
app.Use(async (context, next) =>
{
    await next(context);
    var mathErrorFeature = context.Features.Get<MathErrorFeature>();
    if (mathErrorFeature is not null)
    {
        if (context.RequestServices.GetService<IProblemDetailsWriter>() is
            { } problemDetailsService)
        {

            if (problemDetailsService.CanWrite(new ProblemDetailsContext() { HttpContext = context }))
            {
                (string Detail, string Type) details = mathErrorFeature.MathError switch
                {
                    MathErrorType.DivisionByZeroError => ("Divison by zero is not defined.",
                        "https://en.wikipedia.org/wiki/Division_by_zero"),
                    _ => ("Negative or complex numbers are not valid input.",
                        "https://en.wikipedia.org/wiki/Square_root")
                };

                await problemDetailsService.WriteAsync(new ProblemDetailsContext
                {
                    HttpContext = context,
                    ProblemDetails =
                    {
                        Title = "Bad Input",
                        Detail = details.Detail,
                        Type = details.Type
                    }
                });
            }
        }
    }
});

// /divide?numerator=2&denominator=4
app.MapGet("/divide", (HttpContext context, double numerator, double denominator) =>
{
    if (denominator == 0)
    {
        var errorType = new MathErrorFeature
        {
            MathError = MathErrorType.DivisionByZeroError
        };
        context.Features.Set(errorType);
        return Results.BadRequest();
    }

    return Results.Ok(numerator / denominator);
});

// /squareroot?radicand=16
app.MapGet("/squareroot", (HttpContext context, double radicand) =>
{
    if (radicand < 0)
    {
        var errorType = new MathErrorFeature
        {
            MathError = MathErrorType.NegativeRadicandError
        };
        context.Features.Set(errorType);
        return Results.BadRequest();
    }

    return Results.Ok(Math.Sqrt(radicand));
});

app.Run();
```

#### Problem details from Middleware

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStatusCodePages();

// Middleware to handle writing problem details to the response.
app.Use(async (context, next) =>
{
    await next(context);
    var mathErrorFeature = context.Features.Get<MathErrorFeature>();
    if (mathErrorFeature is not null)
    {
        if (context.RequestServices.GetService<IProblemDetailsService>() is
                                                           { } problemDetailsService)
        {
            (string Detail, string Type) details = mathErrorFeature.MathError switch
            {
                MathErrorType.DivisionByZeroError => ("Divison by zero is not defined.",
                "https://en.wikipedia.org/wiki/Division_by_zero"),
                _ => ("Negative or complex numbers are not valid input.", 
                "https://en.wikipedia.org/wiki/Square_root")
            };

            await problemDetailsService.WriteAsync(new ProblemDetailsContext
            {
                HttpContext = context,
                ProblemDetails =
                {
                    Title = "Bad Input",
                    Detail = details.Detail,
                    Type = details.Type
                }
            });
        }
    }
});

// /divide?numerator=2&denominator=4
app.MapGet("/divide", (HttpContext context, double numerator, double denominator) =>
{
    if (denominator == 0)
    {
        var errorType = new MathErrorFeature { MathError =
                                               MathErrorType.DivisionByZeroError };
        context.Features.Set(errorType);
        return Results.BadRequest();
    }

    return Results.Ok(numerator / denominator);
});

// /squareroot?radicand=16
app.MapGet("/squareroot", (HttpContext context, double radicand) =>
{
    if (radicand < 0)
    {
        var errorType = new MathErrorFeature { MathError =
                                               MathErrorType.NegativeRadicandError };
        context.Features.Set(errorType);
        return Results.BadRequest();
    }

    return Results.Ok(Math.Sqrt(radicand));
});

app.MapControllers();

app.Run();
```

```csharp
[Route("api/[controller]/[action]")]
[ApiController]
public class ValuesController : ControllerBase
{
    // /api/values/divide/1/2
    [HttpGet("{Numerator}/{Denominator}")]
    public IActionResult Divide(double Numerator, double Denominator)
    {
        if (Denominator == 0)
        {
            var errorType = new MathErrorFeature
            {
                MathError = MathErrorType.DivisionByZeroError
            };
            HttpContext.Features.Set(errorType);
            return BadRequest();
        }

        return Ok(Numerator / Denominator);
    }

    // /api/values/squareroot/4
    [HttpGet("{radicand}")]
    public IActionResult Squareroot(double radicand)
    {
        if (radicand < 0)
        {
            var errorType = new MathErrorFeature
            {
                MathError = MathErrorType.NegativeRadicandError
            };
            HttpContext.Features.Set(errorType);
            return BadRequest();
        }

        return Ok(Math.Sqrt(radicand));
    }

}
```

```csharp
[Route("api/[controller]/[action]")]
[ApiController]
public class Values3Controller : ControllerBase
{
    // /api/values3/divide/1/2
    [HttpGet("{Numerator}/{Denominator}")]
    public IActionResult Divide(double Numerator, double Denominator)
    {
        if (Denominator == 0)
        {
            var errorType = new MathErrorFeature
            {
                MathError = MathErrorType.DivisionByZeroError
            };
            HttpContext.Features.Set(errorType);
            return Problem(
                title: "Bad Input",
                detail: "Divison by zero is not defined.",
                type: "https://en.wikipedia.org/wiki/Division_by_zero",
                statusCode: StatusCodes.Status400BadRequest
                );
        }

        return Ok(Numerator / Denominator);
    }

    // /api/values3/squareroot/4
    [HttpGet("{radicand}")]
    public IActionResult Squareroot(double radicand)
    {
        if (radicand < 0)
        {
            var errorType = new MathErrorFeature
            {
                MathError = MathErrorType.NegativeRadicandError
            };
            HttpContext.Features.Set(errorType);
            return Problem(
                title: "Bad Input",
                detail: "Negative or complex numbers are not valid input.",
                type: "https://en.wikipedia.org/wiki/Square_root",
                statusCode: StatusCodes.Status400BadRequest
                );
        }

        return Ok(Math.Sqrt(radicand));
    }

}
```

## Produce a ```ProblemDetails``` payload for exceptions

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.MapControllers();
app.Run();
```

```json
{
"type":"https://tools.ietf.org/html/rfc7231#section-6.6.1",
"title":"An error occurred while processing your request.",
"status":500,"traceId":"00-b644<snip>-00"
}
```

```csharp
using Microsoft.AspNetCore.Diagnostics;
using static System.Net.Mime.MediaTypeNames;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler(exceptionHandlerApp =>
    {
        exceptionHandlerApp.Run(async context =>
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = Text.Plain;

            var title = "Bad Input";
            var detail = "Invalid input";
            var type = "https://errors.example.com/badInput";

            if (context.RequestServices.GetService<IProblemDetailsService>() is
                { } problemDetailsService)
            {
                var exceptionHandlerFeature =
               context.Features.Get<IExceptionHandlerFeature>();

                var exceptionType = exceptionHandlerFeature?.Error;
                if (exceptionType != null &&
                   exceptionType.Message.Contains("infinity"))
                {
                    title = "Argument exception";
                    detail = "Invalid input";
                    type = "https://errors.example.com/argumentException";
                }

                await problemDetailsService.WriteAsync(new ProblemDetailsContext
                {
                    HttpContext = context,
                    ProblemDetails =
                {
                    Title = title,
                    Detail = detail,
                    Type = type
                }
                });
            }
        });
    });
}

app.MapControllers();
app.Run();
```

> Warning
Do not serve sensitive error information to clients. Serving errors is a security risk.

## Additional resources

 - View or download sample code (how to download)

 - Troubleshoot ASP.NET Core on Azure App Service and IIS

 - Common error troubleshooting for Azure App Service and IIS with ASP.NET Core

 - Handle errors in ASP.NET Core controller-based web APIs

 - Handle errors in minimal APIs.

Ref: [Handle errors in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-8.0)