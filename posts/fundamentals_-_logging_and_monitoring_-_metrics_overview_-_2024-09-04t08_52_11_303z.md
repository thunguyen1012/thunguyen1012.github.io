---
title: Fundamentals - Logging and monitoring - Metrics overview
published: true
date: 2024-09-04 08:52:11
tags: Summary, AspNetCore
description: Metrics are numerical measurements reported over time. They're typically used to monitor the health of an app and generate alerts. For example, a web service might track how many:
image:
---

## In this article

Metrics are numerical measurements reported over time. They're typically used to monitor the health of an app and generate alerts. For example, a web service might track how many:

- Requests it received per second.

- Milliseconds it took to respond.

- Responses sent an error.

Web services can be monitored to see how quickly they respond to requests.

> Tip
See ASP.NET Core metrics for a comprehensive list of all instruments together with their attributes.

## Using metrics

There are two parts to using metrics in a .NET app:

- Instrumentation: Code in .NET libraries takes measurements and associates these measurements with a metric name. .NET and ASP.NET Core include many built-in metrics.

- Collection: A .NET app configures named metrics to be transmitted from the app for external storage and analysis. Some tools may perform configuration outside the app using configuration files or a UI tool.

In this tutorial, I'll show you how to collect and store metrics in C.

- Populating metrics in Grafana with OpenTelemetry and Prometheus.

- Viewing metrics in real time with ```dotnet-counters```

Measurements can also be associated with key-value pairs called tags that allow data to be categorized for analysis. For more information, see Multi-dimensional metrics.

## Create the starter app

Create a new ASP.NET Core app with the following command:

```dotnetcli
dotnet new web -o WebMetric
cd WebMetric
dotnet add package OpenTelemetry.Exporter.Prometheus.AspNetCore --prerelease
dotnet add package OpenTelemetry.Extensions.Hosting
```

Replace the contents of ```Program.cs``` with the following code:

```csharp
using OpenTelemetry.Metrics;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenTelemetry()
    .WithMetrics(builder =>
    {
        builder.AddPrometheusExporter();

        builder.AddMeter("Microsoft.AspNetCore.Hosting",
                         "Microsoft.AspNetCore.Server.Kestrel");
        builder.AddView("http.server.request.duration",
            new ExplicitBucketHistogramConfiguration
            {
                Boundaries = new double[] { 0, 0.005, 0.01, 0.025, 0.05,
                       0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10 }
            });
    });
var app = builder.Build();

app.MapPrometheusScrapingEndpoint();

app.MapGet("/", () => "Hello OpenTelemetry! ticks:"
                     + DateTime.Now.Ticks.ToString()[^3..]);

app.Run();
```

## View metrics with ```dotnet-counters```

 ```dotnet-counters``` is a command-line tool that can view live metrics for .NET Core apps on demand. It doesn't require setup, making it useful for ad-hoc investigations or verifying that metric instrumentation is working. It works with both System.Diagnostics.Metrics based APIs and EventCounters.

If the ```dotnet-counters``` tool isn't installed, run the following command:

```dotnetcli
dotnet tool update -g dotnet-counters
```

While the test app is running, launch ```dotnet-counters```. The following command shows an example of ```dotnet-counters``` monitoring all metrics from the ```Microsoft.AspNetCore.Hosting``` meter.

```dotnetcli
dotnet-counters monitor -n WebMetric --counters Microsoft.AspNetCore.Hosting
```

Output similar to the following is displayed:

```dotnetcli
Press p to pause, r to resume, q to quit.
    Status: Running

[Microsoft.AspNetCore.Hosting]
    http-server-current-requests
        host=localhost,method=GET,port=5045,scheme=http                    0
    http-server-request-duration (s)
        host=localhost,method=GET,port=5045,protocol=HTTP/1.1,ro           0.001
        host=localhost,method=GET,port=5045,protocol=HTTP/1.1,ro           0.001
        host=localhost,method=GET,port=5045,protocol=HTTP/1.1,ro           0.001
        host=localhost,method=GET,port=5045,protocol=HTTP/1.1,ro           0
        host=localhost,method=GET,port=5045,protocol=HTTP/1.1,ro           0
        host=localhost,method=GET,port=5045,protocol=HTTP/1.1,ro           0
```

For more information, see ```dotnet-counters```.

## Enrich the ASP.NET Core request metric

ASP.NET Core has many built-in metrics. The ```http.server.request.duration``` metric:

- Records the duration of HTTP requests on the server.

- Captures request information in tags, such as the matched route and response status code.

The ```http.server.request.duration``` metric supports tag enrichment using ```IHttpMetricsTagsFeature```. Enrichment is when a library or app adds its own tags to a metric. This is useful if an app wants to add a custom categorization to dashboards or alerts built with metrics.

