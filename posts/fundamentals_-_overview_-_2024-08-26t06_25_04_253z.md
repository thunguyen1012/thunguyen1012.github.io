---
title: Fundamentals - Overview
published: true
date: 2024-08-26 06:25:04
tags: Summary, AspNetCore
description: 
image:
---

## In this article

> Note
This isn't the latest version of this article. For the current release, see the .NET 8 version of this article.

> Warning
This version of ASP.NET Core is no longer supported. For more information, see .NET and .NET Core Support Policy. For the current release, see the .NET 8 version of this article.

> Important
This information relates to a pre-release product that may be substantially modified before it's commercially released. Microsoft makes no warranties, express or implied, with respect to the information provided here.
For the current release, see the .NET 8 version of this article.

## ```Program.cs```

 - Services required by the app are configured.

 - The app's request handling pipeline is defined as a series of middleware components.

 - Razor Pages

 - MVC controllers with views

 - Web API with controllers

 - Minimal web APIs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthorization();

app.MapGet("/hi", () => "Hello!");

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

## Dependency injection (services)

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();
```

```csharp
using Microsoft.EntityFrameworkCore;
using RazorPagesMovie.Data;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

builder.Services.AddDbContext<RazorPagesMovieContext>(options =>
   options.UseSqlServer(builder.Configuration.GetConnectionString("RPMovieContext")));

var app = builder.Build();
```

```csharp
public class IndexModel : PageModel
{
    private readonly RazorPagesMovieContext _context;
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(RazorPagesMovieContext context, ILogger<IndexModel> logger)
    {
        _context = context;
        _logger = logger;
    }

    public IList<Movie> Movie { get;set; }

    public async Task OnGetAsync()
    {
        _logger.LogInformation("IndexModel OnGetAsync.");
        Movie = await _context.Movie.ToListAsync();
    }
}
```

## Middleware

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthorization();

app.MapGet("/hi", () => "Hello!");

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

## Host

 - An HTTP server implementation

 - Middleware components

 - Logging

 - Dependency injection (DI) services

 - Configuration

 - ASP.NET Core ```WebApplication```, also known as the Minimal Host

 - .NET Generic Host combined with ASP.NET Core's ```ConfigureWebHostDefaults```

 - ASP.NET Core WebHost

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();
```

 - Use Kestrel as the web server and enable IIS integration.

 - Load configuration from ```appsettings.json```, environment variables, command line arguments, and other configuration sources.

 - Send logging output to the console and debug providers.

### Non-web scenarios

## Servers

  - Windows

    - Kestrel is a cross-platform web server. Kestrel is often run in a reverse proxy configuration using IIS. In ASP.NET Core 2.0 or later, Kestrel can be run as a public-facing edge server exposed directly to the Internet.

    - IIS HTTP Server is a server for Windows that uses IIS. With this server, the ASP.NET Core app and IIS run in the same process.

    - HTTP.sys is a server for Windows that isn't used with IIS.

  - macOS
    - ASP.NET Core provides the Kestrel cross-platform server implementation. In ASP.NET Core 2.0 or later, Kestrel can run as a public-facing edge server exposed directly to the Internet. Kestrel is often run in a reverse proxy configuration with Nginx or Apache.

  - Linux
    - ASP.NET Core provides the Kestrel cross-platform server implementation. In ASP.NET Core 2.0 or later, Kestrel can run as a public-facing edge server exposed directly to the Internet. Kestrel is often run in a reverse proxy configuration with Nginx or Apache.

## Configuration

## Environments

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthorization();

app.MapGet("/hi", () => "Hello!");

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

## Logging

 - Console

 - Debug

 - Event Tracing on Windows

 - Windows Event Log

 - TraceSource

 - Azure App Service

 - Azure Application Insights

```csharp
public class IndexModel : PageModel
{
    private readonly RazorPagesMovieContext _context;
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(RazorPagesMovieContext context, ILogger<IndexModel> logger)
    {
        _context = context;
        _logger = logger;
    }

    public IList<Movie> Movie { get;set; }

    public async Task OnGetAsync()
    {
        _logger.LogInformation("IndexModel OnGetAsync.");
        Movie = await _context.Movie.ToListAsync();
    }
}
```

## Routing

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

## Error handling

 - A developer exception page

 - Custom error pages

 - Static status code pages

 - ```Startup``` exception handling

## Make HTTP requests

 - Provides a central location for naming and configuring logical ```HttpClient``` instances. For example, register and configure a github client for accessing GitHub. Register and configure a default client for other purposes.

 - Supports registration and chaining of multiple delegating handlers to build an outgoing request middleware pipeline. This pattern is similar to ASP.NET Core's inbound middleware pipeline. The pattern provides a mechanism to manage cross-cutting concerns for HTTP requests, including caching, error handling, serialization, and logging.

 - Integrates with Polly, a popular third-party library for transient fault handling.

 - Manages the pooling and lifetime of underlying ```HttpClientHandler``` instances to avoid common DNS problems that occur when managing ```HttpClient``` lifetimes manually.

 - Adds a configurable logging experience via ILogger for all requests sent through clients created by the factory.

## Content root

 - The executable hosting the app (.exe).

 - Compiled assemblies that make up the app (.dll).

 - Content files used by the app, such as:

   - Razor files (.cshtml, ```.razor```)

   - Configuration files (.json, ```.xml```)

   - Data files (.db)

 - The Web root, typically the wwwroot folder.

## Web root

 - Stylesheets (.css)

 - JavaScript (.js)

 - Images (.png, ```.jpg```)

```xml
<ItemGroup>
  <Content Update="wwwroot\local\**\*.*" CopyToPublishDirectory="Never" />
</ItemGroup>
```

## Additional resources

 - ```WebApplicationBuilder``` source code

Ref: [ASP.NET Core fundamentals overview](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/?view=aspnetcore-8.0)