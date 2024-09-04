---
title: Fundamentals - Logging and monitoring - Health checks
published: true
date: 2024-09-04 08:51:39
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - Health probes can be used by container orchestrators and load balancers to check an app's status. For example, a container orchestrator may respond to a failing health check by halting a rolling deployment or restarting a container. A load balancer might react to an unhealthy app by routing traffic away from the failing instance to a healthy instance.

 - Use of memory, disk, and other physical server resources can be monitored for healthy status.

 - Health checks can test an app's dependencies, such as databases and external service endpoints, to confirm availability and normal functioning.

## Basic health probe

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();

var app = builder.Build();

app.MapHealthChecks("/healthz");

app.Run();
```

### Docker ```HEALTHCHECK```

```dockerfile
HEALTHCHECK CMD curl --fail http://localhost:5000/healthz || exit
```

## Create health checks

```csharp
public class SampleHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var isHealthy = true;

        // ...

        if (isHealthy)
        {
            return Task.FromResult(
                HealthCheckResult.Healthy("A healthy result."));
        }

        return Task.FromResult(
            new HealthCheckResult(
                context.Registration.FailureStatus, "An unhealthy result."));
    }
}
```

## Register health check services

```csharp
builder.Services.AddHealthChecks()
    .AddCheck<SampleHealthCheck>("Sample");
```

```csharp
builder.Services.AddHealthChecks()
    .AddCheck<SampleHealthCheck>(
        "Sample",
        failureStatus: HealthStatus.Degraded,
        tags: new[] { "sample" });
```

```csharp
builder.Services.AddHealthChecks()
    .AddCheck("Sample", () => HealthCheckResult.Healthy("A healthy result."));
```

```csharp
public class SampleHealthCheckWithArgs : IHealthCheck
{
    private readonly int _arg1;
    private readonly string _arg2;

    public SampleHealthCheckWithArgs(int arg1, string arg2)
        => (_arg1, _arg2) = (arg1, arg2);

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        // ...

        return Task.FromResult(HealthCheckResult.Healthy("A healthy result."));
    }
}
```

```csharp
builder.Services.AddHealthChecks()
    .AddTypeActivatedCheck<SampleHealthCheckWithArgs>(
        "Sample",
        failureStatus: HealthStatus.Degraded,
        tags: new[] { "sample" },
        args: new object[] { 1, "Arg" });
```

## Use Health Checks Routing

```csharp
app.MapHealthChecks("/healthz");
```

### Require host

```csharp
app.MapHealthChecks("/healthz")
    .RequireHost("www.contoso.com:5001");
```

```csharp
app.MapHealthChecks("/healthz")
    .RequireHost("*:5001");
```

> Warning
API that relies on the Host header, such as `HttpRequest.Host` and ```RequireHost```, are subject to potential spoofing by clients.
To prevent host and port spoofing, use one of the following approaches:

Use `HttpContext.Connection (ConnectionInfo.LocalPort)` where the ports are checked.
Employ Host filtering.

  - Use `HttpContext.Connection (ConnectionInfo.LocalPort)` where the ports are checked.

  - Employ Host filtering.

```csharp
app.MapHealthChecks("/healthz")
    .RequireHost("*:5001")
    .RequireAuthorization();
```

### Require authorization

```csharp
app.MapHealthChecks("/healthz")
    .RequireAuthorization();
```

### Enable Cross-Origin Requests (CORS)

## Health check options

 - Filter health checks

 - Customize the HTTP status code

 - Suppress cache headers

 - Customize output

### Filter health checks

```csharp
app.MapHealthChecks("/healthz", new HealthCheckOptions
{
    Predicate = healthCheck => healthCheck.Tags.Contains("sample")
});
```

### Customize the HTTP status code

```csharp
app.MapHealthChecks("/healthz", new HealthCheckOptions
{
    ResultStatusCodes =
    {
        [HealthStatus.Healthy] = StatusCodes.Status200OK,
        [HealthStatus.Degraded] = StatusCodes.Status200OK,
        [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable
    }
});
```

### Suppress cache headers

```csharp
app.MapHealthChecks("/healthz", new HealthCheckOptions
{
    AllowCachingResponses = true
});
```

### Customize output

```csharp
app.MapHealthChecks("/healthz", new HealthCheckOptions
{
    ResponseWriter = WriteResponse
});
```

```csharp
private static Task WriteResponse(HttpContext context, HealthReport healthReport)
{
    context.Response.ContentType = "application/json; charset=utf-8";

    var options = new JsonWriterOptions { Indented = true };

    using var memoryStream = new MemoryStream();
    using (var jsonWriter = new Utf8JsonWriter(memoryStream, options))
    {
        jsonWriter.WriteStartObject();
        jsonWriter.WriteString("status", healthReport.Status.ToString());
        jsonWriter.WriteStartObject("results");

        foreach (var healthReportEntry in healthReport.Entries)
        {
            jsonWriter.WriteStartObject(healthReportEntry.Key);
            jsonWriter.WriteString("status",
                healthReportEntry.Value.Status.ToString());
            jsonWriter.WriteString("description",
                healthReportEntry.Value.Description);
            jsonWriter.WriteStartObject("data");

            foreach (var item in healthReportEntry.Value.Data)
            {
                jsonWriter.WritePropertyName(item.Key);

                JsonSerializer.Serialize(jsonWriter, item.Value,
                    item.Value?.GetType() ?? typeof(object));
            }

            jsonWriter.WriteEndObject();
            jsonWriter.WriteEndObject();
        }

        jsonWriter.WriteEndObject();
        jsonWriter.WriteEndObject();
    }

    return context.Response.WriteAsync(
        Encoding.UTF8.GetString(memoryStream.ToArray()));
}
```

## Database probe

> Warning
When checking a database connection with a query, choose a query that returns quickly. The query approach runs the risk of overloading the database and degrading its performance. In most cases, running a test query isn't necessary. Merely making a successful connection to the database is sufficient. If you find it necessary to run a query, choose a simple SELECT query, such as ```SELECT 1```.

```csharp
var conStr = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(conStr))
{
    throw new InvalidOperationException(
                       "Could not find a connection string named 'DefaultConnection'.");
}
builder.Services.AddHealthChecks()
    .AddSqlServer(conStr);
