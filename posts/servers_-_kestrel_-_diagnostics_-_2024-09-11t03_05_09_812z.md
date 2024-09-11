---
title: Servers - Kestrel - Diagnostics
published: true
date: 2024-09-11 03:05:09
tags: Summary, AspNetCore
description:
image:
---

## In this article

This article provides guidance for gathering diagnostics from Kestrel to help troubleshoot issues. Topics covered include:

- Logging: Structured logs written to .NET Core logging. ILogger is used by app frameworks to write logs, and by users for their own logging in an app.

- Metrics: Representation of data measures over intervals of time, for example, requests per second. Metrics are emitted using ```EventCounter``` and can be observed using the dotnet-counters command line tool or with Application Insights.

- ```DiagnosticSource```: ```DiagnosticSource``` is a mechanism for production-time logging with rich data payloads for consumption within the process. Unlike logging, which assumes data will leave the process and expects serializable data, ```DiagnosticSource``` works well with complex data.

## Logging

Like most components in ASP.NET Core, Kestrel uses ```Microsoft.Extensions.Logging``` to emit log information. Kestrel employs the use of multiple categories which allows you to be selective on which logs you listen to.

<table><thead>
<tr>
<th>Logging Category Name</th>
<th>Logging Events</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>Microsoft.AspNetCore.Server.Kestrel</code></td>
<td><code>ApplicationError</code>, <code>ConnectionHeadResponseBodyWrite</code>, <code>ApplicationNeverCompleted</code>, <code>RequestBodyStart</code>, <code>RequestBodyDone</code>, <code>RequestBodyNotEntirelyRead</code>, <code>RequestBodyDrainTimedOut</code>, <code>ResponseMinimumDataRateNotSatisfied</code>, <code>InvalidResponseHeaderRemoved</code>, <code>HeartbeatSlow</code></td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.Server.Kestrel.BadRequests</code></td>
<td><code>ConnectionBadRequest</code>, <code>RequestProcessingError</code>, <code>RequestBodyMinimumDataRateNotSatisfied</code></td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.Server.Kestrel.Connections</code></td>
<td><code>ConnectionAccepted</code>, <code>ConnectionStart</code>, <code>ConnectionStop</code>, <code>ConnectionPause</code>, <code>ConnectionResume</code>, <code>ConnectionKeepAlive</code>, <code>ConnectionRejected</code>, <code>ConnectionDisconnect</code>, <code>NotAllConnectionsClosedGracefully</code>, <code>NotAllConnectionsAborted</code>, <code>ApplicationAbortedConnection</code></td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.Server.Kestrel.Http2</code></td>
<td><code>Http2ConnectionError</code>, <code>Http2ConnectionClosing</code>, <code>Http2ConnectionClosed</code>, <code>Http2StreamError</code>, <code>Http2StreamResetAbort</code>, <code>HPackDecodingError</code>, <code>HPackEncodingError</code>, <code>Http2FrameReceived</code>, <code>Http2FrameSending</code>, <code>Http2MaxConcurrentStreamsReached</code></td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.Server.Kestrel.Http3</code></td>
<td><code>Http3ConnectionError</code>, <code>Http3ConnectionClosing</code>, <code>Http3ConnectionClosed</code>, <code>Http3StreamAbort</code>, <code>Http3FrameReceived</code>, <code>Http3FrameSending</code></td>
</tr>
</tbody></table>

### Connection logging

Kestrel also supports the ability to emit ```Debug``` level logs for byte-level communication and can be enabled on a per-endpoint basis. To enable connection logging, see configure endpoints for Kestrel

## Metrics

Metrics is a representation of data measures over intervals of time, for example, requests per second. Metrics data allows observation of the state of an app at a high-level. Kestrel metrics are emitted using ```EventCounter```.

> Note
The ```connections-per-second``` and ```tls-handshakes-per-second``` counters are named incorrectly. The counters:

Do not always contain the number of new connections or TLS handshakes per second
Display the number of new connection or TLS handshakes in the last update interval as requested as the consumer of Events via the ```EventCounterIntervalSec``` argument in the ```filterPayload``` to ```KestrelEventSource```.

We recommend consumers of these counters scale the metric value based on the ```DisplayRateTimeScale``` of one second.

 - Do not always contain the number of new connections or TLS handshakes per second

 - Display the number of new connection or TLS handshakes in the last update interval as requested as the consumer of Events via the ```EventCounterIntervalSec``` argument in the ```filterPayload``` to ```KestrelEventSource```.

