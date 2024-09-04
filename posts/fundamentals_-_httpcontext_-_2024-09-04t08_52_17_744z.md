---
title: Fundamentals - HttpContext
published: true
date: 2024-09-04 08:52:17
tags: Summary, AspNetCore
description: HttpContext encapsulates all information about an individual HTTP request and response. An HttpContext instance is initialized when an HTTP request is received. The HttpContext instance is accessible by middleware and app frameworks such as Web API controllers, Razor Pages, SignalR, gRPC, and more.
image:
---

## In this article

 ```HttpContext``` encapsulates all information about an individual HTTP request and response. An ```HttpContext``` instance is initialized when an HTTP request is received. The ```HttpContext``` instance is accessible by middleware and app frameworks such as Web API controllers, Razor Pages, SignalR, gRPC, and more.

For more information about accessing the ```HttpContext```, see Access ```HttpContext``` in ASP.NET Core.

## ```HttpRequest```

 ```HttpContext```.Request provides access to ```HttpRequest```. ```HttpRequest``` has information about the incoming HTTP request, and it's initialized when an HTTP request is received by the server. ```HttpRequest``` isn't read-only, and middleware can change request values in the middleware pipeline.

Commonly used members on ```HttpRequest``` include:

<table><thead>
<tr>
<th>Property</th>
<th>Description</th>
<th>Example</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httprequest.path#microsoft-aspnetcore-http-httprequest-path" class="no-loc" data-linktype="absolute-path">HttpRequest.Path</a></td>
<td>The request path.</td>
<td><code>/en/article/getstarted</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httprequest.method#microsoft-aspnetcore-http-httprequest-method" class="no-loc" data-linktype="absolute-path">HttpRequest.Method</a></td>
<td>The request method.</td>
<td><code>GET</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httprequest.headers#microsoft-aspnetcore-http-httprequest-headers" class="no-loc" data-linktype="absolute-path">HttpRequest.Headers</a></td>
<td>A collection of request headers.</td>
<td><code>user-agent=Edge</code><br><code>x-custom-header=MyValue</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httprequest.routevalues#microsoft-aspnetcore-http-httprequest-routevalues" class="no-loc" data-linktype="absolute-path">HttpRequest.RouteValues</a></td>
<td>A collection of route values. The collection is set when the request is matched to a route.</td>
<td><code>language=en</code><br><code>article=getstarted</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httprequest.query#microsoft-aspnetcore-http-httprequest-query" class="no-loc" data-linktype="absolute-path">HttpRequest.Query</a></td>
<td>A collection of query values parsed from <a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httprequest.querystring#microsoft-aspnetcore-http-httprequest-querystring" class="no-loc" data-linktype="absolute-path">QueryString</a>.</td>
<td><code>filter=hello</code><br><code>page=1</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httprequest.readformasync#microsoft-aspnetcore-http-httprequest-readformasync(system-threading-cancellationtoken)" data-linktype="absolute-path">HttpRequest.ReadFormAsync()</a></td>
<td>A method that reads the request body as a form and returns a form values collection. For information about why <code>ReadFormAsync</code> should be used to access form data, see <a href="best-practices?view=aspnetcore-8.0#prefer-readformasync-over-requestform" data-linktype="relative-path">Prefer ```ReadFormAsync``` over Request.Form</a>.</td>
<td><code>email=user@contoso.com</code><br><code>password=TNkt4taM</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httprequest.body#microsoft-aspnetcore-http-httprequest-body" class="no-loc" data-linktype="absolute-path">HttpRequest.Body</a></td>
<td>A <a href="/en-us/dotnet/api/system.io.stream" class="no-loc" data-linktype="absolute-path">Stream</a> for reading the request body.</td>
<td>UTF-8 JSON payload</td>
</tr>
</tbody></table>

### Get request headers

 ```HttpRequest.Headers``` provides access to the request headers sent with the HTTP request. There are two ways to access headers using this collection:

- Provide the header name to the indexer on the header collection. The header name isn't case-sensitive. The indexer can access any header value.

- The header collection also has properties for getting and setting commonly used HTTP headers. The properties provide a fast, IntelliSense driven way to access headers.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", (HttpRequest request) =>
{
    var userAgent = request.Headers.UserAgent;
    var customHeader = request.Headers["x-custom-header"];

    return Results.Ok(new { userAgent = userAgent, customHeader = customHeader });
});