```

> Note
AspNetCore.Diagnostics.HealthChecks isn't maintained or supported by Microsoft.

## Entity Framework Core ```DbContext``` probe

 - Use Entity Framework (EF) Core.

 - Include a package reference to the ```Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore``` NuGet package.

 - The ```DbContextHealthCheck``` calls EF Core's ```CanConnectAsync``` method. You can customize what operation is run when checking health using ```AddDbContextCheck``` method overloads.

 - The name of the health check is the name of the ```TContext``` type.

```csharp
builder.Services.AddDbContext<SampleDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHealthChecks()
    .AddDbContextCheck<SampleDbContext>();
```

## Separate readiness and liveness probes

 - Readiness indicates if the app is running normally but isn't ready to receive requests.

 - Liveness indicates if an app has crashed and must be restarted.

```csharp
public class StartupBackgroundService : BackgroundService
{
    private readonly StartupHealthCheck _healthCheck;

    public StartupBackgroundService(StartupHealthCheck healthCheck)
        => _healthCheck = healthCheck;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Simulate the effect of a long-running task.
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        _healthCheck.StartupCompleted = true;
    }
}
```

```csharp
public class StartupHealthCheck : IHealthCheck
{
    private volatile bool _isReady;

    public bool StartupCompleted
    {
        get => _isReady;
        set => _isReady = value;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        if (StartupCompleted)
        {
            return Task.FromResult(HealthCheckResult.Healthy("The startup task has completed."));
        }

        return Task.FromResult(HealthCheckResult.Unhealthy("That startup task is still running."));
    }
}
```

```csharp
builder.Services.AddHostedService<StartupBackgroundService>();
builder.Services.AddSingleton<StartupHealthCheck>();

builder.Services.AddHealthChecks()
    .AddCheck<StartupHealthCheck>(
        "Startup",
        tags: new[] { "ready" });
```

```csharp
app.MapHealthChecks("/healthz/ready", new HealthCheckOptions
{
    Predicate = healthCheck => healthCheck.Tags.Contains("ready")
});

app.MapHealthChecks("/healthz/live", new HealthCheckOptions
{
    Predicate = _ => false
});
```

 - ```/healthz/ready``` for the readiness check. The readiness check filters health checks to those tagged with ready.

 - ```/healthz/live``` for the liveness check. The liveness check filters out all health checks by returning ```false``` in the `HealthCheckOptions.Predicate` delegate. For more information on filtering health checks, see Filter health checks in this article.

### Kubernetes example

```yaml
spec:
  template:
  spec:
    readinessProbe:
      # an http probe
      httpGet:
        path: /healthz/ready
        port: 80
      # length of time to wait for a pod to initialize
      # after pod startup, before applying health checking
      initialDelaySeconds: 30
      timeoutSeconds: 1
    ports:
      - containerPort: 80
```

## Distribute a health check library

 - Write a health check that implements the IHealthCheck interface as a standalone class. The class can rely on dependency injection (DI), type activation, and named options to access configuration data.

 - Write an extension method with parameters that the consuming app calls in its ```Program.cs``` method. Consider the following example health check, which accepts ```arg1``` and ```arg2``` as constructor parameters:
```public SampleHealthCheckWithArgs(int arg1, string arg2)
    => (_arg1, _arg2) = (arg1, arg2);```

The preceding signature indicates that the health check requires custom data to process the health check probe logic. The data is provided to the delegate used to create the health check instance when the health check is registered with an extension method. In the following example, the caller specifies:

```csharp
public SampleHealthCheckWithArgs(int arg1, string arg2)
    => (_arg1, _arg2) = (arg1, arg2);
```

   - ```arg1```: An integer data point for the health check.

   - ```arg2```: A string argument for the health check.

   - name: An optional health check name. If ```null```, a default value is used.

   - ```failureStatus```: An optional ```HealthStatus```, which is reported for a failure status. If ```null```, ```HealthStatus```.Unhealthy is used.

   - ```tags```: An optional IEnumerable<string> collection of ```tags```.

```csharp
public static class SampleHealthCheckBuilderExtensions
{
    private const string DefaultName = "Sample";

