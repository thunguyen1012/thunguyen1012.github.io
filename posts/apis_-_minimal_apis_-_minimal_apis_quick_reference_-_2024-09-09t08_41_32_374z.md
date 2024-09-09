---
title: APIs - Minimal APIs - Minimal APIs quick reference
published: true
date: 2024-09-09 08:41:32
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Provides a quick reference for minimal APIs.

 - Is intended for experienced developers. For an introduction, see Tutorial: Create a minimal API with ASP.NET Core.

 - ```WebApplication``` and `WebApplicationBuilder`

 - Route Handlers

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

### Developer exception ```page```

```csharp
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/", () =>
{
    throw new InvalidOperationException("Oops, the '/' route has thrown an exception.");
});

app.Run();
```

## ASP.NET Core Middleware

<table><thead>
<tr>
<th>Middleware</th>
<th>Description</th>
<th>API</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="../security/authentication/?view=aspnetcore-6.0" data-linktype="relative-path">Authentication</a></td>
<td>Provides authentication support.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.authappbuilderextensions.useauthentication" class="no-loc" data-linktype="absolute-path">UseAuthentication</a></td>
</tr>
<tr>
<td><a href="../security/authorization/introduction?view=aspnetcore-8.0" data-linktype="relative-path">Authorization</a></td>
<td>Provides authorization support.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.authorizationappbuilderextensions.useauthorization" class="no-loc" data-linktype="absolute-path">UseAuthorization</a></td>
</tr>
<tr>
<td><a href="../security/cors?view=aspnetcore-6.0" data-linktype="relative-path">CORS</a></td>
<td>Configures Cross-Origin Resource Sharing.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.corsmiddlewareextensions.usecors" class="no-loc" data-linktype="absolute-path">UseCors</a></td>
</tr>
<tr>
<td><a href="../web-api/handle-errors?view=aspnetcore-6.0" data-linktype="relative-path">Exception Handler</a></td>
<td>Globally handles exceptions thrown by the middleware pipeline.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.exceptionhandlerextensions.useexceptionhandler" class="no-loc" data-linktype="absolute-path">UseExceptionHandler</a></td>
</tr>
<tr>
<td><a href="middleware/?view=aspnetcore-6.0#forwarded-headers-middleware-order" data-linktype="relative-path">Forwarded Headers</a></td>
<td>Forwards proxied headers onto the current request.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.forwardedheadersextensions.useforwardedheaders" class="no-loc" data-linktype="absolute-path">UseForwardedHeaders</a></td>
</tr>
<tr>
<td><a href="../security/enforcing-ssl?view=aspnetcore-6.0" data-linktype="relative-path">HTTPS Redirection</a></td>
<td>Redirects all HTTP requests to HTTPS.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.httpspolicybuilderextensions.usehttpsredirection" class="no-loc" data-linktype="absolute-path">UseHttpsRedirection</a></td>
</tr>
<tr>
<td><a href="middleware/?view=aspnetcore-6.0#middleware-order" data-linktype="relative-path">HTTP Strict Transport Security (HSTS)</a></td>
<td>Security enhancement middleware that adds a special response header.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.hstsbuilderextensions.usehsts" class="no-loc" data-linktype="absolute-path">UseHsts</a></td>
</tr>
<tr>
<td><a href="logging/?view=aspnetcore-6.0" data-linktype="relative-path">Request Logging</a></td>
<td>Provides support for logging HTTP requests and responses.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.httploggingbuilderextensions.usehttplogging" class="no-loc" data-linktype="absolute-path">UseHttpLogging</a></td>
</tr>
<tr>
<td><a href="../performance/timeouts?view=aspnetcore-8.0" data-linktype="relative-path">Request Timeouts</a></td>
<td>Provides support for configuring request timeouts, global default and per endpoint.</td>
<td><code>UseRequestTimeouts</code></td>
</tr>
<tr>
<td><a href="https://www.w3.org/TR/WD-logfile.html" data-linktype="external">W3C Request Logging</a></td>
<td>Provides support for logging HTTP requests and responses in the <a href="https://www.w3.org/TR/WD-logfile.html" data-linktype="external">W3C format</a>.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.httploggingbuilderextensions.usew3clogging" class="no-loc" data-linktype="absolute-path">UseW3CLogging</a></td>
</tr>
<tr>
<td><a href="../performance/caching/middleware?view=aspnetcore-8.0" data-linktype="relative-path">Response Caching</a></td>
<td>Provides support for caching responses.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.responsecachingextensions.useresponsecaching" class="no-loc" data-linktype="absolute-path">UseResponseCaching</a></td>
</tr>
<tr>
<td><a href="../performance/response-compression?view=aspnetcore-8.0" data-linktype="relative-path">Response Compression</a></td>
<td>Provides support for compressing responses.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.responsecompressionbuilderextensions.useresponsecompression" class="no-loc" data-linktype="absolute-path">UseResponseCompression</a></td>
</tr>
<tr>
<td><a href="app-state?view=aspnetcore-8.0" data-linktype="relative-path">Session</a></td>
<td>Provides support for managing ```user``` sessions.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.sessionmiddlewareextensions.usesession" class="no-loc" data-linktype="absolute-path">UseSession</a></td>
</tr>
<tr>
<td><a href="static-files?view=aspnetcore-8.0" data-linktype="relative-path">Static Files</a></td>
<td>Provides support for serving static files and directory browsing.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.staticfileextensions.usestaticfiles" class="no-loc" data-linktype="absolute-path">UseStaticFiles</a>, <a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.fileserverextensions.usefileserver" class="no-loc" data-linktype="absolute-path">UseFileServer</a></td>
</tr>
<tr>
<td><a href="websockets?view=aspnetcore-8.0" data-linktype="relative-path">WebSockets</a></td>
<td>Enables the WebSockets protocol.</td>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.websocketmiddlewareextensions.usewebsockets" class="no-loc" data-linktype="absolute-path">UseWebSockets</a></td>
</tr>
</tbody></table>

## Routing

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "This is a GET");
app.MapPost("/", () => "This is a POST");
app.MapPut("/", () => "This is a PUT");
app.MapDelete("/", () => "This is a DELETE");

app.MapMethods("/options-or-head", new[] { "OPTIONS", "HEAD" }, 
                          () => "This is an options or head request ");

app.Run();
```

### Route Handlers

### Lambda expression

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/inline", () => "This is an inline lambda");

var handler = () => "This is a lambda variable";

app.MapGet("/", handler);

app.Run();
```

### Local function

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string LocalFunction() => "This is local function";

app.MapGet("/", LocalFunction);

app.Run();
```

### Instance method

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var handler = new HelloHandler();

app.MapGet("/", handler.Hello);

app.Run();

class HelloHandler
{
    public string Hello()
    {
        return "Hello Instance method";
    }
}
```

### Static method

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", HelloHandler.Hello);

