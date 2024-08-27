---
title: Fundamentals - Host - WebApplication and WebApplicationBuilder
published: true
date: 2024-08-27 07:57:15
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## ```WebApplication```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

```csharp
var app = WebApplication.Create(args);

app.MapGet("/", () => "Hello World!");

app.Run();
```

### Working with ports

```csharp
var app = WebApplication.Create(args);

app.MapGet("/", () => "Hello World!");

app.Run("http://localhost:3000");
```

#### Multiple ports

```csharp
var app = WebApplication.Create(args);

app.Urls.Add("http://localhost:3000");
app.Urls.Add("http://localhost:4000");

app.MapGet("/", () => "Hello World");

app.Run();
```

#### Set the port from the command line

```dotnetcli
dotnet run --urls="https://localhost:7777"
```

#### Read the port from environment

```csharp
var app = WebApplication.Create(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";

app.MapGet("/", () => "Hello World");

app.Run($"http://localhost:{port}");
```

#### Set the ports via the ```ASPNETCORE_URLS``` environment variable

### Listen on all interfaces

#### http://*:3000

```csharp
var app = WebApplication.Create(args);

app.Urls.Add("http://*:3000");

app.MapGet("/", () => "Hello World");

app.Run();
```

#### http://+:3000

```csharp
var app = WebApplication.Create(args);

app.Urls.Add("http://+:3000");

app.MapGet("/", () => "Hello World");

app.Run();
```

#### ```http://0.0.0.0:3000```

```csharp
var app = WebApplication.Create(args);

app.Urls.Add("http://0.0.0.0:3000");

app.MapGet("/", () => "Hello World");

app.Run();
```

### Listen on all interfaces using ```ASPNETCORE_URLS```

### Listen on all interfaces using ```ASPNETCORE_HTTPS_PORTS```

### Specify HTTPS with development certificate

```csharp
var app = WebApplication.Create(args);

app.Urls.Add("https://localhost:3000");

app.MapGet("/", () => "Hello World");

app.Run();
```

### Specify HTTPS using a custom certificate

#### Specify the custom certificate with ```appsettings.json```

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Kestrel": {
    "Certificates": {
      "Default": {
        "Path": "cert.pem",
        "KeyPath": "key.pem"
      }
    }
  }
}
```

#### Specify the custom certificate via configuration

```csharp
var builder = WebApplication.CreateBuilder(args);

// Configure the cert and the key
builder.Configuration["Kestrel:Certificates:Default:Path"] = "cert.pem";
builder.Configuration["Kestrel:Certificates:Default:KeyPath"] = "key.pem";

var app = builder.Build();

app.Urls.Add("https://localhost:3000");

app.MapGet("/", () => "Hello World");

app.Run();
```

#### Use the certificate APIs

```csharp
using System.Security.Cryptography.X509Certificates;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ConfigureHttpsDefaults(httpsOptions =>
    {
        var certPath = Path.Combine(builder.Environment.ContentRootPath, "cert.pem");
        var keyPath = Path.Combine(builder.Environment.ContentRootPath, "key.pem");

        httpsOptions.ServerCertificate = X509Certificate2.CreateFromPemFile(certPath, 
                                         keyPath);
    });
});

var app = builder.Build();

app.Urls.Add("https://localhost:3000");

app.MapGet("/", () => "Hello World");

app.Run();
```

### Read the environment

```csharp
var app = WebApplication.Create(args);

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/oops");
}

app.MapGet("/", () => "Hello World");
app.MapGet("/oops", () => "Oops! An error happened.");

app.Run();
```

### Configuration

```csharp
var app = WebApplication.Create(args);

var message = app.Configuration["HelloKey"] ?? "Config failed!";

app.MapGet("/", () => message);

app.Run();
```

### Logging

```csharp
var app = WebApplication.Create(args);

app.Logger.LogInformation("The app started");

app.MapGet("/", () => "Hello World");

