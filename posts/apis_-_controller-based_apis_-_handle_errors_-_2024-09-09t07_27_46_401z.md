---
title: APIs - Controller-based APIs - Handle errors
published: true
date: 2024-09-09 07:27:46
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Developer Exception Page

 - Running in the Development environment.

 - The app was created with the current templates, that is, by using WebApplication.CreateBuilder.

> Warning
Don't enable the Developer Exception Page unless the app is running in the Development environment. Don't share detailed exception information publicly when the app runs in production. For more information on configuring environments, see Use multiple environments in ASP.NET Core.

 - Stack trace

 - Query string parameters, if any

 - Cookies, if any

 - Headers

 - Endpoint metadata, if any

![Developer exception page animated to show each tab selected.!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling/_static/aspnetcore-developer-page-improvements.gif?view=aspnetcore-8.0 "Developer exception page animated to show each tab selected.")

```text
Status: 500 Internal Server Error
Time: 9.39 msSize: 480 bytes
FormattedRawHeadersRequest
Body
text/plain; charset=utf-8, 480 bytes
System.InvalidOperationException: Sample Exception
   at WebApplicationMinimal.Program.<>c.<Main>b__0_0() in C:\Source\WebApplicationMinimal\Program.cs:line 12
   at lambda_method1(Closure, Object, HttpContext)
   at Microsoft.AspNetCore.Diagnostics.DeveloperExceptionPageMiddlewareImpl.Invoke(HttpContext context)

HEADERS
=======
Accept: text/plain
Host: localhost:7267
traceparent: 00-0eab195ea19d07b90a46cd7d6bf2f
```

 - Add the following controller action to a controller-based API. The action throws an exception when the endpoint is requested.

```csharp
[HttpGet("Throw")]
public IActionResult Throw() =>
    throw new Exception("Sample exception.");
```

 - Run the app in the development environment.

 - Go to the endpoint defined by the controller action.

## Exception handler

 - In ```Program.cs```, call UseExceptionHandler to add the Exception Handling Middleware:

```csharp
var app = builder.Build();

app.UseHttpsRedirection();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
}

app.UseAuthorization();

app.MapControllers();

app.Run();
```

 - Configure a controller action to respond to the ```/error``` route:

```csharp
[Route("/error")]
public IActionResult HandleError() =>
    Problem();
```

> Warning
Don't mark the error handler action method with HTTP method attributes, such as ```HttpGet```. Explicit verbs prevent some requests from reaching the action method.
For web APIs that use Swagger / OpenAPI, mark the error handler action with the `[ApiExplorerSettings]` attribute and set its IgnoreApi property to ```true```. This attribute configuration excludes the error handler action from the app's OpenAPI specification:

Allow anonymous access to the method if unauthenticated users should see the error.

```csharp
[ApiExplorerSettings(IgnoreApi = true)]
```

 - In ```Program.cs```, register environment-specific Exception Handling Middleware instances:
In the preceding code, the middleware is registered with:

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error-development");
}
else
{
    app.UseExceptionHandler("/error");
}
```

   - A route of ```/error-development``` in the Development environment.

   - A route of ```/error``` in non-Development environments.

 - Add controller actions for both the Development and non-Development routes:
```csharp
[Route("/error-development")]
public IActionResult HandleErrorDevelopment(
    [FromServices] IHostEnvironment hostEnvironment)
{
    if (!hostEnvironment.IsDevelopment())
    {
        return NotFound();
    }

    var exceptionHandlerFeature =
        HttpContext.Features.Get<IExceptionHandlerFeature>()!;

    return Problem(
        detail: exceptionHandlerFeature.Error.StackTrace,
        title: exceptionHandlerFeature.Error.Message);
}

[Route("/error")]
public IActionResult HandleError() =>
    Problem();
```

## Use exceptions to modify the response

 - Create a well-known exception ```type``` named ```HttpResponseException```:

```csharp
public class HttpResponseException : Exception
{
    public HttpResponseException(int statusCode, object? value = null) =>
        (StatusCode, Value) = (statusCode, value);

    public int StatusCode { get; }

    public object? Value { get; }
}
```

 - Create an action filter named ```HttpResponseExceptionFilter```:
The preceding filter specifies an ```Order``` of the maximum integer value minus 10. This ```Order``` allows other filters to run at the end of the pipeline.

```csharp
public class HttpResponseExceptionFilter : IActionFilter, IOrderedFilter
{
    public int Order => int.MaxValue - 10;