app.Run();

class HelloHandler
{
    public static string Hello()
    {
        return "Hello static method";
    }
}
```

### Endpoint defined outside of ```Program.cs```

```csharp
using MinAPISeparateFile;

var builder = WebApplication.CreateSlimBuilder(args);

var app = builder.Build();

TodoEndpoints.Map(app);

app.Run();
```

```csharp
namespace MinAPISeparateFile;

public static class TodoEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapGet("/", async context =>
        {
            // Get all todo items
            await context.Response.WriteAsJsonAsync(new { Message = "All todo items" });
        });

        app.MapGet("/{id}", async context =>
        {
            // Get one todo item
            await context.Response.WriteAsJsonAsync(new { Message = "One todo item" });
        });
    }
}
```

### Named endpoints and link generation

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/hello", () => "Hello named route")
   .WithName("hi");

app.MapGet("/", (LinkGenerator linker) => 
        $"The link to the hello route is {linker.GetPathByName("hi", values: null)}");

app.Run();
```

 - Must be globally unique.

 - Are used as the OpenAPI operation ```id``` when OpenAPI support is enabled. For more information, see OpenAPI.

### Route Parameters

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/users/{userId}/books/{bookId}", 
    (int userId, int bookId) => $"The user id is {userId} and book id is {bookId}");

app.Run();
```

### Wildcard and catch all routes

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/posts/{*rest}", (string rest) => $"Routing to {rest}");

app.Run();
```

