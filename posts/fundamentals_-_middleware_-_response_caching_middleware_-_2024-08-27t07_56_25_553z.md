---
title: Fundamentals - Middleware - Response caching middleware
published: true
date: 2024-08-27 07:56:25
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - Enables caching server responses based on HTTP cache headers. Implements the standard HTTP caching semantics. Caches based on HTTP cache headers like proxies do.

 - Is typically not beneficial for UI apps such as Razor Pages because browsers generally set request headers that prevent caching. Output caching, which is available in ASP.NET Core 7.0 and later, benefits UI apps. With output caching, configuration decides what should be cached independently of HTTP headers.

 - May be beneficial for public GET or HEAD API requests from clients where the Conditions for caching are met.

## Configuration

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCaching();

var app = builder.Build();

app.UseHttpsRedirection();

// UseCors must be called before UseResponseCaching
//app.UseCors();

app.UseResponseCaching();
```

> Warning
UseCors must be called before ```UseResponseCaching``` when using CORS middleware.

 - ```Cache-Control```: Caches cacheable responses for up to 10 seconds.

 - ```Vary```: Configures the middleware to serve a cached response only if the Accept-Encoding header of subsequent requests matches that of the original request.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCaching();

var app = builder.Build();

app.UseHttpsRedirection();

// UseCors must be called before UseResponseCaching
//app.UseCors();

app.UseResponseCaching();

app.Use(async (context, next) =>
{
    context.Response.GetTypedHeaders().CacheControl =
        new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
        {
            Public = true,
            MaxAge = TimeSpan.FromSeconds(10)
        };
    context.Response.Headers[Microsoft.Net.Http.Headers.HeaderNames.Vary] =
        new string[] { "Accept-Encoding" };

    await next();
});

app.MapGet("/", () => DateTime.Now.Millisecond);

app.Run();
```

 - Has a `[ResponseCache]` attribute. This applies even if a property isn't set. For example, omitting the VaryByHeader property will cause the corresponding header to be removed from the response.

> Warning
Responses containing content for authenticated clients must be marked as not cacheable to prevent the middleware from storing and serving those responses. See Conditions for caching for details on how the middleware determines if a response is cacheable.

## Options

<table><thead>
<tr>
<th>Option</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.responsecaching.responsecachingoptions.maximumbodysize#microsoft-aspnetcore-responsecaching-responsecachingoptions-maximumbodysize" class="no-loc" data-linktype="absolute-path">MaximumBodySize</a></td>
<td>The largest cacheable size for the response body in bytes. The default value is <code>64 * 1024 * 1024</code> (64 MB).</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.responsecaching.responsecachingoptions.sizelimit#microsoft-aspnetcore-responsecaching-responsecachingoptions-sizelimit" class="no-loc" data-linktype="absolute-path">SizeLimit</a></td>
<td>The size limit for the response cache middleware in bytes. The default value is <code>100 * 1024 * 1024</code> (100 MB).</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.responsecaching.responsecachingoptions.usecasesensitivepaths#microsoft-aspnetcore-responsecaching-responsecachingoptions-usecasesensitivepaths" class="no-loc" data-linktype="absolute-path">UseCaseSensitivePaths</a></td>
<td>Determines if responses are cached on case-sensitive paths. The default value is <code>false</code>.</td>
</tr>
</tbody></table>

 - Cache responses with a body size smaller than or equal to 1,024 bytes.

 - Store the responses by case-sensitive paths. For example, ```/page1``` and ```/Page1``` are stored separately.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCaching(options =>
{
    options.MaximumBodySize = 1024;
    options.UseCaseSensitivePaths = true;
});

var app = builder.Build();

app.UseHttpsRedirection();

// UseCors must be called before UseResponseCaching
//app.UseCors();

app.UseResponseCaching();

app.Use(async (context, next) =>
{
    context.Response.GetTypedHeaders().CacheControl =
        new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
        {
            Public = true,
            MaxAge = TimeSpan.FromSeconds(10)
        };
    context.Response.Headers[Microsoft.Net.Http.Headers.HeaderNames.Vary] =
        new string[] { "Accept-Encoding" };

    await next(context);
});

app.MapGet("/", () => DateTime.Now.Millisecond);

app.Run();
```

## ```VaryByQueryKeys```

```csharp
var responseCachingFeature = context.HttpContext.Features.Get<IResponseCachingFeature>();