    public void OnActionExecuting(ActionExecutingContext context) { }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        if (context.Exception is HttpResponseException httpResponseException)
        {
            context.Result = new ObjectResult(httpResponseException.Value)
            {
                StatusCode = httpResponseException.StatusCode
            };

            context.ExceptionHandled = true;
        }
    }
}
```

 - In ```Program.cs```, add the action filter to the filters collection:

```csharp
builder.Services.AddControllers(options =>
{
    options.Filters.Add<HttpResponseExceptionFilter>();
});
```

## Validation failure error response

```csharp
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
            new BadRequestObjectResult(context.ModelState)
            {
                ContentTypes =
                {
                    // using static System.Net.Mime.MediaTypeNames;
                    Application.Json,
                    Application.Xml
                }
            };
    })
    .AddXmlSerializerFormatters();
```

## Client error response

 - Use the problem details service

 - Implement ```ProblemDetailsFactory```

 - Use ```ApiBehaviorOptions.ClientErrorMapping```

### Default problem details response

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

```csharp
[Route("api/[controller]/[action]")]
[ApiController]
public class Values2Controller : ControllerBase
{
    // /api/values2/divide/1/2
    [HttpGet("{Numerator}/{Denominator}")]
    public IActionResult Divide(double Numerator, double Denominator)
    {
        if (Denominator == 0)
        {
            return BadRequest();
        }

        return Ok(Numerator / Denominator);
    }

    // /api/values2 /squareroot/4
    [HttpGet("{radicand}")]
    public IActionResult Squareroot(double radicand)
    {
        if (radicand < 0)
        {
            return BadRequest();
        }

        return Ok(Math.Sqrt(radicand));
    }
}
```

 - The ```/api/values2/divide``` endpoint is called with a zero denominator.

 - The ```/api/values2/squareroot``` endpoint is called with a radicand less than zero.

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "traceId": "00-84c1fd4063c38d9f3900d06e56542d48-85d1d4-00"
}
```

### Problem details service

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

```csharp
[Route("api/[controller]/[action]")]
[ApiController]
public class Values2Controller : ControllerBase
{
    // /api/values2/divide/1/2
    [HttpGet("{Numerator}/{Denominator}")]
    public IActionResult Divide(double Numerator, double Denominator)
    {
        if (Denominator == 0)
        {
            return BadRequest();
        }

        return Ok(Numerator / Denominator);
    }

    // /api/values2 /squareroot/4
    [HttpGet("{radicand}")]
    public IActionResult Squareroot(double radicand)
    {
        if (radicand < 0)
        {
            return BadRequest();
        }

        return Ok(Math.Sqrt(radicand));
    }
}
```

 - An invalid input is supplied.

 - The URI has no matching endpoint.

 - An unhandled exception occurs.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressMapClientErrors = true;
    });

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

#### Customize problem details with ```CustomizeProblemDetails```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddProblemDetails(options =>
        options.CustomizeProblemDetails = (context) =>
        {

            var mathErrorFeature = context.HttpContext.Features
                                                       .Get<MathErrorFeature>();
            if (mathErrorFeature is not null)
            {
                (string Detail, string Type) details = mathErrorFeature.MathError switch
                {
                    MathErrorType.DivisionByZeroError =>
                    ("Divison by zero is not defined.",
                                          "https://wikipedia.org/wiki/Division_by_zero"),
                    _ => ("Negative or complex numbers are not valid input.",
                                          "https://wikipedia.org/wiki/Square_root")
                };

                context.ProblemDetails.Type = details.Type;
                context.ProblemDetails.Title = "Bad Input";
                context.ProblemDetails.Detail = details.Detail;
            }
        }
    );

var app = builder.Build();

app.UseHttpsRedirection();

app.UseStatusCodePages();

app.UseAuthorization();

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
// Custom Http Request Feature
class MathErrorFeature
{
    public MathErrorType MathError { get; set; }
}

// Custom math errors
enum MathErrorType
{
    DivisionByZeroError,
    NegativeRadicandError
}
```

 - The ```/divide``` endpoint is called with a zero denominator.

 - The ```/squareroot``` endpoint is called with a radicand less than zero.

 - The URI has no matching endpoint.

```json
{
  "type": "https://en.wikipedia.org/wiki/Square_root",
  "title": "Bad Input",
  "status": 400,
  "detail": "Negative or complex numbers are not allowed."
}
```

### Implement ```ProblemDetailsFactory```

 - Client error responses

 - Validation failure error responses

 - ControllerBase.Problem and ControllerBase.ValidationProblem

```csharp
builder.Services.AddControllers();
builder.Services.AddTransient<ProblemDetailsFactory, SampleProblemDetailsFactory>();
```

### Use ```ApiBehaviorOptions.ClientErrorMapping```

```csharp
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.ClientErrorMapping[StatusCodes.Status404NotFound].Link =
            "https://httpstatuses.com/404";
    });
```

## Additional resources

 - How to Use ModelState Validation in ASP.NET Core Web API

 - View or download sample code

 - Hellang.Middleware.ProblemDetails

Ref: [Handle errors in ASP.NET Core controller-based web APIs](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors?view=aspnetcore-8.0)