---
title: Fundamentals - Dependency injection (services)
published: true
date: 2024-08-27 07:56:25
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Overview of dependency injection

```csharp
public class MyDependency
{
    public void WriteMessage(string message)
    {
        Console.WriteLine($"MyDependency.WriteMessage called. Message: {message}");
    }
}
```

```csharp
public class IndexModel : PageModel
{
    private readonly MyDependency _dependency = new MyDependency();

    public void OnGet()
    {
        _dependency.WriteMessage("IndexModel.OnGet");
    }
}
```

 - To replace ```MyDependency``` with a different implementation, the ```IndexModel``` class must be modified.

 - If ```MyDependency``` has dependencies, they must also be configured by the ```IndexModel``` class. In a large project with multiple classes depending on ```MyDependency```, the configuration code becomes scattered across the app.

 - This implementation is difficult to unit test.

 - The use of an interface or base class to abstract the dependency implementation.

 - Registration of the dependency in a service container. ASP.NET Core provides a built-in service container, `IServiceProvider`. Services are typically registered in the app's ```Program.cs``` file.

 - Injection of the service into the constructor of the class where it's used. The framework takes on the responsibility of creating an instance of the dependency and disposing of it when it's no longer needed.

```csharp
public interface IMyDependency
{
    void WriteMessage(string message);
}
```

```csharp
public class MyDependency : IMyDependency
{
    public void WriteMessage(string message)
    {
        Console.WriteLine($"MyDependency.WriteMessage Message: {message}");
    }
}
```

```csharp
using DependencyInjectionSample.Interfaces;
using DependencyInjectionSample.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddScoped<IMyDependency, MyDependency>();

var app = builder.Build();
```

```csharp
public class Index2Model : PageModel
{
    private readonly IMyDependency _myDependency;

    public Index2Model(IMyDependency myDependency)
    {
        _myDependency = myDependency;            
    }

    public void OnGet()
    {
        _myDependency.WriteMessage("Index2Model.OnGet");
    }
}
```

 - Doesn't use the concrete type ```MyDependency```, only the ```IMyDependency``` interface it implements. That makes it easy to change the implementation without modifying the controller or Razor Page.

 - Doesn't create an instance of ```MyDependency```, it's created by the DI container.

```csharp
public class MyDependency2 : IMyDependency
{
    private readonly ILogger<MyDependency2> _logger;

    public MyDependency2(ILogger<MyDependency2> logger)
    {
        _logger = logger;
    }

    public void WriteMessage(string message)
    {
        _logger.LogInformation( $"MyDependency2.WriteMessage Message: {message}");
    }
}
```

```csharp
using DependencyInjectionSample.Interfaces;
using DependencyInjectionSample.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddScoped<IMyDependency, MyDependency2>();

var app = builder.Build();
```

 - Is typically an object that provides a service to other objects, such as the ```IMyDependency``` service.

 - Is not related to a web service, although the service may use a web service.

```csharp
public class AboutModel : PageModel
{
    private readonly ILogger _logger;

    public AboutModel(ILogger<AboutModel> logger)
    {
        _logger = logger;
    }
    
    public string Message { get; set; } = string.Empty;

    public void OnGet()
    {
        Message = $"About page visited at {DateTime.UtcNow.ToLongTimeString()}";
        _logger.LogInformation(Message);
    }
}
```

## Register groups of services with extension methods

```csharp
using DependencyInjectionSample.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddRazorPages();

var app = builder.Build();
```

```csharp
using ConfigSample.Options;
using Microsoft.Extensions.DependencyInjection.ConfigSample.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<PositionOptions>(
    builder.Configuration.GetSection(PositionOptions.Position));
builder.Services.Configure<ColorOptions>(
    builder.Configuration.GetSection(ColorOptions.Color));

builder.Services.AddScoped<IMyDependency, MyDependency>();
builder.Services.AddScoped<IMyDependency2, MyDependency2>();

var app = builder.Build();
```

```csharp
using ConfigSample.Options;
using Microsoft.Extensions.Configuration;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class MyConfigServiceCollectionExtensions
    {
        public static IServiceCollection AddConfig(
             this IServiceCollection services, IConfiguration config)
        {
            services.Configure<PositionOptions>(
                config.GetSection(PositionOptions.Position));
            services.Configure<ColorOptions>(
                config.GetSection(ColorOptions.Color));

            return services;
        }

        public static IServiceCollection AddMyDependencyGroup(
             this IServiceCollection services)
        {
            services.AddScoped<IMyDependency, MyDependency>();
            services.AddScoped<IMyDependency2, MyDependency2>();

            return services;
        }
    }
}
```