```csharp
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder();
var app = builder.Build();

app.Use(async (context, next) =>
{
    var tagsFeature = context.Features.Get<IHttpMetricsTagsFeature>();
    if (tagsFeature != null)
    {
        var source = context.Request.Query["utm_medium"].ToString() switch
        {
            "" => "none",
            "social" => "social",
            "email" => "email",
            "organic" => "organic",
            _ => "other"
        };
        tagsFeature.Tags.Add(new KeyValuePair<string, object?>("mkt_medium", source));
    }

    await next.Invoke();
});

app.MapGet("/", () => "Hello World!");

app.Run();
```

The proceeding example:

- Adds middleware to enrich the ASP.NET Core request metric.

- Gets the ```IHttpMetricsTagsFeature``` from the ```HttpContext```. The feature is only present on the context if someone is listening to the metric. Verify ```IHttpMetricsTagsFeature``` is not ```null``` before using it.

- Adds a custom tag containing the request's marketing source to the ```http.server.request.duration``` metric.

  - The tag has the name ```mkt_medium``` and a value based on the ```utm_medium``` query string value. The ```utm_medium``` value is resolved to a known range of values.

  - The tag allows requests to be categorized by marketing medium type, which could be useful when analyzing web app traffic.

> Note
Follow the multi-dimensional metrics best practices when enriching with custom tags. Too many tags, or tags with an unbound range cause a large combination of tags. Collection tools have a limit on how many combinations they support for a counter and may start filtering results out to avoid excessive memory usage.

## Create custom metrics

Metrics are created using APIs in the System.Diagnostics.Metrics namespace. See Create custom metrics for information on creating custom metrics.

### Creating metrics in ASP.NET Core apps with ```IMeterFactory```

We recommended creating Meter instances in ASP.NET Core apps with ```IMeterFactory```.

ASP.NET Core registers ```IMeterFactory``` in dependency injection (DI) by default. The meter factory integrates metrics with DI, making isolating and collecting metrics easy. ```IMeterFactory``` is especially useful for testing. It allows for multiple tests to run side-by-side and only collecting metrics values that are recorded in a test.

To use ```IMeterFactory``` in an app, create a type that uses ```IMeterFactory``` to create the app's custom metrics:

```csharp
public class ContosoMetrics
{
    private readonly Counter<int> _productSoldCounter;

    public ContosoMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("Contoso.Web");
        _productSoldCounter = meter.CreateCounter<int>("contoso.product.sold");
    }

    public void ProductSold(string productName, int quantity)
    {
        _productSoldCounter.Add(quantity,
            new KeyValuePair<string, object?>("contoso.product.name", productName));
    }
}
```

Register the metrics type with DI in ```Program.cs```:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ContosoMetrics>();
```

Inject the metrics type and record values where needed. Because the metrics type is registered in DI it can be use with MVC controllers, minimal APIs, or any other type that is created by DI:

```csharp
app.MapPost("/complete-sale", (SaleModel model, ContosoMetrics metrics) =>
{
    // ... business logic such as saving the sale to a database ...

    metrics.ProductSold(model.ProductName, model.QuantitySold);
});
```

To monitor the "Contoso.Web" meter, use the following ```dotnet-counters``` command.

```dotnetcli
dotnet-counters monitor -n WebMetric --counters Contoso.Web
```

Output similar to the following is displayed:

```dotnetcli
Press p to pause, r to resume, q to quit.
    Status: Running

[Contoso.Web]
    contoso.product.sold (Count / 1 sec)
        contoso.product.name=Eggs            12    
        contoso.product.name=Milk            0
```

## View metrics in Grafana with OpenTelemetry and Prometheus

### Overview

OpenTelemetry:

- Is a vendor-neutral open-source project supported by the Cloud Native Computing Foundation.

- Standardizes generating and collecting telemetry for cloud-native software.

- Works with .NET using the .NET metric APIs.

- Is endorsed by Azure Monitor and many APM vendors.

This tutorial shows one of the integrations available for OpenTelemetry metrics using the OSS Prometheus and Grafana projects. The metrics data flow:

- The ASP.NET Core metric APIs record measurements from the example app.

- The OpenTelemetry .NET library running in the app aggregates the measurements.

- The Prometheus exporter library makes the aggregated data available via an HTTP metrics endpoint. 'Exporter' is what OpenTelemetry calls the libraries that transmit telemetry to vendor-specific backends.

- A Prometheus server:

  - Polls the metrics endpoint

  - Reads the data

  - Stores the data in a database for long-term persistence. Prometheus refers to reading and storing data as scraping an endpoint.

  - Can run on a different machine

- The Grafana server:

  - Queries the data stored in Prometheus and displays it on a web-based monitoring dashboard.

  - Can run on a different machine.

### View metrics from sample app

Navigate to the sample app. The browser displays Hello OpenTelemetry! ticks:<3digits> where ```3digits``` are the last 3 digits of the current DateTime.Ticks.

Append ```/metrics``` to the URL to view the metrics endpoint. The browser displays the metrics being collected:

![metrics 2!](https://learn.microsoft.com/en-us/aspnet/core/log-mon/metrics/metrics/static/metrics.png?view=aspnetcore-8.0 "metrics 2")

### Set up and configure Prometheus

Follow the Prometheus first steps to set up a Prometheus server and confirm it's working.

Modify the prometheus.yml configuration file so that Prometheus scrapes the metrics endpoint that the example app is exposing. Add the following highlighted text in the ```scrape_configs``` section:

```yaml
# my global config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: "prometheus"

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
      - targets: ["localhost:9090"]

  - job_name: 'MyASPNETApp'
    scrape_interval: 5s # Poll every 5 seconds for a more responsive demo.
    static_configs:
      - targets: ["localhost:5045"]  ## Enter the HTTP port number of the demo app.