if (responseCachingFeature != null)
{
    responseCachingFeature.VaryByQueryKeys = new[] { "MyKey" };
}
```

## HTTP headers used by Response Caching Middleware

<table><thead>
<tr>
<th>Header</th>
<th>Details</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>Authorization</code></td>
<td>The response isn't cached if the header exists.</td>
</tr>
<tr>
<td><code>Cache-Control</code></td>
<td>The middleware only considers caching responses marked with the <code>public</code> cache directive. Control caching with the following parameters:<ul><li>max-age</li><li>max-stale†</li><li>min-fresh</li><li>must-revalidate</li><li>no-cache</li><li>no-store</li><li>only-if-cached</li><li>private</li><li>public</li><li>s-maxage</li><li>proxy-revalidate‡</li></ul>†If no limit is specified to <code>max-stale</code>, the middleware takes no action.<br>‡<code>proxy-revalidate</code> has the same effect as <code>must-revalidate</code>.<br><br>For more information, see <a href="https://www.rfc-editor.org/rfc/rfc9111.html#name-request-directives" data-linktype="external">RFC 9111: Request Directives</a>.</td>
</tr>
<tr>
<td><code>Pragma</code></td>
<td>A <code>Pragma: ```no-cache```</code> header in the request produces the same effect as <code>Cache-Control: ```no-cache```</code>. This header is overridden by the relevant directives in the <code>Cache-Control</code> header, if present. Considered for backward compatibility with HTTP/1.0.</td>
</tr>
<tr>
<td><code>Set-Cookie</code></td>
<td>The response isn't cached if the header exists. Any middleware in the request processing pipeline that sets one or more cookies prevents the Response Caching Middleware from caching the response (for example, the <a href="../../fundamentals/app-state?view=aspnetcore-8.0#tempdata" data-linktype="relative-path">cookie-based TempData provider</a>).</td>
</tr>
<tr>
<td><code>Vary</code></td>
<td>The <code>Vary</code> header is used to vary the cached response by another header. For example, cache responses by encoding by including the <code>Vary: Accept-Encoding</code> header, which caches responses for requests with headers <code>Accept-Encoding: gzip</code> and <code>Accept-Encoding: text/plain</code> separately. A response with a header value of <code>*</code> is never stored.</td>
</tr>
<tr>
<td><code>Expires</code></td>
<td>A response deemed stale by this header isn't stored or retrieved unless overridden by other <code>Cache-Control</code> headers.</td>
</tr>
<tr>
<td><code>If-None-Match</code></td>
<td>The full response is served from cache if the value isn't <code>*</code> and the <code>ETag</code> of the response doesn't match any of the values provided. Otherwise, a 304 (Not Modified) response is served.</td>
</tr>
<tr>
<td><code>If-Modified-Since</code></td>
<td>If the <code>If-None-Match</code> header isn't present, a full response is served from cache if the cached response date is newer than the value provided. Otherwise, a <em>304 - Not Modified</em> response is served.</td>
</tr>
<tr>
<td><code>Date</code></td>
<td>When serving from cache, the <code>Date</code> header is set by the middleware if it wasn't provided on the original response.</td>
</tr>
<tr>
<td><code>Content-Length</code></td>
<td>When serving from cache, the <code>Content-Length</code> header is set by the middleware if it wasn't provided on the original response.</td>
</tr>
<tr>
<td><code>Age</code></td>
<td>The <code>Age</code> header sent in the original response is ignored. The middleware computes a new value when serving a cached response.</td>
</tr>
</tbody></table>

     - ```max-age```

     - ```max-stale```†

     - min-fresh

     - ```must-revalidate```

     - ```no-cache```

     - ```no-store```

     - only-if-cached

     - ```private```

     - public

     - ```s-maxage```

     - ```proxy-revalidate```‡

## Caching respects request ```Cache-Control``` directives

 - Cache in-memory in ASP.NET Core

 - Distributed caching in ASP.NET Core

 - Cache Tag Helper in ASP.NET Core MVC

 - Distributed Cache Tag Helper in ASP.NET Core

## Troubleshooting

### Conditions for caching

 - The request must result in a server response with a 200 (OK) status code.

 - The request method must be GET or HEAD.

 - Response Caching Middleware must be placed before middleware that require caching. For more information, see ASP.NET Core Middleware.

 - The ```Authorization``` header must not be present.

 - ```Cache-Control``` header parameters must be valid, and the response must be marked public and not marked ```private```.

 - The ```Pragma: ```no-cache`````` header must not be present if the ```Cache-Control``` header isn't present, as the ```Cache-Control``` header overrides the ```Pragma``` header when present.

 - The ```Set-Cookie``` header must not be present.

 - ```Vary``` header parameters must be valid and not equal to *.

 - The ```Content-Length``` header value (if set) must match the size of the response body.

 - The IHttpSendFileFeature isn't used.

 - The response must not be stale as specified by the ```Expires``` header and the ```max-age``` and ```s-maxage``` cache directives.

 - Response buffering must be successful. The size of the response must be smaller than the configured or default SizeLimit. The body size of the response must be smaller than the configured or default MaximumBodySize.

 - The response must be cacheable according to RFC 9111: HTTP Caching. For example, the ```no-store``` directive must not exist in request or response header fields. See RFC 9111: HTTP Caching (Section 3: Storing Responses in Caches for details.

> Note
The Antiforgery system for generating secure tokens to prevent Cross-Site Request Forgery (CSRF) attacks sets the ```Cache-Control``` and ```Pragma``` headers to ```no-cache``` so that responses aren't cached. For information on how to disable antiforgery tokens for HTML form elements, see Prevent Cross-Site Request Forgery (XSRF/CSRF) attacks in ASP.NET Core.

## Additional resources

 - View or download sample code (how to download)

 - GitHub source for ```IResponseCachingPolicyProvider```

 - GitHub source for ```IResponseCachingPolicyProvider```

 - App startup in ASP.NET Core

 - ASP.NET Core Middleware

 - Cache in-memory in ASP.NET Core

 - Distributed caching in ASP.NET Core

 - Detect changes with change tokens in ASP.NET Core

 - Response caching in ASP.NET Core

 - Cache Tag Helper in ASP.NET Core MVC

 - Distributed Cache Tag Helper in ASP.NET Core

Ref: [Response Caching Middleware in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware?view=aspnetcore-8.0)