<table><thead>
<tr>
<th>Name</th>
<th>Display Name</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>connections-per-second</code></td>
<td>Connection Rate</td>
<td>The number of new incoming connections per update interval</td>
</tr>
<tr>
<td><code>total-connections</code></td>
<td>Total Connections</td>
<td>The total number of connections</td>
</tr>
<tr>
<td><code>tls-handshakes-per-second</code></td>
<td>TLS Handshake Rate</td>
<td>The number of new TLS handshakes per update interval</td>
</tr>
<tr>
<td><code>total-tls-handshakes</code></td>
<td>Total TLS Handshakes</td>
<td>The total number of TLS handshakes</td>
</tr>
<tr>
<td><code>current-tls-handshakes</code></td>
<td>Current TLS Handshakes</td>
<td>The number of TLS handshakes in process</td>
</tr>
<tr>
<td><code>failed-tls-handshakes</code></td>
<td>Failed TLS Handshakes</td>
<td>The total number of failed TLS handshakes</td>
</tr>
<tr>
<td><code>current-connections</code></td>
<td>Current Connections</td>
<td>The total number of connections, including idle connections</td>
</tr>
<tr>
<td><code>connection-queue-length</code></td>
<td>Connection Queue Length</td>
<td>The total number connections queued to the thread pool. In a healthy system at steady state, this number should always be close to zero</td>
</tr>
<tr>
<td><code>request-queue-length</code></td>
<td>Request Queue Length</td>
<td>The total number requests queued to the thread pool. In a healthy system at steady state, this number should always be close to zero. This metric is unlike the IIS/Http.Sys request queue and cannot be compared</td>
</tr>
<tr>
<td><code>current-upgraded-requests</code></td>
<td>Current Upgraded Requests (WebSockets)</td>
<td>The number of active WebSocket requests</td>
</tr>
</tbody></table>

## ```DiagnosticSource```

Kestrel emits a ```DiagnosticSource``` event for HTTP requests rejected at server layer such as malformed requests and protocols violations. As such, these requests never make it into the hosting layer of ASP.NET Core.

Kestrel emits these events with the ```Microsoft.AspNetCore.Server.Kestrel.BadRequest``` event name and an ```IFeatureCollection``` as the object payload. The underlying exception can be retrieved by accessing the ```IBadRequestExceptionFeature``` on the feature collection.

Resolving these events is a two-step process. An observer for ```DiagnosticListener``` must be created:

```csharp
class BadRequestEventListener : IObserver<KeyValuePair<string, object>>, IDisposable
{
    private readonly IDisposable _subscription;
    private readonly Action<IBadRequestExceptionFeature> _callback;

    public BadRequestEventListener(DiagnosticListener diagnosticListener, Action<IBadRequestExceptionFeature> callback)
    {
        _subscription = diagnosticListener.Subscribe(this!, IsEnabled);
        _callback = callback;
    }
    private static readonly Predicate<string> IsEnabled = (provider) => provider switch
    {
        "Microsoft.AspNetCore.Server.Kestrel.BadRequest" => true,
        _ => false
    };
    public void OnNext(KeyValuePair<string, object> pair)
    {
        if (pair.Value is IFeatureCollection featureCollection)
        {
            var badRequestFeature = featureCollection.Get<IBadRequestExceptionFeature>();

            if (badRequestFeature is not null)
            {
                _callback(badRequestFeature);
            }
        }
    }
    public void OnError(Exception error) { }
    public void OnCompleted() { }
    public virtual void Dispose() => _subscription.Dispose();
}
```

Subscribe to the ASP.NET Core ```DiagnosticListener``` with the observer. In this example, we create a callback that logs the underlying exception.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var diagnosticSource = app.Services.GetRequiredService<DiagnosticListener>();
using var badRequestListener = new BadRequestEventListener(diagnosticSource, (badRequestExceptionFeature) =>
{
    app.Logger.LogError(badRequestExceptionFeature.Error, "Bad request received");
});
app.MapGet("/", () => "Hello world");
app.Run();
```

## Behavior with debugger attached

Certain timeouts and rate limits aren't enforced when a debugger is attached to a Kestrel process. For more information, see Behavior with debugger attached.

Ref: [Diagnostics in Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/diagnostics?view=aspnetcore-8.0)