---
title: Fundamentals - Host - Web Host
published: true
date: 2024-08-27 07:57:15
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Set up a host

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        CreateWebHostBuilder(args).Build().Run();
    }

    public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .UseStartup<Startup>();
}
```

 - Configures Kestrel server as the web server using the app's hosting configuration providers. For the Kestrel server's default options, see ```Configure``` options for the ASP.NET Core Kestrel web server.

 - Sets the content root to the path returned by `Directory.GetCurrentDirectory`.

 - Loads host configuration from:

   - Environment variables prefixed with ```ASPNETCORE_``` (for example, ```ASPNETCORE_ENVIRONMENT```).

   - Command-line arguments.

 - Loads app configuration in the following order from:

   - ```appsettings.json```.

   - ```appsettings.{Environment}.json```.

   - User secrets when the app runs in the ```Development``` environment using the entry assembly.

   - Environment variables.

   - Command-line arguments.

 - Configures logging for console and debug output. Logging includes log filtering rules specified in a Logging configuration section of an ```appsettings.json``` or ```appsettings.{Environment}.json``` file.

 - When running behind IIS with the ASP.NET Core Module, ```CreateDefaultBuilder``` enables IIS Integration, which configures the app's base address and port. IIS Integration also configures the app to capture startup errors. For the IIS default options, see Host ASP.NET Core on Windows with IIS.

 - Sets ServiceProviderOptions.ValidateScopes to ```true``` if the app's environment is ```Development```. For more information, see Scope validation.

 - ```ConfigureAppConfiguration``` is used to specify additional ```IConfiguration``` for the app. The following ```ConfigureAppConfiguration``` call adds a delegate to include app configuration in the ```appsettings.xml``` file. ```ConfigureAppConfiguration``` may be called multiple times. Note that this configuration doesn't apply to the host (for example, server URLs or environment). See the Host configuration values section.
```csharp
WebHost.CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((hostingContext, config) =>
    {
        config.AddXmlFile("appsettings.xml", optional: true, reloadOnChange: true);
    })
    ...
```

 - The following ```ConfigureLogging``` call adds a delegate to configure the minimum logging level (SetMinimumLevel) to `LogLevel.Warning`. This setting overrides the settings in ```appsettings.Development.json``` (LogLevel.Debug) and ```appsettings.Production.json``` (LogLevel.Error) configured by ```CreateDefaultBuilder```. ```ConfigureLogging``` may be called multiple times.
```csharp
WebHost.CreateDefaultBuilder(args)
    .ConfigureLogging(logging => 
    {
        logging.SetMinimumLevel(LogLevel.Warning);
    })
    ...
```

 - The following call to ```ConfigureKestrel``` overrides the default `Limits.MaxRequestBodySize` of 30,000,000 bytes established when Kestrel was configured by ```CreateDefaultBuilder```:
```csharp
WebHost.CreateDefaultBuilder(args)
    .ConfigureKestrel((context, options) =>
    {
        options.Limits.MaxRequestBodySize = 20000000;
    });
```

> Note
As an alternative to using the static ```CreateDefaultBuilder``` method, creating a host from ```WebHostBuilder``` is a supported approach with ASP.NET Core 2.x.

## Host configuration values

 - Host builder configuration, which includes environment variables with the format ```ASPNETCORE_```{configurationKey}. For example, ```ASPNETCORE_ENVIRONMENT```.

 - Extensions such as ```UseContentRoot``` and UseConfiguration (see the Override configuration section).

 - ```UseSetting``` and the associated key. When setting a value with ```UseSetting```, the value is set as a ```string``` regardless of the type.

### Application Key (Name)

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseSetting(WebHostDefaults.ApplicationKey, "CustomApplicationName")
```

### Capture ```Startup``` Errors

```csharp
WebHost.CreateDefaultBuilder(args)
    .CaptureStartupErrors(true)
```

### Content root

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseContentRoot("c:\\<content-root>")
```

 - Fundamentals: Content root

 - Web root

### Detailed Errors

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseSetting(WebHostDefaults.DetailedErrorsKey, "true")
```

### Environment

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseEnvironment(EnvironmentName.Development)
```

### Hosting ```Startup``` Assemblies

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseSetting(WebHostDefaults.HostingStartupAssembliesKey, "assembly1;assembly2")
```

### HTTPS Port

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseSetting("https_port", "8080")
```

### Hosting ```Startup``` Exclude Assemblies

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseSetting(WebHostDefaults.HostingStartupExcludeAssembliesKey, "assembly1;assembly2")
```

### Prefer Hosting URLs

```csharp
WebHost.CreateDefaultBuilder(args)
    .PreferHostingUrls(true)
```