app.Run();
```

For information on efficiently handling headers that appear more than once, see A brief look at StringValues.

### Read request body

An HTTP request can include a request body. The request body is data associated with the request, such as the content of an HTML form, UTF-8 JSON payload, or a file.

 ```HttpRequest.Body``` allows the request body to be read with Stream:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/uploadstream", async (IConfiguration config, HttpContext context) =>
{
    var filePath = Path.Combine(config["StoredFilesPath"], Path.GetRandomFileName());

    await using var writeStream = File.Create(filePath);
    await context.Request.Body.CopyToAsync(writeStream);
});

app.Run();
```

 ```HttpRequest.Body``` can be read directly or used with other APIs that accept stream.

> Note
Minimal APIs supports binding ```HttpRequest.Body``` directly to a Stream parameter.

#### Enable request body buffering

Forward-only reading of the request body reduces memory usage.

The ```EnableBuffering``` extension method enables buffering of the HTTP request body and is the recommended way to enable multiple reads. Because a request can be any size, ```EnableBuffering``` supports options for buffering large request bodies to disk, or rejecting them entirely.

The middleware in the following example:

- Enables multiple reads with ```EnableBuffering```. It must be called before reading the request body.

- Reads the request body.

- Rewinds the request body to the start so other middleware or the endpoint can read it.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    context.Request.EnableBuffering();
    await ReadRequestBody(context.Request.Body);
    context.Request.Body.Position = 0;
    
    await next.Invoke();
});

app.Run();
```

#### ```BodyReader```

An alternative way to read the request body is to use the ```HttpRequest.BodyReader``` property. The ```BodyReader``` property exposes the request body as a PipeReader. This API is from I/O pipelines, an advanced, high-performance way to read the request body.

The reader directly accesses the request body and manages memory on the caller's behalf. Unlike ```HttpRequest.Body```, the reader doesn't copy request data into a buffer. However, a reader is more complicated to use than a stream and should be used with caution.

For information on how to read content from ```BodyReader```, see I/O pipelines PipeReader.

## ```HttpResponse```

 ```HttpContext.Response``` provides access to ```HttpResponse```. ```HttpResponse``` is used to set information on the HTTP response sent back to the client.

Commonly used members on ```HttpResponse``` include:

<table><thead>
<tr>
<th>Property</th>
<th>Description</th>
<th>Example</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.statuscode#microsoft-aspnetcore-http-httpresponse-statuscode" class="no-loc" data-linktype="absolute-path">HttpResponse.StatusCode</a></td>
<td>The response code. Must be set before writing to the response body.</td>
<td><code>200</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.contenttype#microsoft-aspnetcore-http-httpresponse-contenttype" class="no-loc" data-linktype="absolute-path">HttpResponse.ContentType</a></td>
<td>The response <code>content-type</code> header. Must be set before writing to the response body.</td>
<td><code>application/json</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.headers#microsoft-aspnetcore-http-httpresponse-headers" class="no-loc" data-linktype="absolute-path">HttpResponse.Headers</a></td>
<td>A collection of response headers. Must be set before writing to the response body.</td>
<td><code>server=Kestrel</code><br><code>x-custom-header=MyValue</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.body#microsoft-aspnetcore-http-httpresponse-body" class="no-loc" data-linktype="absolute-path">HttpResponse.Body</a></td>
<td>A <a href="/en-us/dotnet/api/system.io.stream" class="no-loc" data-linktype="absolute-path">Stream</a> for writing the response body.</td>
<td>Generated web page</td>
</tr>
</tbody></table>

### Set response headers

 ```HttpResponse.Headers``` provides access to the response headers sent with the HTTP response. There are two ways to access headers using this collection:

- Provide the header name to the indexer on the header collection. The header name isn't case-sensitive. The indexer can access any header value.

- The header collection also has properties for getting and setting commonly used HTTP headers. The properties provide a fast, IntelliSense driven way to access headers.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", (HttpResponse response) =>
{
    response.Headers.CacheControl = "no-cache";
    response.Headers["x-custom-header"] = "Custom value";

    return Results.File(File.OpenRead("helloworld.txt"));
});

app.Run();
```

An app can't modify headers after the response has started. Once the response starts, the headers are sent to the client. A response is started by flushing the response body or calling ```HttpResponse.StartAsync(CancellationToken)```. The ```HttpResponse.HasStarted``` property indicates whether the response has started. An error is thrown when attempting to modify headers after the response has started:

> Note
Unless response buffering is enabled, all write operations (for example, WriteAsync) flush the response body internally and mark the response as started. Response buffering is disabled by default.

### Write response body

An HTTP response can include a response body. The response body is data associated with the response, such as generated web page content, UTF-8 JSON payload, or a file.

 ```HttpResponse.Body``` allows the response body to be written with Stream:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/downloadfile", async (IConfiguration config, HttpContext context) =>
{
    var filePath = Path.Combine(config["StoredFilesPath"], "helloworld.txt");

    await using var fileStream = File.OpenRead(filePath);
    await fileStream.CopyToAsync(context.Response.Body);
});

app.Run();
```

 ```HttpResponse.Body``` can be written directly or used with other APIs that write to a stream.

#### ```BodyWriter```

An alternative way to write the response body is to use the ```HttpResponse.BodyWriter``` property. The ```BodyWriter``` property exposes the response body as a PipeWriter. This API is from I/O pipelines, and it's an advanced, high-performance way to write the response.

The writer provides direct access to the response body and manages memory on the caller's behalf. Unlike ```HttpResponse.Body```, the write doesn't copy request data into a buffer. However, a writer is more complicated to use than a stream and writer code should be thoroughly tested.

For information on how to write content to ```BodyWriter```, see I/O pipelines PipeWriter.

### Set response trailers

Trailers are headers sent with the response after the response body is complete.

The following code sets trailers using AppendTrailer:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", (HttpResponse response) =>
{
    // Write body
    response.WriteAsync("Hello world");

    if (response.SupportsTrailers())
    {
        response.AppendTrailer("trailername", "TrailerValue");
    }
});

app.Run();
```

## ```RequestAborted```

The ```HttpContext.RequestAborted``` cancellation token can be used to notify that the HTTP request has been aborted by the client or server. The cancellation token should be passed to long-running tasks so they can be canceled if the request is aborted. For example, aborting a database query or HTTP request to get data to return in the response.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var httpClient = new HttpClient();
app.MapPost("/books/{bookId}", async (int bookId, HttpContext context) =>
{
    var stream = await httpClient.GetStreamAsync(
        $"http://contoso/books/{bookId}.json", context.RequestAborted);

    // Proxy the response as JSON
    return Results.Stream(stream, "application/json");
});

app.Run();
```

The ```RequestAborted``` cancellation token doesn't need to be used for request body read operations because reads always throw immediately when the request is aborted. The ```RequestAborted``` token is also usually unnecessary when writing response bodies, because writes immediately no-op when the request is aborted.

In some cases, passing the ```RequestAborted``` token to write operations can be a convenient way to force a write loop to exit early with an OperationCanceledException. However, it's typically better to pass the ```RequestAborted``` token into any asynchronous operations responsible for retrieving the response body content instead.

> Note
Minimal APIs supports binding ```HttpContext.RequestAborted``` directly to a CancellationToken parameter.

## `Abort()`

The ```HttpContext.Abort()``` method can be used to abort an HTTP request from the server. Aborting the HTTP request immediately triggers the ```HttpContext.RequestAborted``` cancellation token and sends a notification to the client that the server has aborted the request.

The middleware in the following example:

- Adds a custom check for malicious requests.

- Aborts the HTTP request if the request is malicious.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    if (RequestAppearsMalicious(context.Request))
    {
        // Malicious requests don't even deserve an error response (e.g. 400).
        context.Abort();
        return;
    }

    await next.Invoke();
});

app.Run();
```

## ```User```

The ```HttpContext.User``` property is used to get or set the user, represented by ClaimsPrincipal, for the request. The ClaimsPrincipal is typically set by ASP.NET Core authentication.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/user/current", [Authorize] async (HttpContext context) =>
{
    var user = await GetUserAsync(context.User.Identity.Name);
    return Results.Ok(user);
});

app.Run();
```

> Note
Minimal APIs supports binding ```HttpContext.User``` directly to a ClaimsPrincipal parameter.

## ```Features```

The ```HttpContext.Features``` property provides access to the collection of feature interfaces for the current request. Since the feature collection is mutable even within the context of a request, middleware can be used to modify the collection and add support for additional features. Some advanced features are only available by accessing the associated interface through the feature collection.

The following example:

- Gets `IHttpMinRequestBodyDataRateFeature` from the features collection.

- Sets `MinDataRate` to ```null```. This removes the minimum data rate that the request body must be sent by the client for this HTTP request.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/long-running-stream", async (HttpContext context) =>
{
    var feature = context.Features.Get<IHttpMinRequestBodyDataRateFeature>();
    if (feature != null)
    {
        feature.MinDataRate = null;
    }

    // await and read long-running stream from request body.
    await Task.Yield();
});

app.Run();
```

