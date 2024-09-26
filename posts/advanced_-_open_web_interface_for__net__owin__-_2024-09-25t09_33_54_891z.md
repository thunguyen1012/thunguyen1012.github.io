---
title: Advanced - Open Web Interface for .NET (OWIN)
published: true
date: 2024-09-25 09:33:54
tags: Summary, AspNetCore
description:
image:
---

## In this article

ASP.NET Core:

- Supports the Open Web Interface for .NET (OWIN).

- Has .NET Core compatible replacements for the Microsoft.Owin.* (Katana) libraries.

OWIN allows web apps to be decoupled from web servers. It defines a standard way for middleware to be used in a pipeline to handle requests and associated responses. ASP.NET Core applications and middleware can interoperate with OWIN-based applications, servers, and middleware.

OWIN provides a decoupling layer that allows two frameworks with disparate object models to be used together. The ```Microsoft.AspNetCore.Owin``` package provides two adapter implementations:

- ASP.NET Core to OWIN

- OWIN to ASP.NET Core

This allows ASP.NET Core to be hosted on top of an OWIN compatible server/host or for other OWIN compatible components to be run on top of ASP.NET Core.

> Note
Using these adapters comes with a performance cost. Apps using only ASP.NET Core components shouldn't use the ```Microsoft.AspNetCore.Owin``` package or adapters.

View or download sample code (how to download)

## Running OWIN middleware in the ASP.NET Core pipeline

ASP.NET Core's OWIN support is deployed as part of the ```Microsoft.AspNetCore.Owin``` package. You can import OWIN support into your project by installing this package.

OWIN middleware conforms to the OWIN specification, which requires a `Func<IDictionary<string, object>, Task>` interface, and specific keys be set (such as ```owin.ResponseBody```). The following simple OWIN middleware displays "Hello World":

```csharp
public Task OwinHello(IDictionary<string, object> environment)
{
    string responseText = "Hello World via OWIN";
    byte[] responseBytes = Encoding.UTF8.GetBytes(responseText);

    // OWIN Environment Keys: https://owin.org/spec/spec/owin-1.0.0.html
    var responseStream = (Stream)environment["owin.ResponseBody"];
    var responseHeaders = (IDictionary<string, string[]>)environment["owin.ResponseHeaders"];

    responseHeaders["Content-Length"] = new string[] { responseBytes.Length.ToString(CultureInfo.InvariantCulture) };
    responseHeaders["Content-Type"] = new string[] { "text/plain" };

    return responseStream.WriteAsync(responseBytes, 0, responseBytes.Length);
}
```

The sample signature returns a ```Task``` and accepts an `IDictionary<string, object>` as required by OWIN.

The following code shows how to add the ```OwinHello``` middleware (shown above) to the ASP.NET Core pipeline with the ```UseOwin``` extension method.

```csharp
public void Configure(IApplicationBuilder app)
{
    app.UseOwin(pipeline =>
    {
        pipeline(next => OwinHello);
    });
}
```

You can configure other actions to take place within the OWIN pipeline.

> Note
Response headers should only be modified prior to the first write to the response stream.

> Note
Multiple calls to ```UseOwin``` is discouraged for performance reasons. OWIN components will operate best if grouped together.

```csharp
app.UseOwin(pipeline =>
{
    pipeline(next =>
    {
        return async environment =>
        {
            // Do something before.
            await next(environment);
            // Do something after.
        };
    });
});
```



## Run ASP.NET Core on an OWIN-based server and use its WebSockets support

The .NET OWIN web server used in the previous example has support for Webs built in, which can be leveraged by an ASP.NET Core application.

```csharp
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.Use(async (context, next) =>
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                await EchoWebSocket(webSocket);
            }
            else
            {
                await next();
            }
        });

        app.Run(context =>
        {
            return context.Response.WriteAsync("Hello World");
        });
    }

    private async Task EchoWebSocket(WebSocket webSocket)
    {
        byte[] buffer = new byte[1024];
        WebSocketReceiveResult received = await webSocket.ReceiveAsync(
            new ArraySegment<byte>(buffer), CancellationToken.None);

        while (!webSocket.CloseStatus.HasValue)
        {
            // Echo anything we receive
            await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, received.Count), 
                received.MessageType, received.EndOfMessage, CancellationToken.None);

            received = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), 
                CancellationToken.None);
        }

        await webSocket.CloseAsync(webSocket.CloseStatus.Value, 
            webSocket.CloseStatusDescription, CancellationToken.None);
    }
}
```

## OWIN environment

You can construct an OWIN environment using the ```HttpContext```.

```csharp
var environment = new OwinEnvironment(HttpContext);
   var features = new OwinFeatureCollection(environment);
```

## OWIN keys

OWIN depends on an `IDictionary<string,object>` object to communicate information throughout an HTTP Request/Response exchange. ASP.NET Core implements the keys listed below. See the primary specification, extensions, and OWIN Key Guidelines and Common Keys.

### Request data (OWIN v1.0.0)

<table><thead>
<tr>
<th>Key</th>
<th>Value (type)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>owin.RequestScheme</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>owin.RequestMethod</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>owin.RequestPathBase</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>owin.RequestPath</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>owin.RequestQueryString</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>owin.RequestProtocol</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>owin.RequestHeaders</td>
<td><code>IDictionary&lt;string,string[]&gt;</code></td>
<td></td>
</tr>
<tr>
<td>owin.RequestBody</td>
<td><code>Stream</code></td>
<td></td>
</tr>
</tbody></table>

