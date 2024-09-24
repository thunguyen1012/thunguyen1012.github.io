---
title: Performance - Event counters
published: true
date: 2024-09-24 04:35:37
tags: Summary, AspNetCore
description: This article applies to: ✔️ .NET Core 3.0 SDK and later versions
image:
---

## In this article

This article applies to: ✔️ .NET Core 3.0 SDK and later versions

In this tutorial, you'll learn how an EventCounter can be used to measure performance with a high frequency of events. You can use the available counters published by various official .NET Core packages, third-party providers, or create your own metrics for monitoring.

In this tutorial, you will:

 - Implement an EventSource.

 - Monitor counters with dotnet-counters.

## Prerequisites

The tutorial uses:

- .NET Core 3.1 SDK or a later version.

- dotnet-counters to ```monitor``` event counters.

- A sample debug target app to diagnose.

## Get the source

The sample application will be used as a basis for monitoring. The sample ASP.NET Core repository is available from the samples browser. You download the zip file, extract it once downloaded, and open it in your favorite IDE. Build and run the application to ensure that it works properly, then stop the application.

## Implement an EventSource

You'll want to keep the overhead per event to a minimum.

Knowing the number of events in a process is not useful.

Below is an example of how to implement an System.Diagnostics.Tracing.EventSource. Create a new file named ```MinimalEventCounterSource```.cs and use the code snippet as its source:

```csharp
using System.Diagnostics.Tracing;

[EventSource(Name = "Sample.EventCounter.Minimal")]
public sealed class MinimalEventCounterSource : EventSource
{
    public static readonly MinimalEventCounterSource Log = new MinimalEventCounterSource();

    private EventCounter _requestCounter;

    private MinimalEventCounterSource() =>
        _requestCounter = new EventCounter("request-time", this)
        {
            DisplayName = "Request Processing Time",
            DisplayUnits = "ms"
        };

    public void Request(string url, long elapsedMilliseconds)
    {
        WriteEvent(1, url, elapsedMilliseconds);
        _requestCounter?.WriteMetric(elapsedMilliseconds);
    }

    protected override void Dispose(bool disposing)
    {
        _requestCounter?.Dispose();
        _requestCounter = null;

        base.Dispose(disposing);
    }
}
```

The EventSource.WriteEvent line is the EventSource part and is not part of EventCounter, it was written to show that you can log a message together with the event counter.

## Add an action filter

In this tutorial, I will show you how to log the time it takes for a request to be replied to.

```csharp
using System.Diagnostics;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DiagnosticScenarios
{
    public class LogRequestTimeFilterAttribute : ActionFilterAttribute
    {
        readonly Stopwatch _stopwatch = new Stopwatch();

        public override void OnActionExecuting(ActionExecutingContext context) => _stopwatch.Start();

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            _stopwatch.Stop();

            MinimalEventCounterSource.Log.Request(
                context.HttpContext.Request.GetDisplayUrl(), _stopwatch.ElapsedMilliseconds);
        }
    }
}
```

The action filter starts a Stopwatch as the request begins, and stops after it has been completed, capturing the elapsed time. The total milliseconds are logged to the ```MinimalEventCounterSource``` singleton instance. For this filter to be applied, you need to add it to the filter collection. In the Startup.cs file, update the ```ConfigureServices``` method in include this filter.

```csharp
public void ConfigureServices(IServiceCollection services) =>
    services.AddControllers(options => options.Filters.Add<LogRequestTimeFilterAttribute>())
            .AddNewtonsoftJson();
```

## Monitor event counter

In this article, I will show you how to build a timer that fires when a metric is recorded.

Use the ```dotnet-counters ps``` command to display a list of .NET processes that can be monitored.

```console
dotnet-counters ps
```

Using the process identifier from the output of the ```dotnet-counters ps``` command, you can start monitoring the event counter with the following ```dotnet-counters ```monitor`````` command:

```console
dotnet-counters monitor --process-id 2196 --counters Sample.EventCounter.Minimal,Microsoft.AspNetCore.Hosting[total-requests,requests-per-second],System.Runtime[cpu-usage]
```

While the ```dotnet-counters ```monitor`````` command is running, hold F5 on the browser to start issuing continuous requests to the ```https://localhost:5001/api/values``` endpoint. After a few seconds stop by pressing q

