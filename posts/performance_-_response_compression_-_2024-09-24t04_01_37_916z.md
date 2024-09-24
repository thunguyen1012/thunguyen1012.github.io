---
title: Performance - Response compression
published: true
date: 2024-09-24 04:01:37
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Compression with HTTPS

## When to use Response Compression Middleware

 - Unable to use the following server-based compression technologies:

   - IIS Dynamic Compression module

   - Apache mod_deflate module

   - Nginx Compression and Decompression

 - Hosting directly on:

   - HTTP.sys server

   - Kestrel server

## Response compression

<table><thead>
<tr>
<th><a href="https://developer.mozilla.org/docs/Web/HTTP/Headers/Accept-Encoding" data-linktype="external"><code>Accept-Encoding</code></a> header values</th>
<th style="text-align: center;">Middleware Supported</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>br</code></td>
<td style="text-align: center;">Yes (default)</td>
<td><a href="https://tools.ietf.org/html/rfc7932" data-linktype="external">Brotli compressed data format</a></td>
</tr>
<tr>
<td><code>deflate</code></td>
<td style="text-align: center;">No</td>
<td><a href="https://tools.ietf.org/html/rfc1951" data-linktype="external">DEFLATE compressed data format</a></td>
</tr>
<tr>
<td><code>exi</code></td>
<td style="text-align: center;">No</td>
<td><a href="https://www.w3.org/TR/exi/" data-linktype="external">W3C Efficient XML Interchange</a></td>
</tr>
<tr>
<td><code>gzip</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="https://tools.ietf.org/html/rfc1952" data-linktype="external">Gzip file format</a></td>
</tr>
<tr>
<td><code>identity</code></td>
<td style="text-align: center;">Yes</td>
<td>"No encoding" identifier: The response must not be encoded.</td>
</tr>
<tr>
<td><code>pack200-gzip</code></td>
<td style="text-align: center;">No</td>
<td><a href="https://jcp.org/aboutJava/communityprocess/review/jsr200/index.html" data-linktype="external">Network Transfer Format for Java Archives</a></td>
</tr>
<tr>
<td><code>*</code></td>
<td style="text-align: center;">Yes</td>
<td>Any available content encoding not explicitly requested</td>
</tr>
</tbody></table>

<table><thead>
<tr>
<th>Header</th>
<th>Role</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://developer.mozilla.org/docs/Web/HTTP/Headers/Accept-Encoding" data-linktype="external"><code>Accept-Encoding</code></a></td>
<td>Sent from the client to the server to indicate the content encoding schemes acceptable to the client.</td>
</tr>
<tr>
<td><a href="https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Encoding" data-linktype="external"><code>Content-Encoding</code></a></td>
<td>Sent from the server to the client to indicate the encoding of the content in the payload.</td>
</tr>
<tr>
<td><a href="https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Length" data-linktype="external"><code>Content-Length</code></a></td>
<td>When compression occurs, the <code>Content-Length</code> header is removed, since the body content changes when the response is compressed.</td>
</tr>
<tr>
<td><a href="https://datatracker.ietf.org/doc/html/rfc1864" data-linktype="external"><code>Content-MD5</code></a></td>
<td>When compression occurs, the <code>Content-MD5</code> header is removed, since the body content has changed and the hash is no longer valid.</td>
</tr>
<tr>
<td><a href="https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Type" data-linktype="external"><code>Content-Type</code></a></td>
<td>Specifies the <a href="https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types" data-linktype="external">MIME type</a> of the content. Every response should specify its <code>Content-Type</code>. The response compression middleware checks this value to determine if the response should be compressed. The response compression middleware specifies a set of <a href="#mime-types" data-linktype="self-bookmark">default MIME types</a> that it can encode, and they can bed replaced or added.</td>
</tr>
<tr>
<td><a href="https://developer.mozilla.org/docs/Web/HTTP/Headers/Vary" data-linktype="external"><code>Vary</code></a></td>
<td>When sent by the server with a value of <code>Accept-Encoding</code> to clients and proxies, the <code>Vary</code> header indicates to the client or proxy that it should cache (vary) responses based on the value of the <code>Accept-Encoding</code> header of the request. The result of returning content with the <code>Vary: ```Accept-Encoding```</code> header is that both compressed and uncompressed responses are cached separately.</td>
</tr>
</tbody></table>

 - The compression of app responses using Gzip and custom compression providers.

 - How to add a MIME type to the default list of MIME types for compression.

 - How to add a custom response compression provider.

## Configuration

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

var app = builder.Build();

app.UseResponseCompression();

app.MapGet("/", () => "Hello World!");