```csharp
using Microsoft.Extensions.DependencyInjection.ConfigSample.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddConfig(builder.Configuration)
    .AddMyDependencyGroup();

builder.Services.AddRazorPages();

var app = builder.Build();
```

## Service lifetimes

 - Inject the service into the middleware's ```Invoke``` or ```InvokeAsync``` method. Using constructor injection throws a runtime exception because it forces the scoped service to behave like a singleton. The sample in the Lifetime and registration options section demonstrates the ```InvokeAsync``` approach.

 - Use Factory-based middleware. Middleware registered using this approach is activated per client request (connection), which allows scoped services to be injected into the middleware's constructor.

## Service registration methods

```csharp
services.AddSingleton<IMyDependency, MyDependency>();
services.AddSingleton<IMyDependency, DifferentDependency>();

public class MyService
{
    public MyService(IMyDependency myDependency, 
       IEnumerable<IMyDependency> myDependencies)
    {
        Trace.Assert(myDependency is DifferentDependency);

        var dependencyArray = myDependencies.ToArray();
        Trace.Assert(dependencyArray[0] is MyDependency);
        Trace.Assert(dependencyArray[1] is DifferentDependency);
    }
}
```

### Keyed services

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKeyedSingleton<ICache, BigCache>("big");
builder.Services.AddKeyedSingleton<ICache, SmallCache>("small");
builder.Services.AddControllers();

var app = builder.Build();

app.MapGet("/big", ([FromKeyedServices("big")] ICache bigCache) => bigCache.Get("date"));
app.MapGet("/small", ([FromKeyedServices("small")] ICache smallCache) =>
                                                               smallCache.Get("date"));

app.MapControllers();

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

[ApiController]
[Route("/cache")]
public class CustomServicesApiController : Controller
{
    [HttpGet("big-cache")]
    public ActionResult<object> GetOk([FromKeyedServices("big")] ICache cache)
    {
        return cache.Get("data-mvc");
    }
}

public class MyHub : Hub
{
    public void Method([FromKeyedServices("small")] ICache cache)
    {
        Console.WriteLine(cache.Get("signalr"));
    }
}
```

## Constructor injection behavior

## Entity Framework contexts

## Lifetime and registration options

```csharp
public interface IOperation
{
    string OperationId { get; }
}

public interface IOperationTransient : IOperation { }
public interface IOperationScoped : IOperation { }
public interface IOperationSingleton : IOperation { }
```

```csharp
public class Operation : IOperationTransient, IOperationScoped, IOperationSingleton
{
    public Operation()
    {
        OperationId = Guid.NewGuid().ToString()[^4..];
    }

    public string OperationId { get; }
}
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddTransient<IOperationTransient, Operation>();
builder.Services.AddScoped<IOperationScoped, Operation>();
builder.Services.AddSingleton<IOperationSingleton, Operation>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseMyMiddleware();
app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

```csharp
public class IndexModel : PageModel
{
    private readonly ILogger _logger;
    private readonly IOperationTransient _transientOperation;
    private readonly IOperationSingleton _singletonOperation;
    private readonly IOperationScoped _scopedOperation;

    public IndexModel(ILogger<IndexModel> logger,
                      IOperationTransient transientOperation,
                      IOperationScoped scopedOperation,
                      IOperationSingleton singletonOperation)
    {
        _logger = logger;
        _transientOperation = transientOperation;
        _scopedOperation    = scopedOperation;
        _singletonOperation = singletonOperation;
    }

    public void  OnGet()
    {
        _logger.LogInformation("Transient: " + _transientOperation.OperationId);
        _logger.LogInformation("Scoped: "    + _scopedOperation.OperationId);
        _logger.LogInformation("Singleton: " + _singletonOperation.OperationId);
    }
}
```

```csharp
public class MyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;

    private readonly IOperationSingleton _singletonOperation;

    public MyMiddleware(RequestDelegate next, ILogger<MyMiddleware> logger,
        IOperationSingleton singletonOperation)
    {
        _logger = logger;
        _singletonOperation = singletonOperation;
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context,
        IOperationTransient transientOperation, IOperationScoped scopedOperation)
    {
        _logger.LogInformation("Transient: " + transientOperation.OperationId);
        _logger.LogInformation("Scoped: " + scopedOperation.OperationId);
        _logger.LogInformation("Singleton: " + _singletonOperation.OperationId);

        await _next(context);
    }
}

public static class MyMiddlewareExtensions
{
    public static IApplicationBuilder UseMyMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<MyMiddleware>();
    }
}
```