For more information about using request features and ```HttpContext```, see Request ```Features``` in ASP.NET Core.

## ```HttpContext``` isn't thread safe

This article primarily discusses using ```HttpContext``` in request and response flow from Razor Pages, controllers, middleware, etc. Consider the following when using ```HttpContext``` outside the request and response flow:

- The ```HttpContext``` is NOT thread safe, accessing it from multiple threads can result in exceptions, data corruption and generally unpredictable results.

- The ```IHttpContextAccessor``` interface should be used with caution. As always, the ```HttpContext``` must not be captured outside of the request flow.  ```IHttpContextAccessor```:

  - Relies on `AsyncLocal<T>` which can have a negative performance impact on asynchronous calls.

  - Creates a dependency on "ambient state" which can make testing more difficult.

- ```IHttpContextAccessor.HttpContext``` may be ```null``` if accessed outside of the request flow.

- To access information from ```HttpContext``` outside the request flow, copy the information inside the request flow. Be careful to copy the actual data and not just references. For example, rather than copying a reference to an ```IHeaderDictionary```, copy the relevant header values or copy the entire dictionary key by key before leaving the request flow.

- Don't capture ```IHttpContextAccessor.HttpContext``` in a constructor.

The following sample logs GitHub branches when requested from the ```/branch``` endpoint:

```csharp
using System.Text.Json;
using HttpContextInBackgroundThread;
using Microsoft.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddHostedService<PeriodicBranchesLoggerService>();

builder.Services.AddHttpClient("GitHub", httpClient =>
{
    httpClient.BaseAddress = new Uri("https://api.github.com/");

    // The GitHub API requires two headers. The Use-Agent header is added
    // dynamically through UserAgentHeaderHandler
    httpClient.DefaultRequestHeaders.Add(
        HeaderNames.Accept, "application/vnd.github.v3+json");
}).AddHttpMessageHandler<UserAgentHeaderHandler>();

builder.Services.AddTransient<UserAgentHeaderHandler>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapGet("/branches", async (IHttpClientFactory httpClientFactory,
                         HttpContext context, Logger<Program> logger) =>
{
    var httpClient = httpClientFactory.CreateClient("GitHub");
    var httpResponseMessage = await httpClient.GetAsync(
        "repos/dotnet/AspNetCore.Docs/branches");

    if (!httpResponseMessage.IsSuccessStatusCode) 
        return Results.BadRequest();

    await using var contentStream =
        await httpResponseMessage.Content.ReadAsStreamAsync();

    var response = await JsonSerializer.DeserializeAsync
        <IEnumerable<GitHubBranch>>(contentStream);

    app.Logger.LogInformation($"/branches request: " +
                              $"{JsonSerializer.Serialize(response)}");

    return Results.Ok(response);
});

app.Run();
```

The GitHub API requires two headers. The ```User-Agent``` header is added dynamically by the ```UserAgentHeaderHandler```:

```csharp
using System.Text.Json;
using HttpContextInBackgroundThread;
using Microsoft.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddHostedService<PeriodicBranchesLoggerService>();

builder.Services.AddHttpClient("GitHub", httpClient =>
{
    httpClient.BaseAddress = new Uri("https://api.github.com/");

    // The GitHub API requires two headers. The Use-Agent header is added
    // dynamically through UserAgentHeaderHandler
    httpClient.DefaultRequestHeaders.Add(
        HeaderNames.Accept, "application/vnd.github.v3+json");
}).AddHttpMessageHandler<UserAgentHeaderHandler>();

builder.Services.AddTransient<UserAgentHeaderHandler>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapGet("/branches", async (IHttpClientFactory httpClientFactory,
                         HttpContext context, Logger<Program> logger) =>
{
    var httpClient = httpClientFactory.CreateClient("GitHub");
    var httpResponseMessage = await httpClient.GetAsync(
        "repos/dotnet/AspNetCore.Docs/branches");

    if (!httpResponseMessage.IsSuccessStatusCode) 
        return Results.BadRequest();

    await using var contentStream =
        await httpResponseMessage.Content.ReadAsStreamAsync();

    var response = await JsonSerializer.DeserializeAsync
        <IEnumerable<GitHubBranch>>(contentStream);

    app.Logger.LogInformation($"/branches request: " +
                              $"{JsonSerializer.Serialize(response)}");

    return Results.Ok(response);
});

app.Run();
```