app.Run();
```

 - Setting ```EnableForHttps``` to ```true``` is a security risk. See Compression with HTTPS in this article for more information.

 - ```app.UseResponseCompression``` must be called before any middleware that compresses responses. For more information, see ASP.NET Core Middleware.

 - Use a tool such as Firefox Browser Developer to set the ```Accept-Encoding``` request header and examine the response headers, size, and body.

 - Select the network tab.

 - Right click the request in the Network request list and select Edit and resend

 - Change ```Accept-Encoding```: from  ```gzip, deflate, br``` to ```none```.

 - Select Send.

## Providers

### Brotli and Gzip compression providers

 - The Brotli compression provider and Gzip compression provider are added by default to the array of compression providers.

 - Compression defaults to Brotli compression when the Brotli compressed data format is supported by the client. If Brotli isn't supported by the client, compression defaults to Gzip when the client supports Gzip compression.

> Note
Documentation links to .NET reference source usually load the repository's default branch, which represents the current development for the next release of .NET. To select a tag for a specific release, use the Switch branches or tags dropdown list. For more information, see How to select a version tag of ASP.NET Core source code (dotnet/AspNetCore.Docs #26205).

 - Enables response compression for HTTPS requests.

 - Adds the Brotli and Gzip response compression providers.

```csharp
using System.IO.Compression;
using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.SmallestSize;
});

var app = builder.Build();

app.UseResponseCompression();

app.MapGet("/", () => "Hello World!");

app.Run();
```

```csharp
using System.IO.Compression;
using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.SmallestSize;
});

var app = builder.Build();

app.UseResponseCompression();

app.MapGet("/", () => "Hello World!");

app.Run();
```

### Custom providers

```csharp
using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCompression(options =>
{
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<CustomCompressionProvider>();
});

var app = builder.Build();

app.UseResponseCompression();

app.MapGet("/", () => "Hello World!");

app.Run();
```

```csharp
using Microsoft.AspNetCore.ResponseCompression;

public class CustomCompressionProvider : ICompressionProvider
{
    public string EncodingName => "mycustomcompression";
    public bool SupportsFlush => true;

    public Stream CreateStream(Stream outputStream)
    {
        // Replace with a custom compression stream wrapper.
        return outputStream;
    }
}
```

## MIME types

> Note
Documentation links to .NET reference source usually load the repository's default branch, which represents the current development for the next release of .NET. To select a tag for a specific release, use the Switch branches or tags dropdown list. For more information, see How to select a version tag of ASP.NET Core source code (dotnet/AspNetCore.Docs #26205).

```csharp
using Microsoft.AspNetCore.ResponseCompression;
using ResponseCompressionSample;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<CustomCompressionProvider>();
    options.MimeTypes =
    ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "image/svg+xml" });
});

var app = builder.Build();

app.UseResponseCompression();
```

## Adding the ```Vary``` header

> Note
Documentation links to .NET reference source usually load the repository's default branch, which represents the current development for the next release of .NET. To select a tag for a specific release, use the Switch branches or tags dropdown list. For more information, see How to select a version tag of ASP.NET Core source code (dotnet/AspNetCore.Docs #26205).

## Middleware issue when behind an Nginx reverse proxy

## Disabling IIS dynamic compression

## Troubleshoot response compression

 - The ```Accept-Encoding``` header is present with a value of ```br```, ```gzip```, *, or custom encoding that matches a custom compression provider. The value must not be ```identity``` or have a quality value (qvalue, ```q```) setting of 0 (zero).

 - The MIME type (Content-Type) must be set and must match a MIME type configured on the ResponseCompressionOptions.

 - The request must not include the ```Content-Range``` header.

 - The request must use insecure protocol (http), unless secure protocol (https) is configured in the Response Compression Middleware options. Note the danger described above when enabling secure content compression.

## Azure deployed sample

```csharp
using Microsoft.AspNetCore.ResponseCompression;
using ResponseCompressionSample;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<CustomCompressionProvider>();
    options.MimeTypes =
    ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "image/svg+xml" });
});

var app = builder.Build();

app.UseResponseCompression();

app.Map("/trickle", async (HttpResponse httpResponse) =>
{
    httpResponse.ContentType = "text/plain;charset=utf-8";

    for (int i = 0; i < 20; i++)
    {
        await httpResponse.WriteAsync("a");
        await httpResponse.Body.FlushAsync();
        await Task.Delay(TimeSpan.FromMilliseconds(50));
    }
});

app.Map("/testfile1kb.txt", () => Results.File(
    app.Environment.ContentRootFileProvider.GetFileInfo("testfile1kb.txt").PhysicalPath,
    "text/plain;charset=utf-8"));

app.Map("/banner.svg", () => Results.File(
    app.Environment.ContentRootFileProvider.GetFileInfo("banner.svg").PhysicalPath,
    "image/svg+xml;charset=utf-8"));

app.MapFallback(() => LoremIpsum.Text);

app.Run();
```

## Additional resources

> Note
Documentation links to .NET reference source usually load the repository's default branch, which represents the current development for the next release of .NET. To select a tag for a specific release, use the Switch branches or tags dropdown list. For more information, see How to select a version tag of ASP.NET Core source code (dotnet/AspNetCore.Docs #26205).

 - View or download sample code (how to download)

 - Response compression middleware source

 - ASP.NET Core Middleware

 - Mozilla Developer Network: ```Accept-Encoding```

 - RFC 9110 Section 8.4.1: Content Codings

 - RFC 9110 Section 8.4.1.3: Gzip Coding

 - GZIP file format specification version 4.3

Ref: [Response compression in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/response-compression?view=aspnetcore-8.0)