### Prevent Hosting ```Startup```

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseSetting(WebHostDefaults.PreventHostingStartupKey, "true")
```

### Server URLs

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseUrls("http://*:5000;http://localhost:5001;https://hostname:5002")
```

### ```Shutdown``` Timeout

 - Triggers IApplicationLifetime.ApplicationStopping.

 - Attempts to stop hosted services, logging any errors for services that fail to stop.

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseShutdownTimeout(TimeSpan.FromSeconds(10))
```

### ```Startup``` Assembly

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseStartup("StartupAssemblyName")
```

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseStartup<TStartup>()
```

### Web root

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseWebRoot("public")
```

 - Fundamentals: Web root

 - Content root

## Override configuration

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        CreateWebHostBuilder(args).Build().Run();
    }

    public static IWebHostBuilder CreateWebHostBuilder(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("hostsettings.json", optional: true)
            .AddCommandLine(args)
            .Build();

        return WebHost.CreateDefaultBuilder(args)
            .UseUrls("http://*:5000")
            .UseConfiguration(config)
            .Configure(app =>
            {
                app.Run(context => 
                    context.Response.WriteAsync("Hello, World!"));
            });
    }
}
```

```json
{
    urls: "http://*:5005"
}
```

> Note
UseConfiguration only copies keys from the provided ```IConfiguration``` to the host builder configuration. Therefore, setting ```reloadOnChange: ```true`````` for JSON, INI, and XML settings files has no effect.

```dotnetcli
dotnet run --urls "http://*:8080"
```

## Manage the host

```csharp
host.Run();
```

```csharp
using (host)
{
    host.Start();
    Console.ReadLine();
}
```

```csharp
var urls = new List<string>()
{
    "http://*:5000",
    "http://localhost:5001"
};

var host = new WebHostBuilder()
    .UseKestrel()
    .UseStartup<Startup>()
    .Start(urls.ToArray());

using (host)
{
    Console.ReadLine();
}
```

```csharp
using (var host = WebHost.Start(app => app.Response.WriteAsync("Hello, World!")))
{
    Console.WriteLine("Use Ctrl-C to shutdown the host...");
    host.WaitForShutdown();
}
```

```csharp
using (var host = WebHost.Start("http://localhost:8080", app => app.Response.WriteAsync("Hello, World!")))
{
    Console.WriteLine("Use Ctrl-C to shutdown the host...");
    host.WaitForShutdown();
}
```

```csharp
using (var host = WebHost.Start(router => router
    .MapGet("hello/{name}", (req, res, data) => 
        res.WriteAsync($"Hello, {data.Values["name"]}!"))
    .MapGet("buenosdias/{name}", (req, res, data) => 
        res.WriteAsync($"Buenos dias, {data.Values["name"]}!"))
    .MapGet("throw/{message?}", (req, res, data) => 
        throw new Exception((string)data.Values["message"] ?? "Uh oh!"))
    .MapGet("{greeting}/{name}", (req, res, data) => 
        res.WriteAsync($"{data.Values["greeting"]}, {data.Values["name"]}!"))
    .MapGet("", (req, res, data) => res.WriteAsync("Hello, World!"))))
{
    Console.WriteLine("Use Ctrl-C to shutdown the host...");
    host.WaitForShutdown();
}
```

<table><thead>
<tr>
<th>Request</th>
<th>Response</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>http://localhost:5000/hello/Martin</code></td>
<td>Hello, Martin!</td>
</tr>
<tr>
<td><code>http://localhost:5000/buenosdias/Catrina</code></td>
<td>Buenos dias, Catrina!</td>
</tr>
<tr>
<td><code>http://localhost:5000/throw/ooops!</code></td>
<td>Throws an exception with ```string``` "ooops!"</td>
</tr>
<tr>
<td><code>http://localhost:5000/throw</code></td>
<td>Throws an exception with ```string``` "Uh oh!"</td>
</tr>
<tr>
<td><code>http://localhost:5000/Sante/Kevin</code></td>
<td>Sante, Kevin!</td>
</tr>
<tr>
<td><code>http://localhost:5000</code></td>
<td>Hello World!</td>
</tr>
</tbody></table>

```csharp
using (var host = WebHost.Start("http://localhost:8080", router => router
    .MapGet("hello/{name}", (req, res, data) => 
        res.WriteAsync($"Hello, {data.Values["name"]}!"))
    .MapGet("buenosdias/{name}", (req, res, data) => 
        res.WriteAsync($"Buenos dias, {data.Values["name"]}!"))
    .MapGet("throw/{message?}", (req, res, data) => 
        throw new Exception((string)data.Values["message"] ?? "Uh oh!"))
    .MapGet("{greeting}/{name}", (req, res, data) => 
        res.WriteAsync($"{data.Values["greeting"]}, {data.Values["name"]}!"))
    .MapGet("", (req, res, data) => res.WriteAsync("Hello, World!"))))
{
    Console.WriteLine("Use Ctrl-C to shut down the host...");
    host.WaitForShutdown();
}
```

```csharp
using (var host = WebHost.StartWith(app => 
    app.Use(next => 
    {
        return async context => 
        {
            await context.Response.WriteAsync("Hello World!");
        };
    })))
{
    Console.WriteLine("Use Ctrl-C to shut down the host...");
    host.WaitForShutdown();
}
```

```csharp
using (var host = WebHost.StartWith("http://localhost:8080", app => 
    app.Use(next => 
    {
        return async context => 
        {
            await context.Response.WriteAsync("Hello World!");
        };
    })))
{
    Console.WriteLine("Use Ctrl-C to shut down the host...");
    host.WaitForShutdown();
}
```

## ```IWebHostEnvironment``` interface

```csharp
public class CustomFileReader
{
    private readonly IWebHostEnvironment _env;

