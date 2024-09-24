---
title: Performance - Caching - Response caching
published: true
date: 2024-09-24 04:00:35
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - Enables caching server responses based on HTTP cache headers. Implements the standard HTTP caching semantics. Caches based on HTTP cache headers like proxies do.

 - Is typically not beneficial for UI apps such as Razor Pages because browsers generally set request headers that prevent caching. Output caching, which is available in ASP.NET Core 7.0 and later, benefits UI apps. With output caching, configuration decides what should be cached independently of HTTP headers.

 - May be beneficial for ```public``` GET or HEAD API requests from clients where the Conditions for caching are met.

## HTTP-based response caching

<table><thead>
<tr>
<th>Directive</th>
<th>Action</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://www.rfc-editor.org/rfc/rfc9111#cache-response-directive.public" data-linktype="external">public</a></td>
<td>A cache may store the response.</td>
</tr>
<tr>
<td><a href="https://www.rfc-editor.org/rfc/rfc9111#cache-response-directive.private" data-linktype="external">private</a></td>
<td>The response must not be stored by a shared cache. A ```private``` cache may store and reuse the response.</td>
</tr>
<tr>
<td><a href="https://www.rfc-editor.org/rfc/rfc9111#cache-response-directive.max-age" data-linktype="external">max-age</a></td>
<td>The client doesn't accept a response whose age is greater than the specified number of seconds. Examples: <code>max-age=60</code> (60 seconds), <code>max-age=2592000</code> (1 month)</td>
</tr>
<tr>
<td><a href="https://www.rfc-editor.org/rfc/rfc9111#cache-response-directive.no-cache" data-linktype="external">no-cache</a></td>
<td><strong>On requests</strong>: A cache must not use a stored response to satisfy the request. The origin server regenerates the response for the client, and the middleware updates the stored response in its cache.<br><br><strong>On responses</strong>: The response must not be used for a subsequent request without validation on the origin server.</td>
</tr>
<tr>
<td><a href="https://www.rfc-editor.org/rfc/rfc9111#cache-response-directive.no-store" data-linktype="external">no-store</a></td>
<td><strong>On requests</strong>: A cache must not store the request.<br><br><strong>On responses</strong>: A cache must not store any part of the response.</td>
</tr>
</tbody></table>

<table><thead>
<tr>
<th>Header</th>
<th>Function</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://www.rfc-editor.org/rfc/rfc9111#field.age" data-linktype="external">Age</a></td>
<td>An estimate of the amount of time in seconds since the response was generated or successfully validated at the origin server.</td>
</tr>
<tr>
<td><a href="https://www.rfc-editor.org/rfc/rfc9111#field.expires" data-linktype="external">Expires</a></td>
<td>The time after which the response is considered stale.</td>
</tr>
<tr>
<td><a href="https://www.rfc-editor.org/rfc/rfc9111#field.pragma" data-linktype="external">Pragma</a></td>
<td>Exists for backwards compatibility with HTTP/1.0 caches for setting <code>no-cache</code> behavior. If the <code>Cache-Control</code> header is present, the <code>Pragma</code> header is ignored.</td>
</tr>
<tr>
<td><a href="https://www.rfc-editor.org/rfc/rfc9110#field.vary" data-linktype="external">Vary</a></td>
<td>Specifies that a cached response must not be sent unless all of the <code>Vary</code> header fields match in both the cached response's original request and the new request.</td>
</tr>
</tbody></table>

## HTTP-based caching respects request ```Cache-Control``` directives

## ResponseCache attribute

> Warning
Disable caching for content that contains information for authenticated clients. Caching should only be enabled for content that doesn't change based on a user's identity or whether a user is signed in.

<table><thead>
<tr>
<th>Request</th>
<th>Returned from</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>http://example.com?key1=value1</code></td>
<td>Server</td>
</tr>
<tr>
<td><code>http://example.com?key1=value1</code></td>
<td>Middleware</td>
</tr>
<tr>
<td><code>http://example.com?key1=NewValue</code></td>
<td>Server</td>
</tr>
</tbody></table>

 - Removes any existing headers for ```Vary```, ```Cache-Control```, and ```Pragma```.

 - Writes out the appropriate headers based on the properties set in the ```ResponseCacheAttribute```.

 - Updates the response caching HTTP feature if VaryByQueryKeys is set.