```

In the preceding highlighted YAML, replace ```5045``` with the port number that the example app is running on.

#### Start Prometheus

- Reload the configuration or restart the Prometheus server.

- Confirm that OpenTelemetryTest is in the UP state in the Status > Targets page of the Prometheus web portal.


![Prometheus status!](https://learn.microsoft.com/en-us/aspnet/core/log-mon/metrics/metrics/static/prometheus_status.png?view=aspnetcore-8.0 "Prometheus status")

Select the Open metric explorer icon to see available metrics:


![Prometheus open_metric_exp!](https://learn.microsoft.com/en-us/aspnet/core/log-mon/metrics/metrics/static/open_metric_exp.png?view=aspnetcore-8.0 "Prometheus open_metric_exp")

Enter counter category such as ```http_``` in the Expression input box to see the available metrics:


![available metrics!](https://learn.microsoft.com/en-us/aspnet/core/log-mon/metrics/metrics/static/metrics2.png?view=aspnetcore-8.0 "available metrics")

Alternatively, enter counter category such as ```kestrel``` in the Expression input box to see the available metrics:


![Prometheus kestrel!](https://learn.microsoft.com/en-us/aspnet/core/log-mon/metrics/metrics/static/kestrel.png?view=aspnetcore-8.0 "Prometheus kestrel")

### Show metrics on a Grafana dashboard

- Follow the installation instructions to install Grafana and connect it to a Prometheus data source.

- Follow Creating a Prometheus graph. Alternatively, pre-built dashboards for .NET metrics are available to download at .NET team dashboards @ grafana.com. Downloaded dashboard JSON can be imported into Grafana.


![dashboard-screenshot2!](https://learn.microsoft.com/en-us/aspnet/core/log-mon/metrics/metrics/static/dashboard-screenshot.png?view=aspnetcore-8.0 "dashboard-screenshot2")

## Test metrics in ASP.NET Core apps

It's possible to test metrics in ASP.NET Core apps. One way to do that is collect and assert metrics values in ASP.NET Core integration tests using `MetricCollector<T>`.

```csharp
public class BasicTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    public BasicTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Get_RequestCounterIncreased()
    {
        // Arrange
        var client = _factory.CreateClient();
        var meterFactory = _factory.Services.GetRequiredService<IMeterFactory>();
        var collector = new MetricCollector<double>(meterFactory,
            "Microsoft.AspNetCore.Hosting", "http.server.request.duration");

        // Act
        var response = await client.GetAsync("/");

        // Assert
        Assert.Contains("Hello OpenTelemetry!", await response.Content.ReadAsStringAsync());

        await collector.WaitForMeasurementsAsync(minCount: 1).WaitAsync(TimeSpan.FromSeconds(5));
        Assert.Collection(collector.GetMeasurementSnapshot(),
            measurement =>
            {
                Assert.Equal("http", measurement.Tags["url.scheme"]);
                Assert.Equal("GET", measurement.Tags["http.request.method"]);
                Assert.Equal("/", measurement.Tags["http.route"]);
            });
    }
}
```

The proceeding test:

- Bootstraps a web app in memory with `WebApplicationFactory<TEntryPoint>`. ```Program``` in the factory's generic argument specifies the web app.

- Collects metrics values with `MetricCollector<T>`

  - Requires a package reference to ```Microsoft.Extensions.Diagnostics.Testing```

  - The `MetricCollector<T>` is created using the web app's ```IMeterFactory```. This allows the collector to only report metrics values recorded by test.

  - Includes the meter name, ```Microsoft.AspNetCore.Hosting```, and counter name, ```http.server.request.duration``` to collect.

- Makes an HTTP request to the web app.

- Asserts the test using results from the metrics collector.

## ASP.NET Core meters and counters

See ASP.NET Core metrics for a list of ASP.NET Core meters and counters.

Ref: [ASP.NET Core metrics](https://learn.microsoft.com/en-us/aspnet/core/log-mon/metrics/metrics?view=aspnetcore-8.0)