```csharp
public async Task InvokeAsync(HttpContext context,
    IOperationTransient transientOperation, IOperationScoped scopedOperation)
{
    _logger.LogInformation("Transient: " + transientOperation.OperationId);
    _logger.LogInformation("Scoped: " + scopedOperation.OperationId);
    _logger.LogInformation("Singleton: " + _singletonOperation.OperationId);

    await _next(context);
}
```

 - Transient objects are always different. The transient ```OperationId``` value is different in the ```IndexModel``` and in the middleware.

 - Scoped objects are the same for a given request but differ across each new request.

 - Singleton objects are the same for every request.

```json
{
  "MyKey": "MyKey from appsettings.Developement.json",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "System": "Debug",
      "Microsoft": "Error"
    }
  }
}
```

## Resolve a service at app start up

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IMyDependency, MyDependency>();

var app = builder.Build();

using (var serviceScope = app.Services.CreateScope())
{
    var services = serviceScope.ServiceProvider;

    var myDependency = services.GetRequiredService<IMyDependency>();
    myDependency.WriteMessage("Call services from main");
}

app.MapGet("/", () => "Hello World!");

app.Run();
```

## Scope validation

## Request Services

> Note
Prefer requesting dependencies as constructor parameters over resolving services from ```RequestServices```. Requesting dependencies as constructor parameters yields classes that are easier to test.

## Design services for dependency injection

 - Avoid stateful, static classes and members. Avoid creating global state by designing apps to use singleton services instead.

 - Avoid direct instantiation of dependent classes within services. Direct instantiation couples the code to a particular implementation.

 - Make services small, well-factored, and easily tested.

### Disposal of services

```csharp
public class Service1 : IDisposable
{
    private bool _disposed;

    public void Write(string message)
    {
        Console.WriteLine($"Service1: {message}");
    }

    public void Dispose()
    {
        if (_disposed)
            return;

        Console.WriteLine("Service1.Dispose");
        _disposed = true;
    }
}

public class Service2 : IDisposable
{
    private bool _disposed;

    public void Write(string message)
    {
        Console.WriteLine($"Service2: {message}");
    }

    public void Dispose()
    {
        if (_disposed)
            return;

        Console.WriteLine("Service2.Dispose");
        _disposed = true;
    }
}

public interface IService3
{
    public void Write(string message);
}

public class Service3 : IService3, IDisposable
{
    private bool _disposed;

    public Service3(string myKey)
    {
        MyKey = myKey;
    }

    public string MyKey { get; }

    public void Write(string message)
    {
        Console.WriteLine($"Service3: {message}, MyKey = {MyKey}");
    }

    public void Dispose()
    {
        if (_disposed)
            return;

        Console.WriteLine("Service3.Dispose");
        _disposed = true;
    }
}
```

```csharp
using DIsample2.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddScoped<Service1>();
builder.Services.AddSingleton<Service2>();

var myKey = builder.Configuration["MyKey"];
builder.Services.AddSingleton<IService3>(sp => new Service3(myKey));

var app = builder.Build();
```

```csharp
public class IndexModel : PageModel
{
    private readonly Service1 _service1;
    private readonly Service2 _service2;
    private readonly IService3 _service3;

    public IndexModel(Service1 service1, Service2 service2, IService3 service3)
    {
        _service1 = service1;
        _service2 = service2;
        _service3 = service3;
    }

    public void OnGet()
    {
        _service1.Write("IndexModel.OnGet");
        _service2.Write("IndexModel.OnGet");
        _service3.Write("IndexModel.OnGet");
    }
}
```

```console
Service1: IndexModel.OnGet
Service2: IndexModel.OnGet
Service3: IndexModel.OnGet, MyKey = MyKey from appsettings.Developement.json
Service1.Dispose
```

### Services not created by the service container

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddSingleton(new Service1());
builder.Services.AddSingleton(new Service2());
```

 - The service instances aren't created by the service container.

 - The framework doesn't dispose of the services automatically.

 - The developer is responsible for disposing the services.

### IDisposable guidance for Transient and shared instances

## Default service container replacement

## Recommendations

 - Avoid using the service locator pattern. For example, don't invoke `GetService` to obtain a service instance when you can use DI instead:
Incorrect:

Correct:
public class MyClass
{
    private readonly IOptionsMonitor<MyOptions> _optionsMonitor;