### Route constraints

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/todos/{id:int}", (int id) => db.Todos.Find(id));
app.MapGet("/todos/{text}", (string text) => db.Todos.Where(t => t.Text.Contains(text));
app.MapGet("/posts/{slug:regex(^[a-z0-9_-]+$)}", (string slug) => $"Post {slug}");

app.Run();
```

<table><thead>
<tr>
<th>Route Template</th>
<th>Example Matching URI</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/todos/{id:int}</code></td>
<td><code>/todos/1</code></td>
</tr>
<tr>
<td><code>/todos/{text}</code></td>
<td><code>/todos/something</code></td>
</tr>
<tr>
<td><code>/posts/{slug:regex(^[a-z0-9_-]+$)}</code></td>
<td><code>/posts/mypost</code></td>
</tr>
</tbody></table>

### Route groups

```csharp
app.MapGroup("/public/todos")
    .MapTodosApi()
    .WithTags("Public");

app.MapGroup("/private/todos")
    .MapTodosApi()
    .WithTags("Private")
    .AddEndpointFilterFactory(QueryPrivateTodos)
    .RequireAuthorization();


EndpointFilterDelegate QueryPrivateTodos(EndpointFilterFactoryContext factoryContext, EndpointFilterDelegate next)
{
    var dbContextIndex = -1;

    foreach (var argument in factoryContext.MethodInfo.GetParameters())
    {
        if (argument.ParameterType == typeof(TodoDb))
        {
            dbContextIndex = argument.Position;
            break;
        }
    }

    // Skip filter if the method doesn't have a TodoDb parameter.
    if (dbContextIndex < 0)
    {
        return next;
    }

    return async invocationContext =>
    {
        var dbContext = invocationContext.GetArgument<TodoDb>(dbContextIndex);
        dbContext.IsPrivate = true;

        try
        {
            return await next(invocationContext);
        }
        finally
        {
            // This should only be relevant if you're pooling or otherwise reusing the DbContext instance.
            dbContext.IsPrivate = false;
        }
    };
}
```

```csharp
public static RouteGroupBuilder MapTodosApi(this RouteGroupBuilder group)
{
    group.MapGet("/", GetAllTodos);
    group.MapGet("/{id}", GetTodo);
    group.MapPost("/", CreateTodo);
    group.MapPut("/{id}", UpdateTodo);
    group.MapDelete("/{id}", DeleteTodo);

    return group;
}
```

```csharp
public static async Task<Created<Todo>> CreateTodo(Todo todo, TodoDb database)
{
    await database.AddAsync(todo);
    await database.SaveChangesAsync();

    return TypedResults.Created($"{todo.Id}", todo);
}
```

```csharp
var all = app.MapGroup("").WithOpenApi();
var org = all.MapGroup("{org}");
var user = org.MapGroup("{user}");
user.MapGet("", (string org, string user) => $"{org}/{user}");
```

```csharp
var outer = app.MapGroup("/outer");
var inner = outer.MapGroup("/inner");

inner.AddEndpointFilter((context, next) =>
{
    app.Logger.LogInformation("/inner group filter");
    return next(context);
});

outer.AddEndpointFilter((context, next) =>
{
    app.Logger.LogInformation("/outer group filter");
    return next(context);
});

inner.MapGet("/", () => "Hi!").AddEndpointFilter((context, next) =>
{
    app.Logger.LogInformation("MapGet filter");
    return next(context);
});
```

```dotnetcli
/outer group filter
/inner group filter
MapGet filter
```

## Parameter binding

  - Route values

  - Query string

  - Header

  - Body (as JSON)

  - Form values

  - Services provided by dependency injection

  - Custom

```csharp
var builder = WebApplication.CreateBuilder(args);

// Added as service
builder.Services.AddSingleton<Service>();

var app = builder.Build();

app.MapGet("/{id}", (int id,
                     int page,
                     [FromHeader(Name = "X-CUSTOM-HEADER")] string customHeader,
                     Service service) => { });

class Service { }
```

<table><thead>
<tr>
<th>Parameter</th>
<th>Binding Source</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>id</code></td>
<td>route value</td>
</tr>
<tr>
<td><code>page</code></td>
<td>query string</td>
</tr>
<tr>
<td><code>customHeader</code></td>
<td>header</td>
</tr>
<tr>
<td><code>service</code></td>
<td>Provided by dependency injection</td>
</tr>
</tbody></table>

```csharp
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapPost("/", (Person person) => { });

record Person(string Name, int Age);
```

```csharp
app.MapGet("/{id}", (HttpRequest request) =>
{
    var id = request.RouteValues["id"];
    var page = request.Query["page"];
    var customHeader = request.Headers["X-CUSTOM-HEADER"];

    // ...
});

app.MapPost("/", async (HttpRequest request) =>
{
    var person = await request.ReadFromJsonAsync<Person>();

    // ...
});
```

### Explicit Parameter Binding

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Added as service
builder.Services.AddSingleton<Service>();

var app = builder.Build();


app.MapGet("/{id}", ([FromRoute] int id,
                     [FromQuery(Name = "p")] int page,
                     [FromServices] Service service,
                     [FromHeader(Name = "Content-Type")] string contentType) 
                     => {});

class Service { }

record Person(string Name, int Age);
```

<table><thead>
<tr>
<th>Parameter</th>
<th>Binding Source</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>id</code></td>
<td>route value with the name <code>id</code></td>
</tr>
<tr>
<td><code>page</code></td>
<td>query string with the name <code>"p"</code></td>
</tr>
<tr>
<td><code>service</code></td>
<td>Provided by dependency injection</td>
</tr>
<tr>
<td><code>contentType</code></td>
<td>header with the name <code>"Content-Type"</code></td>
</tr>
</tbody></table>

#### Explicit binding from form values

```csharp
app.MapPost("/todos", async ([FromForm] string name,
    [FromForm] Visibility visibility, IFormFile? attachment, TodoDb db) =>
{
    var todo = new Todo
    {
        Name = name,
        Visibility = visibility
    };

    if (attachment is not null)
    {
        var attachmentName = Path.GetRandomFileName();

        using var stream = File.Create(Path.Combine("wwwroot", attachmentName));
        await attachment.CopyToAsync(stream);
    }

    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return Results.Ok();
});

// Remaining code removed for brevity.
```

```csharp
app.MapPost("/ap/todos", async ([AsParameters] NewTodoRequest request, TodoDb db) =>
{
    var todo = new Todo
    {
        Name = request.Name,
        Visibility = request.Visibility
    };

    if (request.Attachment is not null)
    {
        var attachmentName = Path.GetRandomFileName();

        using var stream = File.Create(Path.Combine("wwwroot", attachmentName));
        await request.Attachment.CopyToAsync(stream);

        todo.Attachment = attachmentName;
    }

    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return Results.Ok();
});

// Remaining code removed for brevity.
```

```csharp
public record struct NewTodoRequest([FromForm] string Name,
    [FromForm] Visibility Visibility, IFormFile? Attachment);
```

#### Secure binding from ```IFormFile``` and ```IFormFileCollection```

```csharp
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder();

builder.Services.AddAntiforgery();

var app = builder.Build();
app.UseAntiforgery();

// Generate a form with an anti-forgery token and an /upload endpoint.
app.MapGet("/", (HttpContext context, IAntiforgery antiforgery) =>
{
    var token = antiforgery.GetAndStoreTokens(context);
    var html = MyUtils.GenerateHtmlForm(token.FormFieldName, token.RequestToken!);
    return Results.Content(html, "text/html");
});

app.MapPost("/upload", async Task<Results<Ok<string>, BadRequest<string>>>
    ([FromForm] FileUploadForm fileUploadForm, HttpContext context,
                                                IAntiforgery antiforgery) =>
{
    await MyUtils.SaveFileWithName(fileUploadForm.FileDocument!,
              fileUploadForm.Name!, app.Environment.ContentRootPath);
    return TypedResults.Ok($"Your file with the description:" +
        $" {fileUploadForm.Description} has been uploaded successfully");
});

app.Run();
```

### Parameter binding with dependency injection

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IDateTime, SystemDateTime>();

var app = builder.Build();

app.MapGet("/",   (               IDateTime dateTime) => dateTime.Now);
app.MapGet("/fs", ([FromServices] IDateTime dateTime) => dateTime.Now);
app.Run();
```

### Optional parameters

  - If a request matches the route, the route handler only runs if all required parameters are provided in the request.

  - Failure to provide all required parameters results in an error.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/products", (int pageNumber) => $"Requesting page {pageNumber}");

app.Run();
```

<table><thead>
<tr>
<th>URI</th>
<th>result</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/products?pageNumber=3</code></td>
<td>3 returned</td>
</tr>
<tr>
<td><code>/products</code></td>
<td><code>BadHttpRequestException</code>: Required parameter "int ```pageNumber```" wasn't provided from query string.</td>
</tr>
<tr>
<td><code>/products/1</code></td>
<td>HTTP 404 error, no matching route</td>
</tr>
</tbody></table>

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/products", (int? pageNumber) => $"Requesting page {pageNumber ?? 1}");

string ListProducts(int pageNumber = 1) => $"Requesting page {pageNumber}";

app.MapGet("/products2", ListProducts);

app.Run();
```

<table><thead>
<tr>
<th>URI</th>
<th>result</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/products?pageNumber=3</code></td>
<td>3 returned</td>
</tr>
<tr>
<td><code>/products</code></td>
<td>1 returned</td>
</tr>
<tr>
<td><code>/products2</code></td>
<td>1 returned</td>
</tr>
</tbody></table>

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/products", (Product? product) => { });

app.Run();
```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/products", (int? pageNumber) => $"Requesting page {pageNumber ?? 1}");

app.Run();
```

<table><thead>
<tr>
<th>URI</th>
<th>result</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/products?pageNumber=3</code></td>
<td><code>3</code> returned</td>
</tr>
<tr>
<td><code>/products</code></td>
<td><code>1</code> returned</td>
</tr>
<tr>
<td><code>/products?pageNumber=two</code></td>
<td><code>BadHttpRequestException</code>: Failed to bind parameter <code>"Nullable&lt;int&gt; ```pageNumber```"</code> from "two".</td>
</tr>
<tr>
<td><code>/products/two</code></td>
<td>HTTP 404 error, no matching route</td>
</tr>
</tbody></table>

### Special types

  - ```HttpContext```: The context which holds all the information about the current HTTP request or response:

```csharp
app.MapGet("/", (HttpContext context) => context.Response.WriteAsync("Hello World"));
```

  - ```HttpRequest``` and ```HttpResponse```: The HTTP request and HTTP response:

```csharp
app.MapGet("/", (HttpRequest request, HttpResponse response) =>
    response.WriteAsync($"Hello World {request.Query["name"]}"));
```

  - ```CancellationToken```: The cancellation token associated with the current HTTP request:

```csharp
app.MapGet("/", async (CancellationToken cancellationToken) => 
    await MakeLongRunningRequestAsync(cancellationToken));
```

  - ```ClaimsPrincipal```: The ```user``` associated with the request, bound from ```HttpContext.User```:

```csharp
app.MapGet("/", (ClaimsPrincipal user) => user.Identity.Name);
```

#### Bind the request body as a ```Stream``` or ```PipeReader```

  - Store the data to blob storage or enqueue the data to a queue provider.

  - Process the stored data with a worker process or cloud function.

```csharp
using System.Text.Json;
using System.Threading.Channels;

namespace BackgroundQueueService;

class BackgroundQueue : BackgroundService
{
    private readonly Channel<ReadOnlyMemory<byte>> _queue;
    private readonly ILogger<BackgroundQueue> _logger;

    public BackgroundQueue(Channel<ReadOnlyMemory<byte>> queue,
                               ILogger<BackgroundQueue> logger)
    {
        _queue = queue;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var dataStream in _queue.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                var person = JsonSerializer.Deserialize<Person>(dataStream.Span)!;
                _logger.LogInformation($"{person.Name} is {person.Age} " +
                                       $"years and from {person.Country}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
        }
    }
}

class Person
{
    public string Name { get; set; } = String.Empty;
    public int Age { get; set; }
    public string Country { get; set; } = String.Empty;
}
```

```csharp
app.MapPost("/register", async (HttpRequest req, Stream body,
                                 Channel<ReadOnlyMemory<byte>> queue) =>
{
    if (req.ContentLength is not null && req.ContentLength > maxMessageSize)
    {
        return Results.BadRequest();
    }

    // We're not above the message size and we have a content length, or
    // we're a chunked request and we're going to read up to the maxMessageSize + 1. 
    // We add one to the message size so that we can detect when a chunked request body
    // is bigger than our configured max.
    var readSize = (int?)req.ContentLength ?? (maxMessageSize + 1);

    var buffer = new byte[readSize];

    // Read at least that many bytes from the body.
    var read = await body.ReadAtLeastAsync(buffer, readSize, throwOnEndOfStream: false);

    // We read more than the max, so this is a bad request.
    if (read > maxMessageSize)
    {
        return Results.BadRequest();
    }

    // Attempt to send the buffer to the background queue.
    if (queue.Writer.TryWrite(buffer.AsMemory(0..read)))
    {
        return Results.Accepted();
    }

    // We couldn't accept the message since we're overloaded.
    return Results.StatusCode(StatusCodes.Status429TooManyRequests);
});
```

```csharp
using System.Threading.Channels;
using BackgroundQueueService;

var builder = WebApplication.CreateBuilder(args);
// The max memory to use for the upload endpoint on this instance.
var maxMemory = 500 * 1024 * 1024;

// The max size of a single message, staying below the default LOH size of 85K.
var maxMessageSize = 80 * 1024;

// The max size of the queue based on those restrictions
var maxQueueSize = maxMemory / maxMessageSize;

// Create a channel to send data to the background queue.
builder.Services.AddSingleton<Channel<ReadOnlyMemory<byte>>>((_) =>
                     Channel.CreateBounded<ReadOnlyMemory<byte>>(maxQueueSize));

// Create a background queue service.
builder.Services.AddHostedService<BackgroundQueue>();
var app = builder.Build();

// curl --request POST 'https://localhost:<port>/register' --header 'Content-Type: application/json' --data-raw '{ "Name":"Samson", "Age": 23, "Country":"Nigeria" }'
// curl --request POST "https://localhost:<port>/register" --header "Content-Type: application/json" --data-raw "{ \"Name\":\"Samson\", \"Age\": 23, \"Country\":\"Nigeria\" }"
app.MapPost("/register", async (HttpRequest req, Stream body,
                                 Channel<ReadOnlyMemory<byte>> queue) =>
{
    if (req.ContentLength is not null && req.ContentLength > maxMessageSize)
    {
        return Results.BadRequest();
    }

    // We're not above the message size and we have a content length, or
    // we're a chunked request and we're going to read up to the maxMessageSize + 1. 
    // We add one to the message size so that we can detect when a chunked request body
    // is bigger than our configured max.
    var readSize = (int?)req.ContentLength ?? (maxMessageSize + 1);

    var buffer = new byte[readSize];

    // Read at least that many bytes from the body.
    var read = await body.ReadAtLeastAsync(buffer, readSize, throwOnEndOfStream: false);

    // We read more than the max, so this is a bad request.
    if (read > maxMessageSize)
    {
        return Results.BadRequest();
    }

    // Attempt to send the buffer to the background queue.
    if (queue.Writer.TryWrite(buffer.AsMemory(0..read)))
    {
        return Results.Accepted();
    }

    // We couldn't accept the message since we're overloaded.
    return Results.StatusCode(StatusCodes.Status429TooManyRequests);
});

app.Run();
```

  - When reading data, the ```Stream``` is the same object as ```HttpRequest.Body```.

  - The request body isn't buffered by default. After the body is read, it's not rewindable. The stream can't be read multiple times.

  - The ```Stream``` and ```PipeReader``` aren't usable outside of the minimal action handler as the underlying buffers will be disposed or reused.

#### File uploads using ```IFormFile``` and ```IFormFileCollection```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapPost("/upload", async (IFormFile file) =>
{
    var tempFile = Path.GetTempFileName();
    app.Logger.LogInformation(tempFile);
    using var stream = File.OpenWrite(tempFile);
    await file.CopyToAsync(stream);
});

app.MapPost("/upload_many", async (IFormFileCollection myFiles) =>
{
    foreach (var file in myFiles)
    {
        var tempFile = Path.GetTempFileName();
        app.Logger.LogInformation(tempFile);
        using var stream = File.OpenWrite(tempFile);
        await file.CopyToAsync(stream);
    }
});

app.Run();
```

#### Binding to forms with ```IFormCollection```, ```IFormFile```, and ```IFormFileCollection```

```csharp
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder();

builder.Services.AddAntiforgery();

var app = builder.Build();
app.UseAntiforgery();

string GetOrCreateFilePath(string fileName, string filesDirectory = "uploadFiles")
{
    var directoryPath = Path.Combine(app.Environment.ContentRootPath, filesDirectory);
    Directory.CreateDirectory(directoryPath);
    return Path.Combine(directoryPath, fileName);
}

async Task UploadFileWithName(IFormFile file, string fileSaveName)
{
    var filePath = GetOrCreateFilePath(fileSaveName);
    await using var fileStream = new FileStream(filePath, FileMode.Create);
    await file.CopyToAsync(fileStream);
}

app.MapGet("/", (HttpContext context, IAntiforgery antiforgery) =>
{
    var token = antiforgery.GetAndStoreTokens(context);
    var html = $"""
      <html>
        <body>
          <form action="/upload" method="POST" enctype="multipart/form-data">
            <input name="{token.FormFieldName}" type="hidden" value="{token.RequestToken}"/>
            <input type="file" name="file" placeholder="Upload an image..." accept=".jpg, 
                                                                            .jpeg, .png" />
            <input type="submit" />
          </form> 
        </body>
      </html>
    """;

    return Results.Content(html, "text/html");
});

app.MapPost("/upload", async Task<Results<Ok<string>,
   BadRequest<string>>> (IFormFile file, HttpContext context, IAntiforgery antiforgery) =>
{
    var fileSaveName = Guid.NewGuid().ToString("N") + Path.GetExtension(file.FileName);
    await UploadFileWithName(file, fileSaveName);
    return TypedResults.Ok("File uploaded successfully!");
});

app.Run();
```

```csharp
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder();

builder.Services.AddAntiforgery();

var app = builder.Build();
app.UseAntiforgery();

string GetOrCreateFilePath(string fileName, string filesDirectory = "uploadFiles")
{
    var directoryPath = Path.Combine(app.Environment.ContentRootPath, filesDirectory);
    Directory.CreateDirectory(directoryPath);
    return Path.Combine(directoryPath, fileName);
}

async Task UploadFileWithName(IFormFile file, string fileSaveName)
{
    var filePath = GetOrCreateFilePath(fileSaveName);
    await using var fileStream = new FileStream(filePath, FileMode.Create);
    await file.CopyToAsync(fileStream);
}

app.MapGet("/", (HttpContext context, IAntiforgery antiforgery) =>
{
    var token = antiforgery.GetAndStoreTokens(context);
    var html = $"""
      <html>
        <body>
          <form action="/upload" method="POST" enctype="multipart/form-data">
            <input name="{token.FormFieldName}" type="hidden" value="{token.RequestToken}"/>
            <input type="file" name="file" placeholder="Upload an image..." accept=".jpg, 
                                                                            .jpeg, .png" />
            <input type="submit" />
          </form> 
        </body>
      </html>
    """;

    return Results.Content(html, "text/html");
});

app.MapPost("/upload", async Task<Results<Ok<string>,
   BadRequest<string>>> (IFormFile file, HttpContext context, IAntiforgery antiforgery) =>
{
    var fileSaveName = Guid.NewGuid().ToString("N") + Path.GetExtension(file.FileName);
    await UploadFileWithName(file, fileSaveName);
    return TypedResults.Ok("File uploaded successfully!");
});

app.Run();
```

### Bind to collections and complex types from forms

  - Collections, for example List and Dictionary

  - Complex types, for example, ```Todo``` or ```Project```

  - A minimal endpoint that binds a multi-part form input to a complex object.

  - How to use the anti-forgery services to support the generation and validation of anti-forgery tokens.

```csharp
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAntiforgery();

var app = builder.Build();

app.UseAntiforgery();

app.MapGet("/", (HttpContext context, IAntiforgery antiforgery) =>
{
    var token = antiforgery.GetAndStoreTokens(context);
    var html = $"""
        <html><body>
           <form action="/todo" method="POST" enctype="multipart/form-data">
               <input name="{token.FormFieldName}" 
                                type="hidden" value="{token.RequestToken}" />
               <input type="text" name="name" />
               <input type="date" name="dueDate" />
               <input type="checkbox" name="isCompleted" value="true" />
               <input type="submit" />
               <input name="isCompleted" type="hidden" value="false" /> 
           </form>
        </body></html>
    """;
    return Results.Content(html, "text/html");
});

app.MapPost("/todo", async Task<Results<Ok<Todo>, BadRequest<string>>> 
               ([FromForm] Todo todo, HttpContext context, IAntiforgery antiforgery) =>
{
    try
    {
        await antiforgery.ValidateRequestAsync(context);
        return TypedResults.Ok(todo);
    }
    catch (AntiforgeryValidationException e)
    {
        return TypedResults.BadRequest("Invalid anti-forgery token");
    }
});

app.Run();

class Todo
{
    public string Name { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
    public DateTime DueDate { get; set; } = DateTime.Now.Add(TimeSpan.FromDays(1));
}
```

  - The target parameter must be annotated with the [FromForm] attribute to disambiguate from parameters that should be read from the JSON body.

  - Binding from complex or collection types is not supported for minimal APIs that are compiled with the Request Delegate Generator.

  - The markup shows an additional hidden input with a name of ```isCompleted``` and a value of ```false```. If the ```isCompleted``` checkbox is checked when the form is submitted, both values ```true``` and ```false``` are submitted as values. If the checkbox is unchecked, only the hidden input value ```false``` is submitted. The ASP.NET Core model-binding process reads only the first value when binding to a ```bool``` value, which results in ```true``` for checked checkboxes and ```false``` for unchecked checkboxes.

```txt
__RequestVerificationToken: CfDJ8Bveip67DklJm5vI2PF2VOUZ594RC8kcGWpTnVV17zCLZi1yrs-CSz426ZRRrQnEJ0gybB0AD7hTU-0EGJXDU-OaJaktgAtWLIaaEWMOWCkoxYYm-9U9eLV7INSUrQ6yBHqdMEE_aJpD4AI72gYiCqc
name: Walk the dog
dueDate: 2024-04-06
isCompleted: true
isCompleted: false
```

### Bind arrays and string values from headers and query strings

```csharp
// Bind query string values to a primitive type array.
// GET  /tags?q=1&q=2&q=3
app.MapGet("/tags", (int[] q) =>
                      $"tag1: {q[0]} , tag2: {q[1]}, tag3: {q[2]}");

// Bind to a string array.
// GET /tags2?names=john&names=jack&names=jane
app.MapGet("/tags2", (string[] names) =>
            $"tag1: {names[0]} , tag2: {names[1]}, tag3: {names[2]}");

// Bind to StringValues.
// GET /tags3?names=john&names=jack&names=jane
app.MapGet("/tags3", (StringValues names) =>
            $"tag1: {names[0]} , tag2: {names[1]}, tag3: {names[2]}");
```

```csharp
// GET /todoitems/tags?tags=home&tags=work
app.MapGet("/todoitems/tags", async (Tag[] tags, TodoDb db) =>
{
    return await db.Todos
        .Where(t => tags.Select(i => i.Name).Contains(t.Tag.Name))
        .ToListAsync();
});
```

```csharp
public class Todo
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public bool IsComplete { get; set; }

    // This is an owned entity. 
    public Tag Tag { get; set; } = new();
}

[Owned]
public class Tag
{
    public string? Name { get; set; } = "n/a";

    public static bool TryParse(string? name, out Tag tag)
    {
        if (name is null)
        {
            tag = default!;
            return false;
        }

        tag = new Tag { Name = name };
        return true;
    }
}
```

```csharp
// GET /todoitems/query-string-ids?ids=1&ids=3
app.MapGet("/todoitems/query-string-ids", async (int[] ids, TodoDb db) =>
{
    return await db.Todos
        .Where(t => ids.Contains(t.Id))
        .ToListAsync();
});
```

```csharp
// POST /todoitems/batch
app.MapPost("/todoitems/batch", async (Todo[] todos, TodoDb db) =>
{
    await db.Todos.AddRangeAsync(todos);
    await db.SaveChangesAsync();

    return Results.Ok(todos);
});
```

```csharp
[
    {
        "id": 1,
        "name": "Have Breakfast",
        "isComplete": true,
        "tag": {
            "name": "home"
        }
    },
    {
        "id": 2,
        "name": "Have Lunch",
        "isComplete": true,
        "tag": {
            "name": "work"
        }
    },
    {
        "id": 3,
        "name": "Have Supper",
        "isComplete": true,
        "tag": {
            "name": "home"
        }
    },
    {
        "id": 4,
        "name": "Have Snacks",
        "isComplete": true,
        "tag": {
            "name": "N/A"
        }
    }
]
```

```csharp
// GET /todoitems/header-ids
// The keys of the headers should all be X-Todo-Id with different values
app.MapGet("/todoitems/header-ids", async ([FromHeader(Name = "X-Todo-Id")] int[] ids, TodoDb db) =>
{
    return await db.Todos
        .Where(t => ids.Contains(t.Id))
        .ToListAsync();
});
```

> Note
When binding a ```string[]``` from a query string, the absence of any matching query string value will result in an empty array instead of a ```null``` value.

### Parameter binding for argument lists with `[AsParameters]`

```csharp
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
var app = builder.Build();

app.MapGet("/todoitems", async (TodoDb db) =>
    await db.Todos.Select(x => new TodoItemDTO(x)).ToListAsync());

app.MapGet("/todoitems/{id}",
                             async (int Id, TodoDb Db) =>
    await Db.Todos.FindAsync(Id)
        is Todo todo
            ? Results.Ok(new TodoItemDTO(todo))
            : Results.NotFound());
// Remaining code removed for brevity.
```

```csharp
app.MapGet("/todoitems/{id}",
                             async (int Id, TodoDb Db) =>
    await Db.Todos.FindAsync(Id)
        is Todo todo
            ? Results.Ok(new TodoItemDTO(todo))
            : Results.NotFound());
```

```csharp
struct TodoItemRequest
{
    public int Id { get; set; }
    public TodoDb Db { get; set; }
}
```

```csharp
app.MapGet("/ap/todoitems/{id}",
                                async ([AsParameters] TodoItemRequest request) =>
    await request.Db.Todos.FindAsync(request.Id)
        is Todo todo
            ? Results.Ok(new TodoItemDTO(todo))
            : Results.NotFound());
```

```csharp
app.MapPost("/todoitems", async (TodoItemDTO Dto, TodoDb Db) =>
{
    var todoItem = new Todo
    {
        IsComplete = Dto.IsComplete,
        Name = Dto.Name
    };

    Db.Todos.Add(todoItem);
    await Db.SaveChangesAsync();

    return Results.Created($"/todoitems/{todoItem.Id}", new TodoItemDTO(todoItem));
});

app.MapPut("/todoitems/{id}", async (int Id, TodoItemDTO Dto, TodoDb Db) =>
{
    var todo = await Db.Todos.FindAsync(Id);

    if (todo is null) return Results.NotFound();

    todo.Name = Dto.Name;
    todo.IsComplete = Dto.IsComplete;

    await Db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapDelete("/todoitems/{id}", async (int Id, TodoDb Db) =>
{
    if (await Db.Todos.FindAsync(Id) is Todo todo)
    {
        Db.Todos.Remove(todo);
        await Db.SaveChangesAsync();
        return Results.Ok(new TodoItemDTO(todo));
    }

    return Results.NotFound();
});
```

```csharp
class CreateTodoItemRequest
{
    public TodoItemDTO Dto { get; set; } = default!;
    public TodoDb Db { get; set; } = default!;
}

class EditTodoItemRequest
{
    public int Id { get; set; }
    public TodoItemDTO Dto { get; set; } = default!;
    public TodoDb Db { get; set; } = default!;
}
```

```csharp
app.MapPost("/ap/todoitems", async ([AsParameters] CreateTodoItemRequest request) =>
{
    var todoItem = new Todo
    {
        IsComplete = request.Dto.IsComplete,
        Name = request.Dto.Name
    };

    request.Db.Todos.Add(todoItem);
    await request.Db.SaveChangesAsync();

    return Results.Created($"/todoitems/{todoItem.Id}", new TodoItemDTO(todoItem));
});

app.MapPut("/ap/todoitems/{id}", async ([AsParameters] EditTodoItemRequest request) =>
{
    var todo = await request.Db.Todos.FindAsync(request.Id);

    if (todo is null) return Results.NotFound();

    todo.Name = request.Dto.Name;
    todo.IsComplete = request.Dto.IsComplete;

    await request.Db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapDelete("/ap/todoitems/{id}", async ([AsParameters] TodoItemRequest request) =>
{
    if (await request.Db.Todos.FindAsync(request.Id) is Todo todo)
    {
        request.Db.Todos.Remove(todo);
        await request.Db.SaveChangesAsync();
        return Results.Ok(new TodoItemDTO(todo));
    }

    return Results.NotFound();
});
```

```csharp
record TodoItemRequest(int Id, TodoDb Db);
record CreateTodoItemRequest(TodoItemDTO Dto, TodoDb Db);
record EditTodoItemRequest(int Id, TodoItemDTO Dto, TodoDb Db);
```

### Custom Binding

  - For route, query, and header binding sources, bind custom types by adding a static ```TryParse``` method for the type.

  - Control the binding process by implementing a ```BindAsync``` method on a type.

#### ```TryParse```

```csharp
public static bool TryParse(string value, out T result);
public static bool TryParse(string value, IFormatProvider provider, out T result);
```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// GET /map?Point=12.3,10.1
app.MapGet("/map", (Point point) => $"Point: {point.X}, {point.Y}");

app.Run();

public class Point
{
    public double X { get; set; }
    public double Y { get; set; }

    public static bool TryParse(string? value, IFormatProvider? provider,
                                out Point? point)
    {
        // Format is "(12.3,10.1)"
        var trimmedValue = value?.TrimStart('(').TrimEnd(')');
        var segments = trimmedValue?.Split(',',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (segments?.Length == 2
            && double.TryParse(segments[0], out var x)
            && double.TryParse(segments[1], out var y))
        {
            point = new Point { X = x, Y = y };
            return true;
        }

        point = null;
        return false;
    }
}
```

#### ```BindAsync```

```csharp
public static ValueTask<T?> BindAsync(HttpContext context, ParameterInfo parameter);
public static ValueTask<T?> BindAsync(HttpContext context);
```

```csharp
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// GET /products?SortBy=xyz&SortDir=Desc&Page=99
app.MapGet("/products", (PagingData pageData) => $"SortBy:{pageData.SortBy}, " +
       $"SortDirection:{pageData.SortDirection}, CurrentPage:{pageData.CurrentPage}");

app.Run();

public class PagingData
{
    public string? SortBy { get; init; }
    public SortDirection SortDirection { get; init; }
    public int CurrentPage { get; init; } = 1;

    public static ValueTask<PagingData?> BindAsync(HttpContext context,
                                                   ParameterInfo parameter)
    {
        const string sortByKey = "sortBy";
        const string sortDirectionKey = "sortDir";
        const string currentPageKey = "page";

        Enum.TryParse<SortDirection>(context.Request.Query[sortDirectionKey],
                                     ignoreCase: true, out var sortDirection);
        int.TryParse(context.Request.Query[currentPageKey], out var page);
        page = page == 0 ? 1 : page;

        var result = new PagingData
        {
            SortBy = context.Request.Query[sortByKey],
            SortDirection = sortDirection,
            CurrentPage = page
        };

        return ValueTask.FromResult<PagingData?>(result);
    }
}

public enum SortDirection
{
    Default,
    Asc,
    Desc
}
```

### Binding failures

<table><thead>
<tr>
<th>Failure mode</th>
<th>Nullable Parameter Type</th>
<th>Binding Source</th>
<th>Status code</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>{ParameterType}.TryParse</code> returns <code>false</code></td>
<td>yes</td>
<td>route/query/header</td>
<td>400</td>
</tr>
<tr>
<td><code>{ParameterType}.BindAsync</code> returns <code>null</code></td>
<td>yes</td>
<td>custom</td>
<td>400</td>
</tr>
<tr>
<td><code>{ParameterType}.BindAsync</code> throws</td>
<td>doesn't matter</td>
<td>custom</td>
<td>500</td>
</tr>
<tr>
<td>Failure to deserialize JSON body</td>
<td>doesn't matter</td>
<td>body</td>
<td>400</td>
</tr>
<tr>
<td>Wrong content type (not <code>application/json</code>)</td>
<td>doesn't matter</td>
<td>body</td>
<td>415</td>
</tr>
</tbody></table>

### Binding Precedence

  - Explicit attribute defined on parameter (From* attributes) in the following order:

Route values: [FromRoute]
Query string: [FromQuery]
Header: [FromHeader]
Body: [FromBody]
Form: [FromForm]
Service: [FromServices]
Parameter values: [AsParameters]

    - Route values: [FromRoute]

    - Query string: [FromQuery]

    - Header: [FromHeader]

    - Body: [FromBody]

    - Form: [FromForm]

    - Service: [FromServices]

    - Parameter values: [AsParameters]

  - Special types

HttpContext
HttpRequest (HttpContext.Request)
HttpResponse (HttpContext.Response)
ClaimsPrincipal (HttpContext.User)
CancellationToken (HttpContext.RequestAborted)
IFormCollection (HttpContext.Request.Form)
IFormFileCollection (HttpContext.Request.Form.Files)
IFormFile (HttpContext.Request.Form.Files[paramName])
Stream (HttpContext.Request.Body)
PipeReader (HttpContext.Request.BodyReader)

    - ```HttpContext```

    - ```HttpRequest``` (HttpContext.Request)

    - ```HttpResponse``` (HttpContext.Response)

    - ```ClaimsPrincipal``` (HttpContext.User)

    - ```CancellationToken``` (HttpContext.RequestAborted)

    - ```IFormCollection``` (HttpContext.Request.Form)

    - ```IFormFileCollection``` (HttpContext.Request.Form.Files)

    - ```IFormFile``` (HttpContext.Request.Form.Files[paramName])

    - ```Stream``` (HttpContext.Request.Body)

    - ```PipeReader``` (HttpContext.Request.BodyReader)

  - Parameter type has a valid static ```BindAsync``` method.

  - Parameter type is a string or has a valid static ```TryParse``` method.

If the parameter name exists in the route template for example, app.Map("/todo/{id}", (int id) => {});, then it's bound from the route.
Bound from the query string.

    - If the parameter name exists in the route template for example, app.Map("/todo/{id}", (int id) => {});, then it's bound from the route.

    - Bound from the query string.

  - If the parameter type is a service provided by dependency injection, it uses that service as the source.

  - The parameter is from the body.

### Configure JSON deserialization options for body binding

#### Configure JSON deserialization options globally

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options => {
    options.SerializerOptions.WriteIndented = true;
    options.SerializerOptions.IncludeFields = true;
});

var app = builder.Build();

app.MapPost("/", (Todo todo) => {
    if (todo is not null) {
        todo.Name = todo.NameField;
    }
    return todo;
});

app.Run();

class Todo {
    public string? Name { get; set; }
    public string? NameField;
    public bool IsComplete { get; set; }
}
// If the request body contains the following JSON:
//
// {"nameField":"Walk dog", "isComplete":false}
//
// The endpoint returns the following JSON:
//
// {
//    "name":"Walk dog",
//    "nameField":"Walk dog",
//    "isComplete":false
// }
```

#### Configure JSON deserialization options for an endpoint

```csharp
using System.Text.Json;

var app = WebApplication.Create();

var options = new JsonSerializerOptions(JsonSerializerDefaults.Web) { 
    IncludeFields = true, 
    WriteIndented = true
};

app.MapPost("/", async (HttpContext context) => {
    if (context.Request.HasJsonContentType()) {
        var todo = await context.Request.ReadFromJsonAsync<Todo>(options);
        if (todo is not null) {
            todo.Name = todo.NameField;
        }
        return Results.Ok(todo);
    }
    else {
        return Results.BadRequest();
    }
});

app.Run();

class Todo
{
    public string? Name { get; set; }
    public string? NameField;
    public bool IsComplete { get; set; }
}
// If the request body contains the following JSON:
//
// {"nameField":"Walk dog", "isComplete":false}
//
// The endpoint returns the following JSON:
//
// {
//    "name":"Walk dog",
//    "isComplete":false
// }
```

### Read the request body

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/uploadstream", async (IConfiguration config, HttpRequest request) =>
{
    var filePath = Path.Combine(config["StoredFilesPath"], Path.GetRandomFileName());

    await using var writeStream = File.Create(filePath);
    await request.BodyReader.CopyToAsync(writeStream);
});

app.Run();
```

  - Accesses the request body using ```HttpRequest.BodyReader```.

  - Copies the request body to a local file.

## Responses

 - ```IResult``` based - This includes `Task<IResult>` and `ValueTask<IResult>`

 - string - This includes `Task<string>` and `ValueTask<string>`

 - ```T``` (Any other type) - This includes `Task<T>` and `ValueTask<T>`

<table><thead>
<tr>
<th>Return value</th>
<th>Behavior</th>
<th>Content-Type</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>IResult</code></td>
<td>The framework calls <a href="/en-us/dotnet/api/microsoft.aspnetcore.http.iresult.executeasync" data-linktype="absolute-path">IResult.ExecuteAsync</a></td>
<td>Decided by the <code>IResult</code> implementation</td>
</tr>
<tr>
<td><code>string</code></td>
<td>The framework writes the string directly to the response</td>
<td><code>text/plain</code></td>
</tr>
<tr>
<td><code>T</code> (Any other type)</td>
<td>The framework JSON-serializes the response</td>
<td><code>application/json</code></td>
</tr>
</tbody></table>

### Example return values

#### string return values

```csharp
app.MapGet("/hello", () => "Hello World");
```

#### JSON return values

```csharp
app.MapGet("/hello", () => new { Message = "Hello World" });
```

#### Return ```TypedResults```

```csharp
app.MapGet("/hello", () => TypedResults.Ok(new Message() {  Text = "Hello World!" }));
```

#### ```IResult``` return values

```csharp
app.MapGet("/hello", () => Results.Ok(new { Message = "Hello World" }));
```

```csharp
app.MapGet("/api/todoitems/{id}", async (int id, TodoDb db) =>
         await db.Todos.FindAsync(id) 
         is Todo todo
         ? Results.Ok(todo) 
         : Results.NotFound())
   .Produces<Todo>(StatusCodes.Status200OK)
   .Produces(StatusCodes.Status404NotFound);
```

#### JSON

```csharp
app.MapGet("/hello", () => Results.Json(new { Message = "Hello World" }));
```

#### Custom Status Code

```csharp
app.MapGet("/405", () => Results.StatusCode(405));
```

#### Text

```csharp
app.MapGet("/text", () => Results.Text("This is some text"));
```

#### ```Stream```

```csharp
var proxyClient = new HttpClient();
app.MapGet("/pokemon", async () => 
{
    var stream = await proxyClient.GetStreamAsync("http://contoso/pokedex.json");
    // Proxy the response as JSON
    return Results.Stream(stream, "application/json");
});
```

#### Redirect

```csharp
app.MapGet("/old-path", () => Results.Redirect("/new-path"));
```

#### File

```csharp
app.MapGet("/download", () => Results.File("myfile.text"));
```

### Built-in results

### Customizing results

```csharp
using System.Net.Mime;
using System.Text;
static class ResultsExtensions
{
    public static IResult Html(this IResultExtensions resultExtensions, string html)
    {
        ArgumentNullException.ThrowIfNull(resultExtensions);

        return new HtmlResult(html);
    }
}

class HtmlResult : IResult
{
    private readonly string _html;

    public HtmlResult(string html)
    {
        _html = html;
    }

    public Task ExecuteAsync(HttpContext httpContext)
    {
        httpContext.Response.ContentType = MediaTypeNames.Text.Html;
        httpContext.Response.ContentLength = Encoding.UTF8.GetByteCount(_html);
        return httpContext.Response.WriteAsync(_html);
    }
}
```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/html", () => Results.Extensions.Html(@$"<!doctype html>
<html>
    <head><title>miniHTML</title></head>
    <body>
        <h1>Hello World</h1>
        <p>The time on the server is {DateTime.Now:O}</p>
    </body>
</html>"));

app.Run();
```

### Typed results

```csharp
[TestClass()]
public class WeatherApiTests
{
    [TestMethod()]
    public void MapWeatherApiTest()
    {
        var result = WeatherApi.GetAllWeathers();
        Assert.IsInstanceOfType(result, typeof(Ok<WeatherForecast[]>));
    }      
}
```

## Filters

## Authorization

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebRPauth.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthorization(o => o.AddPolicy("AdminsOnly", 
                                  b => b.RequireClaim("admin", "true")));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();

var app = builder.Build();

app.UseAuthorization();

app.MapGet("/auth", [Authorize] () => "This endpoint requires authorization.");
app.MapGet("/", () => "This endpoint doesn't require authorization.");
app.MapGet("/Identity/Account/Login", () => "Sign in page at this endpoint.");

app.Run();
```

```csharp
app.MapGet("/auth", () => "This endpoint requires authorization")
   .RequireAuthorization();
```

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebRPauth.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthorization(o => o.AddPolicy("AdminsOnly", 
                                  b => b.RequireClaim("admin", "true")));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();

var app = builder.Build();

app.UseAuthorization();

app.MapGet("/admin", [Authorize("AdminsOnly")] () => 
                             "The /admin endpoint is for admins only.");

app.MapGet("/admin2", () => "The /admin2 endpoint is for admins only.")
   .RequireAuthorization("AdminsOnly");

app.MapGet("/", () => "This endpoint doesn't require authorization.");
app.MapGet("/Identity/Account/Login", () => "Sign in page at this endpoint.");

app.Run();
```

### Allow unauthenticated users to access an endpoint

```csharp
app.MapGet("/login", [AllowAnonymous] () => "This endpoint is for all roles.");


app.MapGet("/login2", () => "This endpoint also for all roles.")
   .AllowAnonymous();
```

## CORS

```csharp
const string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      builder =>
                      {
                          builder.WithOrigins("http://example.com",
                                              "http://www.contoso.com");
                      });
});

var app = builder.Build();
app.UseCors();

app.MapGet("/",() => "Hello CORS!");

app.Run();
```

```csharp
using Microsoft.AspNetCore.Cors;

const string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      builder =>
                      {
                          builder.WithOrigins("http://example.com",
                                              "http://www.contoso.com");
                      });
});

var app = builder.Build();
app.UseCors();

app.MapGet("/cors", [EnableCors(MyAllowSpecificOrigins)] () => 
                           "This endpoint allows cross origin requests!");
app.MapGet("/cors2", () => "This endpoint allows cross origin requests!")
                     .RequireCors(MyAllowSpecificOrigins);

app.Run();
```

## ```ValidateScopes``` and ```ValidateOnBuild```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<MyScopedService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    Console.WriteLine("Development environment");
}
else
{
    Console.WriteLine("Release environment");
}