### ```Vary```

```csharp
[ApiController]
public class TimeController : ControllerBase
{
    [Route("api/[controller]")]
    [HttpGet]
    [ResponseCache(VaryByHeader = "User-Agent", Duration = 30)]
    public ContentResult GetTime() => Content(
                      DateTime.Now.Millisecond.ToString());
```

```text
Cache-Control: public,max-age=30
Vary: User-Agent
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddResponseCaching();

var app = builder.Build();

app.UseHttpsRedirection();

// UseCors must be called before UseResponseCaching
//app.UseCors();

app.UseResponseCaching();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

### ```NoStore``` and ```Location.None```

 - ```Cache-Control``` is set to ```no-store,no-cache```.

 - ```Pragma``` is set to ```no-cache```.

```csharp
[Route("api/[controller]/ticks")]
[HttpGet]
[ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
public ContentResult GetTimeTicks() => Content(
                  DateTime.Now.Ticks.ToString());
```

```csharp
builder.Services.AddControllersWithViews().AddMvcOptions(options => 
    options.Filters.Add(
        new ResponseCacheAttribute
        {
            NoStore = true, 
            Location = ResponseCacheLocation.None
        }));
```

### Location and Duration

```csharp
[Route("api/[controller]/ms")]
[HttpGet]
[ResponseCache(Duration = 10, Location = ResponseCacheLocation.Any, NoStore = false)]
public ContentResult GetTimeMS() => Content(
                  DateTime.Now.Millisecond.ToString());
```

### Cache profiles

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCaching();
builder.Services.AddControllers(options =>
{
    options.CacheProfiles.Add("Default30",
        new CacheProfile()
        {
            Duration = 30
        });
});

var app = builder.Build();

app.UseHttpsRedirection();

// UseCors must be called before UseResponseCaching
//app.UseCors();

app.UseResponseCaching();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

```csharp
[ApiController]
[ResponseCache(CacheProfileName = "Default30")]
public class Time2Controller : ControllerBase
{
    [Route("api/[controller]")]
    [HttpGet]
    public ContentResult GetTime() => Content(
                      DateTime.Now.Millisecond.ToString());

    [Route("api/[controller]/ticks")]
    [HttpGet]
    public ContentResult GetTimeTicks() => Content(
                      DateTime.Now.Ticks.ToString());
}
```

 - Razor Pages: Attributes can't be applied to handler methods. Browsers used with UI apps prevent response caching.

 - MVC controllers.

 - MVC action methods: Method-level attributes override the settings specified in class-level attributes.

```csharp
[ApiController]
[ResponseCache(VaryByHeader = "User-Agent", Duration = 30)]
public class Time4Controller : ControllerBase
{
    [Route("api/[controller]")]
    [HttpGet]
    public ContentResult GetTime() => Content(
                      DateTime.Now.Millisecond.ToString());

    [Route("api/[controller]/ticks")]
    [HttpGet]
    public ContentResult GetTimeTicks() => Content(
                  DateTime.Now.Ticks.ToString());

    [Route("api/[controller]/ms")]
    [HttpGet]
    [ResponseCache(Duration = 10, Location = ResponseCacheLocation.Any, NoStore = false)]
    public ContentResult GetTimeMS() => Content(
                      DateTime.Now.Millisecond.ToString());
}
```

## Additional resources

 - Storing Responses in Caches

 - ```Cache-Control```

 - Cache in-memory in ASP.NET Core

 - Distributed caching in ASP.NET Core

 - Detect changes with change tokens in ASP.NET Core

 - Response Caching Middleware in ASP.NET Core

 - Cache Tag Helper in ASP.NET Core MVC

 - Distributed Cache Tag Helper in ASP.NET Core

Ref: [Response caching in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/response?view=aspnetcore-8.0)