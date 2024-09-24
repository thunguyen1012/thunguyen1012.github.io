---
title: Advanced - Request decompression
published: true
date: 2024-09-24 04:35:59
tags: Summary, AspNetCore
description:
image:
---

## In this article

Request decompression middleware:

- Enables API endpoints to accept requests with compressed content.

- Uses the ```Content-Encoding``` HTTP header to automatically identify and decompress requests which contain compressed content.

- Eliminates the need to write code to handle compressed requests.

When the ```Content-Encoding``` header value on a request matches one of the available decompression providers, the middleware:

- Uses the matching provider to wrap the HttpRequest.Body in an appropriate decompression stream.

- Removes the ```Content-Encoding``` header, indicating that the request body is no longer compressed.

Requests that don't include a ```Content-Encoding``` header are ignored by the request decompression middleware.

Decompression:

- Occurs when the body of the request is read. That is, decompression occurs at the endpoint on model binding. The request body isn't decompressed eagerly.

- When attempting to read the decompressed request body with invalid compressed data for the specified ```Content-Encoding```, an exception is thrown. Brotli can throw System.InvalidOperationException: Decoder ran into invalid data. Deflate and GZip can throw System.IO.InvalidDataException: The archive entry was compressed using an unsupported compression method.

If the middleware encounters a request with compressed content but is unable to decompress it, the request is passed to the next delegate in the pipeline. For example, a request with an unsupported ```Content-Encoding``` header value or multiple ```Content-Encoding``` header values is passed to the next delegate in the pipeline.

## Configuration

The following code uses AddRequestDecompression(IServiceCollection) and UseRequestDecompression to enable request decompression for the default ```Content-Encoding``` types:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRequestDecompression();

var app = builder.Build();

app.UseRequestDecompression();

app.MapPost("/", (HttpRequest request) => Results.Stream(request.Body));

app.Run();
```



## Default decompression providers

The ```Content-Encoding``` header values that the request decompression middleware supports by default are listed in the following table:

<table><thead>
<tr>
<th><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding" data-linktype="external"><code>Content-Encoding</code></a> header values</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>br</code></td>
<td><a href="https://tools.ietf.org/html/rfc7932" data-linktype="external">Brotli compressed data format</a></td>
</tr>
<tr>
<td><code>deflate</code></td>
<td><a href="https://tools.ietf.org/html/rfc1951" data-linktype="external">DEFLATE compressed data format</a></td>
</tr>
<tr>
<td><code>gzip</code></td>
<td><a href="https://tools.ietf.org/html/rfc1952" data-linktype="external">Gzip file format</a></td>
</tr>
</tbody></table>

## Custom decompression providers

Support for custom encodings can be added by creating custom decompression provider classes that implement IDecompressionProvider:

```csharp
public class CustomDecompressionProvider : IDecompressionProvider
{
    public Stream GetDecompressionStream(Stream stream)
    {
        // Perform custom decompression logic here
        return stream;
    }
}
```

Custom decompression providers are registered with RequestDecompressionOptions along with their corresponding ```Content-Encoding``` header values:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRequestDecompression(options =>
{
    options.DecompressionProviders.Add("custom", new CustomDecompressionProvider());
});

var app = builder.Build();

app.UseRequestDecompression();

app.MapPost("/", (HttpRequest request) => Results.Stream(request.Body));

app.Run();
```

## Request size limits

In order to guard against zip bombs or decompression bombs:

- The maximum size of the decompressed request body is limited to the request body size limit enforced by the endpoint or server.

- If the number of bytes read from the decompressed request body stream exceeds the limit, an InvalidOperationException is thrown to prevent additional bytes from being read from the stream.

In order of precedence, the maximum request size for an endpoint is set by:

- IRequestSizeLimitMetadata.MaxRequestBodySize, such as RequestSizeLimitAttribute or DisableRequestSizeLimitAttribute for MVC endpoints.

- The global server size limit IHttpMaxRequestBodySizeFeature.MaxRequestBodySize. ```MaxRequestBodySize``` can be overridden per request with IHttpMaxRequestBodySizeFeature.MaxRequestBodySize, but defaults to the limit configured for the web server implementation.

<table><thead>
<tr>
<th>Web server implementation</th>
<th><code>MaxRequestBodySize</code> configuration</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="../servers/httpsys?view=aspnetcore-8.0" data-linktype="relative-path">HTTP.sys</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.server.httpsys.httpsysoptions.maxrequestbodysize#microsoft-aspnetcore-server-httpsys-httpsysoptions-maxrequestbodysize" class="no-loc" data-linktype="absolute-path">HttpSysOptions.MaxRequestBodySize</a></td>
</tr>
<tr>
<td><a href="../../host-and-deploy/iis/?view=aspnetcore-8.0" data-linktype="relative-path">IIS</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.iisserveroptions.maxrequestbodysize#microsoft-aspnetcore-builder-iisserveroptions-maxrequestbodysize" class="no-loc" data-linktype="absolute-path">IISServerOptions.MaxRequestBodySize</a></td>
</tr>
<tr>
<td><a href="../servers/kestrel?view=aspnetcore-8.0" data-linktype="relative-path">Kestrel</a></td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserverlimits.maxrequestbodysize#microsoft-aspnetcore-server-kestrel-core-kestrelserverlimits-maxrequestbodysize" class="no-loc" data-linktype="absolute-path">KestrelServerLimits.MaxRequestBodySize</a></td>
</tr>
</tbody></table>

> Warning
Disabling the request body size limit poses a security risk in regards to uncontrolled resource consumption, particularly if the request body is being buffered. Ensure that safeguards are in place to mitigate the risk of denial-of-service (DoS) attacks.

## Additional Resources

- ASP.NET Core Middleware

- Mozilla Developer Network: ```Content-Encoding```

- Brotli Compressed Data Format

- DEFLATE Compressed Data Format Specification version 1.3

- GZIP file format specification version 4.3

Ref: [Request decompression in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-decompression?view=aspnetcore-8.0)