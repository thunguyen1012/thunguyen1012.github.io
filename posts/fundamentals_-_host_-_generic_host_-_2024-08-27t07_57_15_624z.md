---
title: Fundamentals - Host - Generic Host
published: true
date: 2024-08-27 07:57:15
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Host definition

 - Dependency injection (DI)

 - Logging

 - Configuration

 - ```IHostedService``` implementations

## Set up a host

```csharp
await Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddHostedService<SampleHostedService>();
    })
    .Build()
    .RunAsync();
```

```csharp
await Host.CreateDefaultBuilder(args)
    .ConfigureWebHostDefaults(webBuilder =>
    {
        webBuilder.UseStartup<Startup>();
    })
    .Build()
    .RunAsync();
```

## Default builder settings

 - Sets the content root to the path returned by `GetCurrentDirectory`.

 - Loads host configuration from:

   - Environment variables prefixed with ```DOTNET_```.

   - Command-line arguments.

 - Loads app configuration from:

   - ```appsettings.json```.

   - ```appsettings.{Environment}.json```.

   - User secrets when the app runs in the ```Development``` ```environment```.

   - Environment variables.

   - Command-line arguments.

 - Adds the following logging providers:

   - Console

   - Debug

   - EventSource

   - EventLog (only when running on Windows)

 - Enables scope validation and dependency validation when the ```environment``` is ```Development```.

 - Loads host configuration from ```environment``` variables prefixed with ```ASPNETCORE_```.

 - Sets Kestrel server as the web server and configures it using the app's hosting configuration providers. For the Kestrel server's default options, see Configure options for the ASP.NET Core Kestrel web server.

 - Adds Host Filtering middleware.

 - Adds Forwarded Headers middleware if ```ASPNETCORE_FORWARDEDHEADERS_ENABLED``` equals ```true```.

 - Enables IIS integration. For the IIS default options, see Host ASP.NET Core on Windows with IIS.

## Framework-provided services

 - ```IHostApplicationLifetime```

 - ```IHostLifetime```

 - ```IHostEnvironment``` / ```IWebHostEnvironment```

## ```IHostApplicationLifetime```

 - Triggers the ApplicationStopping event handlers, which allows the app to run logic before the shutdown process begins.

 - Stops the server, which disables new connections. The server waits for requests on existing connections to complete, for as long as the shutdown timeout allows. The server sends the connection close header for further requests on existing connections.

 - Triggers the `ApplicationStopped` event handlers, which allows the app to run logic after the application has shutdown.

```csharp
public class HostApplicationLifetimeEventsHostedService : IHostedService
{
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    public HostApplicationLifetimeEventsHostedService(
        IHostApplicationLifetime hostApplicationLifetime)
        => _hostApplicationLifetime = hostApplicationLifetime;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _hostApplicationLifetime.ApplicationStarted.Register(OnStarted);
        _hostApplicationLifetime.ApplicationStopping.Register(OnStopping);
        _hostApplicationLifetime.ApplicationStopped.Register(OnStopped);

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
        => Task.CompletedTask;

    private void OnStarted()
    {
        // ...
    }

    private void OnStopping()
    {
        // ...
    }

    private void OnStopped()
    {
        // ...
    }
}
```

## ```IHostLifetime```

 - Listens for Ctrl+C/SIGINT (Windows), ⌘+C (macOS), or SIGTERM and calls ```StopApplication``` to start the shutdown process.

 - Unblocks extensions such as `RunAsync` and `WaitForShutdownAsync`.

## ```IHostEnvironment```

 - ApplicationName

 - EnvironmentName

 - ContentRootPath

## Host configuration

```csharp
Host.CreateDefaultBuilder(args)
    .ConfigureHostConfiguration(hostConfig =>
    {
        hostConfig.SetBasePath(Directory.GetCurrentDirectory());
        hostConfig.AddJsonFile("hostsettings.json", optional: true);
        hostConfig.AddEnvironmentVariables(prefix: "PREFIX_");
        hostConfig.AddCommandLine(args);
    });
```

## App configuration

## Settings for all app types

### ApplicationName

### ContentRoot

```csharp
Host.CreateDefaultBuilder(args)
    .UseContentRoot("/path/to/content/root")
    // ...
```

 - Fundamentals: Content root

 - WebRoot

### EnvironmentName

```csharp
Host.CreateDefaultBuilder(args)
    .UseEnvironment("Development")
    // ...
```

### ShutdownTimeout

 - Triggers ```IHostApplicationLifetime.ApplicationStopping```.

 - Attempts to stop hosted services, logging errors for services that fail to stop.

```csharp
Host.CreateDefaultBuilder(args)
    .ConfigureServices((hostContext, services) =>
    {
        services.Configure<HostOptions>(options =>
        {
            options.ShutdownTimeout = TimeSpan.FromSeconds(20);
        });
    });
```

### Disable app configuration reload on change

> Warning
The colon (:) separator doesn't work with ```environment``` variable hierarchical keys on all platforms. For more information, see Environment variables.

## Settings for web apps

```csharp
Host.CreateDefaultBuilder(args)
    .ConfigureWebHostDefaults(webBuilder =>
    {
        // ...
    });
```

### ```CaptureStartupErrors```

```csharp
webBuilder.CaptureStartupErrors(true);
```

### DetailedErrors

```csharp
webBuilder.UseSetting(WebHostDefaults.DetailedErrorsKey, "true");
```

### HostingStartupAssemblies

```csharp
webBuilder.UseSetting(
    WebHostDefaults.HostingStartupAssembliesKey, "assembly1;assembly2");
```

### HostingStartupExcludeAssemblies

```csharp
webBuilder.UseSetting(
    WebHostDefaults.HostingStartupExcludeAssembliesKey, "assembly1;assembly2");
```

### HTTPS_Port

```csharp
webBuilder.UseSetting("https_port", "8080");
```

### ```PreferHostingUrls```

```csharp
webBuilder.PreferHostingUrls(true);
```

### PreventHostingStartup

```csharp
webBuilder.UseSetting(WebHostDefaults.PreventHostingStartupKey, "true");
```

### StartupAssembly

```csharp
webBuilder.UseStartup("StartupAssemblyName");
```

```csharp
webBuilder.UseStartup<Startup>();
```

### SuppressStatusMessages

```csharp
webBuilder.UseSetting(WebHostDefaults.SuppressStatusMessagesKey, "true");
```

### URLs

```csharp
webBuilder.UseUrls("http://*:5000;http://localhost:5001;https://hostname:5002");
```

### WebRoot

```csharp
webBuilder.UseWebRoot("public");
```

 - Fundamentals: Web root

 - ContentRoot

## Manage the host lifetime

### Run

### RunAsync

### RunConsoleAsync

### Start

### ```StartAsync```

### StopAsync

### WaitForShutdown

### WaitForShutdownAsync

## Additional resources

- Background tasks with hosted services in ASP.NET Core

- GitHub link to Generic Host source

Note
Documentation links to .NET reference source usually load the repository's default branch, which represents the current development for the next release of .NET. To select a tag for a specific release, use the Switch branches or tags dropdown list. For more information, see How to select a version tag of ASP.NET Core source code (dotnet/AspNetCore.Docs #26205).

> Note
Documentation links to .NET reference source usually load the repository's default branch, which represents the current development for the next release of .NET. To select a tag for a specific release, use the Switch branches or tags dropdown list. For more information, see How to select a version tag of ASP.NET Core source code (dotnet/AspNetCore.Docs #26205).

Ref: [.NET Generic Host in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/generic-host?view=aspnetcore-8.0)