    public MyClass(IOptionsMonitor<MyOptions> optionsMonitor)
    {
        _optionsMonitor = optionsMonitor;
    }

    public void MyMethod()
    {
        var option = _optionsMonitor.CurrentValue.Option;

        ...
    }
}

```csharp
public class MyClass
{
    private readonly IOptionsMonitor<MyOptions> _optionsMonitor;

    public MyClass(IOptionsMonitor<MyOptions> optionsMonitor)
    {
        _optionsMonitor = optionsMonitor;
    }

    public void MyMethod()
    {
        var option = _optionsMonitor.CurrentValue.Option;

        ...
    }
}
```

 - Another service locator variation to avoid is injecting a factory that resolves dependencies at runtime. Both of these practices mix Inversion of Control strategies.

 - Avoid static access to ```HttpContext``` (for example, `IHttpContextAccessor.HttpContext`).

## Recommended patterns for multi-tenancy in DI

## Framework-provided services

<table><thead>
<tr>
<th>Service Type</th>
<th>Lifetime</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.hosting.builder.iapplicationbuilderfactory" class="no-loc" data-linktype="absolute-path">Microsoft.AspNetCore.Hosting.Builder.IApplicationBuilderFactory</a></td>
<td>Transient</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.hosting.ihostapplicationlifetime" class="no-loc" data-linktype="absolute-path">IHostApplicationLifetime</a></td>
<td>Singleton</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.hosting.iwebhostenvironment" class="no-loc" data-linktype="absolute-path">IWebHostEnvironment</a></td>
<td>Singleton</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.hosting.istartup" class="no-loc" data-linktype="absolute-path">Microsoft.AspNetCore.Hosting.IStartup</a></td>
<td>Singleton</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.hosting.istartupfilter" class="no-loc" data-linktype="absolute-path">Microsoft.AspNetCore.Hosting.IStartupFilter</a></td>
<td>Transient</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.hosting.server.iserver" class="no-loc" data-linktype="absolute-path">Microsoft.AspNetCore.Hosting.Server.IServer</a></td>
<td>Singleton</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.ihttpcontextfactory" class="no-loc" data-linktype="absolute-path">Microsoft.AspNetCore.Http.IHttpContextFactory</a></td>
<td>Transient</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.ilogger-1" class="no-loc" data-linktype="absolute-path">Microsoft.Extensions.Logging.ILogger&lt;TCategoryName&gt;</a></td>
<td>Singleton</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.iloggerfactory" class="no-loc" data-linktype="absolute-path">Microsoft.Extensions.Logging.ILoggerFactory</a></td>
<td>Singleton</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.objectpool.objectpoolprovider" class="no-loc" data-linktype="absolute-path">Microsoft.Extensions.ObjectPool.ObjectPoolProvider</a></td>
<td>Singleton</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.options.iconfigureoptions-1" class="no-loc" data-linktype="absolute-path">Microsoft.Extensions.Options.IConfigureOptions&lt;TOptions&gt;</a></td>
<td>Transient</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.options.ioptions-1" class="no-loc" data-linktype="absolute-path">Microsoft.Extensions.Options.IOptions&lt;TOptions&gt;</a></td>
<td>Singleton</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.diagnostics.diagnosticsource" class="no-loc" data-linktype="absolute-path">System.Diagnostics.DiagnosticSource</a></td>
<td>Singleton</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.diagnostics.diagnosticlistener" class="no-loc" data-linktype="absolute-path">System.Diagnostics.DiagnosticListener</a></td>
<td>Singleton</td>
</tr>
</tbody></table>

## Additional resources

 - Dependency injection into views in ASP.NET Core

 - Dependency injection into controllers in ASP.NET Core

 - Dependency injection in requirement handlers in ASP.NET Core

 - ASP.NET Core Blazor dependency injection

 - NDC Conference Patterns for DI app development

 - App startup in ASP.NET Core

 - Factory-based middleware activation in ASP.NET Core

 - Understand dependency injection basics in .NET

 - Dependency injection guidelines

 - Tutorial: Use dependency injection in .NET

 - .NET dependency injection

 - ASP.NET CORE DEPENDENCY INJECTION: WHAT IS THE ISERVICECOLLECTION?

 - Four ways to dispose IDisposables in ASP.NET Core

 - Writing Clean Code in ASP.NET Core with Dependency Injection (MSDN)

 - Explicit Dependencies Principle

 - Inversion of Control Containers and the Dependency Injection Pattern (Martin Fowler)

 - How to register a service with multiple interfaces in ASP.NET Core DI

Ref: [Dependency injection in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-8.0)