    public static IHealthChecksBuilder AddSampleHealthCheck(
        this IHealthChecksBuilder healthChecksBuilder,
        int arg1,
        string arg2,
        string? name = null,
        HealthStatus? failureStatus = null,
        IEnumerable<string>? tags = default)
    {
        return healthChecksBuilder.Add(
            new HealthCheckRegistration(
                name ?? DefaultName,
                _ => new SampleHealthCheckWithArgs(arg1, arg2),
                failureStatus,
                tags));
    }
}
```

## Health Check Publisher

 - ```Delay```: The initial delay applied after the app starts before executing IHealthCheckPublisher instances. The delay is applied once at startup and doesn't apply to later iterations. The default value is five seconds.

 - ```Period```: The period of IHealthCheckPublisher execution. The default value is 30 seconds.

 - Predicate: If Predicate is ```null (default)```, the health check publisher service runs all registered health checks. To run a subset of health checks, provide a function that filters the set of checks. The predicate is evaluated each period.

 - Timeout: The timeout for executing the health checks for all IHealthCheckPublisher instances. Use InfiniteTimeSpan to execute without a timeout. The default value is 30 seconds.

```csharp
public class SampleHealthCheckPublisher : IHealthCheckPublisher
{
    public Task PublishAsync(HealthReport report, CancellationToken cancellationToken)
    {
        if (report.Status == HealthStatus.Healthy)
        {
            // ...
        }
        else
        {
            // ...
        }

        return Task.CompletedTask;
    }
}
```

```csharp
builder.Services.Configure<HealthCheckPublisherOptions>(options =>
{
    options.Delay = TimeSpan.FromSeconds(2);
    options.Predicate = healthCheck => healthCheck.Tags.Contains("sample");
});

builder.Services.AddSingleton<IHealthCheckPublisher, SampleHealthCheckPublisher>();
```

 - Includes publishers for several systems, including Application Insights.

 - Is not maintained or supported by Microsoft.

### Individual Healthchecks

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks()
   .Add(new HealthCheckRegistration(
       name: "SampleHealthCheck1",
       instance: new SampleHealthCheck(),
       failureStatus: null,
       tags: null,
       timeout: default)
   {
       Delay = TimeSpan.FromSeconds(40),
       Period = TimeSpan.FromSeconds(30)
   });

var app = builder.Build();

app.MapHealthChecks("/healthz");

app.Run();
```

## Dependency Injection and Health Checks

```csharp
public class SampleHealthCheckWithDI : IHealthCheck
{
    private readonly SampleHealthCheckWithDiConfig _config;

    public SampleHealthCheckWithDI(SampleHealthCheckWithDiConfig config)
        => _config = config;

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var isHealthy = true;

        // use _config ...

        if (isHealthy)
        {
            return Task.FromResult(
                HealthCheckResult.Healthy("A healthy result."));
        }

        return Task.FromResult(
            new HealthCheckResult(
                context.Registration.FailureStatus, "An unhealthy result."));
    }
}
```

```csharp
builder.Services.AddSingleton<SampleHealthCheckWithDiConfig>(new SampleHealthCheckWithDiConfig
{
    BaseUriToCheck = new Uri("https://sample.contoso.com/api/")
});
builder.Services.AddHealthChecks()
    .AddCheck<SampleHealthCheckWithDI>(
        "With Dependency Injection",
        tags: new[] { "inject" });
```

## ```UseHealthChecks``` vs. ```MapHealthChecks```

 - ```UseHealthChecks``` registers middleware for handling health checks requests in the middleware pipeline.

 - ```MapHealthChecks``` registers a health checks endpoint. The endpoint is matched and executed along with other endpoints in the app.

 - Terminates the pipeline when a request matches the health check endpoint. Short-circuiting is often desirable because it avoids unnecessary work, such as logging and other middleware.

 - Is primarily used for configuring the health check middleware in the pipeline.

 - Can match any path on a port with a ```null``` or empty ```PathString```. Allows performing a health check on any request made to the specified port.

 - Source code

 - Terminating the pipeline when a request matches the health check endpoint, by calling ShortCircuit. For example, `app.MapHealthChecks("/healthz").ShortCircuit();`. For more information, see Short-circuit middleware after routing.

 - Mapping specific routes or endpoints for health checks.

 - Customization of the URL or path where the health check endpoint is accessible.

 - Mapping multiple health check endpoints with different routes or configurations. Multiple endpoint support:

   - Enables separate endpoints for different types of health checks or components.

   - Is used to differentiate between different aspects of the app's health or apply specific configurations to subsets of health checks.

 - Source code

## Additional resources

 - View or download sample code (how to download)

> Note
This article was partially created with the help of artificial intelligence. Before publishing, an author reviewed and revised the content as needed. See Our principles for using AI-generated content in Microsoft Learn.

Ref: [Health checks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks?view=aspnetcore-8.0)