The ```UserAgentHeaderHandler```:

```csharp
using Microsoft.Net.Http.Headers;

namespace HttpContextInBackgroundThread;

public class UserAgentHeaderHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger _logger;

    public UserAgentHeaderHandler(IHttpContextAccessor httpContextAccessor,
                                  ILogger<UserAgentHeaderHandler> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    protected override async Task<HttpResponseMessage> 
                                    SendAsync(HttpRequestMessage request, 
                                    CancellationToken cancellationToken)
    {
        var contextRequest = _httpContextAccessor.HttpContext?.Request;
        string? userAgentString = contextRequest?.Headers["user-agent"].ToString();
        
        if (string.IsNullOrEmpty(userAgentString))
        {
            userAgentString = "Unknown";
        }

        request.Headers.Add(HeaderNames.UserAgent, userAgentString);
        _logger.LogInformation($"User-Agent: {userAgentString}");

        return await base.SendAsync(request, cancellationToken);
    }
}
```

In the preceding code, when the ```HttpContext``` is ```null```, the ```userAgent``` string is set to "Unknown". If possible, ```HttpContext``` should be explicitly passed to the service. Explicitly passing in ```HttpContext``` data:

- Makes the service API more useable outside the request flow.

- Is better for performance.

- Makes the code easier to understand and reason about than relying on ambient state.

When the service must access ```HttpContext```, it should account for the possibility of ```HttpContext``` being ```null``` when not called from a request thread.

The application also includes ```PeriodicBranchesLoggerService```, which logs the open GitHub branches of the specified repository every 30 seconds:

```csharp
using System.Text.Json;

namespace HttpContextInBackgroundThread;

public class PeriodicBranchesLoggerService : BackgroundService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger _logger;
    private readonly PeriodicTimer _timer;

    public PeriodicBranchesLoggerService(IHttpClientFactory httpClientFactory,
                                         ILogger<PeriodicBranchesLoggerService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (await _timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                // Cancel sending the request to sync branches if it takes too long
                // rather than miss sending the next request scheduled 30 seconds from now.
                // Having a single loop prevents this service from sending an unbounded
                // number of requests simultaneously.
                using var syncTokenSource = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
                syncTokenSource.CancelAfter(TimeSpan.FromSeconds(30));
                
                var httpClient = _httpClientFactory.CreateClient("GitHub");
                var httpResponseMessage = await httpClient.GetAsync("repos/dotnet/AspNetCore.Docs/branches",
                                                                    stoppingToken);

                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    await using var contentStream =
                        await httpResponseMessage.Content.ReadAsStreamAsync(stoppingToken);

                    // Sync the response with preferred datastore.
                    var response = await JsonSerializer.DeserializeAsync<
                        IEnumerable<GitHubBranch>>(contentStream, cancellationToken: stoppingToken);

                    _logger.LogInformation(
                        $"Branch sync successful! Response: {JsonSerializer.Serialize(response)}");
                }
                else
                {
                    _logger.LogError(1, $"Branch sync failed! HTTP status code: {httpResponseMessage.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(1, ex, "Branch sync failed!");
            }
        }
    }

    public override Task StopAsync(CancellationToken stoppingToken)
    {
        // This will cause any active call to WaitForNextTickAsync() to return false immediately.
        _timer.Dispose();
        // This will cancel the stoppingToken and await ExecuteAsync(stoppingToken).
        return base.StopAsync(stoppingToken);
    }
}
```

 ```PeriodicBranchesLoggerService``` is a hosted service, which runs outside the request and response flow. Logging from the ```PeriodicBranchesLoggerService``` has a ```null``` ```HttpContext```. The ```PeriodicBranchesLoggerService``` was written to not depend on the ```HttpContext```.

```csharp
using System.Text.Json;
using HttpContextInBackgroundThread;
using Microsoft.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddHostedService<PeriodicBranchesLoggerService>();

builder.Services.AddHttpClient("GitHub", httpClient =>
{
```

Ref: [Use ```HttpContext``` in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/use-http-context?view=aspnetcore-8.0)