    public CustomFileReader(IWebHostEnvironment env)
    {
        _env = env;
    }

    public string ReadFile(string filePath)
    {
        var fileProvider = _env.WebRootFileProvider;
        // Process the file here
    }
}
```

```csharp
public class Startup
{
    public Startup(IWebHostEnvironment env)
    {
        HostingEnvironment = env;
    }

    public IWebHostEnvironment HostingEnvironment { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        if (HostingEnvironment.IsDevelopment())
        {
            // Development configuration
        }
        else
        {
            // Staging/Production configuration
        }

        var contentRootPath = HostingEnvironment.ContentRootPath;
    }
}
```

> Note
In addition to the ```IsDevelopment``` extension method, ```IWebHostEnvironment``` offers ```IsStaging```, ```IsProduction```, and `IsEnvironment(string environmentName)` methods. For more information, see Use multiple environments in ASP.NET Core.

```csharp
public async Task Invoke(HttpContext context, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        // Configure middleware for Development
    }
    else
    {
        // Configure middleware for Staging/Production
    }

    var contentRootPath = env.ContentRootPath;
}
```

## ```IHostApplicationLifetime``` interface

<table><thead>
<tr>
<th>Cancellation Token</th>
<th>Triggered when…</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>ApplicationStarted</code></td>
<td>The host has fully started.</td>
</tr>
<tr>
<td><code>ApplicationStopped</code></td>
<td>The host is completing a graceful shutdown. All requests should be processed. ```Shutdown``` blocks until this event completes.</td>
</tr>
<tr>
<td><code>ApplicationStopping</code></td>
<td>The host is performing a graceful shutdown. Requests may still be processing. ```Shutdown``` blocks until this event completes.</td>
</tr>
</tbody></table>

```csharp
public class Startup
{
    public void Configure(IApplicationBuilder app, IHostApplicationLifetime appLifetime)
    {
        appLifetime.ApplicationStarted.Register(OnStarted);
        appLifetime.ApplicationStopping.Register(OnStopping);
        appLifetime.ApplicationStopped.Register(OnStopped);

        Console.CancelKeyPress += (sender, eventArgs) =>
        {
            appLifetime.StopApplication();
            // Don't terminate the process immediately, wait for the Main thread to exit gracefully.
            eventArgs.Cancel = true;
        };
    }

    private void OnStarted()
    {
        // Perform post-startup activities here
    }

    private void OnStopping()
    {
        // Perform on-stopping activities here
    }

    private void OnStopped()
    {
        // Perform post-stopped activities here
    }
}
```

```csharp
public class MyClass
{
    private readonly IHostApplicationLifetime _appLifetime;

    public MyClass(IHostApplicationLifetime appLifetime)
    {
        _appLifetime = appLifetime;
    }

    public void Shutdown()
    {
        _appLifetime.StopApplication();
    }
}
```

## Scope validation

 - Scoped services aren't directly or indirectly resolved from the root service provider.

 - Scoped services aren't directly or indirectly injected into singletons.

```csharp
WebHost.CreateDefaultBuilder(args)
    .UseDefaultServiceProvider((context, options) => {
        options.ValidateScopes = true;
    })
```

## Additional resources

 - Host ASP.NET Core on Windows with IIS

 - Host ASP.NET Core on Linux with Nginx

 - Host ASP.NET Core in a Windows Service

Ref: [ASP.NET Core Web Host](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/web-host?view=aspnetcore-8.0)