```console
Press p to pause, r to resume, q to quit.
    Status: Running

[Microsoft.AspNetCore.Hosting]
    Request Rate / 1 sec                               9
    Total Requests                                   134
[System.Runtime]
    CPU Usage (%)                                     13
[Sample.EventCounter.Minimal]
    Request Processing Time (ms)                      34.5
```

The ```dotnet-counters ```monitor`````` command is great for active monitoring. However, you may want to ```collect``` these diagnostic metrics for post processing and analysis. For that, use the ```dotnet-counters ```collect`````` command. The ```collect``` switch command is similar to the ```monitor``` command, but accepts a few additional parameters. You can specify the desired output file name and format. For a JSON file named diagnostics.json use the following command:

```console
dotnet-counters collect --process-id 2196 --format json -o diagnostics.json --counters Sample.EventCounter.Minimal,Microsoft.AspNetCore.Hosting[total-requests,requests-per-second],System.Runtime[cpu-usage]
```

Again, while the command is running, hold F5 on the browser to start issuing continuous requests to the ```https://localhost:5001/api/values``` endpoint. After a few seconds stop by pressing q. The diagnostics.json file is written. The JSON file that is written is not indented, however; for readability it is indented here.

```json
{
  "TargetProcess": "DiagnosticScenarios",
  "StartTime": "8/5/2020 3:02:45 PM",
  "Events": [
    {
      "timestamp": "2020-08-05 15:02:47Z",
      "provider": "System.Runtime",
      "name": "CPU Usage (%)",
      "counterType": "Metric",
      "value": 0
    },
    {
      "timestamp": "2020-08-05 15:02:47Z",
      "provider": "Microsoft.AspNetCore.Hosting",
      "name": "Request Rate / 1 sec",
      "counterType": "Rate",
      "value": 0
    },
    {
      "timestamp": "2020-08-05 15:02:47Z",
      "provider": "Microsoft.AspNetCore.Hosting",
      "name": "Total Requests",
      "counterType": "Metric",
      "value": 134
    },
    {
      "timestamp": "2020-08-05 15:02:47Z",
      "provider": "Sample.EventCounter.Minimal",
      "name": "Request Processing Time (ms)",
      "counterType": "Metric",
      "value": 0
    },
    {
      "timestamp": "2020-08-05 15:02:47Z",
      "provider": "System.Runtime",
      "name": "CPU Usage (%)",
      "counterType": "Metric",
      "value": 0
    },
    {
      "timestamp": "2020-08-05 15:02:48Z",
      "provider": "Microsoft.AspNetCore.Hosting",
      "name": "Request Rate / 1 sec",
      "counterType": "Rate",
      "value": 0
    },
    {
      "timestamp": "2020-08-05 15:02:48Z",
      "provider": "Microsoft.AspNetCore.Hosting",
      "name": "Total Requests",
      "counterType": "Metric",
      "value": 134
    },
    {
      "timestamp": "2020-08-05 15:02:48Z",
      "provider": "Sample.EventCounter.Minimal",
      "name": "Request Processing Time (ms)",
      "counterType": "Metric",
      "value": 0
    },
    {
      "timestamp": "2020-08-05 15:02:48Z",
      "provider": "System.Runtime",
      "name": "CPU Usage (%)",
      "counterType": "Metric",
      "value": 0
    },
    {
      "timestamp": "2020-08-05 15:02:50Z",
      "provider": "Microsoft.AspNetCore.Hosting",
      "name": "Request Rate / 1 sec",
      "counterType": "Rate",
      "value": 0
    },
    {
      "timestamp": "2020-08-05 15:02:50Z",
      "provider": "Microsoft.AspNetCore.Hosting",
      "name": "Total Requests",
      "counterType": "Metric",
      "value": 134
    },
    {
      "timestamp": "2020-08-05 15:02:50Z",
      "provider": "Sample.EventCounter.Minimal",
      "name": "Request Processing Time (ms)",
      "counterType": "Metric",
      "value": 0
    }
  ]
}
```

## Next steps

Ref: [Tutorial: Measure performance using EventCounters in .NET Core](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/event-counter-perf?view=aspnetcore-8.0)