### Request data (OWIN v1.1.0)

<table><thead>
<tr>
<th>Key</th>
<th>Value (type)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>owin.RequestId</td>
<td><code>String</code></td>
<td>Optional</td>
</tr>
</tbody></table>

### Response data (OWIN v1.0.0)

<table><thead>
<tr>
<th>Key</th>
<th>Value (type)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>owin.ResponseStatusCode</td>
<td><code>int</code></td>
<td>Optional</td>
</tr>
<tr>
<td>owin.ResponseReasonPhrase</td>
<td><code>String</code></td>
<td>Optional</td>
</tr>
<tr>
<td>owin.ResponseHeaders</td>
<td><code>IDictionary&lt;string,string[]&gt;</code></td>
<td></td>
</tr>
<tr>
<td>owin.ResponseBody</td>
<td><code>Stream</code></td>
<td></td>
</tr>
</tbody></table>

### Other data (OWIN v1.0.0)

<table><thead>
<tr>
<th>Key</th>
<th>Value (type)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>owin.CallCancelled</td>
<td><code>CancellationToken</code></td>
<td></td>
</tr>
<tr>
<td>owin.Version</td>
<td><code>String</code></td>
<td></td>
</tr>
</tbody></table>

### Common keys

<table><thead>
<tr>
<th>Key</th>
<th>Value (type)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>ssl.ClientCertificate</td>
<td><code>X509Certificate</code></td>
<td></td>
</tr>
<tr>
<td>ssl.LoadClientCertAsync</td>
<td><code>Func&lt;Task&gt;</code></td>
<td></td>
</tr>
<tr>
<td>server.RemoteIpAddress</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>server.RemotePort</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>server.LocalIpAddress</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>server.LocalPort</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>server.OnSendingHeaders</td>
<td><code>Action&lt;Action&lt;object&gt;,object&gt;</code></td>
<td></td>
</tr>
</tbody></table>

### SendFiles v0.3.0

<table><thead>
<tr>
<th>Key</th>
<th>Value (type)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>sendfile.SendAsync</td>
<td>See <a href="https://owin.org/spec/extensions/owin-SendFile-Extension-v0.3.0.htm" data-linktype="external">delegate signature</a></td>
<td>Per Request</td>
</tr>
</tbody></table>

### Opaque v0.3.0

<table><thead>
<tr>
<th>Key</th>
<th>Value (type)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>opaque.Version</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>opaque.Upgrade</td>
<td><code>OpaqueUpgrade</code></td>
<td>See <a href="https://owin.org/spec/extensions/owin-SendFile-Extension-v0.3.0.htm" data-linktype="external">delegate signature</a></td>
</tr>
<tr>
<td>opaque.Stream</td>
<td><code>Stream</code></td>
<td></td>
</tr>
<tr>
<td>opaque.CallCancelled</td>
<td><code>CancellationToken</code></td>
<td></td>
</tr>
</tbody></table>

### WebSocket v0.3.0

<table><thead>
<tr>
<th>Key</th>
<th>Value (type)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>websocket.Version</td>
<td><code>String</code></td>
<td></td>
</tr>
<tr>
<td>websocket.Accept</td>
<td><code>WebSocketAccept</code></td>
<td>See <a href="https://owin.org/spec/extensions/owin-SendFile-Extension-v0.3.0.htm" data-linktype="external">delegate signature</a></td>
</tr>
<tr>
<td>websocket.AcceptAlt</td>
<td></td>
<td>Non-spec</td>
</tr>
<tr>
<td>websocket.SubProtocol</td>
<td><code>String</code></td>
<td>See <a href="https://tools.ietf.org/html/rfc6455#section-4.2.2" data-linktype="external">RFC6455 Section 4.2.2</a> Step 5.5</td>
</tr>
<tr>
<td>websocket.SendAsync</td>
<td><code>WebSocketSendAsync</code></td>
<td>See <a href="https://owin.org/spec/extensions/owin-SendFile-Extension-v0.3.0.htm" data-linktype="external">delegate signature</a></td>
</tr>
<tr>
<td>websocket.ReceiveAsync</td>
<td><code>WebSocketReceiveAsync</code></td>
<td>See <a href="https://owin.org/spec/extensions/owin-SendFile-Extension-v0.3.0.htm" data-linktype="external">delegate signature</a></td>
</tr>
<tr>
<td>websocket.CloseAsync</td>
<td><code>WebSocketCloseAsync</code></td>
<td>See <a href="https://owin.org/spec/extensions/owin-SendFile-Extension-v0.3.0.htm" data-linktype="external">delegate signature</a></td>
</tr>
<tr>
<td>websocket.CallCancelled</td>
<td><code>CancellationToken</code></td>
<td></td>
</tr>
<tr>
<td>websocket.ClientCloseStatus</td>
<td><code>int</code></td>
<td>Optional</td>
</tr>
<tr>
<td>websocket.ClientCloseDescription</td>
<td><code>String</code></td>
<td>Optional</td>
</tr>
</tbody></table>

## Additional resources

- See the source on GitHub for OWIN keys supported in the translation layer.

- Middleware

- Servers

Ref: [Open Web Interface for .NET (OWIN) with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/owin?view=aspnetcore-8.0)