app.Run();
```

### Access the Dependency Injection (DI) container

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<SampleService>();

var app = builder.Build();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var sampleService = scope.ServiceProvider.GetRequiredService<SampleService>();
    sampleService.DoSomething();
}

app.Run();
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKeyedSingleton<ICache, BigCache>("big");
builder.Services.AddKeyedSingleton<ICache, SmallCache>("small");

var app = builder.Build();

app.MapGet("/big", ([FromKeyedServices("big")] ICache bigCache) => bigCache.Get("date"));

app.MapGet("/small", ([FromKeyedServices("small")] ICache smallCache) => smallCache.Get("date"));

app.Run();

public interface ICache
{
    object Get(string key);
}
public class BigCache : ICache
{
    public object Get(string key) => $"Resolving {key} from big cache.";
}

public class SmallCache : ICache
{
    public object Get(string key) => $"Resolving {key} from small cache.";
}
```

## WebApplicationBuilder

### Change the content root, application name, and environment

```csharp
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ApplicationName = typeof(Program).Assembly.FullName,
    ContentRootPath = Directory.GetCurrentDirectory(),
    EnvironmentName = Environments.Staging,
    WebRootPath = "customwwwroot"
});

Console.WriteLine($"Application Name: {builder.Environment.ApplicationName}");
Console.WriteLine($"Environment Name: {builder.Environment.EnvironmentName}");
Console.WriteLine($"ContentRoot Path: {builder.Environment.ContentRootPath}");
Console.WriteLine($"WebRootPath: {builder.Environment.WebRootPath}");

var app = builder.Build();
```

### Change the content root, ```app``` name, and environment by using environment variables or command line

<table><thead>
<tr>
<th>feature</th>
<th>Environment variable</th>
<th>Command-line argument</th>
</tr>
</thead>
<tbody>
<tr>
<td>Application name</td>
<td>ASPNETCORE_APPLICATIONNAME</td>
<td>--applicationName</td>
</tr>
<tr>
<td>Environment name</td>
<td>ASPNETCORE_ENVIRONMENT</td>
<td>--environment</td>
</tr>
<tr>
<td>Content root</td>
<td>ASPNETCORE_CONTENTROOT</td>
<td>--contentRoot</td>
</tr>
</tbody></table>

### Add configuration providers

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddIniFile("appsettings.ini");

var app = builder.Build();
```

### Read configuration

 - ```appSettings.json``` and ```appSettings.{environment}.json```

 - Environment variables

 - The command line

```csharp
var builder = WebApplication.CreateBuilder(args);

var message = builder.Configuration["HelloKey"] ?? "Hello";

var app = builder.Build();

app.MapGet("/", () => message);

app.Run();
```

### Read the environment

```csharp
var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    Console.WriteLine($"Running in development.");
}

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

### Add logging providers

```csharp
var builder = WebApplication.CreateBuilder(args);

// Configure JSON logging to the console.
builder.Logging.AddJsonConsole();

var app = builder.Build();

app.MapGet("/", () => "Hello JSON console!");

app.Run();
```

### Add services

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add the memory cache services.
builder.Services.AddMemoryCache();

// Add a custom scoped service.
builder.Services.AddScoped<ITodoRepository, TodoRepository>();
var app = builder.Build();
```

### Customize the IHostBuilder

```csharp
var builder = WebApplication.CreateBuilder(args);

// Wait 30 seconds for graceful shutdown.
builder.Host.ConfigureHostOptions(o => o.ShutdownTimeout = TimeSpan.FromSeconds(30));

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

### Customize the IWebHostBuilder

```csharp
var builder = WebApplication.CreateBuilder(args);

// Change the HTTP server implemenation to be HTTP.sys based
builder.WebHost.UseHttpSys();

var app = builder.Build();

app.MapGet("/", () => "Hello HTTP.sys");

app.Run();
```

### Change the web root

```csharp
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // Look for static files in webroot
    WebRootPath = "webroot"
});

var app = builder.Build();

app.Run();
```

### Custom dependency injection (DI) container

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());

// Register services directly with Autofac here. Don't
// call builder.Populate(), that happens in AutofacServiceProviderFactory.
builder.Host.ConfigureContainer<ContainerBuilder>(builder => builder.RegisterModule(new MyApplicationModule()));

var app = builder.Build();
```

### Add Middleware

```csharp
var app = WebApplication.Create(args);

// Setup the file server to serve static files.
app.UseFileServer();

app.MapGet("/", () => "Hello World!");

app.Run();
```

### Developer exception page

```csharp
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/", () =>
{
    throw new InvalidOperationException("Oops, the '/' route has thrown an exception.");
});

app.Run();
```

Ref: [WebApplication and WebApplicationBuilder in Minimal API apps](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/webapplication?view=aspnetcore-8.0)