app.MapGet("/", context =>
{
    // Intentionally getting service provider from app, not from the request
    // This causes an exception from attempting to resolve a scoped service
    // outside of a scope.
    // Throws System.InvalidOperationException:
    // 'Cannot resolve scoped service 'MyScopedService' from root provider.'
    var service = app.Services.GetRequiredService<MyScopedService>();
    return context.Response.WriteAsync("Service resolved");
});

app.Run();

public class MyScopedService { }
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<MyScopedService>();
builder.Services.AddScoped<AnotherService>();

// System.AggregateException: 'Some services are not able to be constructed (Error
// while validating the service descriptor 'ServiceType: AnotherService Lifetime:
// Scoped ImplementationType: AnotherService': Unable to resolve service for type
// 'BrokenService' while attempting to activate 'AnotherService'.)'
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    Console.WriteLine("Development environment");
}
else
{
    Console.WriteLine("Release environment");
}

app.MapGet("/", context =>
{
    var service = context.RequestServices.GetRequiredService<MyScopedService>();
    return context.Response.WriteAsync("Service resolved correctly!");
});

app.Run();

public class MyScopedService { }

public class AnotherService
{
    public AnotherService(BrokenService brokenService) { }
}

public class BrokenService { }
```

```csharp
var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    Console.WriteLine("Development environment");
    // Doesn't detect the validation problems because ValidateScopes is false.
    builder.Host.UseDefaultServiceProvider(options =>
    {
        options.ValidateScopes = false;
        options.ValidateOnBuild = false;
    });
}
```

## See also

 - Minimal APIs quick reference

 - Work with OpenAPI documents

 - Create responses in Minimal API applications

 - Filters in Minimal API apps

 - Handle errors in minimal APIs

 - Authentication and authorization in minimal APIs

 - Test Minimal API apps

 - Short-circuit routing

 - Identity API endpoints

 - Keyed service dependency injection container support

 - A look behind the scenes of minimal API endpoints

 - Organizing ASP.NET Core Minimal APIs

 - Fluent validation discussion on GitHub

Ref: [Minimal APIs quick reference](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-8.0)